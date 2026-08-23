import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/data/settings";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const copy = t.pages.admin.settings;
  const settings = await getSettings();

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      <SettingsForm locale={locale} t={t} settings={settings} />
    </AdminSection>
  );
}
