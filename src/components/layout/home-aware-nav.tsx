"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";

type NavItem = { href: string; label: string; hash?: string };

export function HomeAwareNav({
  locale,
  items,
  menuLabel,
}: {
  locale: Locale;
  items: NavItem[];
  menuLabel: string;
}) {
  const pathname = usePathname();
  const home = routes(locale).home;
  const onHome =
    pathname === home || pathname === `/${locale}` || pathname === `/${locale}/`;

  return (
    <nav
      aria-label={menuLabel}
      className="hidden items-center gap-5 text-[11px] tracking-[0.2em] uppercase lg:gap-8 md:flex"
    >
      {items.map((item) => {
        const href =
          onHome && item.hash ? `${home}${item.hash}` : item.href;
        return (
          <Link
            key={item.href}
            href={href}
            className="inline-flex min-h-11 items-center text-nav uppercase transition hover:text-foreground"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
