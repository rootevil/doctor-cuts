import "server-only";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { BOOKING_SLOT_MINUTES } from "@/lib/booking/slot";
import { bookingAlertAddress, sendEmail } from "@/lib/email/send";
import {
  confirmationEmail,
  shopBookingAlertEmail,
  resolveCustomerDisplayName,
} from "@/lib/email/templates";
import { getSettings } from "@/lib/data/settings";
import { localizedServiceName } from "@/lib/services/localize";
import { routes } from "@/lib/routes";
import { requestOrigin } from "@/lib/http/origin";
import { isLocale, type Locale } from "@/i18n/config";
import { formatEurFromCents } from "@/lib/payments/deposit";

type AppointmentEmailRow = {
  id: string;
  status: string;
  payment_status: string;
  deposit_cents: number;
  reference_code: string;
  starts_at: string;
  locale: string | null;
  customer_notes: string | null;
  customer_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  manage_token: string | null;
};

/**
 * Marks a paid hold as confirmed and sends customer + shop emails.
 * Idempotent: a second call on an already-paid row is a no-op success.
 */
export async function finalizePaidAppointment(appointmentId: string): Promise<{
  ok: boolean;
  already?: boolean;
}> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) return { ok: false };
  const admin = createSupabaseAdminClient();

  const { data: row, error } = await admin
    .from("appointments")
    .select(
      `
      id, status, payment_status, deposit_cents, reference_code, starts_at, locale,
      customer_notes, customer_id, guest_name, guest_email, guest_phone, manage_token,
      service:services ( slug, name, price )
    `,
    )
    .eq("id", appointmentId)
    .maybeSingle();

  if (error || !row) {
    console.warn("[payments] finalize fetch failed:", error?.message);
    return { ok: false };
  }

  const typed = row as AppointmentEmailRow & {
    service:
      | { slug: string; name: string; price: number }
      | { slug: string; name: string; price: number }[]
      | null;
  };

  if (typed.payment_status === "paid" && typed.status === "confirmed") {
    return { ok: true, already: true };
  }

  if (typed.status === "cancelled") return { ok: false };

  const { error: updateError } = await admin
    .from("appointments")
    .update({
      status: "confirmed",
      payment_status: "paid",
    })
    .eq("id", appointmentId)
    .eq("status", "pending");

  if (updateError) {
    console.warn("[payments] finalize update failed:", updateError.message);
    return { ok: false };
  }

  await sendBookingConfirmedEmails(typed);
  const locale = isLocale(typed.locale ?? "") ? (typed.locale as Locale) : "it";
  revalidatePath(routes(locale).account);
  revalidatePath(routes(locale).accountAppointments);
  revalidatePath(routes(locale).admin, "layout");
  return { ok: true };
}

export async function sendBookingConfirmedEmails(row: AppointmentEmailRow) {
  const admin = createSupabaseAdminClient();
  const settings = await getSettings();
  const origin = await requestOrigin();
  const locale: Locale = isLocale(row.locale ?? "") ? (row.locale as Locale) : "it";

  const { data: withService } = await admin
    .from("appointments")
    .select("service:services ( slug, name, price )")
    .eq("id", row.id)
    .maybeSingle();

  const serviceRaw = withService?.service as
    | { slug: string; name: string; price: number }
    | { slug: string; name: string; price: number }[]
    | null
    | undefined;
  const service = Array.isArray(serviceRaw) ? serviceRaw[0] : serviceRaw;
  if (!service) return;

  let to: string | null = row.guest_email;
  let customerName: string | null = null;
  let customerPhone: string | null = row.guest_phone;

  if (row.customer_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", row.customer_id)
      .maybeSingle();
    to = profile?.email ?? to;
    customerName = resolveCustomerDisplayName({
      fullName: profile?.full_name,
      guestName: row.guest_name,
      email: to,
    });
    customerPhone = profile?.phone?.trim() || customerPhone;
  } else {
    customerName = resolveCustomerDisplayName({
      guestName: row.guest_name,
      email: to,
    });
  }

  if (!to) return;

  const managePath =
    !row.customer_id && row.manage_token
      ? routes(locale).manageBooking(row.reference_code, row.manage_token)
      : routes(locale).account;

  const depositNote =
    row.deposit_cents > 0
      ? formatEurFromCents(row.deposit_cents, locale)
      : null;

  const template = confirmationEmail({
    locale,
    customerName,
    serviceName: localizedServiceName(locale, service.slug, service.name),
    startsAt: row.starts_at,
    durationMinutes: BOOKING_SLOT_MINUTES,
    referenceCode: row.reference_code,
    price: Number(service.price),
    settings,
    manageUrl: `${origin}${managePath}`,
    depositPaidLabel: depositNote,
  });
  await sendEmail({ to, ...template });

  const alert = shopBookingAlertEmail({
    customerName,
    customerEmail: to,
    customerPhone,
    serviceName: localizedServiceName("en", service.slug, service.name),
    startsAt: row.starts_at,
    durationMinutes: BOOKING_SLOT_MINUTES,
    referenceCode: row.reference_code,
    price: Number(service.price),
    status: "confirmed",
    notes: row.customer_notes,
    adminUrl: `${origin}${routes("it").adminAppointments}`,
    depositPaidLabel: depositNote,
  });
  await sendEmail({
    to: bookingAlertAddress(),
    ...alert,
    replyTo: to,
  });
}
