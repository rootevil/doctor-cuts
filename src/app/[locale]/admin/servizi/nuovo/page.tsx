import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import { ServiceForm } from "@/components/admin/service-form";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AdminServiceNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const copy = t.pages.admin.services;
  return (
    <AdminSection kicker={copy.kicker} title={copy.new} lead={copy.newLead}>
      <ServiceForm locale={locale} t={t} />
    </AdminSection>
  );
}
