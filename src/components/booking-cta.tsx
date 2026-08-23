import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { ButtonLink } from "@/components/ui/button";
import { RevealFade } from "@/components/motion/reveal-fade";

export function BookingCta({ locale, t }: { locale: Locale; t: Dictionary }) {
  const r = routes(locale);
  return (
    <section id="book" className="relative isolate overflow-hidden border-t border-border">
      <Image
        src="/images/leave.jpg"
        alt={t.cta.imageAlt}
        fill
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div aria-hidden className="hero-gradient absolute inset-0 -z-10" />
      <div className="mx-auto flex min-h-[80dvh] max-w-[1600px] flex-col justify-center gap-10 px-6 py-32 md:px-10">
        <RevealFade>
          <h2 className="font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-[7rem] lg:text-[9rem]">
            {t.cta.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </RevealFade>
        <RevealFade delay={0.15}>
          <ButtonLink href={r.book} variant="brass" arrow>
            {t.cta.button}
          </ButtonLink>
        </RevealFade>
      </div>
    </section>
  );
}
