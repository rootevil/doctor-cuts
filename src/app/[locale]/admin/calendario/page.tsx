import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import { AdminCalendarView } from "@/components/admin/admin-calendar-view";
import {
  getAdminCalendarDay,
  getAdminCalendarWeek,
  weekStartMonday,
} from "@/lib/admin/calendar-data";
import { listAllServices } from "@/lib/admin/data";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { requestLocale } from "@/i18n/request-locale";
import { routes } from "@/lib/routes";
import { shopToday } from "@/lib/booking/timezone";

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
    title: t.pages.admin.calendar.metaTitle,
    robots: { index: false, follow: false },
  };
}

export default async function AdminCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string; view?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const sp = await searchParams;
  const t = getDictionary(locale);
  const copy = t.pages.admin.calendar;
  const r = routes(locale);

  const today = shopToday();
  const dateISO =
    sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : today;
  const mode = sp.view === "week" ? "week" : "day";
  const weekStartISO = weekStartMonday(dateISO);

  const [day, week, services] = await Promise.all([
    getAdminCalendarDay(dateISO),
    getAdminCalendarWeek(weekStartISO),
    listAllServices(),
  ]);

  const activeServices = services
    .filter((s) => s.is_active)
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      price: Number(s.price),
    }));

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      <AdminCalendarView
        locale={locale}
        t={t}
        mode={mode}
        dateISO={dateISO}
        weekStartISO={weekStartISO}
        day={day}
        week={week}
        services={activeServices}
        calendarPath={r.adminCalendar}
      />
    </AdminSection>
  );
}
