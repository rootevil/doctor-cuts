import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { PaymentRetryButton } from "@/components/booking/payment-retry-button";
import { loadPaymentReturn } from "@/lib/payments/session";
import { formatEurFromCents } from "@/lib/payments/deposit";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { dateFnsLocale } from "@/lib/booking/date-locale";
import { localizedServiceName } from "@/lib/services/localize";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.pages.prenota.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function BookingPaymentReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; p?: string; outcome?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const { ref, p } = await searchParams;
  const t = getDictionary(locale);
  const copy = t.pages.prenota;
  const r = routes(locale);

  const appointment =
    ref && p ? await loadPaymentReturn({ referenceCode: ref, paymentToken: p }) : null;

  if (!appointment) {
    return (
      <ResultShell>
        <h1 className="font-display text-3xl uppercase md:text-4xl">
          {copy.payment.result.missingTitle}
        </h1>
        <p className="max-w-md text-body">{copy.payment.result.missingLead}</p>
        <ButtonLink href={r.book} variant="book" arrow>
          {t.pages.gestisci.bookAgain}
        </ButtonLink>
      </ResultShell>
    );
  }

  const serviceName = localizedServiceName(
    locale,
    appointment.service_slug,
    appointment.service_name,
  );
  const when = formatInTimeZone(
    new Date(appointment.starts_at),
    SHOP_TZ,
    "EEE d MMM · HH:mm",
    { locale: dateFnsLocale(locale) },
  );
  const paid =
    appointment.payment_status === "paid" && appointment.status === "confirmed";
  const managePath =
    appointment.manage_token && !appointment.customer_id
      ? r.manageBooking(appointment.reference_code, appointment.manage_token)
      : r.account;

  if (paid) {
    return (
      <ResultShell>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brass text-brass">
          <Check className="h-6 w-6" aria-hidden />
        </div>
        <p className="text-[11px] tracking-[0.28em] text-brass uppercase">
          {copy.success.kicker}
        </p>
        <h1 className="font-display text-3xl uppercase md:text-5xl">{copy.success.title}</h1>
        <p className="max-w-md text-body">
          {copy.success.body.replace("{service}", serviceName)}
        </p>
        <dl className="grid w-full max-w-lg grid-cols-1 gap-3 border-y border-border py-5 text-left sm:grid-cols-2">
          <div>
            <dt className="text-label uppercase">{copy.success.dateLabel}</dt>
            <dd className="font-display text-lg">{when}</dd>
          </div>
          <div>
            <dt className="text-label uppercase">{copy.success.referenceLabel}</dt>
            <dd className="font-display text-lg">{appointment.reference_code}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-label uppercase">{copy.payment.payNow}</dt>
            <dd className="font-display text-lg text-brass">
              {formatEurFromCents(appointment.deposit_cents, locale)}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={managePath} variant="book" arrow>
            {copy.success.manageCta}
          </ButtonLink>
          <ButtonLink href={r.home} variant="ghost">
            {copy.success.homeCta}
          </ButtonLink>
        </div>
      </ResultShell>
    );
  }

  const canRetry =
    appointment.status === "pending" && appointment.payment_status === "awaiting" && p;

  return (
    <ResultShell>
      <h1 className="font-display text-3xl uppercase md:text-4xl">
        {canRetry ? copy.payment.result.unpaidTitle : copy.payment.result.processingTitle}
      </h1>
      <p className="max-w-md text-body">
        {canRetry ? copy.payment.result.unpaidLead : copy.payment.result.processingLead}
      </p>
      <p className="text-sm text-muted">
        {serviceName} · {when} · {appointment.reference_code}
      </p>
      {canRetry ? (
        <PaymentRetryButton
          locale={locale}
          referenceCode={appointment.reference_code}
          paymentToken={p}
          label={copy.payment.result.retry}
        />
      ) : (
        <ButtonLink href={r.book} variant="book" arrow>
          {t.pages.gestisci.bookAgain}
        </ButtonLink>
      )}
    </ResultShell>
  );
}

function ResultShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 py-16 text-center md:py-24"
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
}
