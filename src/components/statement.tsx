import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { RevealFade } from "@/components/motion/reveal-fade";

/**
 * Statement band: real studio interior as a watermark under the display type.
 * Type stays primary; the photo gives place/atmosphere without competing with the hero.
 */
export function Statement({ t }: { t: Dictionary }) {
  return (
    <section className="statement-band relative isolate overflow-hidden border-t border-border">
      {/* Atmosphere layer — size: full bleed, ~viewport-tall on desktop */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src="/images/studio-interior.jpg"
          alt=""
          fill
          sizes="100vw"
          className="statement-photo object-cover object-[72%_40%]"
          priority={false}
        />
        <div className="statement-scrim absolute inset-0" />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] max-w-[1600px] flex-col justify-center px-6 py-28 md:min-h-[78vh] md:px-10 md:py-40">
        <RevealFade>
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-16">
            <div className="accent-rule mt-4 hidden shrink-0 md:block" aria-hidden />
            <h2 className="font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl md:max-w-[14ch] md:text-[6.5rem] lg:text-[8rem]">
              {t.statement.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
        </RevealFade>
        <RevealFade delay={0.15}>
          <p className="mt-14 max-w-md text-lg text-body md:mt-20 md:ml-auto md:pl-16">
            {t.statement.body}
          </p>
        </RevealFade>
      </div>
    </section>
  );
}
