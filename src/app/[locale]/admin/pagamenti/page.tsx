import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import { AdminPaymentsView } from "@/components/admin/admin-payments-view";
import {
  listPaymentLedger,
  type PaymentRange,
} from "@/lib/admin/payments-data";
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
    title: t.pages.admin.payments.metaTitle,
    robots: { index: false, follow: false },
  };
}

const RANGES: PaymentRange[] = ["today", "week", "month", "all"];

export default async function AdminPaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const sp = await searchParams;
  const t = getDictionary(locale);
  const copy = t.pages.admin.payments;
  const r = routes(locale);

  const range = (RANGES.includes(sp.range as PaymentRange)
    ? sp.range
    : "month") as PaymentRange;
  const { rows, totals } = await listPaymentLedger(range);

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      <AdminPaymentsView
        locale={locale}
        t={t}
        range={range}
        rows={rows}
        totals={totals}
        rangeHref={(next) => `${r.adminPayments}?range=${next}`}
      />
    </AdminSection>
  );
}
