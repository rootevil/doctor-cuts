import { notFound } from "next/navigation";
import { Hero } from "@/components/hero";
import { Statement } from "@/components/statement";
import { Services } from "@/components/services";
import { BookingCta } from "@/components/booking-cta";
import { Gallery } from "@/components/gallery";
import { Experience } from "@/components/experience";
import { About } from "@/components/about";
import { Testimonials } from "@/components/testimonials";
import { Location } from "@/components/location";
import { BookBar } from "@/components/book-bar";
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
      <BookingCta locale={raw} t={t} />
      <Gallery t={t} locale={raw} items={galleryItems} />
      <Experience t={t} />
      <About locale={raw} t={t} />
      <Testimonials t={t} />
      <Location locale={raw} t={t} />
      <div className="h-20 md:hidden" aria-hidden />
      <BookBar locale={raw} t={t} />
    </>
  );
}
