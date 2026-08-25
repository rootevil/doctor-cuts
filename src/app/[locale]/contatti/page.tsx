import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  PhoneGlyphIcon,
  WhatsAppIcon,
} from "@/components/icons/brand-icons";
import { LazyMap } from "@/components/location/lazy-map";
import { Kicker } from "@/components/ui/kicker";
import { getBusinessHours } from "@/lib/data/hours";
import { getSettings } from "@/lib/data/settings";
import { contactFromSettings, displayHoursRows } from "@/lib/display/contact";
import { routes } from "@/lib/routes";
import { site } from "@/lib/site";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

/** Place-accurate embed (Doctor cuts · Macerata). */
const MAPS_EMBED = site.mapsEmbedUrl;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.pages.contatti.metaTitle,
    description: t.pages.contatti.metaDescription,
    alternates: {
      canonical: routes(locale).contact,
      languages: { it: "/it/contatti", en: "/en/contatti" },
    },
  };
}

function SectionIcon({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brass/35 bg-brass-subtle text-brass"
      aria-hidden
    >
      {children}
    </span>
  );
}

export default async function ContattiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const page = t.pages.contatti;

  const [settings, hours] = await Promise.all([getSettings(), getBusinessHours()]);
  const contact = contactFromSettings(settings);
  const hourRows = displayHoursRows(hours, locale);
  const mapsHref = contact.mapsUrl;

  return (
    <>
      {/* Compact header */}
      <header className="border-b border-border bg-surface">
        <div className="site-wrap-mid page-top-spacious pb-10 md:pb-12">
          <Kicker accent>{page.kicker}</Kicker>
          <h1 className="type-display-title mt-5 text-foreground">
            {page.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-body md:text-lg">
            {page.lead}
          </p>
        </div>
      </header>

      {/* One clear layout: details + map */}
      <section className="bg-background">
        <div className="site-wrap-mid grid grid-cols-1 gap-8 py-10 md:py-14 lg:grid-cols-2 lg:items-stretch lg:gap-10">
          <div className="flex flex-col divide-y divide-border border border-border bg-surface">
            {/* Address */}
            <div className="flex flex-col gap-5 p-5 md:p-7">
              <div className="flex items-center gap-3">
                <SectionIcon>
                  <MapPin className="h-4 w-4" strokeWidth={1.75} />
                </SectionIcon>
                <h2 className="text-[11px] font-bold tracking-[0.28em] text-brass-muted uppercase">
                  {page.addressTitle}
                </h2>
              </div>
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-brass"
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
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </div>

            {/* Channels */}
            <div className="flex flex-col gap-5 p-5 md:p-7">
              <div className="flex items-center gap-3">
                <SectionIcon>
                  <Phone className="h-4 w-4" strokeWidth={1.75} />
                </SectionIcon>
                <h2 className="text-[11px] font-bold tracking-[0.28em] text-brass-muted uppercase">
                  {page.channelsTitle}
                </h2>
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
                  href={contact.mailtoHref}
                  className="btn-channel btn-channel-email"
                  aria-label={`${t.location.email}: ${contact.email}`}
                >
                  <span className="btn-channel-mark" aria-hidden>
                    <Mail className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span className="btn-channel-label">{contact.email}</span>
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

            {/* Hours */}
            <div className="flex flex-col gap-5 p-5 md:p-7">
              <div className="flex items-center gap-3">
                <SectionIcon>
                  <Clock className="h-4 w-4" strokeWidth={1.75} />
                </SectionIcon>
                <h2 className="text-[11px] font-bold tracking-[0.28em] text-brass-muted uppercase">
                  {page.hoursTitle}
                </h2>
              </div>
              <dl className="flex flex-col">
                {hourRows.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-baseline justify-between gap-6 border-b border-border py-3 last:border-b-0"
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
          </div>

          <div className="min-h-[22rem] overflow-hidden lg:min-h-0">
            <LazyMap
              src={MAPS_EMBED}
              title={t.location.mapAlt}
              reveal={t.location.mapReveal}
              tall
            />
          </div>
        </div>
      </section>
    </>
  );
}
