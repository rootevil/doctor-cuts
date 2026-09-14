import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { enUS, it } from "date-fns/locale";
import { StatCard } from "@/components/admin/section";
import { AppointmentRow } from "@/components/admin/appointment-row";
import {
  appointmentCounts,
  listTodaysAppointments,
  listUpcomingAppointments,
} from "@/lib/admin/data";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { requestLocale } from "@/i18n/request-locale";
import { routes } from "@/lib/routes";

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
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.admin.overview;

  const [counts, today, upcoming] = await Promise.all([
    appointmentCounts(),
    listTodaysAppointments(),
    listUpcomingAppointments(),
  ]);

  const remainingToday = today.filter(
    (a) =>
      a.status === "pending" ||
      a.status === "confirmed" ||
      a.status === "arrived",
  );

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
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`${r.adminCalendar}?date=${formatInTimeZone(new Date(), SHOP_TZ, "yyyy-MM-dd")}&view=day`}
            className="admin-btn admin-btn-brass"
          >
            {copy.actionCalendar}
          </Link>
          <Link
            href={`${r.adminAppointments}?range=all&status=pending`}
            className="admin-btn admin-btn-ghost"
          >
            {copy.viewAll}
          </Link>
        </div>
      </header>

      <div className="admin-overview-actions">
        <Link href={r.adminCalendar} className="admin-overview-action">
          {copy.actionCalendar}
        </Link>
        <Link href={r.adminAppointments} className="admin-overview-action">
          {copy.actionAppointments}
        </Link>
        <Link href={r.adminPayments} className="admin-overview-action">
          {copy.actionPayments}
        </Link>
        <Link href={r.adminHours} className="admin-overview-action">
          {copy.actionHours}
        </Link>
        <Link href={r.adminSettings} className="admin-overview-action">
          {copy.actionSettings}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <StatCard
          label={copy.today}
          value={counts.today}
          hint={copy.todayHint}
          href={
            remainingToday.length > 0
              ? `${r.adminAppointments}?range=today&status=pending`
              : `${r.adminAppointments}?range=today&status=completed`
          }
        />
        <StatCard
          label={copy.pending}
          value={counts.waiting}
          hint={copy.pendingHint}
          href={`${r.adminAppointments}?range=all&status=pending`}
          emphasize={counts.waiting > 0}
        />
        <StatCard
          label={copy.completed}
          value={counts.completed}
          hint={copy.completedHint}
          href={`${r.adminAppointments}?range=week&status=completed`}
        />
      </div>

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

      {upcoming.length > 0 ? (
        <div className="admin-overview-panel">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2.5">
            <h2 className="admin-overview-panel-title">{copy.upcomingSchedule}</h2>
            <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
              {copy.scheduleCount.replace("{count}", String(upcoming.length))}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {upcoming.map((a) => (
              <AppointmentRow key={a.id} appointment={a} locale={locale} t={t} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
