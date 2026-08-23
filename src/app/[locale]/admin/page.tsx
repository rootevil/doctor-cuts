import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { enUS, it } from "date-fns/locale";
import { CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/admin/section";
import { AppointmentRow } from "@/components/admin/appointment-row";
import {
  appointmentCounts,
  listAppointments,
  listTodaysAppointments,
} from "@/lib/admin/data";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";
import { routes } from "@/lib/routes";

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
    title: t.pages.admin.metaTitle,
    description: t.pages.admin.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.admin.overview;

  const [counts, today, pending] = await Promise.all([
    appointmentCounts(),
    listTodaysAppointments(),
    listAppointments({ status: "pending", limit: 8 }),
  ]);

  const todayIds = new Set(today.map((a) => a.id));
  const pendingOffToday = pending.filter((a) => !todayIds.has(a.id));

  const dateLabel = formatInTimeZone(new Date(), SHOP_TZ, "EEEE d MMMM", {
    locale: locale === "it" ? it : enUS,
  });

  return (
    <section className="admin-overview">
      <header className="admin-overview-header">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[0.22em] text-brass uppercase">
            {copy.kicker}
          </p>
          <h1 className="mt-1.5 font-display text-2xl leading-tight tracking-tight text-foreground capitalize md:text-3xl">
            {dateLabel}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-body">{copy.lead}</p>
        </div>
        <Link href={r.adminAppointments} className="admin-btn admin-btn-ghost shrink-0">
          {copy.viewAll} →
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <StatCard
          label={copy.today}
          value={counts.today}
          hint={copy.todayHint}
          href={`${r.adminAppointments}?range=today`}
        />
        <StatCard
          label={copy.upcoming}
          value={counts.upcoming}
          hint={copy.upcomingHint}
          href={`${r.adminAppointments}?range=week`}
        />
        <StatCard
          label={copy.pending}
          value={counts.pending}
          hint={copy.pendingHint}
          href={`${r.adminAppointments}?status=pending`}
          emphasize={counts.pending > 0}
        />
      </div>

      {counts.pending > 0 ? (
        <div className="admin-overview-panel admin-overview-panel--attention">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="admin-overview-panel-title flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brass" aria-hidden />
                {copy.attention}
                <span className="text-brass">({counts.pending})</span>
              </h2>
              <p className="mt-1 text-xs text-body">{copy.attentionLead}</p>
            </div>
            <Link
              href={`${r.adminAppointments}?status=pending`}
              className="admin-btn admin-btn-brass shrink-0"
            >
              {copy.viewAll} →
            </Link>
          </div>
          {pendingOffToday.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {pendingOffToday.map((a) => (
                <AppointmentRow key={a.id} appointment={a} locale={locale} t={t} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="admin-overview-panel">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2.5">
          <h2 className="admin-overview-panel-title">{copy.todaySchedule}</h2>
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
            {copy.scheduleCount.replace("{count}", String(today.length))}
          </span>
        </div>
        {today.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{copy.emptyToday}</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {today.map((a) => (
              <AppointmentRow key={a.id} appointment={a} locale={locale} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
