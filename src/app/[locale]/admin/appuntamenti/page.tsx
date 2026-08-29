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

  const range = (RANGES.includes(sp.range as AdminRange) ? sp.range : "week") as AdminRange;
  const bucket = (BUCKETS.includes(sp.status as AdminBucket)
    ? sp.status
    : "pending") as AdminBucket;
  const q = (sp.q ?? "").trim();

  const bounds = rangeBoundsFor(range, bucket);
  const rows = await listAppointments({ ...bounds, bucket, q });

  const buildHref = (params: {
    range?: string;
    status?: string;
    q?: string;
  }) => {
    const u = new URLSearchParams();
    u.set("range", params.range ?? range);
    u.set("status", params.status ?? bucket);
    if (params.q ?? q) u.set("q", params.q ?? q);
    return `${r.adminAppointments}?${u.toString()}`;
  };

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map((rng) => (
            <Link
              key={rng}
              href={buildHref({ range: rng })}
              className={`border px-3 py-2 text-[11px] tracking-[0.22em] uppercase transition ${
                range === rng
                  ? "border-foreground bg-surface"
                  : "border-border hover:border-foreground/60"
              }`}
            >
              {copy.ranges[rng]}
            </Link>
          ))}
          <span className="mx-3 h-4 w-px bg-border" aria-hidden />
          {BUCKETS.map((s) => (
            <Link
              key={s}
              href={buildHref({ status: s })}
              className={`border px-3 py-2 text-[11px] tracking-[0.22em] uppercase transition ${
                bucket === s
                  ? "border-foreground bg-surface"
                  : "border-border hover:border-foreground/60"
              }`}
            >
              {s === "pending"
                ? copy.waitingLabel
                : s === "completed"
                  ? statusLabels.completed
                  : statusLabels.cancelled}
            </Link>
          ))}
        </div>

        <form method="GET" action={r.adminAppointments} className="flex flex-wrap gap-2">
          <input type="hidden" name="range" value={range} />
          <input type="hidden" name="status" value={bucket} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={copy.searchPlaceholder}
            className="flex-1 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          />
          <button
            type="submit"
            className="border border-foreground bg-foreground px-4 py-2 text-[11px] tracking-[0.22em] text-background uppercase transition hover:opacity-90"
          >
            {copy.search}
          </button>
          {q ? (
            <Link
              href={buildHref({ q: "" })}
              className="inline-flex items-center border border-border px-4 py-2 text-[11px] tracking-[0.22em] uppercase transition hover:border-foreground"
            >
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
