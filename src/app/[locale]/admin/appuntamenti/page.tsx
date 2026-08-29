import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminSection } from "@/components/admin/section";
import { AppointmentRow } from "@/components/admin/appointment-row";
import {
  listAppointments,
  rangeBoundsFor,
  type AdminBucket,
  type AdminRange,
} from "@/lib/admin/data";
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
    title: t.pages.admin.appointments.metaTitle,
    robots: { index: false, follow: false },
  };
}

const RANGES: AdminRange[] = ["today", "week", "month", "all"];
const BUCKETS: AdminBucket[] = ["pending", "completed", "cancelled"];

export default async function AdminAppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string; status?: string; q?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const sp = await searchParams;
  const t = getDictionary(locale);
  const copy = t.pages.admin.appointments;
  const statusLabels = t.pages.account.appointments.statuses;
  const r = routes(locale);

  const bucket = (BUCKETS.includes(sp.status as AdminBucket)
    ? sp.status
    : "pending") as AdminBucket;
  const range = (RANGES.includes(sp.range as AdminRange)
    ? sp.range
    : bucket === "pending"
      ? "all"
      : "week") as AdminRange;
  const q = (sp.q ?? "").trim();

  const bounds = rangeBoundsFor(range, bucket);
  const rows = await listAppointments({ ...bounds, bucket, q });

  const buildHref = (next: { range?: string; status?: string; q?: string }) => {
    const u = new URLSearchParams();
    u.set("range", next.range ?? range);
    u.set("status", next.status ?? bucket);
    const query = next.q ?? q;
    if (query) u.set("q", query);
    return `${r.adminAppointments}?${u.toString()}`;
  };

  const bucketLabel = (s: AdminBucket) => {
    if (s === "pending") return copy.waitingLabel;
    if (s === "completed") return statusLabels.completed;
    return statusLabels.cancelled;
  };

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      <div className="admin-filters">
        <div className="admin-filter-group">
          <span className="admin-filter-label">{copy.rangeLabel}</span>
          {RANGES.map((rng) => (
            <Link
              key={rng}
              href={buildHref({ range: rng })}
              aria-current={range === rng ? "page" : undefined}
              className="admin-chip"
            >
              {copy.ranges[rng]}
            </Link>
          ))}
        </div>
        <div className="admin-filter-group">
          <span className="admin-filter-label">{copy.statusLabel}</span>
          {BUCKETS.map((s) => (
            <Link
              key={s}
              href={buildHref({ status: s })}
              aria-current={bucket === s ? "page" : undefined}
              className="admin-chip"
            >
              {bucketLabel(s)}
            </Link>
          ))}
        </div>

        <form method="GET" action={r.adminAppointments} className="admin-search">
          <input type="hidden" name="range" value={range} />
          <input type="hidden" name="status" value={bucket} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={copy.searchPlaceholder}
            className="admin-field min-w-0 flex-1"
          />
          <button type="submit" className="admin-btn admin-btn-primary">
            {copy.search}
          </button>
          {q ? (
            <Link href={buildHref({ q: "" })} className="admin-btn admin-btn-ghost">
              {copy.clear}
            </Link>
          ) : null}
        </form>
      </div>

      <div className="flex flex-col gap-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">{copy.empty}</p>
        ) : (
          rows.map((row) => (
            <AppointmentRow key={row.id} appointment={row} locale={locale} t={t} />
          ))
        )}
      </div>
    </AdminSection>
  );
}
