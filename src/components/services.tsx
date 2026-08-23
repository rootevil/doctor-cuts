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
    <section id="services" className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex items-baseline justify-between border-b border-border pb-8 pt-24">
          <Kicker>{t.services.kicker}</Kicker>
          <Link
            href={r.services}
            className="link-brass hidden text-[11px] tracking-[0.28em] uppercase md:inline"
          >
            {t.services.viewAll} →
          </Link>
        </div>

        <ul className="divide-y divide-border">
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

        <div className="flex justify-end border-t border-border py-8 md:hidden">
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
