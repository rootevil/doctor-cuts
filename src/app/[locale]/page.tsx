import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import { Statement } from "@/components/statement";
import { Services } from "@/components/services";
import { Gallery } from "@/components/gallery";
import { About } from "@/components/about";
import { Location } from "@/components/location";
import { getPublicGallery } from "@/lib/data/gallery";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getDictionary(raw);
  const galleryItems = await getPublicGallery();

  return (
    <>
      <Hero locale={raw} t={t} />
      <Statement t={t} />
      <Services locale={raw} t={t} />
      <Gallery t={t} locale={raw} items={galleryItems} />
      <About locale={raw} t={t} />
      <Location locale={raw} t={t} />
    </>
  );
}
