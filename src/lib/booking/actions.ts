"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { computeSlotGrid, type SlotOption } from "@/lib/booking/availability";
import { BOOKING_SLOT_MINUTES } from "@/lib/booking/slot";
import { SHOP_TZ, shopDayOfWeek, shopToday } from "@/lib/booking/timezone";
import { getBookingsForDate } from "@/lib/data/appointments";
import {
  getBusinessHours,
  getBreaks,
  isDateBlocked,
} from "@/lib/data/hours";
import { getSettings } from "@/lib/data/settings";
import { getServiceById } from "@/lib/data/services";
import { bookingAlertAddress, sendEmail } from "@/lib/email/send";
import {
  confirmationEmail,
  cancellationEmail,
  shopBookingAlertEmail,
  shopCancellationAlertEmail,
  resolveCustomerDisplayName,
} from "@/lib/email/templates";
import type { Locale } from "@/i18n/config";
import { localizedServiceName } from "@/lib/services/localize";
import { routes } from "@/lib/routes";
import {
  bookingInputSchema,
  cancelBookingSchema,
  guestManageSchema,
  isoDateSchema,
  uuidSchema,
  fdToObject,
} from "@/lib/security/schemas";
import { limitByIp, limitByKey } from "@/lib/security/rate-limit";
import { generateManageToken, tokensEqual } from "@/lib/booking/token";
import { siteUrl } from "@/lib/seo/site-url";
import type { AppointmentStatus } from "@/lib/supabase/types";

export type SlotList = {
  ok: true;
  dateISO: string;
  timezone: string;
  slots: SlotOption[];
  bookingsEnabled: boolean;
} | {
  ok: false;
  reason:
    | "not_configured"
    | "invalid_input"
    | "unknown_service"
    | "past_date"
    | "beyond_window"
    | "bookings_closed";
};

export async function getAvailableSlots(
  serviceId: string,
  dateISO: string,
): Promise<SlotList> {
  if (!supabaseConfigured) return { ok: false, reason: "not_configured" };

  const parsedDate = isoDateSchema.safeParse(dateISO);
  const parsedId = uuidSchema.safeParse(serviceId);
  if (!parsedDate.success || !parsedId.success) {
    return { ok: false, reason: "invalid_input" };
  }

  const rl = await limitByIp("slots", 60, 60_000);
  if (!rl.ok) return { ok: false, reason: "invalid_input" };

  const service = await getServiceById(parsedId.data);
  if (!service) return { ok: false, reason: "unknown_service" };

  const settings = await getSettings();
  if (!settings.bookings_enabled) {
    return { ok: false, reason: "bookings_closed" };
  }

  const today = shopToday();
  if (dateISO < today) return { ok: false, reason: "past_date" };

  const [hours, breaks, blocked, bookings] = await Promise.all([
    getBusinessHours(),
    getBreaks(),
    isDateBlocked(dateISO),
    getBookingsForDate(dateISO),
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

  return {
    ok: true,
    dateISO,
    timezone: SHOP_TZ,
    slots,
    bookingsEnabled: true,
  };
}

export type CreateBookingInput = {
  serviceId: string;
  startsAtUTC: string;
  notes?: string;
  locale: Locale;
  guest?: { name: string; email: string; phone?: string };
};

export type CreateBookingResult =
  | {
      ok: true;
      referenceCode: string;
      appointmentId: string;
      managePath: string;
      isGuest: boolean;
    }
  | {
      ok: false;
      reason:
        | "not_configured"
        | "auth_required"
        | "guest_required"
        | "unknown_service"
        | "invalid_time"
        | "slot_taken"
        | "bookings_closed"
        | "unknown";
      message?: string;
    };

/**
 * Creates an appointment for the signed-in user, or as a guest when
 * `guest` details are provided. Overlap safety comes from the DB
 * exclusion constraint (`appointments_no_overlap`).
 */
export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  if (!supabaseConfigured) return { ok: false, reason: "not_configured" };

  const parsed = bookingInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid_time" };
  const validated = parsed.data;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guest = validated.guest;
  if (!user && !guest) return { ok: false, reason: "guest_required" };

  const ipRl = await limitByIp("createBooking", 20, 60 * 60_000);
  if (!ipRl.ok) return { ok: false, reason: "unknown", message: "rate_limited" };

  if (user) {
    const userRl = await limitByKey("createBooking", user.id, 10, 60 * 60_000);
    if (!userRl.ok) return { ok: false, reason: "unknown", message: "rate_limited" };
  } else if (guest) {
    const emailRl = await limitByKey(
      "createBookingGuest",
      guest.email.toLowerCase(),
      8,
      60 * 60_000,
    );
    if (!emailRl.ok) return { ok: false, reason: "unknown", message: "rate_limited" };
  }

  const service = await getServiceById(validated.serviceId);
  if (!service) return { ok: false, reason: "unknown_service" };

  const settings = await getSettings();
  if (!settings.bookings_enabled) {
    return { ok: false, reason: "bookings_closed" };
  }

  const startsAt = new Date(validated.startsAtUTC);
  if (Number.isNaN(startsAt.getTime())) return { ok: false, reason: "invalid_time" };
  const endsAt = new Date(startsAt.getTime() + BOOKING_SLOT_MINUTES * 60_000);

  const initialStatus = settings.require_confirmation ? "pending" : "confirmed";
  const manageToken = user ? null : generateManageToken();
  const writer =
    !user && supabaseServiceRoleKey ? createSupabaseAdminClient() : supabase;

  const { data, error } = user
    ? await supabase
        .from("appointments")
        .insert({
          customer_id: user.id,
          service_id: service.id,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: initialStatus,
          customer_notes: validated.notes || null,
          locale: validated.locale,
        })
        .select("id, reference_code")
        .single()
    : await writer
        .from("appointments")
        .insert({
          customer_id: null,
          guest_name: guest!.name,
          guest_email: guest!.email,
          guest_phone: guest!.phone || null,
          manage_token: manageToken,
          service_id: service.id,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: initialStatus,
          customer_notes: validated.notes || null,
          locale: validated.locale,
        })
        .select("id, reference_code")
        .single();

  if (error) {
    if (error.code === "23P01") return { ok: false, reason: "slot_taken" };
    console.warn("[booking] insert failed:", error.message);
    return { ok: false, reason: "unknown", message: error.message };
  }

  const isGuest = !user;
  const managePath = isGuest && manageToken
    ? routes(validated.locale).manageBooking(data.reference_code, manageToken)
    : routes(validated.locale).account;

  let to: string | null = null;
  let customerName: string | null = null;
  let customerPhone: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle();
    to = profile?.email ?? user.email ?? null;
    const meta = user.user_metadata as
      | { full_name?: string; phone?: string }
      | undefined;
    customerName = resolveCustomerDisplayName({
      fullName: profile?.full_name,
      metaFullName: meta?.full_name,
      email: to,
    });
    customerPhone =
      profile?.phone?.trim() ||
      (typeof meta?.phone === "string" ? meta.phone.trim() : "") ||
      null;
  } else if (guest) {
    to = guest.email;
    customerName = resolveCustomerDisplayName({
      guestName: guest.name,
      email: guest.email,
    });
    customerPhone = guest.phone?.trim() || null;
  }

  const origin = await siteOrigin();
  const serviceLabel = localizedServiceName(
    validated.locale,
    service.slug,
    service.name,
  );

  if (to) {
    const template = confirmationEmail({
      locale: validated.locale,
      customerName,
      serviceName: serviceLabel,
      startsAt: startsAt.toISOString(),
      durationMinutes: BOOKING_SLOT_MINUTES,
      referenceCode: data.reference_code,
      price: Number(service.price),
      settings,
      manageUrl: `${origin}${managePath}`,
    });
    await sendEmail({ to, ...template });

    const alert = shopBookingAlertEmail({
      customerName,
      customerEmail: to,
      customerPhone,
      serviceName: localizedServiceName("en", service.slug, service.name),
      startsAt: startsAt.toISOString(),
      durationMinutes: BOOKING_SLOT_MINUTES,
      referenceCode: data.reference_code,
      price: Number(service.price),
      status: initialStatus,
      notes: validated.notes?.trim() || null,
      adminUrl: `${origin}${routes("it").adminAppointments}`,
    });
    await sendEmail({
      to: bookingAlertAddress(),
      ...alert,
      replyTo: to,
    });
  }

  revalidatePath(routes(validated.locale).account);
  revalidatePath(routes(validated.locale).accountAppointments);
  revalidatePath(routes(validated.locale).admin, "layout");
  return {
    ok: true,
    referenceCode: data.reference_code,
    appointmentId: data.id,
    managePath,
    isGuest,
  };
}

export type CancelResult = {
  ok: boolean;
  reason?: "not_configured" | "auth_required" | "not_found" | "too_late" | "unknown";
  message?: string;
};

export async function cancelBooking(formData: FormData): Promise<CancelResult> {
  if (!supabaseConfigured) return { ok: false, reason: "not_configured" };

  const parsed = cancelBookingSchema.safeParse(fdToObject(formData));
  if (!parsed.success) return { ok: false, reason: "not_found" };
  const { appointment_id: appointmentId, locale } = parsed.data;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "auth_required" };

  const rl = await limitByKey("cancelBooking", user.id, 20, 60 * 60_000);
  if (!rl.ok) return { ok: false, reason: "unknown", message: "rate_limited" };

  const { data: existing, error: fetchErr } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, reference_code, customer_notes, customer_id, service:services ( id, slug, name, price, duration_minutes )",
    )
    .eq("id", appointmentId)
    .maybeSingle();

  if (fetchErr || !existing) return { ok: false, reason: "not_found" };
  if (existing.customer_id !== user.id) return { ok: false, reason: "not_found" };

  const settings = await getSettings();
  const now = new Date();
  const cutoff = new Date(
    new Date(existing.starts_at).getTime() - settings.cancellation_hours * 3_600_000,
  );
  if (now > cutoff) return { ok: false, reason: "too_late" };

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId);
  if (error) {
    console.warn("[booking] cancel failed:", error.message);
    return { ok: false, reason: "unknown", message: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  const service = Array.isArray(existing.service) ? existing.service[0] : existing.service;
  const to = profile?.email ?? user.email;
  if (to && service) {
    const origin = await siteOrigin();
    const meta = user.user_metadata as
      | { full_name?: string; phone?: string }
      | undefined;
    const customerName = resolveCustomerDisplayName({
      fullName: profile?.full_name,
      metaFullName: meta?.full_name,
      email: to,
    });
    const customerPhone =
      profile?.phone?.trim() ||
      (typeof meta?.phone === "string" ? meta.phone.trim() : "") ||
      null;
    const durationMinutes = BOOKING_SLOT_MINUTES;

    const template = cancellationEmail({
      locale,
      customerName,
      serviceName: localizedServiceName(locale, service.slug, service.name),
      startsAt: existing.starts_at,
      durationMinutes,
      referenceCode: existing.reference_code,
      price: Number(service.price),
      settings,
      manageUrl: `${origin}${routes(locale).account}`,
    });
    await sendEmail({ to, ...template });

    const alert = shopCancellationAlertEmail({
      customerName,
      customerEmail: to,
      customerPhone,
      serviceName: localizedServiceName("en", service.slug, service.name),
      startsAt: existing.starts_at,
      durationMinutes,
      referenceCode: existing.reference_code,
      price: Number(service.price),
      adminUrl: `${origin}${routes("it").adminAppointments}`,
    });
    await sendEmail({
      to: bookingAlertAddress(),
      ...alert,
      replyTo: to,
    });
  }

  revalidatePath(routes(locale).account);
  revalidatePath(routes(locale).accountAppointments);
  revalidatePath(routes(locale).admin, "layout");
  return { ok: true };
}

export type GuestAppointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  reference_code: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  service_name: string;
  service_slug: string;
  duration_minutes: number;
  price: number;
  can_cancel: boolean;
};

export async function getGuestAppointment(
  referenceCode: string,
  token: string,
): Promise<GuestAppointment | null> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) return null;
  const parsed = guestManageSchema.safeParse({
    locale: "it",
    reference_code: referenceCode.toUpperCase(),
    token,
  });
  if (!parsed.success) return null;

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, reference_code, guest_name, guest_email, guest_phone, manage_token, service:services ( slug, name, duration_minutes, price )",
    )
    .eq("reference_code", parsed.data.reference_code)
    .maybeSingle();

  if (!data?.manage_token) return null;
  if (!tokensEqual(data.manage_token, parsed.data.token)) return null;

  const settings = await getSettings();
  const cutoff = new Date(
    new Date(data.starts_at).getTime() - settings.cancellation_hours * 3_600_000,
  );
  const service = Array.isArray(data.service) ? data.service[0] : data.service;
  if (!service) return null;

  const cancellable =
    (data.status === "pending" || data.status === "confirmed") && new Date() <= cutoff;

  return {
    id: data.id,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    status: data.status as AppointmentStatus,
    reference_code: data.reference_code,
    guest_name: data.guest_name,
    guest_email: data.guest_email,
    guest_phone: data.guest_phone,
    service_name: service.name,
    service_slug: service.slug,
    duration_minutes: service.duration_minutes,
    price: Number(service.price),
    can_cancel: cancellable,
  };
}

export async function cancelGuestBooking(formData: FormData): Promise<CancelResult> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) {
    return { ok: false, reason: "not_configured" };
  }

  const parsed = guestManageSchema.safeParse(fdToObject(formData));
  if (!parsed.success) return { ok: false, reason: "not_found" };
  const { locale, reference_code, token } = parsed.data;

  const ipRl = await limitByIp("cancelGuest", 10, 60 * 60_000);
  if (!ipRl.ok) return { ok: false, reason: "unknown", message: "rate_limited" };

  const appointment = await getGuestAppointment(reference_code, token);
  if (!appointment) return { ok: false, reason: "not_found" };
  if (!appointment.can_cancel) return { ok: false, reason: "too_late" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointment.id)
    .eq("reference_code", reference_code);
  if (error) {
    console.warn("[booking] guest cancel failed:", error.message);
    return { ok: false, reason: "unknown", message: error.message };
  }

  const settings = await getSettings();
  if (appointment.guest_email) {
    const origin = await siteOrigin();
    const customerName = resolveCustomerDisplayName({
      guestName: appointment.guest_name,
      email: appointment.guest_email,
    });
    const durationMinutes = BOOKING_SLOT_MINUTES;

    const template = cancellationEmail({
      locale,
      customerName,
      serviceName: localizedServiceName(
        locale,
        appointment.service_slug,
        appointment.service_name,
      ),
      startsAt: appointment.starts_at,
      durationMinutes,
      referenceCode: appointment.reference_code,
      price: appointment.price,
      settings,
      manageUrl: `${origin}${routes(locale).manageBooking(reference_code, token)}`,
    });
    await sendEmail({ to: appointment.guest_email, ...template });

    const alert = shopCancellationAlertEmail({
      customerName,
      customerEmail: appointment.guest_email,
      customerPhone: appointment.guest_phone,
      serviceName: localizedServiceName(
        "en",
        appointment.service_slug,
        appointment.service_name,
      ),
      startsAt: appointment.starts_at,
      durationMinutes,
      referenceCode: appointment.reference_code,
      price: appointment.price,
      adminUrl: `${origin}${routes("it").adminAppointments}`,
    });
    await sendEmail({
      to: bookingAlertAddress(),
      ...alert,
      replyTo: appointment.guest_email,
    });
  }

  revalidatePath(routes(locale).admin, "layout");
  return { ok: true };
}

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return siteUrl;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}
