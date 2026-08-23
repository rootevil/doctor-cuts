import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { routes } from "@/lib/routes";
import { Kicker } from "@/components/ui/kicker";
import { RevealFade } from "@/components/motion/reveal-fade";

export function About({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <section id="about" className="section-alt section-shell">
      <div className="site-wrap-wide grid grid-cols-1 items-center gap-10 section-pad-y md:grid-cols-2 md:gap-12 lg:gap-16">
        <RevealFade>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[22rem] overflow-hidden sm:max-w-[26rem] md:mx-0 md:max-w-[min(100%,32rem)]">
            <Image
              src="/images/about-studio.jpg"
              alt={t.about.imageAlt}
              fill
              sizes="(min-width: 768px) 40vw, 26rem"
              className="object-cover object-[center_30%]"
            />
          </div>
        </RevealFade>

        <RevealFade delay={0.1}>
          <div className="flex flex-col justify-center gap-7 md:gap-8 md:pl-2 lg:pl-4">
            <Kicker accent>{t.about.kicker}</Kicker>
            <h2 className="font-display text-5xl leading-[0.95] tracking-tight md:text-6xl lg:text-7xl">
              {t.about.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="max-w-md text-lg text-body">{t.about.body}</p>
            <div className="flex flex-wrap items-end justify-between gap-6 border-t section-rule pt-6 md:max-w-md">
              <div>
                <p className="kicker">{t.about.yearLabel}</p>
                <p className="mt-2 font-display text-3xl text-brass">{site.established}</p>
              </div>
              <Link
                href={`${routes(locale).home}#contact`}
                className="link-brass inline-flex min-h-11 items-center text-[11px] tracking-[0.22em] uppercase"
              >
                {t.about.findUs} →
              </Link>
            </div>
          </div>
        </RevealFade>
      </div>
    </section>
  );
}
