import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { Kicker } from "@/components/ui/kicker";
import { RevealFade } from "@/components/motion/reveal-fade";

/** Full landscape frame — do not crop to portrait. */
const OWNER_W = 1024;
const OWNER_H = 682;

export function Owner({ t }: { locale: Locale; t: Dictionary }) {
  const copy = t.owner;

  return (
    <section id="owner" className="owner-section section-alt section-shell">
      <div className="site-wrap-wide owner-section-grid">
        <RevealFade>
          <div className="owner-section-copy order-2 min-[900px]:order-1">
            <Kicker accent>{copy.kicker}</Kicker>
            <div>
              <h2 className="owner-section-name text-foreground">{copy.name}</h2>
              <p className="owner-section-role">{copy.role}</p>
            </div>
            <p className="owner-section-body">{copy.body}</p>
            <ul className="owner-section-list">
              {copy.highlights.map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <span
                    className="mt-[0.4rem] h-1 w-1 shrink-0 rounded-full bg-brass"
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
            <div className="owner-section-footer">
              <p className="kicker">{copy.experienceLabel}</p>
              <p className="owner-section-years">{copy.experienceValue}</p>
            </div>
          </div>
        </RevealFade>

        <RevealFade delay={0.08}>
          <figure className="owner-section-photo order-1 min-[900px]:order-2">
            <Image
              src="/images/owner-muhammad-sikandar.jpg"
              alt={copy.imageAlt}
              width={OWNER_W}
              height={OWNER_H}
              quality={92}
              sizes="(min-width: 900px) 62vw, 100vw"
              className="h-auto w-full"
              priority={false}
            />
          </figure>
        </RevealFade>
      </div>
    </section>
  );
}
