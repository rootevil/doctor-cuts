"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { routes } from "@/lib/routes";
import { LanguageToggle } from "@/components/layout/language-toggle";

type Props = {
  locale: Locale;
  t: Dictionary;
  items: { href: string; label: string }[];
  bookHref: string;
  accountHref: string;
  accountLabel: string;
};

export function MobileNav({
  locale,
  t,
  items,
  bookHref,
  accountHref,
  accountLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const r = routes(locale);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t.nav.close : t.nav.menu}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center gap-2 text-[11px] tracking-[0.22em] uppercase"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span>{open ? t.nav.close : t.nav.menu}</span>
      </button>

      {open ? (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-background text-foreground"
        >
          <div className="flex h-16 items-center justify-between px-6">
            <Link
              href={r.home}
              onClick={() => setOpen(false)}
              className="font-display text-lg tracking-[0.18em] uppercase"
            >
              Doctor Cuts
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 min-w-11 items-center gap-2 text-[11px] tracking-[0.22em] uppercase"
              aria-label={t.nav.close}
            >
              <X className="h-4 w-4" />
              {t.nav.close}
            </button>
          </div>

          <nav
            aria-label={t.nav.menu}
            className="flex h-[calc(100dvh-4rem)] flex-col justify-between px-6 pb-10"
          >
            <ul className="mt-8 flex flex-col gap-6 font-display text-4xl leading-none tracking-tight">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-display transition hover:text-foreground-soft"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={bookHref} onClick={() => setOpen(false)} className="text-brass">
                  {t.nav.book}
                </Link>
              </li>
              <li>
                <Link
                  href={accountHref}
                  onClick={() => setOpen(false)}
                  className="text-accent-soft text-2xl"
                >
                  {accountLabel}
                </Link>
              </li>
            </ul>

            <div className="flex flex-col gap-6 border-t border-border pt-6 text-[11px] tracking-[0.22em] uppercase">
              <LanguageToggle
                locale={locale}
                label={t.nav.language}
                labels={t.lang}
                variant="stacked"
              />
              <div className="flex flex-wrap gap-4 text-nav">
                <a href={site.instagram} className="hover:text-foreground">
                  Instagram
                </a>
                <a href={site.whatsapp} className="hover:text-foreground">
                  WhatsApp
                </a>
                <a href={site.telHref} className="hover:text-foreground">
                  {site.phoneDisplay}
                </a>
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
