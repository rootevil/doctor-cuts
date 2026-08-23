import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { RevealFade } from "@/components/motion/reveal-fade";

/**
 * Statement band: real studio interior as a watermark under the display type.
 * Type stays primary; the photo gives place/atmosphere without competing with the hero.
 */
export function Statement({ t }: { t: Dictionary }) {
  return (
    <section className="statement-band section-shell relative isolate overflow-hidden">
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

      <div className="relative site-wrap-wide flex min-h-[62vh] flex-col justify-center section-pad-y md:min-h-[70vh]">
        <RevealFade>
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-16">
            <div className="accent-rule mt-4 hidden shrink-0 md:block" aria-hidden />
            <h2 className="type-display-section text-foreground md:max-w-[16ch]">
              {t.statement.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
        </RevealFade>
        <RevealFade delay={0.15}>
          <p className="mt-14 max-w-md rounded-sm bg-background/35 px-1 py-1 text-lg text-body backdrop-blur-[2px] md:mt-20 md:ml-auto md:bg-background/45 md:px-4 md:py-3 md:pl-16">
            {t.statement.body}
          </p>
        </RevealFade>
      </div>
    </section>
  );
}
