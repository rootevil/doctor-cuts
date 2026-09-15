import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { enUS, it } from "date-fns/locale";
import { StatCard } from "@/components/admin/section";
import { AppointmentRow } from "@/components/admin/appointment-row";
import { AdminOverviewDayCalendar } from "@/components/admin/admin-overview-day-calendar";
import {
  appointmentCounts,
  listTodaysAppointments,
  listUpcomingAppointments,
} from "@/lib/admin/data";
import { getAdminCalendarDay } from "@/lib/admin/calendar-data";
import { SHOP_TZ, shopToday } from "@/lib/booking/timezone";
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

  const todayISO = shopToday();
  const calendarHref = `${r.adminCalendar}?date=${todayISO}&view=day`;

  const [counts, today, upcoming, calendarDay] = await Promise.all([
    appointmentCounts(),
    listTodaysAppointments(),
    listUpcomingAppointments(),
    getAdminCalendarDay(todayISO),
  ]);

  const dateLabel = formatInTimeZone(new Date(), SHOP_TZ, "EEEE d MMMM", {
    locale: locale === "it" ? it : enUS,
  });

  return (
    <section className="admin-overview">
      <header className="admin-overview-header">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-brass uppercase">
            {copy.kicker}
          </p>
          <h1 className="mt-1.5 capitalize text-foreground">
            {dateLabel}
          </h1>
          <p className="mt-1.5 max-w-xl text-body">{copy.lead}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href={`${r.adminAppointments}?range=all&status=pending`}
            className="admin-btn admin-btn-ghost"
          >
            {copy.viewAll}
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <StatCard
          label={copy.today}
          value={counts.today}
          hint={copy.todayHint}
          href={`${r.adminAppointments}?range=today&status=pending`}
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

      <AdminOverviewDayCalendar
        locale={locale}
        t={t}
        day={calendarDay}
        calendarHref={calendarHref}
      />

      <div className="admin-overview-panel">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2.5">
          <h2 className="admin-overview-panel-title">{copy.todaySchedule}</h2>
          <span className="text-[0.6875rem] tracking-[0.12em] text-muted uppercase">
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
            <span className="text-[0.6875rem] tracking-[0.12em] text-muted uppercase">
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
