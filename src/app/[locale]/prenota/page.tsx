import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { BookingFlow } from "@/components/booking/booking-flow";
import { getActiveServices } from "@/lib/data/services";
import { getSettings } from "@/lib/data/settings";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
    description: t.pages.prenota.metaDescription,
    alternates: {
      canonical: routes(locale).book,
      languages: { it: "/it/prenota", en: "/en/prenota" },
    },
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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const copy = t.pages.prenota;
  const r = routes(locale);

  const [services, settings, userId] = await Promise.all([
    getActiveServices(),
    getSettings(),
    currentUserId(),
  ]);

  return (
    <>
      <PageHero kicker={copy.kicker} title={copy.title} lead={copy.lead} />

      {!supabaseConfigured ? (
        <EmptyState
          title={copy.states.notConfiguredTitle}
          lead={copy.states.notConfiguredLead}
          ctas={<FallbackContacts copy={copy} />}
        />
      ) : services.length === 0 ? (
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
            services={services}
            maxDays={settings.max_booking_days}
            timezone={SHOP_TZ}
            isAuthenticated={Boolean(userId)}
          />
        </section>
      )}

      <section className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-6 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-10">
          <p>
            {copy.assist.lead} ·{" "}
            <a href={site.whatsapp} className="text-foreground underline underline-offset-4">
              WhatsApp
            </a>{" "}
            /{" "}
            <a href={site.telHref} className="text-foreground underline underline-offset-4">
              {site.phoneDisplay}
            </a>
          </p>
          <Link
            href={r.services}
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase transition hover:text-foreground"
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
    <section className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 py-20 md:px-10 md:py-28">
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
