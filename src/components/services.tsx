import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { ServiceSlug } from "@/lib/site";
import { formatPrice, services as staticServices } from "@/lib/site";
import { getActiveServices } from "@/lib/data/services";
import { routes } from "@/lib/routes";
import { Kicker } from "@/components/ui/kicker";
import { ServiceRow } from "@/components/services/service-row";
import { RevealFade } from "@/components/motion/reveal-fade";

function padId(index: number) {
  return String(index + 1).padStart(2, "0");
}

export async function Services({ locale, t }: { locale: Locale; t: Dictionary }) {
  const r = routes(locale);
  const bookHint = t.pages.servizi.detailsHint;
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
    <section id="services" className="section-shell bg-background">
      <div className="site-wrap-wide section-pad-y">
        <div className="section-head flex items-baseline justify-between">
          <Kicker>{t.services.kicker}</Kicker>
          <Link
            href={r.services}
            className="link-brass hidden text-[11px] tracking-[0.28em] uppercase md:inline"
          >
            {t.services.viewAll} →
          </Link>
        </div>

        <ul className="divide-y section-rule">
          {list.map((service) => (
            <li key={service.slug}>
              <RevealFade>
                <ServiceRow
                  href={r.bookService(service.slug)}
                  id={service.id}
                  name={service.name}
                  blurb={service.blurb}
                  price={service.price}
                  detailsHint={bookHint}
                />
              </RevealFade>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex justify-end border-t section-rule pt-6 md:hidden">
          <Link
            href={r.services}
            className="link-brass text-[11px] tracking-[0.28em] uppercase"
          >
            {t.services.viewAll} →
          </Link>
        </div>
      </div>
    </section>
  );
}
