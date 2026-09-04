import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/booking/booking-flow";
import { Kicker } from "@/components/ui/kicker";
import { getActiveServices, getServiceById } from "@/lib/data/services";
import { getSettings } from "@/lib/data/settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { getRescheduleTarget } from "@/lib/booking/actions";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { italianAlternates } from "@/i18n/public-url";
import { requestLocale } from "@/i18n/request-locale";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";
import { isDepositCheckoutReady } from "@/lib/payments/config";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return urlLocaleParams;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  return {
    title: t.pages.prenota.metaTitle,
    description: t.pages.prenota.metaDescription,
    alternates: italianAlternates(routes(locale).book),
  };
}

async function currentUserId() {
  if (!supabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export default async function PrenotaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    service?: string;
    reschedule?: string;
    code?: string;
    t?: string;
  }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const {
    service: serviceSlug,
    reschedule: rescheduleId,
    code,
    t: manageToken,
  } = await searchParams;
  const t = getDictionary(locale);
  const copy = t.pages.prenota;
  const r = routes(locale);

  const [services, settings, userId, reschedule] = await Promise.all([
    getActiveServices(),
    getSettings(),
    currentUserId(),
    rescheduleId
      ? getRescheduleTarget({
          appointmentId: rescheduleId,
          referenceCode: code ?? null,
          manageToken: manageToken ?? null,
        })
      : Promise.resolve(null),
  ]);

  let bookingServices = services;
  if (reschedule) {
    const alreadyListed = services.some((s) => s.id === reschedule.serviceId);
    if (!alreadyListed) {
      const locked = await getServiceById(reschedule.serviceId);
      if (locked) bookingServices = [locked, ...services];
    }
  }

  const isReschedule = Boolean(reschedule);
  const headerKicker = isReschedule ? copy.reschedule.kicker : copy.kicker;
  const headerTitle = isReschedule ? copy.reschedule.title : copy.title.join(" ");
  const headerLead = isReschedule ? copy.reschedule.lead : copy.lead;

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="site-wrap-narrow page-top pb-5 md:pb-6">
          <Kicker accent>{headerKicker}</Kicker>
          <h1 className="mt-3 font-display text-2xl leading-tight tracking-tight text-foreground sm:text-3xl md:text-[2rem]">
            {headerTitle}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-body">{headerLead}</p>
          {!isReschedule ? (
            <p className="mt-1.5 text-[10px] tracking-[0.18em] text-muted uppercase">
              {copy.note}
            </p>
          ) : null}
        </div>
      </header>

      {!supabaseConfigured ? (
        <EmptyState
          title={copy.states.notConfiguredTitle}
          lead={copy.states.notConfiguredLead}
          ctas={<FallbackContacts copy={copy} />}
        />
      ) : !settings.bookings_enabled ? (
        <EmptyState
          title={copy.states.closedTitle}
          lead={copy.states.closedLead}
          ctas={<FallbackContacts copy={copy} />}
        />
      ) : rescheduleId && !reschedule ? (
        <EmptyState
          title={t.pages.gestisci.missing}
          lead={t.pages.gestisci.tooLate}
          ctas={
            <Link
              href={userId ? r.account : r.home}
              className="inline-flex items-center gap-3 bg-foreground px-6 py-3 text-[11px] tracking-[0.28em] text-background uppercase transition hover:opacity-90"
            >
              {userId ? t.pages.account.appointments.backToAccount : t.pages.gestisci.home}
              <span aria-hidden>→</span>
            </Link>
          }
        />
      ) : reschedule &&
        !bookingServices.some((s) => s.id === reschedule.serviceId) ? (
        <EmptyState
          title={t.pages.gestisci.missing}
          lead={copy.errors.unknownService}
          ctas={
            <Link
              href={userId ? r.account : r.home}
              className="inline-flex items-center gap-3 bg-foreground px-6 py-3 text-[11px] tracking-[0.28em] text-background uppercase transition hover:opacity-90"
            >
              {userId ? t.pages.account.appointments.backToAccount : t.pages.gestisci.home}
              <span aria-hidden>→</span>
            </Link>
          }
        />
      ) : bookingServices.length === 0 ? (
        <EmptyState
          title={copy.states.emptyTitle}
          lead={copy.states.emptyLead}
          ctas={<FallbackContacts copy={copy} />}
        />
      ) : (
        <section className="bg-background">
          <BookingFlow
            locale={locale}
            t={t}
            services={bookingServices}
            maxDays={settings.max_booking_days}
            timezone={SHOP_TZ}
            isAuthenticated={Boolean(userId) || Boolean(reschedule && !reschedule.isGuest)}
            depositEnabled={
              !reschedule && isDepositCheckoutReady() && settings.deposit_required
            }
            depositCents={settings.deposit_cents}
            initialServiceSlug={serviceSlug?.trim() || null}
            reschedule={reschedule}
          />
        </section>
      )}

      <section className="border-t border-border bg-surface">
        <div className="site-wrap-narrow flex flex-col gap-2 py-4 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            {copy.assist.lead}{" "}
            <a href={site.whatsapp} className="link-brass">
              WhatsApp
            </a>
            {" · "}
            <a href={site.telHref} className="link-brass">
              {site.phoneDisplay}
            </a>
          </p>
          <Link
            href={r.services}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase transition hover:text-foreground"
          >
            <span aria-hidden>↳</span>
            {t.services.viewAll}
          </Link>
        </div>
      </section>
    </>
  );
}

function EmptyState({
  title,
  lead,
  ctas,
}: {
  title: string;
  lead: string;
  ctas: React.ReactNode;
}) {
  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 py-16 md:px-10 md:py-20">
        <h2 className="font-display text-3xl leading-tight md:text-4xl">{title}</h2>
        <p className="max-w-xl text-lg text-muted">{lead}</p>
        {ctas}
      </div>
    </section>
  );
}

function FallbackContacts({
  copy,
}: {
  copy: ReturnType<typeof getDictionary>["pages"]["prenota"];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={site.whatsapp}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center gap-3 bg-foreground px-6 py-3 text-[11px] tracking-[0.28em] text-background uppercase transition hover:opacity-90"
      >
        {copy.whatsappCta}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </a>
      <a
        href={site.telHref}
        className="group inline-flex items-center gap-3 border border-foreground px-6 py-3 text-[11px] tracking-[0.28em] uppercase transition hover:bg-foreground hover:text-background"
      >
        {copy.contactCta}
      </a>
    </div>
  );
}
