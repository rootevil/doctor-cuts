import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import type {
  AppointmentStatus,
  ProfileRow,
  ServiceRow,
} from "@/lib/supabase/types";
import {
  shiftDate,
  shopDateBoundsUtc,
  shopToday,
} from "@/lib/booking/timezone";
import { completePastAppointments } from "@/lib/payments/complete";

/* ------------------------------------------------------------------ */
/*  Appointments                                                       */
/* ------------------------------------------------------------------ */

export type AdminAppointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  reference_code: string;
  customer_notes: string | null;
  admin_notes: string | null;
  payment_status: string;
  deposit_cents: number;
  can_refund: boolean;
  is_guest: boolean;
  customer: {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
  } | null;
  service: {
    id: string;
    slug: string;
    name: string;
    price: number;
    duration_minutes: number;
  } | null;
};

const APPOINTMENT_SELECT = `
  id, starts_at, ends_at, status, reference_code, customer_notes, admin_notes,
  payment_status, deposit_cents,
  guest_name, guest_email, guest_phone,
  customer:profiles ( id, full_name, email, phone ),
  service:services ( id, slug, name, price, duration_minutes )
`;

/** Admin lists only real deposits — hide unpaid holds and local/test rows. */
const PAID = ["paid"] as const;
const PAID_OR_REFUNDED = ["paid", "refunded"] as const;

function normaliseAppointment(row: unknown): AdminAppointment {
  const r = row as Record<string, unknown>;
  const oneOrArr = <T,>(v: T | T[] | null | undefined): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
  const linked = oneOrArr(r.customer as AdminAppointment["customer"]);
  const guestEmail = (r.guest_email as string | null) ?? null;
  const guestName = (r.guest_name as string | null) ?? null;
  const guestPhone = (r.guest_phone as string | null) ?? null;
  return {
    id: r.id as string,
    starts_at: r.starts_at as string,
    ends_at: r.ends_at as string,
    status: r.status as AppointmentStatus,
    reference_code: r.reference_code as string,
    customer_notes: (r.customer_notes as string | null) ?? null,
    admin_notes: (r.admin_notes as string | null) ?? null,
    payment_status: (r.payment_status as string) ?? "none",
    deposit_cents: Number(r.deposit_cents ?? 0),
    can_refund:
      (r.payment_status as string) === "paid" &&
      (r.status === "pending" ||
        r.status === "confirmed" ||
        r.status === "arrived" ||
        r.status === "cancelled"),
    is_guest: !linked && Boolean(guestEmail || guestName),
    customer:
      linked ??
      (guestEmail || guestName
        ? {
            id: "",
            full_name: guestName,
            email: guestEmail ?? "",
            phone: guestPhone,
          }
        : null),
    service: oneOrArr(r.service as AdminAppointment["service"]),
  };
}

export async function listTodaysAppointments(): Promise<AdminAppointment[]> {
  if (!supabaseConfigured) return [];
  await completePastAppointments();
  const supabase = await createSupabaseServerClient();
  const { startUtc, endUtc } = shopDateBoundsUtc(shopToday());
  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .gte("starts_at", startUtc)
    .lt("starts_at", endUtc)
    .in("payment_status", [...PAID])
    .not("status", "eq", "cancelled")
    .order("starts_at", { ascending: true });
  if (error) {
    console.warn("[admin] today's appointments:", error.message);
    return [];
  }
  return (data ?? []).map(normaliseAppointment);
}

/** Newest bookings, by when they were created — not when the chair time is. */
export async function listRecentAppointments(
  days = 7,
  limit = 12,
): Promise<AdminAppointment[]> {
  if (!supabaseConfigured) return [];
  await completePastAppointments();
  const supabase = await createSupabaseServerClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .gte("created_at", since)
    .in("payment_status", [...PAID])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[admin] recent appointments:", error.message);
    return [];
  }
  return (data ?? []).map(normaliseAppointment);
}

/** Confirmed/pending chair times after today, for the overview list. */
export async function listUpcomingAppointments(
  days = 13,
  limit = 12,
): Promise<AdminAppointment[]> {
  if (!supabaseConfigured) return [];
  await completePastAppointments();
  const supabase = await createSupabaseServerClient();
  const from = shopDateBoundsUtc(shiftDate(shopToday(), 1)).startUtc;
  const to = shopDateBoundsUtc(shiftDate(shopToday(), days)).endUtc;
  const { data, error } = await supabase
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .gte("starts_at", from)
    .lt("starts_at", to)
    .in("status", ["pending", "confirmed", "arrived"])
    .in("payment_status", [...PAID])
    .order("starts_at", { ascending: true })
    .limit(limit);
  if (error) {
    console.warn("[admin] upcoming appointments:", error.message);
    return [];
  }
  return (data ?? []).map(normaliseAppointment);
}

export type AdminBucket = "pending" | "completed" | "cancelled";
export type AdminRange = "today" | "week" | "month" | "all";

export type AppointmentFilter = {
  from?: string; // "YYYY-MM-DD" shop-local
  to?: string; // "YYYY-MM-DD"
  bucket?: AdminBucket;
  /** @deprecated use bucket */
  status?: AppointmentStatus | "all";
  q?: string;
  limit?: number;
};

export function rangeBoundsFor(
  range: AdminRange,
  bucket: AdminBucket,
): { from?: string; to?: string } {
  const today = shopToday();
  if (range === "all") return {};
  if (range === "today") return { from: today, to: today };
  if (range === "week") {
    if (bucket === "pending") return { from: today, to: shiftDate(today, 6) };
    if (bucket === "completed") return { from: shiftDate(today, -6), to: today };
    return { from: shiftDate(today, -6), to: shiftDate(today, 6) };
  }
  if (bucket === "pending") return { from: today, to: shiftDate(today, 29) };
  if (bucket === "completed") return { from: shiftDate(today, -29), to: today };
  return { from: shiftDate(today, -29), to: shiftDate(today, 29) };
}

function sanitizeSearch(raw: string) {
  return raw.replace(/[%(),]/g, " ").trim().slice(0, 80);
}

function applyBucket<T extends {
  in: (column: string, values: string[]) => T;
  eq: (column: string, value: string) => T;
  gt: (column: string, value: string) => T;
}>(query: T, bucket: AdminBucket): T {
  const now = new Date().toISOString();
  if (bucket === "pending") {
    return query
      .in("status", ["pending", "confirmed", "arrived"])
      .in("payment_status", [...PAID])
      .gt("ends_at", now);
  }
  if (bucket === "completed") {
    return query.eq("status", "completed").in("payment_status", [...PAID]);
  }
  return query
    .eq("status", "cancelled")
    .in("payment_status", [...PAID_OR_REFUNDED]);
}

export async function listAppointments(
  filter: AppointmentFilter = {},
): Promise<AdminAppointment[]> {
  if (!supabaseConfigured) return [];
  await completePastAppointments();
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("appointments").select(APPOINTMENT_SELECT);

  const bucket: AdminBucket | undefined =
    filter.bucket ??
    (filter.status === "pending" ||
    filter.status === "completed" ||
    filter.status === "cancelled"
      ? filter.status
      : undefined);

  const searching = Boolean(filter.q?.trim());
  if (!searching) {
    if (filter.from) {
      query = query.gte("starts_at", shopDateBoundsUtc(filter.from).startUtc);
    }
    if (filter.to) {
      query = query.lt("starts_at", shopDateBoundsUtc(filter.to).endUtc);
    }
    if (bucket) {
      query = applyBucket(query, bucket);
    } else {
      query = query.in("payment_status", [...PAID_OR_REFUNDED]);
    }
  } else {
    query = query.in("payment_status", [...PAID_OR_REFUNDED]);
    const safe = sanitizeSearch(filter.q!);
    if (safe) {
      const { data: matches } = await supabase
        .from("profiles")
        .select("id")
        .or(
          `email.ilike.%${safe}%,full_name.ilike.%${safe}%,phone.ilike.%${safe}%`,
        )
        .limit(50);
      const ids = (matches ?? []).map((p) => p.id as string);
      const orParts = [
        `reference_code.ilike.%${safe}%`,
        `guest_email.ilike.%${safe}%`,
        `guest_name.ilike.%${safe}%`,
        `guest_phone.ilike.%${safe}%`,
      ];
      if (ids.length > 0) orParts.push(`customer_id.in.(${ids.join(",")})`);
      query = query.or(orParts.join(","));
    }
  }

  const newestFirst = bucket === "completed" || bucket === "cancelled";
  query = query
    .order("starts_at", { ascending: !newestFirst })
    .limit(filter.limit ?? 200);

  const { data, error } = await query;
  if (error) {
    console.warn("[admin] appointments list:", error.message);
    return [];
  }

  let rows = (data ?? []).map(normaliseAppointment);
  if (filter.q?.trim()) {
    const q = filter.q.trim().toLowerCase();
    rows = rows.filter(
      (row) =>
        row.reference_code.toLowerCase().includes(q) ||
        row.customer?.email.toLowerCase().includes(q) ||
        row.customer?.full_name?.toLowerCase().includes(q) ||
        row.customer?.phone?.toLowerCase().includes(q),
    );
  }
  return rows;
}

export async function appointmentCounts() {
  if (!supabaseConfigured) return { today: 0, upcoming: 0, pending: 0 };
  await completePastAppointments();
  const supabase = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const { startUtc, endUtc } = shopDateBoundsUtc(shopToday());

  const [today, upcoming, pending] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", startUtc)
      .lt("starts_at", endUtc)
      .in("payment_status", [...PAID])
      .in("status", ["pending", "confirmed", "arrived", "completed"]),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gt("ends_at", now)
      .in("status", ["pending", "confirmed", "arrived"])
      .in("payment_status", [...PAID]),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gt("ends_at", now)
      .in("status", ["pending", "confirmed", "arrived"])
      .in("payment_status", [...PAID]),
  ]);

  return {
    today: today.count ?? 0,
    upcoming: upcoming.count ?? 0,
    pending: pending.count ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */

export async function listAllServices(): Promise<ServiceRow[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.warn("[admin] services:", error.message);
    return [];
  }
  return (data ?? []) as ServiceRow[];
}

export async function getServiceRow(id: string): Promise<ServiceRow | null> {
  if (!supabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  return (data ?? null) as ServiceRow | null;
}

/* ------------------------------------------------------------------ */
/*  Hours + breaks + blocked dates                                     */
/* ------------------------------------------------------------------ */

export type AdminBusinessHour = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

export type AdminBreak = {
  id: string;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  label: string | null;
};

export type AdminBlockedDate = {
  id: string;
  date: string;
  reason: string | null;
};

export async function listAdminHours(): Promise<AdminBusinessHour[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("business_hours")
    .select("day_of_week, open_time, close_time, is_closed")
    .order("day_of_week", { ascending: true });
  return (data ?? []) as AdminBusinessHour[];
}

export async function listAdminBreaks(): Promise<AdminBreak[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("breaks")
    .select("id, day_of_week, start_time, end_time, label")
    .order("day_of_week", { ascending: true });
  return (data ?? []) as AdminBreak[];
}

export async function listAdminBlockedDates(): Promise<AdminBlockedDate[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const today = shopToday();
  const { data } = await supabase
    .from("blocked_dates")
    .select("id, date, reason")
    .gte("date", today)
    .order("date", { ascending: true });
  return (data ?? []) as AdminBlockedDate[];
}

/* ------------------------------------------------------------------ */
/*  Customers                                                          */
/* ------------------------------------------------------------------ */

export type AdminCustomer = ProfileRow & {
  appointment_count: number;
  last_appointment_at: string | null;
};

export async function listCustomers(): Promise<AdminCustomer[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const list = (profiles ?? []) as ProfileRow[];
  if (list.length === 0) return [];

  const { data: apts } = await supabase
    .from("appointments")
    .select("customer_id, starts_at")
    .in(
      "customer_id",
      list.map((p) => p.id),
    );

  const byCustomer = new Map<string, { count: number; last: string | null }>();
  for (const row of (apts ?? []) as { customer_id: string; starts_at: string }[]) {
    const existing = byCustomer.get(row.customer_id) ?? { count: 0, last: null };
    existing.count += 1;
    if (!existing.last || row.starts_at > existing.last) existing.last = row.starts_at;
    byCustomer.set(row.customer_id, existing);
  }

  return list.map((p) => {
    const stats = byCustomer.get(p.id);
    return {
      ...p,
      appointment_count: stats?.count ?? 0,
      last_appointment_at: stats?.last ?? null,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Gallery                                                            */
/* ------------------------------------------------------------------ */

export type AdminGalleryItem = {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  category: string | null;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
};

export async function listGallery(): Promise<AdminGalleryItem[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("gallery")
    .select("id, image_url, title, description, category, sort_order, is_featured, created_at")
    .order("sort_order", { ascending: true });
  return (data ?? []) as AdminGalleryItem[];
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

export type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  created_at: string;
  author_name: string | null;
  source: "site" | "google";
  customer: { id: string; full_name: string | null; email: string } | null;
};

export async function listReviews(): Promise<AdminReview[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("reviews")
    .select(
      `id, rating, comment, status, is_featured, created_at, author_name, source,
       customer:profiles ( id, full_name, email )`,
    )
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as AdminReview[];
  return rows.map((r) => ({
    ...r,
    source: r.source === "google" ? "google" : "site",
    customer: Array.isArray(r.customer)
      ? (r.customer[0] ?? null)
      : (r.customer ?? null),
  }));
}

/* ------------------------------------------------------------------ */
/*  Admin-only utilities using the service role                        */
/* ------------------------------------------------------------------ */

export function hasAdminSecrets() {
  return Boolean(supabaseServiceRoleKey);
}

/**
 * Fetches the auth.users row for a customer id. We use the service role
 * because listing raw auth records isn't reachable through RLS. Only called
 * from admin server code.
 */
export async function getAuthEmailFor(userId: string): Promise<string | null> {
  if (!supabaseServiceRoleKey) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}
