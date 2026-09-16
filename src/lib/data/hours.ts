import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import type { BusinessHour, Break } from "@/lib/booking/availability";
import { shopDayOfWeek, shiftDate } from "@/lib/booking/timezone";

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

export type SpecialHours = {
  date: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  label: string | null;
};

/** Resolved schedule for one shop-local calendar day. */
export type DaySchedule = {
  blocked: boolean;
  /** When set, use instead of the weekly row for this date. */
  hoursOverride: Pick<BusinessHour, "open_time" | "close_time" | "is_closed"> | null;
  special: SpecialHours | null;
};

async function hoursClient() {
  if (supabaseServiceRoleKey) return createSupabaseAdminClient();
  return createSupabaseServerClient();
}

function normalizeBreak(row: {
  day_of_week: number | null;
  start_time: string;
  end_time: string;
}): Break {
  return {
    day_of_week: row.day_of_week == null ? null : Number(row.day_of_week),
    start_time: String(row.start_time),
    end_time: String(row.end_time),
  };
}

function mapSpecialHours(row: {
  date: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  label: string | null;
}): SpecialHours {
  return {
    date: String(row.date),
    open_time: row.open_time ? String(row.open_time) : null,
    close_time: row.close_time ? String(row.close_time) : null,
    is_closed: Boolean(row.is_closed),
    label: (row.label as string | null) ?? null,
  };
}

export async function getBusinessHours(): Promise<BusinessHour[]> {
  if (!supabaseConfigured) return DEFAULT_HOURS;
  const supabase = await hoursClient();
  const { data } = await supabase
    .from("business_hours")
    .select("day_of_week, open_time, close_time, is_closed")
    .order("day_of_week", { ascending: true });
  if (!data || data.length === 0) return DEFAULT_HOURS;
  return data.map((row) => ({
    day_of_week: Number(row.day_of_week),
    open_time: row.open_time ? String(row.open_time) : null,
    close_time: row.close_time ? String(row.close_time) : null,
    is_closed: Boolean(row.is_closed),
  }));
}

export async function getBreaks(): Promise<Break[]> {
  if (!supabaseConfigured) return [];
  const supabase = await hoursClient();
  const { data } = await supabase
    .from("breaks")
    .select("day_of_week, start_time, end_time");
  return (data ?? []).map(normalizeBreak);
}

export async function isDateBlocked(dateISO: string): Promise<boolean> {
  if (!supabaseConfigured) return false;
  const supabase = await hoursClient();
  const { data } = await supabase
    .from("blocked_dates")
    .select("date")
    .eq("date", dateISO)
    .maybeSingle();
  return Boolean(data);
}

export async function getBlockedDates(fromISO: string, toISO: string): Promise<string[]> {
  if (!supabaseConfigured) return [];
  const supabase = await hoursClient();
  const { data } = await supabase
    .from("blocked_dates")
    .select("date")
    .gte("date", fromISO)
    .lte("date", toISO);
  return (data ?? []).map((r: { date: string }) => r.date);
}

export async function getSpecialHoursForDate(
  dateISO: string,
): Promise<SpecialHours | null> {
  if (!supabaseConfigured) return null;
  const supabase = await hoursClient();
  const { data } = await supabase
    .from("special_hours")
    .select("date, open_time, close_time, is_closed, label")
    .eq("date", dateISO)
    .maybeSingle();
  if (!data) return null;
  return mapSpecialHours(data);
}

export async function getSpecialHoursInRange(
  fromISO: string,
  toISO: string,
): Promise<SpecialHours[]> {
  if (!supabaseConfigured) return [];
  const supabase = await hoursClient();
  const { data } = await supabase
    .from("special_hours")
    .select("date, open_time, close_time, is_closed, label")
    .gte("date", fromISO)
    .lte("date", toISO);
  return (data ?? []).map(mapSpecialHours);
}

/**
 * Whether the shop accepts bookings on this date given weekly hours,
 * blocked dates, and special-hour overrides (same priority as resolveDaySchedule).
 */
export function isShopClosedOnDate(
  dateISO: string,
  hours: BusinessHour[],
  blockedDates: ReadonlySet<string>,
  specialByDate: ReadonlyMap<string, SpecialHours>,
): boolean {
  if (blockedDates.has(dateISO)) return true;

  const special = specialByDate.get(dateISO);
  if (special) {
    return (
      special.is_closed ||
      !special.open_time ||
      !special.close_time ||
      special.close_time <= special.open_time
    );
  }

  const weekly = hours.find((h) => h.day_of_week === shopDayOfWeek(dateISO));
  return (
    !weekly ||
    weekly.is_closed ||
    !weekly.open_time ||
    !weekly.close_time ||
    weekly.close_time <= weekly.open_time
  );
}

/**
 * Closed / blocked dates inside the booking window for the public calendar.
 * Special open days (even on a normally closed weekday) stay bookable.
 */
export async function getClosedBookingDates(
  fromISO: string,
  toISO: string,
): Promise<string[]> {
  if (toISO < fromISO) return [];

  const [hours, blocked, specials] = await Promise.all([
    getBusinessHours(),
    getBlockedDates(fromISO, toISO),
    getSpecialHoursInRange(fromISO, toISO),
  ]);

  const blockedSet = new Set(blocked);
  const specialByDate = new Map(specials.map((s) => [s.date, s]));
  const closed: string[] = [];

  for (let cursor = fromISO; cursor <= toISO; cursor = shiftDate(cursor, 1)) {
    if (isShopClosedOnDate(cursor, hours, blockedSet, specialByDate)) {
      closed.push(cursor);
    }
  }

  return closed;
}

/**
 * Priority: blocked date → special hours for that date → weekly template.
 * Special closed days count as blocked for slot generation.
 */
export async function resolveDaySchedule(dateISO: string): Promise<DaySchedule> {
  const [blocked, special] = await Promise.all([
    isDateBlocked(dateISO),
    getSpecialHoursForDate(dateISO),
  ]);

  if (blocked) {
    return { blocked: true, hoursOverride: null, special: null };
  }

  if (special) {
    if (special.is_closed) {
      return {
        blocked: true,
        hoursOverride: {
          open_time: null,
          close_time: null,
          is_closed: true,
        },
        special,
      };
    }
    return {
      blocked: false,
      hoursOverride: {
        open_time: special.open_time,
        close_time: special.close_time,
        is_closed: false,
      },
      special,
    };
  }

  return { blocked: false, hoursOverride: null, special: null };
}
