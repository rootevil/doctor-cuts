import type { Dictionary } from "@/i18n/dictionaries";
import type { PublicReview } from "@/lib/data/reviews";
import { site } from "@/lib/site";
import { Kicker } from "@/components/ui/kicker";
import { RevealFade } from "@/components/motion/reveal-fade";

function Stars({ rating, label }: { rating: number; label: string }) {
  const filled = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span className="inline-flex items-center gap-0.5 text-brass" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < filled ? "text-brass" : "text-foreground-muted/35"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * Social proof between About and Location.
 * Curated Google quotes only — section omitted when empty (no filler).
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
  const mapsHref = site.mapsUrl;
  const starsLabel = (n: number) => copy.starsLabel.replace("{n}", String(n));

  return (
    <section id="reviews" className="section-shell bg-background" aria-labelledby="reviews-heading">
      <div className="site-wrap-wide section-pad-y">
        <RevealFade>
          <div className="section-head flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-3">
              <Kicker accent>{copy.kicker}</Kicker>
              <h2
                id="reviews-heading"
                className="font-display text-3xl leading-[0.95] tracking-tight md:text-4xl lg:text-5xl"
              >
                {copy.title}
              </h2>
              {copy.lead ? (
                <p className="max-w-md text-base text-body md:text-lg">{copy.lead}</p>
              ) : null}
            </div>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="link-brass inline-flex min-h-11 items-center self-start text-[11px] tracking-[0.22em] uppercase md:self-auto"
            >
              {copy.googleCta}
              <span aria-hidden className="ml-1.5">
                →
              </span>
              <span className="sr-only"> ({copy.opensNew})</span>
            </a>
          </div>
        </RevealFade>

        <ul className="mt-10 flex flex-col md:mt-14">
          {reviews.map((review, index) => (
            <li key={review.id}>
              <RevealFade delay={Math.min(index * 0.06, 0.24)}>
                <figure className="border-t section-rule py-8 md:py-10">
                  <blockquote className="max-w-3xl">
                    <p className="font-display text-2xl leading-[1.2] tracking-tight text-foreground md:text-3xl md:leading-[1.15]">
                      “{review.quote}”
                    </p>
                  </blockquote>
                  <figcaption className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Stars rating={review.rating} label={starsLabel(review.rating)} />
                    <span className="text-[11px] font-bold tracking-[0.22em] text-accent-soft uppercase">
                      {review.name}
                    </span>
                    {review.source === "google" ? (
                      <span className="text-[10px] tracking-[0.2em] text-muted uppercase">
                        {copy.viaGoogle}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              </RevealFade>
            </li>
          ))}
        </ul>

        <RevealFade delay={0.12}>
          <div className="border-t section-rule pt-8">
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center gap-2 text-[11px] tracking-[0.22em] text-foreground-muted uppercase transition hover:text-brass"
            >
              {copy.showAll}
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
              <span className="sr-only"> ({copy.opensNew})</span>
            </a>
          </div>
        </RevealFade>
      </div>
    </section>
  );
}
