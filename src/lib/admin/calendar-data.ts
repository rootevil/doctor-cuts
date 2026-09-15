import "server-only";

import { computeSlotGrid, type SlotState } from "@/lib/booking/availability";
import { BOOKING_SLOT_MINUTES } from "@/lib/booking/slot";
import {
  shiftDate,
  shopDateBoundsUtc,
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
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import type { AppointmentStatus } from "@/lib/supabase/types";
import {
  appointmentIsHardDeletable,
  type AdminAppointment,
} from "@/lib/admin/data";
import { expireStalePaymentHolds } from "@/lib/payments/expire";
import { completePastAppointments } from "@/lib/payments/complete";

export type AdminCalendarAppointment = AdminAppointment;

export type AdminCalendarSlot = {
  startsAt: string;
  state: SlotState;
  appointment: AdminCalendarAppointment | null;
  /** Present when state is "break" — configured pause window, e.g. "14:00–16:00". */
  breakWindow?: string;
};

export type AdminCalendarDay = {
  dateISO: string;
  blocked: boolean;
  closed: boolean;
  slots: AdminCalendarSlot[];
};

const APPOINTMENT_SELECT = `
  id, starts_at, ends_at, status, reference_code, customer_notes, admin_notes,
  payment_status, deposit_cents,
  guest_name, guest_email, guest_phone,
  customer:profiles ( id, full_name, email, phone ),
  service:services ( id, slug, name, price, duration_minutes )
`;

function normaliseCalendarAppointment(row: unknown): AdminCalendarAppointment {
  const r = row as Record<string, unknown>;
  const oneOrArr = <T,>(v: T | T[] | null | undefined): T | null =>
    Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
  const linked = oneOrArr(
    r.customer as AdminCalendarAppointment["customer"],
  );
  const guestEmail = (r.guest_email as string | null) ?? null;
  const guestName = (r.guest_name as string | null) ?? null;
  const guestPhone = (r.guest_phone as string | null) ?? null;
  const status = r.status as AppointmentStatus;
  const paymentStatus = (r.payment_status as string) ?? "none";
  const endsAt = r.ends_at as string;
  const live =
    status === "pending" || status === "confirmed" || status === "arrived";
  const notEnded = new Date(endsAt).getTime() > Date.now();
  const visiblePay = paymentStatus === "paid" || paymentStatus === "none";
  return {
    id: r.id as string,
    starts_at: r.starts_at as string,
    ends_at: endsAt,
    status,
    reference_code: r.reference_code as string,
    customer_notes: (r.customer_notes as string | null) ?? null,
    admin_notes: (r.admin_notes as string | null) ?? null,
    payment_status: paymentStatus,
    deposit_cents: Number(r.deposit_cents ?? 0),
    can_cancel: live && visiblePay && notEnded,
    can_refund:
      paymentStatus === "paid" && (live || status === "cancelled"),
    can_delete: appointmentIsHardDeletable({
      status,
      payment_status: paymentStatus,
    }),
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
    service: oneOrArr(r.service as AdminCalendarAppointment["service"]),
  };
}

async function listLiveAppointmentsForDate(dateISO: string) {
  if (!supabaseConfigured || !supabaseServiceRoleKey) return [];
  const admin = createSupabaseAdminClient();
  const { startUtc, endUtc } = shopDateBoundsUtc(dateISO);
  // Include completed so today’s calendar still shows who already came in.
  const { data, error } = await admin
    .from("appointments")
    .select(APPOINTMENT_SELECT)
    .in("status", ["pending", "confirmed", "arrived", "completed"])
    .in("payment_status", ["paid", "none"])
    .lt("starts_at", endUtc)
    .gt("ends_at", startUtc)
    .order("starts_at", { ascending: true });
  if (error) {
    console.warn("[admin] calendar day fetch:", error.message);
    return [];
  }
  return (data ?? []).map(normaliseCalendarAppointment);
}

/**
 * Shop day grid for admin. Notice hours are ignored so walk-ins can take
 * the next free chair; past slots stay unavailable unless already booked.
 */
export async function getAdminCalendarDay(
  dateISO: string,
  opts?: { ignoreAppointmentId?: string | null },
): Promise<AdminCalendarDay> {
  await expireStalePaymentHolds();
  await completePastAppointments();

  const [hours, breaks, blocked, bookings, appointments] = await Promise.all([
    getBusinessHours(),
    getBreaks(),
    isDateBlocked(dateISO),
    getBookingsForDate(dateISO, opts?.ignoreAppointmentId),
    listLiveAppointmentsForDate(dateISO),
  ]);

  const dayHours = hours.find((h) => h.day_of_week === shopDayOfWeek(dateISO));
  const closed = Boolean(
    blocked || !dayHours || dayHours.is_closed || !dayHours.open_time,
  );

  if (closed) {
    return { dateISO, blocked, closed: true, slots: [] };
  }

  const settings = await getSettings();
  const grid = computeSlotGrid({
    dateISO,
    dayOfWeek: shopDayOfWeek(dateISO),
    serviceDurationMinutes: BOOKING_SLOT_MINUTES,
    slotIntervalMinutes: BOOKING_SLOT_MINUTES,
    bookingNoticeHours: 0,
    now: new Date(),
    hours,
    breaks,
    blockedDate: false,
    bookings,
  });

  const today = shopToday();
  const lastDay = shiftDate(today, settings.max_booking_days);
  const byStart = new Map(
    appointments.map((a) => [new Date(a.starts_at).toISOString(), a]),
  );

  const slots: AdminCalendarSlot[] = grid.map((slot) => {
    const appointment = byStart.get(slot.startsAt) ?? null;
    if (appointment) {
      return {
        startsAt: slot.startsAt,
        state: "booked",
        appointment,
      };
    }
    if (dateISO > lastDay && slot.state === "available") {
      return {
        startsAt: slot.startsAt,
        state: "unavailable",
        appointment: null,
      };
    }
    return {
      startsAt: slot.startsAt,
      state: slot.state,
      appointment: null,
      breakWindow: slot.breakWindow,
    };
  });

  return { dateISO, blocked, closed: false, slots };
}

export async function getAdminCalendarWeek(startISO: string) {
  return Promise.all(
    Array.from({ length: 7 }, (_, i) =>
      getAdminCalendarDay(shiftDate(startISO, i)),
    ),
  );
}

/** Monday of the week containing dateISO (shop calendar). */
export function weekStartMonday(dateISO: string) {
  const dow = shopDayOfWeek(dateISO);
  return shiftDate(dateISO, 1 - dow);
}
