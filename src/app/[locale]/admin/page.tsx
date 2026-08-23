import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { enUS, it } from "date-fns/locale";
import { AdminSection, StatCard } from "@/components/admin/section";
import { AppointmentRow } from "@/components/admin/appointment-row";
import {
  appointmentCounts,
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

  const [counts, today] = await Promise.all([
    appointmentCounts(),
    listTodaysAppointments(),
  ]);
  const dateLabel = formatInTimeZone(new Date(), SHOP_TZ, "EEEE d MMMM", {
    locale: locale === "it" ? it : enUS,
  });

  return (
    <AdminSection
      kicker={copy.kicker}
      title={dateLabel}
      lead={copy.lead}
      right={
        <Link
          href={r.adminAppointments}
          className="admin-btn admin-btn-ghost"
        >
          {copy.viewAll} →
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label={copy.today} value={counts.today} hint={copy.todayHint} />
        <StatCard label={copy.upcoming} value={counts.upcoming} hint={copy.upcomingHint} />
        <StatCard label={copy.pending} value={counts.pending} hint={copy.pendingHint} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between border-b border-border pb-3">
          <h2 className="text-[11px] tracking-[0.28em] text-muted uppercase">
            {copy.todaySchedule}
          </h2>
          <span className="text-[11px] tracking-[0.22em] text-muted uppercase">
            {today.length} · {SHOP_TZ}
          </span>
        </div>
        {today.length === 0 ? (
          <p className="text-sm text-muted">{copy.emptyToday}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {today.map((a) => (
              <AppointmentRow key={a.id} appointment={a} locale={locale} t={t} />
            ))}
          </div>
        )}
      </div>
    </AdminSection>
  );
}
