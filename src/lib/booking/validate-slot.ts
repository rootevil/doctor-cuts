import "server-only";

import { computeSlotGrid } from "@/lib/booking/availability";
import { BOOKING_SLOT_MINUTES } from "@/lib/booking/slot";
import {
  shiftDate,
  shopDateISO,
  shopDayOfWeek,
  shopToday,
} from "@/lib/booking/timezone";
import { getBookingsForDate } from "@/lib/data/appointments";
import {
  getBusinessHours,
  getBreaks,
  isDateBlocked,
} from "@/lib/data/hours";
import { getSettings } from "@/lib/data/settings";
import { getServiceById } from "@/lib/data/services";

export type SlotValidationFailure =
  | "unknown_service"
  | "inactive_service"
  | "invalid_time"
  | "beyond_window"
  | "slot_unavailable"
  | "bookings_closed";

/**
 * Server-side mirror of the slot grid shown in Prenota.
 * Rejects times outside hours, notice, blocked days, or the booking window.
 */
export async function assertSlotBookable(input: {
  serviceId: string;
  startsAtUTC: string;
  /** When rescheduling, ignore the current appointment so its chair stays free. */
  ignoreAppointmentId?: string | null;
}): Promise<{ ok: true } | { ok: false; reason: SlotValidationFailure }> {
  const service = await getServiceById(input.serviceId);
  if (!service) return { ok: false, reason: "unknown_service" };
  // Reschedule keeps the original service even if it was later deactivated.
  if (!service.is_active && !input.ignoreAppointmentId) {
    return { ok: false, reason: "inactive_service" };
  }

  const settings = await getSettings();
  if (!settings.bookings_enabled) return { ok: false, reason: "bookings_closed" };

  const startsAt = new Date(input.startsAtUTC);
  if (Number.isNaN(startsAt.getTime())) return { ok: false, reason: "invalid_time" };

  const dateISO = shopDateISO(startsAt);
  const today = shopToday();
  if (dateISO < today) return { ok: false, reason: "invalid_time" };

  const lastBookableDay = shiftDate(today, settings.max_booking_days);
  if (dateISO > lastBookableDay) return { ok: false, reason: "beyond_window" };

  const [hours, breaks, blocked, bookings] = await Promise.all([
    getBusinessHours(),
    getBreaks(),
    isDateBlocked(dateISO),
    getBookingsForDate(dateISO, input.ignoreAppointmentId),
  ]);

  const slots = computeSlotGrid({
    dateISO,
    dayOfWeek: shopDayOfWeek(dateISO),
    serviceDurationMinutes: BOOKING_SLOT_MINUTES,
    slotIntervalMinutes: BOOKING_SLOT_MINUTES,
    bookingNoticeHours: settings.booking_notice_hours,
    now: new Date(),
    hours,
    breaks,
    blockedDate: blocked,
    bookings,
  });

  const match = slots.find(
    (slot) => slot.startsAt === startsAt.toISOString() && slot.state === "available",
  );
  if (!match) return { ok: false, reason: "slot_unavailable" };

  return { ok: true };
}
