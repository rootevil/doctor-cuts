import { Star } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import { getFeaturedReviews } from "@/lib/data/reviews";
import { Kicker } from "@/components/ui/kicker";
import { RevealFade } from "@/components/motion/reveal-fade";

export async function Testimonials({ t }: { t: Dictionary }) {
  const featured = await getFeaturedReviews(3);
  const items =
    featured.length > 0
      ? featured.map((r) => ({
          quote: r.quote,
          name: r.name,
          rating: r.rating,
          key: r.id,
        }))
      : t.testimonials.items.map((item, i) => ({
          quote: item.quote,
          name: item.name,
          rating: 5,
          key: `dict-${i}`,
        }));

  return (
    <section className="section-alt border-t border-border">
      <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32">
        <Kicker accent>{t.testimonials.kicker}</Kicker>
        <ul className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.key}>
              <RevealFade delay={index * 0.05}>
                <figure className="flex flex-col gap-6 border-t border-border pt-8 md:border-t-0 md:pt-0">
                  <blockquote className="font-display text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="flex items-center gap-3 text-[11px] tracking-[0.28em] text-muted uppercase">
                    <span>{item.name}</span>
                    <span aria-hidden className="flex gap-1 text-brass">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3" fill="currentColor" />
                      ))}
                    </span>
                  </figcaption>
                </figure>
              </RevealFade>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
