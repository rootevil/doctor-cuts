import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { RevealFade } from "@/components/motion/reveal-fade";
import { BreadcrumbsJsonLd, ServiceJsonLd } from "@/components/seo/json-ld";
import { formatPrice, services as staticServices, type ServiceSlug } from "@/lib/site";
import {
  getActiveServices,
  getServiceBySlug,
} from "@/lib/data/services";
import { routes } from "@/lib/routes";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

export async function generateStaticParams() {
  const db = await getActiveServices();
  const slugs = db.length > 0 ? db.map((s) => s.slug) : staticServices.map((s) => s.slug);
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const db = await getServiceBySlug(slug);
  const staticSvc = staticServices.find((s) => s.slug === slug);
  const dict = t.services.items[slug as ServiceSlug];
  const name = dict?.name ?? db?.name ?? staticSvc?.slug;
  if (!name) return {};
  const description = dict?.detail ?? db?.description ?? "";
  const image = db?.image_url || staticSvc?.heroImage || "/images/cut-detail.jpg";
  return {
    title: name,
    description,
    alternates: {
      canonical: routes(locale).service(slug),
      languages: {
        it: `/it/servizi/${slug}`,
        en: `/en/servizi/${slug}`,
        "x-default": `/it/servizi/${slug}`,
      },
    },
    openGraph: {
      title: name,
      description,
      url: routes(locale).service(slug),
      images: [{ url: image, width: 1200, height: 1500, alt: name }],
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const r = routes(locale);

  const [db, allActive] = await Promise.all([
    getServiceBySlug(slug),
    getActiveServices(),
  ]);
  const staticSvc = staticServices.find((s) => s.slug === slug);
  const dict = t.services.items[slug as ServiceSlug];

  if (!db && !staticSvc) notFound();

  const name = dict?.name ?? db?.name ?? slug;
  const detail = dict?.detail ?? db?.description ?? "";
  const price = Number(db?.price ?? staticSvc?.price ?? 0);
  const duration = db?.duration_minutes ?? staticSvc?.duration ?? 0;
  const image = db?.image_url || staticSvc?.heroImage || "/images/cut-detail.jpg";
  const includes = dict?.includes ?? [];
  const ideal = dict?.ideal ?? "";

  const others =
    allActive.length > 0
      ? allActive
          .filter((s) => s.slug !== slug)
          .slice(0, 3)
          .map((s) => ({
            slug: s.slug,
            name: t.services.items[s.slug as ServiceSlug]?.name ?? s.name,
            price: Number(s.price),
            image: s.image_url || "/images/cut-detail.jpg",
          }))
      : staticServices
          .filter((s) => s.slug !== slug)
          .map((s) => ({
            slug: s.slug,
            name: t.services.items[s.slug].name,
            price: s.price,
            image: s.image,
          }));

  return (
    <>
      <ServiceJsonLd
        name={name}
        description={detail}
        price={price}
        duration={duration}
        locale={locale}
      />
      <BreadcrumbsJsonLd
        items={[
          { name: "Doctor Cuts", url: r.home },
          { name: t.nav.services, url: r.services },
          { name, url: r.service(slug) },
        ]}
      />
      <PageHero
        kicker={t.services.kicker}
        title={[name, ""] as [string, string]}
        lead={detail}
        crumb={{ href: r.services, label: t.pages.serviceDetail.back }}
        action={{ href: r.book, label: t.pages.serviceDetail.bookCta, primary: true }}
      />

      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:gap-16 md:px-10 md:py-24">
          <RevealFade>
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={image}
                alt={name}
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-cover"
                priority
                unoptimized={image.startsWith("http")}
              />
            </div>
          </RevealFade>
          <RevealFade delay={0.1}>
            <dl className="flex flex-col divide-y divide-border border-y border-border">
              <div className="grid grid-cols-[8rem_1fr] items-center gap-6 py-6">
                <dt className="text-[11px] tracking-[0.28em] text-muted uppercase">
                  {t.pages.serviceDetail.durationLabel}
                </dt>
                <dd className="font-display text-2xl md:text-3xl">
                  {duration} {t.services.minutes.toLowerCase()}
                </dd>
              </div>
              <div className="grid grid-cols-[8rem_1fr] items-center gap-6 py-6">
                <dt className="text-[11px] tracking-[0.28em] text-muted uppercase">
                  {t.pages.serviceDetail.priceLabel}
                </dt>
                <dd className="font-display text-2xl md:text-3xl">
                  {formatPrice(price, locale)}
                </dd>
              </div>
              {includes.length > 0 ? (
                <div className="grid grid-cols-[8rem_1fr] gap-6 py-6">
                  <dt className="text-[11px] tracking-[0.28em] text-muted uppercase">
                    {t.pages.serviceDetail.includesLabel}
                  </dt>
                  <dd>
                    <ul className="flex flex-col gap-2 text-body">
                      {includes.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span
                            aria-hidden
                            className="mt-2 h-px w-3 flex-none bg-foreground/40"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
              {ideal ? (
                <div className="grid grid-cols-[8rem_1fr] items-start gap-6 py-6">
                  <dt className="text-[11px] tracking-[0.28em] text-muted uppercase">
                    {t.pages.serviceDetail.idealLabel}
                  </dt>
                  <dd className="text-body">{ideal}</dd>
                </div>
              ) : null}
            </dl>
          </RevealFade>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-10 md:py-24">
          <p className="mb-10 text-[11px] tracking-[0.32em] text-muted uppercase">
            {t.pages.serviceDetail.relatedLabel}
          </p>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug}>
                <Link href={r.service(s.slug)} className="group block">
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      sizes="(min-width: 768px) 30vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      unoptimized={s.image.startsWith("http")}
                    />
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="font-display text-2xl">{s.name}</span>
                    <span className="text-sm text-muted">
                      {formatPrice(s.price, locale)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
