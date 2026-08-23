import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RevealFade } from "@/components/motion/reveal-fade";
import { StorySteps } from "@/components/storia/story-steps";
import { ButtonLink } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { site } from "@/lib/site";
import { routes } from "@/lib/routes";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

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
  const page = t.pages.storia;
  const r = routes(locale);

  return (
    <>
      <section className="relative isolate flex min-h-[62dvh] w-full flex-col justify-end overflow-hidden md:min-h-[68dvh]">
        <Image
          src="/images/gallery-hero.jpg"
          alt={page.heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30"
        />
        <div className="site-wrap-mid pb-12 page-top-spacious md:pb-16">
          <Kicker accent>{page.kicker}</Kicker>
          <h1 className="type-display-section mt-5 max-w-[16ch] text-foreground">
            {page.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-lg text-base text-foreground-soft md:text-lg">
            {page.lead}
          </p>
        </div>
      </section>

      <StorySteps
        label={page.storyLabel}
        steps={page.sections.map(({ title, body }) => ({ title, body }))}
      />

      <section
        className="border-b border-border bg-surface"
        aria-labelledby="values-heading"
      >
        <div className="site-wrap-mid py-12 md:py-14">
          <h2
            id="values-heading"
            className="text-[11px] tracking-[0.28em] text-muted uppercase"
          >
            {page.valuesTitle}
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {page.values.map((value, index) => (
              <li
                key={value.label}
                className="border-t border-border pt-5 sm:border-t-0 sm:border-l sm:border-border sm:pt-0 sm:pl-6 first:sm:border-l-0 first:sm:pl-0"
              >
                <RevealFade delay={index * 0.05}>
                  <p className="font-display text-2xl tracking-tight text-foreground md:text-3xl">
                    {value.label}
                  </p>
                  <p className="mt-3 max-w-[18ch] text-sm text-muted md:text-base">
                    {value.body}
                  </p>
                </RevealFade>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-background" aria-labelledby="visit-heading">
        <div className="site-wrap-mid grid grid-cols-1 gap-10 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-14 md:py-16">
          <div>
            <h2
              id="visit-heading"
              className="font-display text-3xl tracking-tight text-foreground md:text-4xl"
            >
              {page.visitTitle}
            </h2>
            <p className="mt-3 max-w-md text-base text-body">{page.visitLead}</p>
            <address className="mt-6 not-italic text-lg leading-snug text-foreground-soft md:text-xl">
              {site.addressLine}
              <br />
              {site.postalCity}
            </address>
            <dl className="mt-6 max-w-sm divide-y divide-border border-y border-border">
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-[11px] tracking-[0.22em] text-muted uppercase">
                  {t.about.yearLabel}
                </dt>
                <dd className="font-display text-xl text-brass">{site.established}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-3.5">
                <dt className="text-[11px] tracking-[0.22em] text-muted uppercase">
                  {t.location.phone}
                </dt>
                <dd>
                  <a
                    href={site.telHref}
                    className="text-foreground transition hover:text-brass"
                  >
                    {site.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap md:justify-end">
            <ButtonLink href={r.book} variant="book" arrow>
              {page.bookCta}
            </ButtonLink>
            <Link
              href={r.contact}
              className="inline-flex min-h-11 items-center border border-border px-5 text-[11px] font-semibold tracking-[0.22em] uppercase transition hover:border-brass hover:text-brass"
            >
              {page.findUsCta}
              <span aria-hidden className="ml-2">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
