import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import type { AppointmentStatus } from "@/lib/supabase/types";
import type { ExistingBooking } from "@/lib/booking/availability";
import { shopDateBoundsUtc } from "@/lib/booking/timezone";
import { getSettings } from "@/lib/data/settings";
import { completePastAppointments } from "@/lib/payments/complete";

export type AppointmentSummary = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  reference_code: string;
  customer_notes: string | null;
  payment_status: string;
  deposit_cents: number;
  can_cancel: boolean;
  can_reschedule: boolean;
  service: {
    id: string;
    slug: string;
    name: string;
    price: number;
    duration_minutes: number;
  } | null;
};

const BLOCKING_STATUSES: AppointmentStatus[] = ["pending", "confirmed", "arrived"];

/**
 * Busy ranges for a shop-local calendar day.
 * Uses the service-role client so availability sees *everyone's* bookings —
 * RLS only allows "select own", which made the grid look fully open for
 * guests / other customers until confirm hit the exclusion constraint.
 * Only `starts_at` / `ends_at` are read (no customer PII).
 */
export async function getBookingsForDate(
  dateISO: string,
  ignoreAppointmentId?: string | null,
): Promise<ExistingBooking[]> {
  if (!supabaseConfigured) return [];
  const { startUtc, endUtc } = shopDateBoundsUtc(dateISO);

  const client = supabaseServiceRoleKey
    ? createSupabaseAdminClient()
    : await createSupabaseServerClient();

  let query = client
    .from("appointments")
    .select("id, starts_at, ends_at")
    .in("status", BLOCKING_STATUSES)
    .lt("starts_at", endUtc)
    .gt("ends_at", startUtc);

  if (ignoreAppointmentId) {
    query = query.neq("id", ignoreAppointmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("[appointments] busy-range fetch failed:", error.message);
    return [];
  }
  return (data ?? []).map(({ starts_at, ends_at }) => ({ starts_at, ends_at }));
}

export async function listAppointmentsForCurrentUser() {
  if (!supabaseConfigured) return { upcoming: [], past: [] };
  await completePastAppointments();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { upcoming: [], past: [] };

  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      id, starts_at, ends_at, status, reference_code, customer_notes,
      payment_status, deposit_cents,
      service:services ( id, slug, name, price, duration_minutes )
    `,
    )
    .eq("customer_id", user.id)
    .order("starts_at", { ascending: true });

  if (error) {
    console.warn("[appointments] list failed:", error.message);
    return { upcoming: [], past: [] };
  }

  const rows = (data ?? []) as unknown as (Omit<
    AppointmentSummary,
    "service" | "can_cancel" | "can_reschedule"
  > & {
    service: AppointmentSummary["service"] | AppointmentSummary["service"][] | null;
  })[];

  const settings = await getSettings();
  const nowMs = Date.now();
  const upcoming: AppointmentSummary[] = [];
  const past: AppointmentSummary[] = [];

  for (const row of rows) {
    const normalisedService = Array.isArray(row.service)
      ? (row.service[0] ?? null)
      : row.service;
    const cutoffMs =
      new Date(row.starts_at).getTime() - settings.cancellation_hours * 3_600_000;
    // Match server cancel/reschedule: allowed while now <= cutoff.
    const mutable =
      (row.status === "pending" || row.status === "confirmed") && nowMs <= cutoffMs;
    const record: AppointmentSummary = {
      ...row,
      payment_status: row.payment_status ?? "none",
      deposit_cents: Number(row.deposit_cents ?? 0),
      service: normalisedService,
      can_cancel: mutable,
      can_reschedule: mutable,
    };
    if (
      new Date(row.starts_at).getTime() >= nowMs &&
      row.status !== "cancelled" &&
      row.status !== "no_show" &&
      row.status !== "completed"
    ) {
      upcoming.push(record);
    } else {
      past.push(record);
    }
  }

  return { upcoming, past };
}
