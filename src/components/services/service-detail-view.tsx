import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatPrice } from "@/lib/site";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";

type RelatedService = {
  slug: string;
  name: string;
  price: number;
  blurb: string;
};

type Props = {
  locale: Locale;
  t: Dictionary;
  slug: string;
  name: string;
  detail: string;
  price: number;
  image: string;
  includes: string[];
  ideal: string;
  others: RelatedService[];
};

export function ServiceDetailView({
  locale,
  t,
  slug,
  name,
  detail,
  price,
  image,
  includes,
  ideal,
  others,
}: Props) {
  const copy = t.pages.serviceDetail;
  const r = routes(locale);
  const bookHref = r.bookService(slug);
  const priceLabel = formatPrice(price, locale);

  return (
    <article className="service-detail">
      <header className="border-b border-border bg-surface">
        <div className="site-wrap-narrow page-top pb-6 md:pb-8">
          <Link
            href={r.services}
            className="link-brass mb-5 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase"
          >
            <span aria-hidden>←</span>
            {copy.back}
          </Link>
          <Kicker accent>{t.services.kicker}</Kicker>
          <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
            {name}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-body md:text-lg">{detail}</p>
        </div>
      </header>

      <div className="service-detail-body site-wrap-narrow py-8 md:py-10">
        <div className="service-detail-panel">
          <div className="service-detail-grid">
            <figure className="service-detail-media">
              <div className="service-detail-media-frame">
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="(min-width: 768px) 420px, 100vw"
                  className="object-cover"
                  priority
                  unoptimized={image.startsWith("http")}
                />
              </div>
            </figure>

            <div className="service-detail-content">
              <div className="service-detail-price-block">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] tracking-[0.22em] text-muted uppercase">
                    {copy.priceLabel}
                  </p>
                  <p className="mt-1 font-display text-3xl leading-none text-foreground md:text-4xl">
                    {priceLabel}
                  </p>
                  <p className="mt-2 text-sm text-body">{copy.bookHint}</p>
                </div>
                <ButtonLink
                  href={bookHref}
                  variant="book"
                  arrow
                  className="hidden shrink-0 md:inline-flex"
                >
                  {copy.bookCta}
                </ButtonLink>
              </div>

              {includes.length > 0 ? (
                <section aria-labelledby="service-includes-heading" className="service-detail-block">
                  <h2
                    id="service-includes-heading"
                    className="service-detail-block-title"
                  >
                    {copy.includesLabel}
                  </h2>
                  <ul className="service-detail-checklist">
                    {includes.map((item) => (
                      <li key={item}>
                        <Check className="h-3.5 w-3.5 shrink-0 text-brass" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {ideal ? (
                <section aria-labelledby="service-ideal-heading" className="service-detail-block">
                  <h2 id="service-ideal-heading" className="service-detail-block-title">
                    {copy.idealLabel}
                  </h2>
                  <p className="text-sm text-body md:text-base">{ideal}</p>
                </section>
              ) : null}
            </div>
          </div>
        </div>

        {others.length > 0 ? (
          <section
            aria-labelledby="service-related-heading"
            className="service-detail-related"
          >
            <div className="service-detail-related-head">
              <h2 id="service-related-heading" className="service-detail-block-title">
                {copy.relatedLabel}
              </h2>
              <Link
                href={r.services}
                className="link-brass text-[10px] tracking-[0.18em] uppercase"
              >
                {copy.viewAllServices}
              </Link>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {others.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={r.service(service.slug)}
                    className="service-detail-related-row group"
                  >
                    <div className="service-detail-related-name min-w-0 flex-1">
                      <span className="font-display text-lg leading-tight text-foreground transition group-hover:text-brass md:text-xl">
                        {service.name}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-muted">
                        {service.blurb}
                      </span>
                    </div>
                    <span className="service-detail-related-price shrink-0 text-sm tabular-nums text-foreground-soft md:text-base">
                      {formatPrice(service.price, locale)}
                    </span>
                    <span
                      aria-hidden
                      className="service-detail-related-arrow shrink-0 text-brass-muted transition group-hover:translate-x-0.5 group-hover:text-brass"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <div className="service-detail-cta-bar md:hidden">
        <div className="site-wrap-narrow flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">{name}</p>
            <p className="font-display text-lg text-brass">{priceLabel}</p>
          </div>
          <ButtonLink href={bookHref} variant="book" size="sm" className="min-h-11 shrink-0">
            {copy.bookCta}
          </ButtonLink>
        </div>
      </div>
      <div className="sticky-action-spacer md:hidden" aria-hidden />
    </article>
  );
}
