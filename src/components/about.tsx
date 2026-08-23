import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { Kicker } from "@/components/ui/kicker";
import { RevealFade } from "@/components/motion/reveal-fade";

export function About({ t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="about" className="section-alt border-t border-border">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-6 py-24 md:grid-cols-2 md:gap-16 md:px-10 md:py-32">
        <RevealFade>
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src="/images/about-studio.jpg"
              alt={t.about.imageAlt}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover object-[center_30%]"
            />
          </div>
        </RevealFade>

        <RevealFade delay={0.1}>
          <div className="flex h-full flex-col justify-center gap-8">
            <Kicker accent>{t.about.kicker}</Kicker>
            <h2 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
              {t.about.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="max-w-md text-lg text-body">{t.about.body}</p>
            <dl className="grid grid-cols-2 gap-6 border-t border-border pt-6 text-sm">
              <div>
                <dt className="kicker">{t.about.yearLabel}</dt>
                <dd className="mt-2 font-display text-3xl text-brass">{site.established}</dd>
              </div>
              <div>
                <dt className="kicker">{t.about.locationLabel}</dt>
                <dd className="mt-2 text-foreground">
                  {site.addressLine}
                  <br />
                  {site.postalCity}
                </dd>
              </div>
            </dl>
          </div>
        </RevealFade>
      </div>
    </section>
  );
}
