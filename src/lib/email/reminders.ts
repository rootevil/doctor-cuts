import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { BOOKING_SLOT_MINUTES } from "@/lib/booking/slot";
import { shiftDate, shopDateBoundsUtc, shopToday } from "@/lib/booking/timezone";
import { sendEmail } from "@/lib/email/send";
import {
  reminderEmail,
  resolveCustomerDisplayName,
} from "@/lib/email/templates";
import { getSettings } from "@/lib/data/settings";
import { localizedServiceName } from "@/lib/services/localize";
import { isLocale, type Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { siteUrl } from "@/lib/seo/site-url";

export type ReminderRunResult = {
  ok: boolean;
  tomorrow: string;
  scanned: number;
  sent: number;
  skipped: number;
  errors: string[];
};

type ReminderRow = {
  id: string;
  starts_at: string;
  reference_code: string;
  locale: string | null;
  guest_name: string | null;
  guest_email: string | null;
  manage_token: string | null;
  customer_id: string | null;
  customer: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
  service: { slug: string; name: string; duration_minutes: number; price: number } | { slug: string; name: string; duration_minutes: number; price: number }[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function coerceLocale(raw: string | null | undefined): Locale {
  return isLocale(raw ?? "") ? (raw as Locale) : "it";
}

/**
 * Sends day-before reminders for every pending/confirmed appointment
 * that starts on the next shop-local calendar day and has not been reminded yet.
 */
export async function sendTomorrowReminders(
  now: Date = new Date(),
): Promise<ReminderRunResult> {
  const tomorrow = shiftDate(shopToday(now), 1);
  const empty: ReminderRunResult = {
    ok: true,
    tomorrow,
    scanned: 0,
    sent: 0,
    skipped: 0,
    errors: [],
  };

  if (!supabaseConfigured || !supabaseServiceRoleKey) {
    return { ...empty, ok: false, errors: ["supabase_not_configured"] };
  }

  const admin = createSupabaseAdminClient();
  const settings = await getSettings();
  const { startUtc, endUtc } = shopDateBoundsUtc(tomorrow);

  const { data, error } = await admin
    .from("appointments")
    .select(
      `
      id, starts_at, reference_code, locale, guest_name, guest_email, manage_token, customer_id,
      customer:profiles ( full_name, email ),
      service:services ( slug, name, duration_minutes, price )
    `,
    )
    .in("status", ["pending", "confirmed"])
    .is("reminder_sent_at", null)
    .gte("starts_at", startUtc)
    .lt("starts_at", endUtc)
    .order("starts_at", { ascending: true });

  if (error) {
    return { ...empty, ok: false, errors: [error.message] };
  }

  const rows = (data ?? []) as unknown as ReminderRow[];
  empty.scanned = rows.length;

  for (const row of rows) {
    const service = one(row.service);
    const profile = one(row.customer);
    if (!service) {
      empty.skipped += 1;
      empty.errors.push(`${row.reference_code}: missing_service`);
      continue;
    }

    const to = (row.guest_email || profile?.email || "").trim().toLowerCase();
    if (!to) {
      empty.skipped += 1;
      empty.errors.push(`${row.reference_code}: missing_email`);
      continue;
    }

    const locale = coerceLocale(row.locale);
    const customerName = resolveCustomerDisplayName({
      fullName: profile?.full_name,
      guestName: row.guest_name,
      email: to,
    });

    const managePath =
      row.manage_token
        ? routes(locale).manageBooking(row.reference_code, row.manage_token)
        : routes(locale).account;

    const template = reminderEmail({
      locale,
      customerName,
      serviceName: localizedServiceName(locale, service.slug, service.name),
      startsAt: row.starts_at,
      durationMinutes: BOOKING_SLOT_MINUTES,
      referenceCode: row.reference_code,
      price: Number(service.price),
      settings,
      manageUrl: `${siteUrl}${managePath}`,
    });

    const result = await sendEmail({ to, ...template });
    if (!result.delivered && result.error) {
      empty.skipped += 1;
      empty.errors.push(`${row.reference_code}: ${result.error}`);
      continue;
    }

    const { error: markErr } = await admin
      .from("appointments")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", row.id)
      .is("reminder_sent_at", null);

    if (markErr) {
      empty.errors.push(`${row.reference_code}: mark_failed ${markErr.message}`);
    }

    empty.sent += 1;
  }

  return empty;
}
