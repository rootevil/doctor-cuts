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

/**
 * available = bookable
 * booked = taken
 * break = inside a configured pause (lunch etc.)
 * unavailable = too soon / past / outside bookable window
 */
export type SlotState = "available" | "booked" | "break" | "unavailable";

export type SlotOption = {
  startsAt: string;
  state: SlotState;
};

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function overlapsRange(
  start: number,
  end: number,
  ranges: Array<[number, number]>,
): boolean {
  return ranges.some(([bs, be]) => start < be && end > bs);
}

function bookingRanges(
  dateISO: string,
  bookings: ExistingBooking[],
): Array<[number, number]> {
  const dayStartUtc = shopLocalToUtc(dateISO, "00:00").getTime();
  const ranges: Array<[number, number]> = [];
  for (const booking of bookings) {
    const s = new Date(booking.starts_at);
    const e = new Date(booking.ends_at);
    const startMin = Math.floor((s.getTime() - dayStartUtc) / 60_000);
    const endMin = Math.ceil((e.getTime() - dayStartUtc) / 60_000);
    if (endMin <= 0 || startMin >= 24 * 60) continue;
    ranges.push([Math.max(0, startMin), Math.min(24 * 60, endMin)]);
  }
  return ranges;
}

function breakRanges(dayOfWeek: number, breaks: Break[]): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const b of breaks) {
    // null / undefined = every day (admin “Ogni giorno”)
    if (b.day_of_week != null && Number(b.day_of_week) !== dayOfWeek) continue;
    const start = hhmmToMinutes(b.start_time);
    const end = hhmmToMinutes(b.end_time);
    if (!(end > start)) continue;
    ranges.push([start, end]);
  }
  return ranges;
}

/**
 * Slot starts on the interval grid from open, plus a final start that ends
 * exactly at close when the grid would otherwise stop early
 * (e.g. 08:30 + 40m → last grid 19:50, but close 21:00 also needs 20:20).
 */
export function slotStartMinutes(
  openMin: number,
  closeMin: number,
  duration: number,
  step: number,
): number[] {
  if (!(closeMin > openMin) || duration <= 0) return [];
  const interval = Math.max(5, step);
  const starts: number[] = [];
  for (let start = openMin; start + duration <= closeMin; start += interval) {
    starts.push(start);
  }
  const lastPossible = closeMin - duration;
  if (lastPossible >= openMin && !starts.includes(lastPossible)) {
    starts.push(lastPossible);
    starts.sort((a, b) => a - b);
  }
  return starts;
}

/**
 * Full day grid with status so the UI can show available (green) vs booked (red).
 * Cancelled appointments are not in `bookings` — they free the slot again.
 */
export function computeSlotGrid(input: AvailabilityInput): SlotOption[] {
  if (input.blockedDate) return [];

  const dayHours = input.hours.find((h) => h.day_of_week === input.dayOfWeek);
  if (!dayHours || dayHours.is_closed || !dayHours.open_time || !dayHours.close_time) {
    return [];
  }

  const openMin = hhmmToMinutes(dayHours.open_time);
  const closeMin = hhmmToMinutes(dayHours.close_time);
  const duration = input.serviceDurationMinutes;
  const step = Math.max(5, input.slotIntervalMinutes);
  const noticeCutoff = new Date(
    input.now.getTime() + input.bookingNoticeHours * 3_600_000,
  );

  const taken = bookingRanges(input.dateISO, input.bookings);
  const paused = breakRanges(input.dayOfWeek, input.breaks);
  const starts = slotStartMinutes(openMin, closeMin, duration, step);

  const slots: SlotOption[] = [];

  for (const start of starts) {
    const end = start + duration;
    const startUtc = shopLocalToUtc(input.dateISO, minutesToHHMM(start));

    let state: SlotState = "available";
    if (overlapsRange(start, end, paused)) {
      state = "break";
    } else if (startUtc < noticeCutoff) {
      state = "unavailable";
    } else if (overlapsRange(start, end, taken)) {
      state = "booked";
    }

    slots.push({ startsAt: startUtc.toISOString(), state });
  }

  return slots;
}

/** Open (bookable) start times only — used where a flat list is enough. */
export function computeSlots(input: AvailabilityInput): string[] {
  return computeSlotGrid(input)
    .filter((s) => s.state === "available")
    .map((s) => s.startsAt);
}

/** Convenience: shift a date by N days (re-exported for consumers). */
export const nextDate = (dateISO: string, days: number) => shiftDate(dateISO, days);
