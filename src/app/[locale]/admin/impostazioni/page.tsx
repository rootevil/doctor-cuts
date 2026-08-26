import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/data/settings";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { requestLocale } from "@/i18n/request-locale";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return urlLocaleParams;
}

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const copy = t.pages.admin.settings;
  const settings = await getSettings();

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      <SettingsForm locale={locale} t={t} settings={settings} />
    </AdminSection>
  );
}
