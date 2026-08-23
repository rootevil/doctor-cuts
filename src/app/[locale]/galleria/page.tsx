import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { GalleryFull } from "@/components/gallery/gallery-full";
import { getPublicGallery } from "@/lib/data/gallery";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";
import { routes } from "@/lib/routes";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.pages.galleria.metaTitle,
    description: t.pages.galleria.metaDescription,
    alternates: {
      canonical: routes(locale).gallery,
      languages: { it: "/it/galleria", en: "/en/galleria" },
    },
  };
}

export default async function GalleriaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const items = await getPublicGallery();

  return (
    <>
      <PageHero
        kicker={t.pages.galleria.kicker}
        title={t.pages.galleria.title}
        lead={t.pages.galleria.intro}
      />
      <GalleryFull t={t} items={items} />
    </>
  );
}
