"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  ChartBar,
  Image as ImageIcon,
  MessageSquareQuote,
  Scissors,
  Settings,
  Users,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function useAdminItems(locale: Locale, t: Dictionary) {
  const r = routes(locale);
  const copy = t.pages.admin.nav;
  const items: Item[] = [
    { href: r.admin, label: copy.overview, icon: ChartBar },
    { href: r.adminAppointments, label: copy.appointments, icon: CalendarClock },
    { href: r.adminServices, label: copy.services, icon: Scissors },
    { href: r.adminHours, label: copy.hours, icon: CalendarDays },
    { href: r.adminCustomers, label: copy.customers, icon: Users },
    { href: r.adminGallery, label: copy.gallery, icon: ImageIcon },
    { href: r.adminReviews, label: copy.reviews, icon: MessageSquareQuote },
    { href: r.adminSettings, label: copy.settings, icon: Settings },
  ];
  return { items, r, copy };
}

function isActive(pathname: string, href: string, adminRoot: string) {
  if (href === adminRoot) return pathname === adminRoot;
  return pathname.startsWith(href);
}

export function AdminNav({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pathname = usePathname() || "";
  const { items, r, copy } = useAdminItems(locale, t);

  return (
    <aside className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center border-b border-border px-5">
        <span className="text-label">{copy.section}</span>
      </div>
      <nav aria-label={copy.section} className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = isActive(pathname, item.href, r.admin);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="admin-nav-link"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="shrink-0 border-t border-border px-5 py-4">
        <p className="text-caption">Studio · Macerata</p>
      </div>
    </aside>
  );
}

export function AdminMobileNav({ locale, t }: { locale: Locale; t: Dictionary }) {
  const pathname = usePathname() || "";
  const { items, r, copy } = useAdminItems(locale, t);

  return (
    <nav aria-label={copy.section} className="border-b border-border bg-[var(--admin-rail)] md:hidden">
      <ul className="flex gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = isActive(pathname, item.href, r.admin);
          const Icon = item.icon;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 px-3 text-[10px] tracking-[0.14em] whitespace-nowrap uppercase ${
                  active
                    ? "border border-brass/40 bg-[var(--admin-panel)] text-foreground"
                    : "text-muted"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${active ? "text-brass" : "text-muted"}`}
                  aria-hidden
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
