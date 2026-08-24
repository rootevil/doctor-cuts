import type { ReactNode } from "react";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getBusinessHours } from "@/lib/data/hours";
import { getSettings } from "@/lib/data/settings";
import { contactFromSettings, displayHoursRows } from "@/lib/display/contact";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  FacebookIcon,
  InstagramIcon,
  PhoneGlyphIcon,
  WhatsAppIcon,
} from "@/components/icons/brand-icons";
import { LazyMap } from "@/components/location/lazy-map";
import { Kicker } from "@/components/ui/kicker";
import { RevealFade } from "@/components/motion/reveal-fade";

function SectionIcon({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brass/35 bg-brass-subtle text-brass shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brass)_12%,transparent)]"
      aria-hidden
    >
      {children}
    </span>
  );
}

/** Place-accurate embed (Doctor cuts · Macerata). */
const MAPS_EMBED =
  "https://www.google.com/maps?q=Doctor+cuts,+Via+Antelmo+Severini,+4%2Fc,+62100+Macerata+MC&ll=43.2969985,13.4565567&z=17&output=embed";

export async function Location({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [settings, hours] = await Promise.all([getSettings(), getBusinessHours()]);
  const contact = contactFromSettings(settings);
  const rows = displayHoursRows(hours, locale);
  const mapsHref =
    contact.mapsUrl ||
    "https://www.google.com/maps/place/Doctor+cuts/@43.2969985,13.4565567,17z";

  return (
    <section id="contact" className="section-shell bg-background">
      <div className="site-wrap-wide section-pad-y">
        <RevealFade>
          <Kicker accent>{t.location.kicker}</Kicker>
        </RevealFade>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:mt-12 lg:grid-cols-2 lg:gap-12 lg:items-stretch">
          {/* Info column */}
          <RevealFade>
            <div className="flex h-full flex-col divide-y section-rule bg-surface">
              {/* Address + logo */}
              <div className="flex flex-col gap-5 p-5 md:p-7">
                <div className="flex items-center gap-3">
                  <SectionIcon>
                    <MapPin className="h-4 w-4" strokeWidth={1.75} />
                  </SectionIcon>
                  <h3 className="text-[11px] font-bold tracking-[0.22em] text-accent-soft uppercase">
                    {t.location.addressTitle}
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-5 md:gap-8">
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 transition hover:text-brass"
                    >
                      <address className="not-italic font-display text-xl leading-snug tracking-tight text-inherit md:text-2xl">
                        {contact.addressLine}
                        {contact.postalCity ? (
                          <>
                            <br />
                            {contact.postalCity}
                          </>
                        ) : null}
                      </address>
                    </a>
                    <BrandLogo height={112} className="shrink-0" />
                  </div>
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex min-h-11 w-fit items-center gap-2.5 text-[11px] tracking-[0.22em] text-foreground-muted uppercase transition hover:text-brass"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/80 transition group-hover:border-brass/50 group-hover:text-brass">
                      <Navigation className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                    </span>
                    {t.location.directions}
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex flex-col gap-5 p-5 md:p-7">
                <div className="flex items-center gap-3">
                  <SectionIcon>
                    <Clock className="h-4 w-4" strokeWidth={1.75} />
                  </SectionIcon>
                  <h3 className="text-[11px] font-bold tracking-[0.22em] text-accent-soft uppercase">
                    {t.location.hoursTitle}
                  </h3>
                </div>
                <dl className="flex flex-col gap-0">
                  {rows.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-baseline justify-between gap-6 border-b section-rule py-3 last:border-b-0"
                    >
                      <dt className="text-[12px] tracking-[0.16em] text-foreground-muted uppercase">
                        {slot.days}
                      </dt>
                      <dd
                        className={`text-right text-sm tabular-nums tracking-wide ${
                          /chiuso|closed/i.test(slot.time)
                            ? "text-muted-subtle"
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
              <div className="flex flex-col gap-5 p-5 md:p-7">
                <div className="flex items-center gap-3">
                  <SectionIcon>
                    <Phone className="h-4 w-4" strokeWidth={1.75} />
                  </SectionIcon>
                  <h3 className="text-[11px] font-bold tracking-[0.22em] text-accent-soft uppercase">
                    {t.location.contactsTitle}
                  </h3>
                </div>
                <div className="btn-channel-grid">
                  <a
                    href={contact.telHref}
                    className="btn-channel btn-channel-call"
                    aria-label={`${t.location.phone}: ${contact.phoneDisplay}`}
                  >
                    <span className="btn-channel-mark" aria-hidden>
                      <PhoneGlyphIcon />
                    </span>
                    <span className="btn-channel-label">{contact.phoneDisplay}</span>
                  </a>
                  <a
                    href={contact.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-channel btn-channel-whatsapp"
                    aria-label={`${t.location.whatsapp}: ${contact.phoneDisplay}`}
                  >
                    <span className="btn-channel-mark" aria-hidden>
                      <WhatsAppIcon />
                    </span>
                    <span className="btn-channel-label">{contact.phoneDisplay}</span>
                  </a>
                  <a
                    href={contact.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-channel btn-channel-instagram"
                    aria-label={`Instagram ${contact.businessName}`}
                  >
                    <span className="btn-channel-mark" aria-hidden>
                      <InstagramIcon />
                    </span>
                    <span className="btn-channel-label">Dr. Cuts</span>
                  </a>
                  <a
                    href={contact.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-channel btn-channel-facebook"
                    aria-label={`Facebook ${contact.businessName}`}
                  >
                    <span className="btn-channel-mark" aria-hidden>
                      <FacebookIcon />
                    </span>
                    <span className="btn-channel-label">Dr. Cuts</span>
                  </a>
                </div>
              </div>
            </div>
          </RevealFade>

          {/* Map column */}
          <RevealFade delay={0.08}>
            <div className="h-full overflow-hidden">
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
