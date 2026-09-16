import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import { HoursWorkspace, type HoursTab } from "@/components/admin/hours-workspace";
import {
  listAdminBlockedDates,
  listAdminBreaks,
  listAdminHours,
  listAdminSpecialHours,
} from "@/lib/admin/data";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { requestLocale } from "@/i18n/request-locale";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return urlLocaleParams;
}

function parseTab(raw: string | undefined): HoursTab {
  if (raw === "breaks" || raw === "special" || raw === "blocked" || raw === "weekly") {
    return raw;
  }
  return "weekly";
}

export default async function AdminHoursPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ok?: string; err?: string; tab?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const query = await searchParams;
  const t = getDictionary(locale);
  const copy = t.pages.admin.hours;

  const [hours, blocked, breaks, special] = await Promise.all([
    listAdminHours(),
    listAdminBlockedDates(),
    listAdminBreaks(),
    listAdminSpecialHours(),
  ]);

  const flashMessage =
    query.ok === "1"
      ? copy.flashSaved
      : query.err === "invalid_times"
        ? copy.flashInvalidTimes
        : query.err === "invalid_date"
          ? copy.flashInvalidDate
          : null;
  const flash =
    flashMessage == null
      ? null
      : {
          tone: (query.ok === "1" ? "ok" : "err") as "ok" | "err",
          message: flashMessage,
        };

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      <HoursWorkspace
        key={`${parseTab(query.tab)}-${query.ok ?? ""}-${query.err ?? ""}`}
        locale={locale}
        copy={copy}
        initialTab={parseTab(query.tab)}
        flash={flash}
        hours={hours}
        breaks={breaks}
        special={special}
        blocked={blocked}
      />
    </AdminSection>
  );
}
