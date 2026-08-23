import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceRow } from "@/components/services/service-row";
import { RevealFade } from "@/components/motion/reveal-fade";
import { Kicker } from "@/components/ui/kicker";
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
  const page = t.pages.servizi;
  const r = routes(locale);
  const dbServices = await getActiveServices();

  const list =
    dbServices.length > 0
      ? dbServices.map((s, i) => {
          const dict = t.services.items[s.slug as ServiceSlug];
          return {
            slug: s.slug,
            id: padId(i),
            name: dict?.name ?? s.name,
            blurb: dict?.blurb ?? s.description ?? "",
            price: formatPrice(Number(s.price), locale),
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
          };
        });

  return (
    <>
      {/* Compact header */}
      <header className="border-b border-border bg-surface">
        <div className="site-wrap-mid page-top-spacious pb-10 md:pb-12">
          <Kicker accent>{page.kicker}</Kicker>
          <h1 className="type-display-title mt-5 text-foreground">
            {page.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-body md:text-lg">
            {page.intro}
          </p>
        </div>
      </header>

      {/* Service menu */}
      <section className="bg-background" aria-labelledby="services-list-heading">
        <div className="site-wrap-mid py-10 md:py-14">
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <h2
              id="services-list-heading"
              className="text-[11px] tracking-[0.28em] text-muted uppercase"
            >
              {page.listLabel}
              <span className="ml-2 text-brass">({list.length})</span>
            </h2>
          </div>

          <ul className="divide-y divide-border border-b border-border">
            {list.map((service, index) => (
              <li key={service.slug}>
                <RevealFade delay={index * 0.04}>
                  <ServiceRow
                    href={r.bookService(service.slug)}
                    id={service.id}
                    name={service.name}
                    blurb={service.blurb}
                    price={service.price}
                    detailsHint={page.detailsHint}
                  />
                </RevealFade>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
