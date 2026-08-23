import { Clock, Instagram, MapPin, Navigation, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getBusinessHours } from "@/lib/data/hours";
import { getSettings } from "@/lib/data/settings";
import { contactFromSettings, displayHoursRows } from "@/lib/display/contact";
import { LazyMap } from "@/components/location/lazy-map";
import { Kicker } from "@/components/ui/kicker";
import { RevealFade } from "@/components/motion/reveal-fade";

function instagramHandle(url: string) {
  const match = url.match(/instagram\.com\/([^/?#]+)/i);
  return match?.[1] ? `@${match[1]}` : "@dr_barbiere";
}

/** Place-accurate embed (Doctor cuts · Macerata). */
const MAPS_EMBED =
  "https://www.google.com/maps?q=Doctor+cuts,+Via+Antelmo+Severini,+4%2Fc,+62100+Macerata+MC&ll=43.2969985,13.4565567&z=17&output=embed";

export async function Location({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [settings, hours] = await Promise.all([getSettings(), getBusinessHours()]);
  const contact = contactFromSettings(settings);
  const rows = displayHoursRows(hours, locale);
  const ig = instagramHandle(contact.instagram);
  const mapsHref =
    contact.mapsUrl ||
    "https://www.google.com/maps/place/Doctor+cuts/@43.2969985,13.4565567,17z";

  return (
    <section id="contact" className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1600px] px-6 py-20 md:px-10 md:py-28">
        <RevealFade>
          <Kicker accent>{t.location.kicker}</Kicker>
        </RevealFade>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 lg:items-stretch">
          {/* Info column */}
          <RevealFade>
            <div className="flex h-full flex-col divide-y divide-border border border-border bg-surface">
              {/* Address */}
              <div className="flex flex-col gap-5 p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-brass" aria-hidden />
                  <h3 className="text-label text-accent-soft">{t.location.addressTitle}</h3>
                </div>
                <address className="not-italic font-display text-2xl leading-snug tracking-tight text-foreground md:text-3xl">
                  {contact.addressLine}
                  {contact.postalCity ? (
                    <>
                      <br />
                      {contact.postalCity}
                    </>
                  ) : null}
                </address>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex min-h-11 w-fit items-center gap-2 text-[11px] tracking-[0.22em] text-foreground-muted uppercase transition hover:text-brass"
                >
                  <Navigation className="h-3.5 w-3.5" aria-hidden />
                  {t.location.directions}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
              </div>

              {/* Hours */}
              <div className="flex flex-col gap-5 p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-brass" aria-hidden />
                  <h3 className="text-label text-accent-soft">{t.location.hoursTitle}</h3>
                </div>
                <dl className="flex flex-col gap-0">
                  {rows.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-baseline justify-between gap-6 border-b border-border py-3.5 last:border-b-0"
                    >
                      <dt className="text-[12px] tracking-[0.16em] text-foreground-muted uppercase">
                        {slot.days}
                      </dt>
                      <dd
                        className={`text-right text-sm tabular-nums tracking-wide ${
                          /chiuso|closed/i.test(slot.time)
                            ? "text-muted"
                            : "text-brass"
                        }`}
                      >
                        {slot.time}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Contacts */}
              <div className="flex flex-col gap-5 p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-brass" aria-hidden />
                  <h3 className="text-label text-accent-soft">{t.location.contactsTitle}</h3>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <a
                    href={contact.telHref}
                    className="inline-flex min-h-12 items-center justify-center gap-2.5 bg-foreground px-5 text-[11px] tracking-[0.22em] text-background uppercase transition hover:opacity-90"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    {contact.phoneDisplay}
                  </a>
                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 border border-border px-5 text-[11px] tracking-[0.22em] text-foreground uppercase transition hover:border-brass hover:text-brass"
                  >
                    {t.location.whatsapp}
                  </a>
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 border border-border px-5 text-[11px] tracking-[0.18em] text-foreground uppercase transition hover:border-brass hover:text-brass"
                  >
                    <Instagram className="h-3.5 w-3.5" aria-hidden />
                    {ig}
                  </a>
                </div>
              </div>
            </div>
          </RevealFade>

          {/* Map column */}
          <RevealFade delay={0.08}>
            <div className="h-full">
              <LazyMap
                src={MAPS_EMBED}
                title={t.location.mapAlt}
                reveal={t.location.mapReveal}
                tall
              />
            </div>
          </RevealFade>
        </div>
      </div>
    </section>
  );
}
