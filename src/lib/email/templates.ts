import { formatInTimeZone } from "date-fns-tz";
import type { Locale } from "@/i18n/config";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { dateFnsLocale } from "@/lib/booking/date-locale";
import type { SettingsRow } from "@/lib/supabase/types";

type BaseCtx = {
  /** UI locale used to pick copy variants. */
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

function fmtDate(iso: string, locale: Locale) {
  return formatInTimeZone(new Date(iso), SHOP_TZ, "EEEE d MMMM · HH:mm", {
    locale: dateFnsLocale(locale),
  }).replace(/^./, (c) => c.toUpperCase());
}

function fmtPrice(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function shell(inner: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0a0a;color:#e6e6e6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111111;border:1px solid #222;">
        <tr><td style="padding:32px 40px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.18em;text-transform:uppercase;color:#f4f4f4;">Doctor Cuts</div>
          <div style="margin-top:32px;color:#e6e6e6;line-height:1.6;font-size:15px;">
            ${inner}
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string) {
  return `<tr><td style="padding:8px 0;color:#9a9a9a;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">${label}</td><td style="padding:8px 0;text-align:right;color:#f4f4f4;font-size:15px;">${value}</td></tr>`;
}

export function confirmationEmail(ctx: BaseCtx): { subject: string; html: string; text: string } {
  const isIt = ctx.locale === "it";
  const greeting = ctx.customerName ? `${isIt ? "Ciao" : "Hi"} ${ctx.customerName},` : isIt ? "Ciao," : "Hi,";
  const subject = isIt
    ? `Prenotazione confermata · ${ctx.referenceCode}`
    : `Booking confirmed · ${ctx.referenceCode}`;
  const when = fmtDate(ctx.startsAt, ctx.locale);

  const body = `
    <p>${greeting}</p>
    <p>${isIt
      ? "la tua prenotazione da Doctor Cuts è stata confermata."
      : "your booking at Doctor Cuts is confirmed."}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-top:1px solid #222;border-bottom:1px solid #222;">
      ${row(isIt ? "Servizio" : "Service", `${ctx.serviceName}`)}
      ${row(isIt ? "Data" : "Date", when)}
      ${row(isIt ? "Durata" : "Duration", `${ctx.durationMinutes} ${isIt ? "min" : "min"}`)}
      ${row(isIt ? "Prezzo" : "Price", fmtPrice(ctx.price, ctx.locale))}
      ${row(isIt ? "Riferimento" : "Reference", ctx.referenceCode)}
    </table>
    <p>${isIt
      ? "Ti aspettiamo in Via Antelmo Severini, 4/c, 62100 Macerata MC."
      : "See you at Via Antelmo Severini, 4/c, 62100 Macerata MC."}</p>
    <p style="margin-top:24px;">
      <a href="${ctx.manageUrl}" style="display:inline-block;background:#f4f4f4;color:#111;text-decoration:none;padding:12px 20px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">${isIt ? "Gestisci prenotazione" : "Manage booking"}</a>
    </p>
    <p style="margin-top:24px;color:#8a8a8a;font-size:12px;">${isIt
      ? `Per modifiche o cancellazioni contatta lo studio con almeno ${ctx.settings.cancellation_hours} ore di anticipo.`
      : `To reschedule or cancel, please give us at least ${ctx.settings.cancellation_hours} hours notice.`}</p>
  `;

  const text = `${greeting}\n\n${isIt ? "Prenotazione confermata" : "Booking confirmed"}\n${ctx.serviceName} · ${when}\n${ctx.durationMinutes} min · ${fmtPrice(ctx.price, ctx.locale)}\n${isIt ? "Riferimento" : "Reference"}: ${ctx.referenceCode}\n\n${ctx.manageUrl}`;

  return { subject, html: shell(body), text };
}

export function cancellationEmail(ctx: BaseCtx): { subject: string; html: string; text: string } {
  const isIt = ctx.locale === "it";
  const subject = isIt
    ? `Prenotazione annullata · ${ctx.referenceCode}`
    : `Booking cancelled · ${ctx.referenceCode}`;
  const when = fmtDate(ctx.startsAt, ctx.locale);
  const body = `
    <p>${isIt ? "Ciao" : "Hi"} ${ctx.customerName ?? ""},</p>
    <p>${isIt
      ? "la tua prenotazione è stata annullata."
      : "your booking has been cancelled."}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border-top:1px solid #222;border-bottom:1px solid #222;">
      ${row(isIt ? "Servizio" : "Service", ctx.serviceName)}
      ${row(isIt ? "Data" : "Date", when)}
      ${row(isIt ? "Riferimento" : "Reference", ctx.referenceCode)}
    </table>
    <p>${isIt ? "A presto." : "See you soon."}</p>
  `;
  const text = `${isIt ? "Prenotazione annullata" : "Booking cancelled"}\n${ctx.serviceName} · ${when}\n${isIt ? "Riferimento" : "Reference"}: ${ctx.referenceCode}`;
  return { subject, html: shell(body), text };
}
