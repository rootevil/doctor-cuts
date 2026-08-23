#!/usr/bin/env node
/**
 * End-to-end: guest booking + ephemeral admin login verification.
 * Usage: node scripts/e2e-full.mjs [--base http://localhost:3000]
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY to create a temporary admin user and
 * cleans up the test booking + user when finished.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

const SHOP_TZ = "Europe/Rome";

const BASE = process.argv.includes("--base")
  ? process.argv[process.argv.indexOf("--base") + 1]
  : "http://localhost:3000";

function loadEnv() {
  const env = { ...process.env };
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!(key in env) || !env[key]) env[key] = val;
    }
  } catch {
    /* rely on process.env */
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const seedAdminEmail = env.SEED_ADMIN_EMAIL?.trim();
const qaPassword = env.QA_TEST_PASSWORD?.trim();

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const runId = Date.now();
const guestEmail = `qa-guest-${runId}@doctorcuts.test`;
const guestName = "QA Guest";
const e2eAdminEmail = `qa-admin-${runId}@doctorcuts.test`;
const e2ePassword = qaPassword || `E2E-DoctorCuts-${runId}!`;

let e2eUserId = null;
let appointmentId = null;
let adminUserId = null;
let usedSeedAdmin = false;

function shopDateISO(date) {
  return formatInTimeZone(date, SHOP_TZ, "yyyy-MM-dd");
}

function shopDayOfWeek(dateISO) {
  const utc = fromZonedTime(`${dateISO}T12:00:00`, SHOP_TZ);
  return Number(formatInTimeZone(utc, SHOP_TZ, "i"));
}

function shopLocalToUtc(dateISO, timeHHMM) {
  return fromZonedTime(`${dateISO}T${timeHHMM}:00`, SHOP_TZ);
}

function generateManageToken() {
  return randomBytes(24).toString("base64url");
}

function shiftDate(dateISO, days) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

async function cleanup() {
  if (appointmentId) {
    await admin.from("appointments").delete().eq("id", appointmentId);
  }
  if (e2eUserId) {
    await admin.auth.admin.deleteUser(e2eUserId);
  }
  if (adminUserId && !usedSeedAdmin) {
    await admin.auth.admin.deleteUser(adminUserId);
  }
}

process.on("SIGINT", () => {
  cleanup().finally(() => process.exit(130));
});

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "follow" });
  return { status: res.status, html: await res.text(), url: res.url };
}

async function getActiveService() {
  const { data, error } = await admin
    .from("services")
    .select("id, slug, name, duration_minutes")
    .eq("is_active", true)
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message || "No active service");
  return data;
}

async function findAvailableSlot(serviceId, durationMinutes = 30) {
  const { data: settings } = await admin.from("settings").select("max_booking_days").limit(1).single();
  const maxDays = settings?.max_booking_days ?? 30;
  const { data: hours } = await admin
    .from("business_hours")
    .select("day_of_week, open_time, close_time, is_closed");
  if (!hours?.length) throw new Error("No business hours configured");

  let dateISO = shopDateISO(new Date());
  for (let offset = 1; offset <= maxDays; offset++) {
    dateISO = shiftDate(shopDateISO(new Date()), offset);

    const dow = shopDayOfWeek(dateISO);
    const dayHours = hours.find((h) => h.day_of_week === dow);
    if (!dayHours || dayHours.is_closed || !dayHours.open_time || !dayHours.close_time) {
      continue;
    }

    const openParts = String(dayHours.open_time).slice(0, 5).split(":").map(Number);
    const closeParts = String(dayHours.close_time).slice(0, 5).split(":").map(Number);
    const openMins = openParts[0] * 60 + openParts[1];
    const closeMins = closeParts[0] * 60 + closeParts[1];
    const step = 40;

    for (let m = openMins; m + durationMinutes <= closeMins; m += step) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      const startsAt = shopLocalToUtc(dateISO, `${hh}:${mm}`);
      const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

      const { data: conflicts } = await admin
        .from("appointments")
        .select("id")
        .lt("starts_at", endsAt.toISOString())
        .gt("ends_at", startsAt.toISOString())
        .neq("status", "cancelled")
        .limit(1);

      if (!conflicts?.length) {
        return { dateISO, startsAt: startsAt.toISOString() };
      }
    }
  }
  throw new Error("No available slot found in booking window");
}

async function createGuestBookingDirect(service, slotISO) {
  const manageToken = generateManageToken();
  const startsAt = new Date(slotISO);
  const endsAt = new Date(startsAt.getTime() + (service.duration_minutes || 30) * 60_000);

  const { data, error } = await admin
    .from("appointments")
    .insert({
      customer_id: null,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: null,
      manage_token: manageToken,
      service_id: service.id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "confirmed",
      customer_notes: "E2E test booking — auto cleanup",
    })
    .select("id, reference_code, manage_token")
    .single();

  if (error) throw new Error(`Booking insert failed: ${error.message}`);
  appointmentId = data.id;
  return data;
}

async function ensureAdminUser() {
  if (qaPassword && seedAdminEmail) {
    const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = users.users.find(
      (u) => u.email?.toLowerCase() === seedAdminEmail.toLowerCase(),
    );
    if (existing) {
      usedSeedAdmin = true;
      adminUserId = existing.id;
      return { email: seedAdminEmail, password: qaPassword, existing: true };
    }
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: e2eAdminEmail,
    password: e2ePassword,
    email_confirm: true,
    user_metadata: { full_name: "QA Admin" },
  });
  if (error) throw new Error(`Create admin user failed: ${error.message}`);
  adminUserId = data.user.id;

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      email: e2eAdminEmail,
      full_name: "QA Admin",
      role: "admin",
    },
    { onConflict: "id" },
  );
  if (profileError) throw new Error(`Profile upsert failed: ${profileError.message}`);

  return { email: e2eAdminEmail, password: e2ePassword, existing: false };
}

async function signInViaSupabase(email, password) {
  const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Sign-in failed: ${error.message}`);
  return data.session;
}

async function verifyManageBookingPage(code, token) {
  const { status, html } = await fetchHtml(
    `/it/gestisci-prenotazione/${encodeURIComponent(code)}?t=${encodeURIComponent(token)}`,
  );
  const ok =
    status === 200 &&
    html.includes(code) &&
    /Annulla prenotazione|Cancel booking/i.test(html);
  return { ok, status };
}

async function verifyAdminApi(session) {
  const client = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const start = Date.now();
  const { data, error } = await client
    .from("appointments")
    .select("id, reference_code, status")
    .limit(5);
  const elapsed = Date.now() - start;
  if (error) return { ok: false, error: error.message, elapsed };
  return { ok: true, count: data?.length ?? 0, elapsed };
}

async function main() {
  console.log(`\n🧪 E2E — booking + admin (${BASE})\n`);

  // --- Guest booking (DB + manage page) ---
  console.log("1. Guest booking");
  const service = await getActiveService();
  console.log(`   Service: ${service.name} (${service.slug})`);

  const slot = await findAvailableSlot(service.id);
  console.log(`   Slot: ${slot.startsAt}`);

  const booking = await createGuestBookingDirect(service, slot.startsAt);
  console.log(`   ✓ Created booking ${booking.reference_code}`);

  const manage = await verifyManageBookingPage(booking.reference_code, booking.manage_token);
  console.log(
    manage.ok
      ? `   ✓ Manage page loads for guest (${manage.status})`
      : `   ✗ Manage page failed (${manage.status})`,
  );

  // --- Admin auth ---
  console.log("\n2. Admin authentication");
  const adminCreds = await ensureAdminUser();
  console.log(
    adminCreds.existing
      ? `   Using SEED_ADMIN_EMAIL from .env.local`
      : `   Created ephemeral admin ${adminCreds.email}`,
  );

  const session = await signInViaSupabase(adminCreds.email, adminCreds.password);
  console.log(`   ✓ Signed in (${session.user.email})`);

  const adminQuery = await verifyAdminApi(session);
  console.log(
    adminQuery.ok
      ? `   ✓ Admin appointments query: ${adminQuery.count} rows in ${adminQuery.elapsed}ms`
      : `   ✗ Admin query failed: ${adminQuery.error}`,
  );

  // --- Admin page HTTP (cookie-less — expect redirect/sign-in) ---
  const adminPage = await fetchHtml("/it/admin");
  const adminPageShowsSignIn = /signin-password|signin-email|type=\"password\"/i.test(adminPage.html);
  console.log(
    adminPageShowsSignIn
      ? `   ⚠ /it/admin HTML without session cookie shows sign-in (expected)`
      : `   ✓ /it/admin reachable (${adminPage.status})`,
  );

  // --- Summary ---
  console.log("\n" + "═".repeat(50));
  const pass = manage.ok && adminQuery.ok;
  console.log(pass ? "E2E PASSED" : "E2E FAILED");
  console.log("═".repeat(50));

  await cleanup();
  console.log("\nCleaned up test booking and ephemeral admin user.\n");
  process.exit(pass ? 0 : 1);
}

main().catch(async (err) => {
  console.error("\nE2E error:", err.message);
  await cleanup();
  process.exit(1);
});
