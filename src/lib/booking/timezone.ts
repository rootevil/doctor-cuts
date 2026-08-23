import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const SHOP_TZ = "Europe/Rome";

/** Convert a "local" wall-clock string in the shop's timezone to a UTC Date. */
export function shopLocalToUtc(dateISO: string, timeHHMM: string): Date {
  return fromZonedTime(`${dateISO}T${timeHHMM}:00`, SHOP_TZ);
}

/** Convert a UTC/Date to the shop's local zone (for display). */
export function utcToShopLocal(date: Date): Date {
  return toZonedTime(date, SHOP_TZ);
}

/** "YYYY-MM-DD" for a given date interpreted in the shop timezone. */
export function shopDateISO(date: Date): string {
  return formatInTimeZone(date, SHOP_TZ, "yyyy-MM-dd");
}

/** "HH:mm" in the shop timezone. */
export function shopTimeHHMM(date: Date): string {
  return formatInTimeZone(date, SHOP_TZ, "HH:mm");
}

/** ISO day-of-week in the shop timezone: Mon=1 ... Sun=7. */
export function shopDayOfWeek(dateISO: string): number {
  // Parse noon-Rome on the given date to avoid DST midnight ambiguity.
  const utc = shopLocalToUtc(dateISO, "12:00");
  const dow = Number(formatInTimeZone(utc, SHOP_TZ, "i"));
  return dow;
}

/**
 * Bounds of a shop-local calendar date, expressed as UTC ISO strings.
 * Useful for querying appointments overlapping a given day.
 */
export function shopDateBoundsUtc(dateISO: string): { startUtc: string; endUtc: string } {
  const start = shopLocalToUtc(dateISO, "00:00");
  const end = shopLocalToUtc(shiftDate(dateISO, 1), "00:00");
  return { startUtc: start.toISOString(), endUtc: end.toISOString() };
}

/** Shift a "YYYY-MM-DD" by N whole days without touching the timezone. */
export function shiftDate(dateISO: string, days: number): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Today, in the shop's calendar. */
export function shopToday(now: Date = new Date()): string {
  return shopDateISO(now);
}

/** Format a Date as a locale-aware weekday + day + month string in shop tz. */
export function formatShopLong(date: Date, locale: "it" | "en"): string {
  return formatInTimeZone(
    date,
    SHOP_TZ,
    locale === "it" ? "EEEE d MMMM" : "EEEE d MMMM",
    { locale: undefined },
  );
}
