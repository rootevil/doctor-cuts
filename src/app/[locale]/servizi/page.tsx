import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceRow } from "@/components/services/service-row";
import { RevealFade } from "@/components/motion/reveal-fade";
import { Kicker } from "@/components/ui/kicker";
import { formatPrice, services as staticServices } from "@/lib/site";
import { getActiveServices } from "@/lib/data/services";
import {
  localizedServiceBlurb,
  localizedServiceName,
} from "@/lib/services/localize";
import { routes } from "@/lib/routes";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { italianAlternates } from "@/i18n/public-url";
import { requestLocale } from "@/i18n/request-locale";

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
    title: t.pages.servizi.metaTitle,
    description: t.pages.servizi.metaDescription,
    alternates: italianAlternates(routes(locale).services),
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
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const page = t.pages.servizi;
  const r = routes(locale);
  const dbServices = await getActiveServices();

  const list =
    dbServices.length > 0
      ? dbServices.map((s, i) => ({
          slug: s.slug,
          id: padId(i),
          name: localizedServiceName(locale, s.slug, s.name),
          blurb: localizedServiceBlurb(locale, s.slug, s.description),
          price: formatPrice(Number(s.price), locale),
        }))
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
