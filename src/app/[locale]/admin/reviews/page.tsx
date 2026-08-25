import { notFound } from "next/navigation";
import { AdminReviewsView } from "@/components/admin/reviews-view";
import { isLocale, locales } from "@/i18n/config";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/** English path segment — canonical for `en`. */
export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <AdminReviewsView locale={raw} />;
}
