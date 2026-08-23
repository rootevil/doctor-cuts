import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { LazyMap } from "@/components/location/lazy-map";
import { site } from "@/lib/site";
import { getBusinessHours } from "@/lib/data/hours";
import { getSettings } from "@/lib/data/settings";
import { contactFromSettings, displayHoursRows } from "@/lib/display/contact";
import { routes } from "@/lib/routes";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

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

function instagramHandle(url: string) {
  const match = url.match(/instagram\.com\/([^/?#]+)/i);
  return match?.[1] ? `@${match[1]}` : url;
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
  const [settings, hours] = await Promise.all([getSettings(), getBusinessHours()]);
  const contact = contactFromSettings(settings);
  const hourRows = displayHoursRows(hours, locale);
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
    settings.address || `${site.addressLine} ${site.postalCity}`,
  )}&output=embed`;

  return (
    <>
      <PageHero
        kicker={t.pages.contatti.kicker}
        title={t.pages.contatti.title}
        lead={t.pages.contatti.lead}
      />

      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-16 px-6 py-20 md:grid-cols-3 md:px-10 md:py-28">
          <div>
            <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
              {t.pages.contatti.addressTitle}
            </p>
            <address className="mt-6 not-italic font-display text-3xl leading-tight tracking-tight md:text-4xl">
              {contact.addressLine}
              {contact.postalCity ? (
                <>
                  <br />
                  {contact.postalCity}
                </>
              ) : null}
            </address>
            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-3 border border-foreground px-5 py-3 text-[11px] tracking-[0.28em] uppercase transition hover:bg-foreground hover:text-background"
            >
              {t.location.directions}
              <span aria-hidden>→</span>
            </a>
          </div>

          <div>
            <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
              {t.pages.contatti.channelsTitle}
            </p>
            <ul className="mt-6 flex flex-col divide-y divide-border border-y border-border">
              <li className="flex items-baseline justify-between py-4 text-sm">
                <span className="text-[11px] tracking-[0.28em] text-muted uppercase">
                  {t.location.phone}
                </span>
                <a
                  href={contact.telHref}
                  className="font-display text-2xl hover:text-foreground-soft"
                >
                  {contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-baseline justify-between py-4 text-sm">
                <span className="text-[11px] tracking-[0.28em] text-muted uppercase">
                  {t.location.whatsapp}
                </span>
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lg hover:text-foreground-soft"
                >
                  +39 {contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-baseline justify-between py-4 text-sm">
                <span className="text-[11px] tracking-[0.28em] text-muted uppercase">
                  Instagram
                </span>
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lg hover:text-foreground-soft"
                >
                  {instagramHandle(contact.instagram)}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
              {t.pages.contatti.hoursTitle}
            </p>
            <dl className="mt-6 flex flex-col divide-y divide-border border-y border-border">
              {hourRows.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between py-4 text-sm tracking-[0.22em] uppercase"
                >
                  <dt className="text-muted">{slot.days}</dt>
                  <dd className="text-foreground">{slot.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-10 md:py-20">
          <LazyMap
            src={mapsEmbed}
            title={t.location.mapAlt}
            reveal={t.location.mapReveal}
          />
        </div>
      </section>
    </>
  );
}
