import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { PageHero } from "@/components/layout/page-hero";
import { GuestCancelButton } from "@/components/booking/guest-cancel-button";
import { getGuestAppointment } from "@/lib/booking/actions";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { formatPrice } from "@/lib/site";

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
    title: t.pages.gestisci.metaTitle,
    description: t.pages.gestisci.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function ManageGuestBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; code: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { locale: raw, code } = await params;
  const { t: token } = await searchParams;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const copy = t.pages.gestisci;
  const r = routes(locale);
  const reference = decodeURIComponent(code).toUpperCase();

  const appointment = token ? await getGuestAppointment(reference, token) : null;

  if (!appointment) {
    return (
      <>
        <PageHero kicker={copy.kicker} title={[copy.missing, ""] as [string, string]} lead={copy.missingLead} />
        <section className="mx-auto flex max-w-2xl flex-col gap-4 px-6 pb-24 md:px-10">
          <Link
            href={r.book}
            className="inline-flex w-fit items-center gap-3 bg-foreground px-6 py-3 text-[11px] tracking-[0.28em] text-background uppercase"
          >
            {copy.bookAgain}
          </Link>
        </section>
      </>
    );
  }

  const when = formatInTimeZone(new Date(appointment.starts_at), SHOP_TZ, "EEEE d MMMM · HH:mm");
  const cancelled = appointment.status === "cancelled";
  const statusLabel =
    t.pages.account.appointments.statuses[
      appointment.status === "no_show" ? "noShow" : appointment.status
    ];

  return (
    <>
      <PageHero
        kicker={copy.kicker}
        title={[copy.title, ""] as [string, string]}
        lead={cancelled ? copy.cancelled : copy.lead}
      />
      <section className="mx-auto flex max-w-2xl flex-col gap-8 px-6 pb-24 md:px-10">
        <dl className="grid grid-cols-1 gap-4 border-y border-border py-8 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] tracking-[0.22em] text-muted uppercase">
              {t.pages.prenota.summary.service}
            </dt>
            <dd className="font-display text-2xl">{appointment.service_name}</dd>
          </div>
          <div>
            <dt className="text-[11px] tracking-[0.22em] text-muted uppercase">
              {t.pages.prenota.success.dateLabel}
            </dt>
            <dd className="font-display text-2xl">{when}</dd>
          </div>
          <div>
            <dt className="text-[11px] tracking-[0.22em] text-muted uppercase">
              {t.pages.prenota.success.referenceLabel}
            </dt>
            <dd className="font-display text-2xl">{appointment.reference_code}</dd>
          </div>
          <div>
            <dt className="text-[11px] tracking-[0.22em] text-muted uppercase">
              {t.pages.prenota.summary.total}
            </dt>
            <dd className="font-display text-2xl">
              {formatPrice(appointment.price, locale)} · {appointment.duration_minutes} min
            </dd>
          </div>
        </dl>
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">{statusLabel}</p>

        {appointment.can_cancel && token ? (
          <GuestCancelButton
            locale={locale}
            referenceCode={appointment.reference_code}
            token={token}
            label={copy.cancel}
            confirmLabel={copy.confirmCancel}
            tooLate={copy.tooLate}
          />
        ) : cancelled ? null : (
          <p className="text-sm text-muted">{copy.tooLate}</p>
        )}

        <div className="flex flex-wrap gap-4">
          <Link
            href={r.home}
            className="border border-border px-6 py-3 text-[11px] tracking-[0.28em] uppercase transition hover:border-foreground"
          >
            {copy.home}
          </Link>
          <Link
            href={r.book}
            className="border border-foreground px-6 py-3 text-[11px] tracking-[0.28em] uppercase transition hover:bg-foreground hover:text-background"
          >
            {copy.bookAgain}
          </Link>
        </div>
      </section>
    </>
  );
}
