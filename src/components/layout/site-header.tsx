import Link from "next/link";
import { User } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ScrollAwareHeader } from "@/components/layout/scroll-aware-header";
import { HomeAwareNav } from "@/components/layout/home-aware-nav";
import { ButtonLink } from "@/components/ui/button";

type NavItem = { href: string; label: string; hash?: string };

async function currentUserSummary() {
  if (!supabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id, email: user.email ?? null } : null;
}

export async function SiteHeader({
  locale,
  t,
}: {
  locale: Locale;
  t: Dictionary;
}) {
  const r = routes(locale);
  const items: NavItem[] = [
    { href: r.services, label: t.nav.services, hash: "#services" },
    { href: r.gallery, label: t.nav.gallery, hash: "#gallery" },
    { href: r.about, label: t.nav.about, hash: "#about" },
    { href: `${r.home}#reviews`, label: t.nav.reviews, hash: "#reviews" },
    { href: r.contact, label: t.nav.contact, hash: "#contact" },
  ];

  const user = await currentUserSummary();
  const accountHref = user ? r.account : r.signIn;
  const accountLabel = user ? t.header.account : t.header.signIn;

  return (
    <ScrollAwareHeader>
      <div className="site-wrap-wide flex h-16 items-center justify-between">
        <Link
          href={r.home}
          className="font-display text-lg tracking-[0.18em] uppercase"
          aria-label="Doctor Cuts"
        >
          Doctor Cuts
        </Link>

        <HomeAwareNav locale={locale} items={items} menuLabel={t.nav.menu} />

        <div className="hidden items-center gap-4 md:flex">
          <LanguageToggle locale={locale} label={t.nav.language} labels={t.lang} />
          <Link
            href={accountHref}
            className="text-nav inline-flex min-h-11 items-center gap-2 text-[11px] tracking-[0.22em] uppercase transition hover:text-foreground"
          >
            <User className="h-3.5 w-3.5" aria-hidden />
            {accountLabel}
          </Link>
          <ButtonLink href={r.book} variant="book" size="sm" className="min-h-11">
            {t.nav.book}
          </ButtonLink>
        </div>

        <div className="md:hidden">
          <MobileNav
            locale={locale}
            t={t}
            items={items}
            bookHref={r.book}
            accountHref={accountHref}
            accountLabel={accountLabel}
          />
        </div>
      </div>
    </ScrollAwareHeader>
  );
}
