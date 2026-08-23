import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { ServiceRow } from "@/components/services/service-row";
import { RevealFade } from "@/components/motion/reveal-fade";
import { formatPrice, services as staticServices, type ServiceSlug } from "@/lib/site";
import { getActiveServices } from "@/lib/data/services";
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
    title: t.pages.servizi.metaTitle,
    description: t.pages.servizi.metaDescription,
    alternates: {
      canonical: routes(locale).services,
      languages: {
        it: "/it/servizi",
        en: "/en/servizi",
      },
    },
  };
}

function padId(index: number) {
  return String(index + 1).padStart(2, "0");
}

export default async function ServiziPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const r = routes(locale);
  const dbServices = await getActiveServices();

  const list =
    dbServices.length > 0
      ? dbServices.map((s, i) => {
          const dict = t.services.items[s.slug as ServiceSlug];
          const fallback = staticServices.find((x) => x.slug === s.slug);
          return {
            slug: s.slug,
            id: padId(i),
            name: dict?.name ?? s.name,
            blurb: dict?.blurb ?? s.description ?? "",
            price: formatPrice(Number(s.price), locale),
            duration: `${s.duration_minutes} ${t.services.minutes}`,
            image: s.image_url || fallback?.image || "/images/cut-detail.jpg",
          };
        })
      : staticServices.map((service) => {
          const copy = t.services.items[service.slug];
          return {
            slug: service.slug,
            id: service.id,
            name: copy.name,
            blurb: copy.blurb,
            price: formatPrice(service.price, locale),
            duration: `${service.duration} ${t.services.minutes}`,
            image: service.image,
          };
        });

  return (
    <>
      <PageHero
        kicker={t.pages.servizi.kicker}
        title={t.pages.servizi.title}
        lead={t.pages.servizi.intro}
        action={{ href: r.book, label: t.nav.book, primary: true }}
      />

      <section className="bg-background">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <ul className="divide-y divide-border border-b border-border">
            {list.map((service) => (
              <li key={service.slug}>
                <RevealFade>
                  <ServiceRow
                    href={r.service(service.slug)}
                    id={service.id}
                    name={service.name}
                    blurb={service.blurb}
                    price={service.price}
                    duration={service.duration}
                    image={service.image}
                  />
                </RevealFade>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start gap-6 px-6 py-24 md:flex-row md:items-end md:justify-between md:px-10">
          <p className="max-w-md font-display text-3xl leading-tight md:text-5xl">
            {t.cta.lines.join(" ")}
          </p>
          <a
            href={r.book}
            className="group inline-flex items-center gap-3 bg-foreground px-6 py-3 text-[11px] tracking-[0.28em] text-background uppercase transition hover:opacity-90"
          >
            <span>{t.cta.button}</span>
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </section>
    </>
  );
}
