import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryFull } from "@/components/gallery/gallery-full";
import { getPublicGallery } from "@/lib/data/gallery";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { italianAlternates } from "@/i18n/public-url";
import { requestLocale } from "@/i18n/request-locale";
import { routes } from "@/lib/routes";

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
    title: t.pages.galleria.metaTitle,
    description: t.pages.galleria.metaDescription,
    alternates: italianAlternates(routes(locale).gallery),
  };
}

export default async function GalleriaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const items = await getPublicGallery(locale);

  return <GalleryFull t={t} locale={locale} items={items} />;
}
