import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { Kicker } from "@/components/ui/kicker";
import { RevealFade } from "@/components/motion/reveal-fade";

const IMAGES = [
  "/images/experience-arrive.jpg",
  "/images/tools.jpg",
  "/images/cut-detail.jpg",
  "/images/leave.jpg",
];

export function Experience({ t }: { t: Dictionary }) {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="border-b border-border py-10">
          <Kicker>{t.experience.kicker}</Kicker>
        </div>

        <ol className="divide-y divide-border">
          {t.experience.items.map((item, index) => {
            const image = IMAGES[index];
            const reverse = index % 2 === 1;
            return (
              <li
                key={item.n}
                className={`grid gap-8 py-16 md:grid-cols-[1fr_1.2fr] md:gap-16 md:py-24 ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <RevealFade>
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={image}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className={`object-cover ${index === 0 ? "object-[center_35%]" : ""}`}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent"
                    />
                  </div>
                </RevealFade>
                <RevealFade delay={0.1}>
                  <div className="flex h-full flex-col justify-center gap-6">
                    <span className="font-display text-3xl text-brass-muted">{item.n}</span>
                    <h3 className="font-display text-4xl leading-tight tracking-tight md:text-6xl">
                      {item.title}
                    </h3>
                    <p className="max-w-sm text-lg text-body">{item.line}</p>
                  </div>
                </RevealFade>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
