import { shiftDate, shopLocalToUtc } from "./timezone";

/**
 * Pure slot-generation logic. All inputs are already normalised to UTC or
 * shop-local strings; this function has no side effects and can be reused
 * on both the server (real availability) and in unit tests.
 */

export type BusinessHour = {
  day_of_week: number; // 1..7, Mon..Sun
  open_time: string | null; // "HH:mm:ss" or null
  close_time: string | null;
  is_closed: boolean;
};

export type Break = {
  day_of_week: number | null; // null = every day
  start_time: string; // "HH:mm:ss"
  end_time: string;
};

export type ExistingBooking = {
  starts_at: string; // ISO UTC
  ends_at: string;
};

export type AvailabilityInput = {
  dateISO: string; // "YYYY-MM-DD" in shop timezone
  dayOfWeek: number; // 1..7
  serviceDurationMinutes: number;
  slotIntervalMinutes: number;
  bookingNoticeHours: number;
  now: Date;
  hours: BusinessHour[];
  breaks: Break[];
  blockedDate: boolean;
  bookings: ExistingBooking[];
};

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Returns an array of ISO UTC strings — the slot *start* times. */
export function computeSlots(input: AvailabilityInput): string[] {
  if (input.blockedDate) return [];

  const dayHours = input.hours.find((h) => h.day_of_week === input.dayOfWeek);
  if (!dayHours || dayHours.is_closed || !dayHours.open_time || !dayHours.close_time) {
    return [];
  }

  const openMin = hhmmToMinutes(dayHours.open_time);
  const closeMin = hhmmToMinutes(dayHours.close_time);
  const duration = input.serviceDurationMinutes;
  const step = Math.max(5, input.slotIntervalMinutes);

  const noticeCutoff = new Date(input.now.getTime() + input.bookingNoticeHours * 3_600_000);

  // Existing bookings + breaks reshaped as [startMinute, endMinute) in shop-local for the day.
  const blocks: Array<[number, number]> = [];

  for (const b of input.breaks) {
    if (b.day_of_week !== null && b.day_of_week !== input.dayOfWeek) continue;
    blocks.push([hhmmToMinutes(b.start_time), hhmmToMinutes(b.end_time)]);
  }

  for (const booking of input.bookings) {
    const s = new Date(booking.starts_at);
    const e = new Date(booking.ends_at);
    // Convert to shop-local minutes on `dateISO`. If the booking straddles
    // midnight in shop time, we still get a clean interval by comparing to
    // the day's UTC bounds via shopLocalToUtc anchors.
    const dayStartUtc = shopLocalToUtc(input.dateISO, "00:00").getTime();
    const startMin = Math.floor((s.getTime() - dayStartUtc) / 60_000);
    const endMin = Math.ceil((e.getTime() - dayStartUtc) / 60_000);
    if (endMin <= 0 || startMin >= 24 * 60) continue;
    blocks.push([Math.max(0, startMin), Math.min(24 * 60, endMin)]);
  }

  const slots: string[] = [];

  for (let start = openMin; start + duration <= closeMin; start += step) {
    const end = start + duration;

    const overlaps = blocks.some(([bs, be]) => start < be && end > bs);
    if (overlaps) continue;

    const startUtc = shopLocalToUtc(input.dateISO, minutesToHHMM(start));
    if (startUtc < noticeCutoff) continue;

    slots.push(startUtc.toISOString());
  }

  return slots;
}

/** Convenience: shift a date by N days (re-exported for consumers). */
export const nextDate = (dateISO: string, days: number) => shiftDate(dateISO, days);
