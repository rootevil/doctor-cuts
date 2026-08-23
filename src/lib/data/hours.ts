import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import type { BusinessHour, Break } from "@/lib/booking/availability";

/** Reasonable fallback so the wizard still renders before the seed is run. */
export const DEFAULT_HOURS: BusinessHour[] = [
  { day_of_week: 1, open_time: "08:30:00", close_time: "21:00:00", is_closed: false },
  { day_of_week: 2, open_time: "08:30:00", close_time: "21:00:00", is_closed: false },
  { day_of_week: 3, open_time: "08:30:00", close_time: "21:00:00", is_closed: false },
  { day_of_week: 4, open_time: "08:30:00", close_time: "21:00:00", is_closed: false },
  { day_of_week: 5, open_time: "08:30:00", close_time: "21:00:00", is_closed: false },
  { day_of_week: 6, open_time: "08:30:00", close_time: "21:00:00", is_closed: false },
  { day_of_week: 7, open_time: null, close_time: null, is_closed: true },
];

export async function getBusinessHours(): Promise<BusinessHour[]> {
  if (!supabaseConfigured) return DEFAULT_HOURS;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("business_hours")
    .select("day_of_week, open_time, close_time, is_closed")
    .order("day_of_week", { ascending: true });
  if (!data || data.length === 0) return DEFAULT_HOURS;
  return data as BusinessHour[];
}

export async function getBreaks(): Promise<Break[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("breaks")
    .select("day_of_week, start_time, end_time");
  return (data ?? []) as Break[];
}

export async function isDateBlocked(dateISO: string): Promise<boolean> {
  if (!supabaseConfigured) return false;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("blocked_dates")
    .select("date")
    .eq("date", dateISO)
    .maybeSingle();
  return Boolean(data);
}

export async function getBlockedDates(fromISO: string, toISO: string): Promise<string[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("blocked_dates")
    .select("date")
    .gte("date", fromISO)
    .lte("date", toISO);
  return (data ?? []).map((r: { date: string }) => r.date);
}
