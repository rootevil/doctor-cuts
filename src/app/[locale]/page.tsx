import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import { Statement } from "@/components/statement";
import { Services } from "@/components/services";
import { Gallery } from "@/components/gallery";
import { About } from "@/components/about";
import { Testimonials } from "@/components/testimonials";
import { Location } from "@/components/location";
import { getPublicGallery } from "@/lib/data/gallery";
import { getFeaturedReviews } from "@/lib/data/reviews";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requestLocale } from "@/i18n/request-locale";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const [galleryItems, reviews] = await Promise.all([
    getPublicGallery(locale),
    getFeaturedReviews(5),
  ]);

  return (
    <>
      <Hero locale={locale} t={t} />
      <Statement t={t} />
      <Services locale={locale} t={t} />
      <Gallery t={t} locale={locale} items={galleryItems} />
      <About locale={locale} t={t} />
      <Testimonials t={t} reviews={reviews} />
      <Location locale={locale} t={t} />
    </>
  );
}
