import { notFound } from "next/navigation";
import { AdminReviewsView } from "@/components/admin/reviews-view";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { requestLocale } from "@/i18n/request-locale";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return urlLocaleParams;
}

/** Italian path segment — canonical for `it`. */
export default async function AdminRecensioniPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  return <AdminReviewsView locale={locale} />;
}
