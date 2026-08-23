"use client";

import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { BrandLogo } from "@/components/layout/brand-logo";

export type FooterContact = {
  businessName: string;
  addressLine: string;
  postalCity: string;
  phoneDisplay: string;
  telHref: string;
  whatsapp: string;
  instagram: string;
};

export function SiteFooterView({
  locale,
  t,
  contact,
}: {
  locale: Locale;
  t: Dictionary;
  contact: FooterContact;
}) {
  const pathname = usePathname();
  const home = routes(locale).home;
  const isHome =
    pathname === home ||
    pathname === `/${locale}` ||
    pathname === `/${locale}/`;

  if (isHome) {
    return (
      <footer className="section-shell bg-surface">
        <div className="site-wrap-wide flex flex-col items-center gap-4 py-5 md:flex-row md:justify-between">
          <p className="text-[11px] tracking-[0.22em] text-muted-subtle uppercase">
            © {new Date().getFullYear()} {t.footer.rights}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex min-h-10 items-center gap-2.5 text-[10px] tracking-[0.28em] text-foreground-muted uppercase transition hover:text-brass"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/80 transition group-hover:border-brass/50 group-hover:text-brass">
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </span>
            {t.footer.backToTop}
          </button>
        </div>
      </footer>
    );
  }

  const r = routes(locale);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brass/40 to-transparent" aria-hidden />
      <div className="site-wrap-mid flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between md:gap-10">
        <Link
          href={r.home}
          aria-label={contact.businessName}
          className="inline-flex w-fit shrink-0 transition hover:opacity-90"
        >
          <BrandLogo src="/images/logo-footer.png" height={72} />
        </Link>

        <Link
          href={r.contact}
          className="group min-w-0 transition hover:text-brass md:flex-1 md:px-6 lg:px-10"
        >
          <address className="not-italic text-sm leading-snug text-body md:text-[15px]">
            <span className="block font-display text-base tracking-tight text-foreground transition group-hover:text-brass md:text-lg">
              {contact.addressLine}
            </span>
            {contact.postalCity ? (
              <span className="mt-0.5 block text-foreground-muted">
                {contact.postalCity}
              </span>
            ) : null}
          </address>
        </Link>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group inline-flex min-h-10 shrink-0 items-center gap-2.5 text-[10px] tracking-[0.28em] text-foreground-muted uppercase transition hover:text-brass md:justify-self-end"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/80 transition group-hover:border-brass/50 group-hover:text-brass">
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </span>
          {t.footer.backToTop}
        </button>
      </div>

      <div className="border-t border-border">
        <div className="site-wrap-mid py-5">
          <p className="text-[11px] tracking-[0.22em] text-muted-subtle uppercase">
            © {new Date().getFullYear()} {contact.businessName}
            <span className="mx-2 text-border-strong" aria-hidden>
              ·
            </span>
            {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
