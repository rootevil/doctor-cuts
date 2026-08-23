import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { RevealLines } from "@/components/motion/reveal-lines";
import { RevealFade } from "@/components/motion/reveal-fade";
import { HeroImage } from "@/components/motion/hero-image";

export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  const r = routes(locale);
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100dvh] w-full flex-col justify-end overflow-hidden"
    >
      <HeroImage>
        <Image
          src="/images/hero.jpg"
          alt={t.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </HeroImage>

      <div aria-hidden className="hero-gradient-warm absolute inset-0 -z-10" />

      <div className="site-wrap-wide flex w-full flex-col gap-10 pb-20 page-top md:pb-28">
        <Kicker accent>
          {t.hero.kicker} · {site.postalCity}
        </Kicker>
        <h1 className="type-display-hero text-foreground">
          <RevealLines lines={t.hero.lines} />
        </h1>
        <RevealFade delay={0.6}>
          <p className="max-w-md text-lg text-body">{t.hero.sub}</p>
        </RevealFade>
        <RevealFade delay={0.8}>
          <ButtonLink href={r.book} variant="book" arrow>
            {t.hero.cta}
          </ButtonLink>
        </RevealFade>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 hidden text-[11px] tracking-[0.28em] text-brass-muted uppercase md:block">
        {t.hero.scroll} ↓
      </div>
    </section>
  );
}
