import type { Dictionary } from "@/i18n/dictionaries";
import type { PublicReview } from "@/lib/data/reviews";
import { site } from "@/lib/site";
import { Kicker } from "@/components/ui/kicker";
import { RevealFade } from "@/components/motion/reveal-fade";

function Stars({ rating, label }: { rating: number; label: string }) {
  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span className="inline-flex items-center gap-px text-[10px] leading-none" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < filled ? "text-brass" : "text-foreground-muted/30"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * Compact social proof between About and Location.
 * Omitted when empty — no filler quotes.
 */
export function Testimonials({
  t,
  reviews,
}: {
  t: Dictionary;
  reviews: PublicReview[];
}) {
  if (reviews.length === 0) return null;

  const copy = t.testimonials;
  const reviewsHref = site.mapsReviewsUrl;
  const moreCount = Math.max(0, site.googleReviewsTotal - reviews.length);
  const starsLabel = (n: number) => copy.starsLabel.replace("{n}", String(n));

  return (
    <section
      id="reviews"
      className="section-shell bg-background"
      aria-labelledby="reviews-heading"
    >
      <div className="site-wrap-wide py-10 md:py-12">
        <RevealFade>
          <div className="flex flex-wrap items-end justify-between gap-3 border-b section-rule pb-4">
            <div className="flex flex-col gap-1.5">
              <Kicker accent>{copy.kicker}</Kicker>
              <h2
                id="reviews-heading"
                className="font-display text-xl tracking-tight md:text-2xl"
              >
                {copy.title}
              </h2>
            </div>
            <a
              href={reviewsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="link-brass inline-flex min-h-10 items-center text-[10px] tracking-[0.2em] uppercase"
            >
              {copy.viaGoogle}
              <span className="sr-only"> ({copy.opensNew})</span>
            </a>
          </div>
        </RevealFade>

        <ul className="mt-1 divide-y section-rule">
          {reviews.map((review, index) => (
            <li key={review.id}>
              <RevealFade delay={Math.min(index * 0.04, 0.16)}>
                <figure className="flex flex-col gap-2 py-4 md:flex-row md:items-baseline md:gap-6 md:py-3.5">
                  <figcaption className="flex shrink-0 items-center gap-2.5 md:w-40">
                    <Stars rating={review.rating} label={starsLabel(review.rating)} />
                    <span className="text-[10px] font-bold tracking-[0.18em] text-accent-soft uppercase">
                      {review.name}
                    </span>
                  </figcaption>
                  <blockquote className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-body md:text-[0.9375rem] md:leading-relaxed">
                      <span className="mr-0.5 text-brass/70" aria-hidden>
                        “
                      </span>
                      {review.quote}
                      <span className="text-brass/70" aria-hidden>
                        ”
                      </span>
                    </p>
                  </blockquote>
                </figure>
              </RevealFade>
            </li>
          ))}
        </ul>

        {moreCount > 0 ? (
          <RevealFade delay={0.1}>
            <div className="border-t section-rule pt-4">
              <a
                href={reviewsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-10 items-center gap-2.5 text-[11px] tracking-[0.18em] text-brass uppercase transition hover:text-foreground"
              >
                <span className="font-display text-xl leading-none tracking-tight text-brass normal-case">
                  +{moreCount}
                </span>
                <span>{copy.moreOnGoogle}</span>
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
                <span className="sr-only">
                  {" "}
                  ({copy.opensNew})
                </span>
              </a>
            </div>
          </RevealFade>
        ) : null}
      </div>
    </section>
  );
}
