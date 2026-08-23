import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import { ServiceForm } from "@/components/admin/service-form";
import { getServiceRow } from "@/lib/admin/data";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function AdminServiceEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const copy = t.pages.admin.services;
  const service = await getServiceRow(id);
  if (!service) notFound();

  return (
    <AdminSection kicker={copy.kicker} title={service.name} lead={copy.editLead}>
      <ServiceForm locale={locale} t={t} service={service} />
    </AdminSection>
  );
}
