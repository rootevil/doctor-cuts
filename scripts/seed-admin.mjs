#!/usr/bin/env node
/**
 * Promote a user to admin by email using the service role.
 * Run with:
 *   node scripts/seed-admin.mjs admin@dr-cuts.com
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env.
 * Prefer signing in as admin@dr-cuts.com after deploy — syncAdminRole promotes
 * that mailbox automatically. This script is for recovering a stuck profile.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotenv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // no .env.local — rely on the surrounding environment
  }
}

loadDotenv();

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/seed-admin.mjs <email>");
  process.exit(1);
}

const ALLOWED = "admin@dr-cuts.com";
if (email.trim().toLowerCase() !== ALLOWED) {
  console.error(
    `Refusing to promote "${email}". Only ${ALLOWED} may be admin.`,
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: userLookup, error: lookupError } = await supabase.auth.admin
  .listUsers({ page: 1, perPage: 200 });

if (lookupError) {
  console.error(lookupError.message);
  process.exit(1);
}

const user = userLookup.users.find(
  (u) => u.email && u.email.toLowerCase() === email.toLowerCase(),
);

if (!user) {
  console.error(
    `No auth user found with email "${email}". Ask them to sign up first, then re-run this script.`,
  );
  process.exit(1);
}

// Upsert — handles the "auth user exists but profile row is missing" case
// that happens when someone signs up before the migrations were pushed.
const { error: upsertError } = await supabase
  .from("profiles")
  .upsert(
    {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? "",
      phone: user.user_metadata?.phone ?? "",
      role: "admin",
    },
    { onConflict: "id" },
  );

if (upsertError) {
  console.error(upsertError.message);
  process.exit(1);
}

console.log(`Promoted ${email} to admin.`);
