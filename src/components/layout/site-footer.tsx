import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getSettings } from "@/lib/data/settings";
import { contactFromSettings } from "@/lib/display/contact";
import { routes } from "@/lib/routes";
import { BrandLogo } from "@/components/layout/brand-logo";

export async function SiteFooter({ locale, t }: { locale: Locale; t: Dictionary }) {
  const r = routes(locale);
  const settings = await getSettings();
  const contact = contactFromSettings(settings);
  const nav = [
    { href: r.services, label: t.nav.services },
    { href: r.gallery, label: t.nav.gallery },
    { href: r.about, label: t.nav.about },
    { href: r.contact, label: t.nav.contact },
    { href: r.book, label: t.nav.book },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brass/40 to-transparent" aria-hidden />
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-4 md:px-10">
        <div className="flex flex-col gap-4">
          <Link
            href={r.home}
            className="inline-flex items-center transition hover:opacity-90"
            aria-label={contact.businessName}
          >
            <BrandLogo height={56} />
          </Link>
          <p className="max-w-xs text-sm text-body">
            {contact.addressLine}
            {contact.postalCity ? ` · ${contact.postalCity}` : ""}
          </p>
        </div>

        <div>
          <p className="kicker mb-4">{t.nav.menu}</p>
          <ul className="flex flex-col gap-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-nav transition hover:text-brass"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="kicker mb-4">{t.pages.contatti.channelsTitle}</p>
          <ul className="flex flex-col gap-2 text-sm text-body">
            <li>
              <a href={contact.telHref} className="transition hover:text-brass">
                {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={contact.whatsapp} className="transition hover:text-brass">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={contact.instagram} className="transition hover:text-brass">
                Instagram
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="kicker mb-4">{t.pages.contatti.addressTitle}</p>
          <address className="not-italic text-sm text-body">
            {contact.addressLine}
            {contact.postalCity ? (
              <>
                <br />
                {contact.postalCity}
              </>
            ) : null}
          </address>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-2 px-6 py-6 text-[11px] tracking-[0.22em] text-muted-subtle uppercase md:flex-row md:items-center md:px-10">
          <span>
            © {new Date().getFullYear()} {contact.businessName}
          </span>
        </div>
      </div>
    </footer>
  );
}
