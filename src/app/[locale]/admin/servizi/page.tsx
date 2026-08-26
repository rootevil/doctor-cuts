import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminSection } from "@/components/admin/section";
import { ServiceActiveToggle } from "@/components/admin/service-active-toggle";
import { deleteService } from "@/lib/admin/actions";
import { listAllServices } from "@/lib/admin/data";
import { localizedServiceName } from "@/lib/services/localize";
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
    title: t.pages.admin.services.metaTitle,
    robots: { index: false, follow: false },
  };
}

function fmtPrice(amount: number, locale: "it" | "en") {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.admin.services;
  const rows = await listAllServices();

  return (
    <AdminSection
      kicker={copy.kicker}
      title={copy.title}
      lead={copy.lead}
      right={
        <Link href={r.adminServiceNew} className="admin-btn admin-btn-brass">
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {copy.new}
        </Link>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-body">{copy.empty}</p>
      ) : (
        <div className="flex flex-col divide-y divide-border border-y border-border">
          {rows.map((service) => (
            <div
              key={service.id}
              className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex flex-col">
                <span className="font-display text-lg text-value">
                  {localizedServiceName(locale, service.slug, service.name)}
                </span>
                <span className="text-caption">
                  {service.slug} · {service.duration_minutes} min ·{" "}
                  {fmtPrice(Number(service.price), locale)} · #{service.sort_order}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ServiceActiveToggle
                  id={service.id}
                  locale={locale}
                  defaultChecked={service.is_active}
                  label={copy.active}
                />
                <Link
                  href={r.adminServiceEdit(service.id)}
                  className="admin-btn admin-btn-ghost !min-h-9"
                >
                  {copy.edit}
                </Link>
                <form action={deleteService}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={service.id} />
                  <button type="submit" className="admin-btn admin-btn-ghost !min-h-9">
                    {t.pages.admin.delete}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminSection>
  );
}
