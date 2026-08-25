import { formatInTimeZone } from "date-fns-tz";
import type { Locale } from "@/i18n/config";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { dateFnsLocale } from "@/lib/booking/date-locale";
import { site } from "@/lib/site";
import type { SettingsRow } from "@/lib/supabase/types";

type BaseCtx = {
  locale: Locale;
  customerName: string | null;
  serviceName: string;
  startsAt: string; // ISO UTC
  durationMinutes: number;
  referenceCode: string;
  price: number;
  settings: SettingsRow;
  manageUrl: string;
};

export type ShopBookingAlertCtx = {
  customerName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  serviceName: string;
  startsAt: string;
  durationMinutes: number;
  referenceCode: string;
  price: number;
  status: "pending" | "confirmed" | string;
  notes: string | null;
  adminUrl: string;
};

/** Prefer profile / metadata / guest name; never leave the shop with a blank. */
export function resolveCustomerDisplayName(options: {
  fullName?: string | null;
  metaFullName?: string | null;
  guestName?: string | null;
  email?: string | null;
}): string {
  const candidates = [
    options.fullName,
    options.metaFullName,
    options.guestName,
  ];
  for (const raw of candidates) {
    const name = (raw ?? "").trim().replace(/\s+/g, " ");
    if (name) return name;
  }
  const local = (options.email ?? "").split("@")[0]?.trim();
  if (local) {
    return local
      .replace(/[._+-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return "Cliente";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtDate(iso: string, locale: Locale) {
  return formatInTimeZone(new Date(iso), SHOP_TZ, "EEEE d MMMM yyyy · HH:mm", {
    locale: dateFnsLocale(locale),
  }).replace(/^./, (c) => c.toUpperCase());
}

function fmtDateShort(iso: string, locale: Locale) {
  return formatInTimeZone(new Date(iso), SHOP_TZ, "d MMM · HH:mm", {
    locale: dateFnsLocale(locale),
  });
}

function fmtPrice(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusLabel(status: string, locale: Locale) {
  const isIt = locale === "it";
  if (status === "confirmed") return isIt ? "Confermata" : "Confirmed";
  if (status === "pending") return isIt ? "In attesa di conferma" : "Pending confirmation";
  if (status === "cancelled") return isIt ? "Annullata" : "Cancelled";
  return status;
}

function shell(inner: string, lang: Locale = "it") {
  return `<!doctype html>
<html lang="${lang}" translate="no">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="google" content="notranslate" />
  <title>Doctor Cuts</title>
</head>
<body class="notranslate" translate="no" style="margin:0;padding:0;background:#0a0a0a;color:#e6e6e6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#111111;border:1px solid #222222;">
        <tr><td style="padding:28px 28px 8px;border-bottom:1px solid #222222;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:0.2em;text-transform:uppercase;color:#f4f4f4;">Doctor Cuts</div>
          <div style="margin-top:6px;font-size:12px;letter-spacing:0.04em;color:#9a9a9a;">${escapeHtml(site.addressLine)}, ${escapeHtml(site.postalCity)}</div>
        </td></tr>
        <tr><td style="padding:28px;color:#e6e6e6;line-height:1.55;font-size:15px;">
          ${inner}
        </td></tr>
        <tr><td style="padding:0 28px 28px;color:#7a7a7a;font-size:12px;line-height:1.5;">
          ${escapeHtml(site.phoneDisplay)} · <a href="mailto:${escapeHtml(site.email)}" style="color:#7a7a7a;text-decoration:none;">${escapeHtml(site.email)}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Stacked rows — more reliable in Gmail than side-by-side columns. */
function detail(label: string, value: string, opts?: { noTranslate?: boolean }) {
  const valueAttr = opts?.noTranslate ? ' translate="no"' : "";
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid #222222;">
      <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9a9a9a;margin:0 0 4px;">${escapeHtml(label)}</div>
      <div${valueAttr} style="font-size:16px;color:#f4f4f4;word-break:break-word;">${escapeHtml(value)}</div>
    </td>
  </tr>`;
}

function detailsTable(
  rows: Array<[string, string | null | undefined, { noTranslate?: boolean }?]>,
) {
  const body = rows
    .filter(([, value]) => Boolean(value && String(value).trim()))
    .map(([label, value, opts]) => detail(label, String(value).trim(), opts))
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:1px solid #222222;">${body}</table>`;
}

function cta(href: string, label: string) {
  return `<p style="margin:24px 0 0;">
    <a href="${escapeHtml(href)}" class="notranslate" translate="no" style="display:inline-block;background:#f4f4f4;color:#111111;text-decoration:none;padding:14px 22px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;">${escapeHtml(label)}</a>
  </p>`;
}

export function confirmationEmail(
  ctx: BaseCtx,
): { subject: string; html: string; text: string } {
  const isIt = ctx.locale === "it";
  const name = ctx.customerName?.trim() || null;
  const greeting = name
    ? isIt
      ? `Ciao ${name},`
      : `Hi ${name},`
    : isIt
      ? "Ciao,"
      : "Hi,";
  const when = fmtDate(ctx.startsAt, ctx.locale);
  const subject = isIt
    ? `Prenotazione confermata · ${ctx.referenceCode}`
    : `Booking confirmed · ${ctx.referenceCode}`;

  const lead = isIt
    ? "La tua prenotazione da Doctor Cuts è confermata. Ti aspettiamo in studio."
    : "Your booking at Doctor Cuts is confirmed. We look forward to seeing you.";

  const body = `
    <p style="margin:0 0 12px;font-size:18px;color:#f4f4f4;" translate="no">${escapeHtml(greeting)}</p>
    <p style="margin:0;color:#cfcfcf;">${escapeHtml(lead)}</p>
    ${detailsTable([
      [isIt ? "Servizio" : "Service", ctx.serviceName],
      [isIt ? "Data e ora" : "Date & time", when],
      [isIt ? "Durata" : "Duration", `${ctx.durationMinutes} min`],
      [isIt ? "Prezzo" : "Price", fmtPrice(ctx.price, ctx.locale)],
      [isIt ? "Riferimento" : "Reference", ctx.referenceCode, { noTranslate: true }],
    ])}
    ${cta(ctx.manageUrl, isIt ? "Gestisci prenotazione" : "Manage booking")}
    <p style="margin:20px 0 0;color:#8a8a8a;font-size:12px;">${
      isIt
        ? `Per modifiche o cancellazioni avvisaci con almeno ${ctx.settings.cancellation_hours} ore di anticipo.`
        : `To reschedule or cancel, please give us at least ${ctx.settings.cancellation_hours} hours notice.`
    }</p>
  `;

  const text = [
    greeting,
    "",
    lead,
    "",
    `${isIt ? "Servizio" : "Service"}: ${ctx.serviceName}`,
    `${isIt ? "Data e ora" : "Date & time"}: ${when}`,
    `${isIt ? "Durata" : "Duration"}: ${ctx.durationMinutes} min`,
    `${isIt ? "Prezzo" : "Price"}: ${fmtPrice(ctx.price, ctx.locale)}`,
    `${isIt ? "Riferimento" : "Reference"}: ${ctx.referenceCode}`,
    "",
    ctx.manageUrl,
  ].join("\n");

  return { subject, html: shell(body, ctx.locale), text };
}

/** Day-before reminder — same visual language as confirmation. */
export function reminderEmail(
  ctx: BaseCtx,
): { subject: string; html: string; text: string } {
  const isIt = ctx.locale === "it";
  const name = ctx.customerName?.trim() || null;
  const greeting = name
    ? isIt
      ? `Ciao ${name},`
      : `Hi ${name},`
    : isIt
      ? "Ciao,"
      : "Hi,";
  const when = fmtDate(ctx.startsAt, ctx.locale);
  const subject = isIt
    ? `Promemoria · domani da Doctor Cuts · ${ctx.referenceCode}`
    : `Reminder · tomorrow at Doctor Cuts · ${ctx.referenceCode}`;

  const lead = isIt
    ? "Ti ricordiamo il tuo appuntamento di domani da Doctor Cuts."
    : "This is a reminder for your appointment tomorrow at Doctor Cuts.";

  const body = `
    <p style="margin:0 0 12px;font-size:18px;color:#f4f4f4;" translate="no">${escapeHtml(greeting)}</p>
    <p style="margin:0;color:#cfcfcf;">${escapeHtml(lead)}</p>
    ${detailsTable([
      [isIt ? "Servizio" : "Service", ctx.serviceName],
      [isIt ? "Data e ora" : "Date & time", when],
      [isIt ? "Durata" : "Duration", `${ctx.durationMinutes} min`],
      [isIt ? "Riferimento" : "Reference", ctx.referenceCode, { noTranslate: true }],
    ])}
    <p style="margin:0;color:#cfcfcf;">${
      isIt
        ? `Ti aspettiamo in ${site.addressLine}, ${site.postalCity}.`
        : `See you at ${site.addressLine}, ${site.postalCity}.`
    }</p>
    ${cta(ctx.manageUrl, isIt ? "Gestisci prenotazione" : "Manage booking")}
    <p style="margin:20px 0 0;color:#8a8a8a;font-size:12px;">${
      isIt
        ? `Per modifiche o cancellazioni avvisaci con almeno ${ctx.settings.cancellation_hours} ore di anticipo.`
        : `To reschedule or cancel, please give us at least ${ctx.settings.cancellation_hours} hours notice.`
    }</p>
  `;

  const text = [
    greeting,
    "",
    lead,
    "",
    `${isIt ? "Servizio" : "Service"}: ${ctx.serviceName}`,
    `${isIt ? "Data e ora" : "Date & time"}: ${when}`,
    `${isIt ? "Durata" : "Duration"}: ${ctx.durationMinutes} min`,
    `${isIt ? "Riferimento" : "Reference"}: ${ctx.referenceCode}`,
    "",
    isIt
      ? `Ti aspettiamo in ${site.addressLine}, ${site.postalCity}.`
      : `See you at ${site.addressLine}, ${site.postalCity}.`,
    "",
    ctx.manageUrl,
  ].join("\n");

  return { subject, html: shell(body, ctx.locale), text };
}

/**
 * Shop inbox alert — English only.
 * Bilingual copy triggered Gmail auto-translate and mangled the message.
 */
export function shopBookingAlertEmail(
  ctx: ShopBookingAlertCtx,
): { subject: string; html: string; text: string } {
  const name =
    (ctx.customerName ?? "").trim().replace(/\s+/g, " ") ||
    resolveCustomerDisplayName({ email: ctx.customerEmail });

  const when = fmtDate(ctx.startsAt, "en");
  const whenShort = fmtDateShort(ctx.startsAt, "en");
  const status = statusLabel(ctx.status, "en");
  const price = fmtPrice(ctx.price, "en");
  const subject = `New booking · ${name} · ${whenShort} · ${ctx.referenceCode}`;

  const body = `
    <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a227;">Shop alert</p>
    <p style="margin:0 0 8px;font-size:20px;color:#f4f4f4;">New booking</p>
    <p style="margin:0;color:#cfcfcf;">
      <strong style="color:#f4f4f4;">${escapeHtml(name)}</strong>
      booked for <strong style="color:#f4f4f4;">${escapeHtml(when)}</strong>.
    </p>
    ${detailsTable([
      ["Customer", name, { noTranslate: true }],
      ["Email", ctx.customerEmail, { noTranslate: true }],
      ["Phone", ctx.customerPhone, { noTranslate: true }],
      ["Service", ctx.serviceName],
      ["Date & time", when],
      ["Duration", `${ctx.durationMinutes} min`],
      ["Price", price],
      ["Status", status],
      ["Reference", ctx.referenceCode, { noTranslate: true }],
      ["Notes", ctx.notes],
    ])}
    ${cta(ctx.adminUrl, "View in admin")}
  `;

  const text = [
    "Doctor Cuts — New booking",
    "",
    `Customer: ${name}`,
    `Email: ${ctx.customerEmail}`,
    ctx.customerPhone?.trim() ? `Phone: ${ctx.customerPhone.trim()}` : null,
    `Service: ${ctx.serviceName}`,
    `Date & time: ${when}`,
    `Duration: ${ctx.durationMinutes} min`,
    `Price: ${price}`,
    `Status: ${status}`,
    `Reference: ${ctx.referenceCode}`,
    ctx.notes?.trim() ? `Notes: ${ctx.notes.trim()}` : null,
    "",
    `View in admin: ${ctx.adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html: shell(body, "en"), text };
}

export function cancellationEmail(
  ctx: BaseCtx,
): { subject: string; html: string; text: string } {
  const isIt = ctx.locale === "it";
  const name = ctx.customerName?.trim() || null;
  const greeting = name
    ? isIt
      ? `Ciao ${name},`
      : `Hi ${name},`
    : isIt
      ? "Ciao,"
      : "Hi,";
  const when = fmtDate(ctx.startsAt, ctx.locale);
  const subject = isIt
    ? `Prenotazione annullata · ${ctx.referenceCode}`
    : `Booking cancelled · ${ctx.referenceCode}`;
  const lead = isIt
    ? "La tua prenotazione è stata annullata."
    : "Your booking has been cancelled.";

  const body = `
    <p style="margin:0 0 12px;font-size:18px;color:#f4f4f4;" translate="no">${escapeHtml(greeting)}</p>
    <p style="margin:0;color:#cfcfcf;">${escapeHtml(lead)}</p>
    ${detailsTable([
      [isIt ? "Servizio" : "Service", ctx.serviceName],
      [isIt ? "Data e ora" : "Date & time", when],
      [isIt ? "Riferimento" : "Reference", ctx.referenceCode, { noTranslate: true }],
    ])}
    <p style="margin:8px 0 0;color:#cfcfcf;">${isIt ? "A presto." : "See you soon."}</p>
  `;

  const text = [
    greeting,
    "",
    lead,
    "",
    `${ctx.serviceName} · ${when}`,
    `${isIt ? "Riferimento" : "Reference"}: ${ctx.referenceCode}`,
  ].join("\n");

  return { subject, html: shell(body, ctx.locale), text };
}

export type ShopCancellationAlertCtx = {
  customerName: string | null;
  customerEmail: string;
  customerPhone: string | null;
  serviceName: string;
  startsAt: string;
  durationMinutes: number;
  referenceCode: string;
  price: number;
  adminUrl: string;
};

/** Shop inbox — English-only cancellation notice (avoids Gmail auto-translate). */
export function shopCancellationAlertEmail(
  ctx: ShopCancellationAlertCtx,
): { subject: string; html: string; text: string } {
  const name =
    (ctx.customerName ?? "").trim().replace(/\s+/g, " ") ||
    resolveCustomerDisplayName({ email: ctx.customerEmail });

  const when = fmtDate(ctx.startsAt, "en");
  const whenShort = fmtDateShort(ctx.startsAt, "en");
  const price = fmtPrice(ctx.price, "en");
  const subject = `Cancelled · ${name} · ${whenShort} · ${ctx.referenceCode}`;

  const body = `
    <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a227;">Shop alert</p>
    <p style="margin:0 0 8px;font-size:20px;color:#f4f4f4;">Booking cancelled</p>
    <p style="margin:0;color:#cfcfcf;">
      <strong style="color:#f4f4f4;">${escapeHtml(name)}</strong>
      cancelled <strong style="color:#f4f4f4;">${escapeHtml(when)}</strong>.
    </p>
    ${detailsTable([
      ["Customer", name, { noTranslate: true }],
      ["Email", ctx.customerEmail, { noTranslate: true }],
      ["Phone", ctx.customerPhone, { noTranslate: true }],
      ["Service", ctx.serviceName],
      ["Was scheduled", when],
      ["Duration", `${ctx.durationMinutes} min`],
      ["Price", price],
      ["Reference", ctx.referenceCode, { noTranslate: true }],
    ])}
    ${cta(ctx.adminUrl, "View in admin")}
  `;

  const text = [
    "Doctor Cuts — Booking cancelled",
    "",
    `Customer: ${name}`,
    `Email: ${ctx.customerEmail}`,
    ctx.customerPhone?.trim() ? `Phone: ${ctx.customerPhone.trim()}` : null,
    `Service: ${ctx.serviceName}`,
    `Was scheduled: ${when}`,
    `Reference: ${ctx.referenceCode}`,
    "",
    `View in admin: ${ctx.adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html: shell(body, "en"), text };
}
