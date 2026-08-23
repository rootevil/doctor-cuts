import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { RevealFade } from "@/components/motion/reveal-fade";
import { site } from "@/lib/site";
import { routes } from "@/lib/routes";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

const SECTION_IMAGES = [
  "/images/interior.jpg",
  "/images/razor.jpg",
  "/images/chair.jpg",
];

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
    title: t.pages.storia.metaTitle,
    description: t.pages.storia.metaDescription,
    alternates: {
      canonical: routes(locale).about,
      languages: { it: "/it/storia", en: "/en/storia" },
    },
  };
}

export default async function StoriaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);

  return (
    <>
      <PageHero
        kicker={t.pages.storia.kicker}
        title={t.pages.storia.title}
        lead={t.pages.storia.lead}
      />

      <section className="bg-background">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          {t.pages.storia.sections.map((section, index) => {
            const reverse = index % 2 === 1;
            return (
              <div
                key={section.title}
                className={`grid gap-10 border-b border-border py-20 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-28 ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <RevealFade>
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={SECTION_IMAGES[index] ?? SECTION_IMAGES[0]}
                      alt={section.imageAlt}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </RevealFade>
                <RevealFade delay={0.1}>
                  <div className="flex h-full flex-col justify-center gap-6">
                    <span className="text-[11px] tracking-[0.32em] text-muted uppercase">
                      0{index + 1}
                    </span>
                    <h2 className="font-display text-4xl leading-tight tracking-tight md:text-6xl">
                      {section.title}
                    </h2>
                    <p className="max-w-md text-lg text-muted">{section.body}</p>
                  </div>
                </RevealFade>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32">
          <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
            {t.pages.storia.valuesTitle}
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-3">
            {t.pages.storia.values.map((value) => (
              <li key={value.label}>
                <RevealFade>
                  <p className="font-display text-4xl leading-none tracking-tight md:text-5xl">
                    {value.label}
                  </p>
                  <p className="mt-6 max-w-xs text-muted">{value.body}</p>
                </RevealFade>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-6 py-20 md:grid-cols-2 md:px-10 md:py-24">
          <div>
            <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
              {t.about.locationLabel}
            </p>
            <address className="mt-6 not-italic font-display text-4xl leading-tight tracking-tight md:text-6xl">
              {site.addressLine}
              <br />
              {site.postalCity}
            </address>
          </div>
          <div className="flex items-end">
            <dl className="w-full">
              <div className="flex items-baseline justify-between border-t border-border py-4">
                <dt className="text-[11px] tracking-[0.28em] text-muted uppercase">
                  {t.about.yearLabel}
                </dt>
                <dd className="font-display text-2xl">{site.established}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border py-4">
                <dt className="text-[11px] tracking-[0.28em] text-muted uppercase">
                  {t.location.phone}
                </dt>
                <dd className="text-foreground">
                  <a href={site.telHref} className="hover:text-foreground-muted">
                    {site.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-y border-border py-4">
                <dt className="text-[11px] tracking-[0.28em] text-muted uppercase">
                  Instagram
                </dt>
                <dd>
                  <a href={site.instagram} className="hover:text-foreground-muted">
                    @{site.instagramHandle}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
