import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

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
    title: t.pages.account.metaTitle,
    description: t.pages.account.metaDescription,
    alternates: {
      canonical: routes(locale).account,
      languages: { it: "/it/account", en: "/en/account" },
    },
    robots: { index: false, follow: false },
  };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.account;

  if (!supabaseConfigured) {
    return (
      <>
        <PageHero kicker={copy.kicker} title={copy.title} lead={copy.lead} />
        <section className="bg-background">
          <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-10">
            <p className="max-w-md text-lg text-muted">
              {t.pages.auth.errors.notConfigured}
            </p>
          </div>
        </section>
      </>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`${r.signIn}?next=${encodeURIComponent(r.account)}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "";
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB")
    : "—";

  return (
    <>
      <PageHero
        kicker={copy.kicker}
        title={[`${copy.greeting},`, displayName ? `${displayName}.` : ""]}
        lead={copy.lead}
      />
      <section className="bg-background">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-16 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:px-10 md:py-24">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={r.accountAppointments}
                className="inline-flex items-center gap-3 bg-foreground px-5 py-3 text-[11px] tracking-[0.28em] text-background uppercase transition hover:opacity-90"
              >
                {copy.appointmentsCta}
                <span aria-hidden>→</span>
              </Link>
              {profile?.role === "admin" ? (
                <Link
                  href={r.admin}
                  className="inline-flex items-center gap-3 border border-brass px-5 py-3 text-[11px] tracking-[0.28em] text-brass uppercase transition hover:bg-brass hover:text-background"
                >
                  {copy.adminPanelCta}
                  <span aria-hidden>→</span>
                </Link>
              ) : null}
              <SignOutButton locale={locale} label={copy.signOut} />
            </div>
          </div>

          <dl className="flex flex-col divide-y divide-border border-y border-border">
            <div className="flex items-baseline justify-between py-4">
              <dt className="text-[11px] tracking-[0.28em] text-muted uppercase">
                {copy.emailLabel}
              </dt>
              <dd className="text-foreground">{user.email}</dd>
            </div>
            <div className="flex items-baseline justify-between py-4">
              <dt className="text-[11px] tracking-[0.28em] text-muted uppercase">
                {copy.roleLabel}
              </dt>
              <dd className="text-foreground uppercase tracking-[0.22em] text-sm">
                {profile?.role ?? "customer"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between py-4">
              <dt className="text-[11px] tracking-[0.28em] text-muted uppercase">
                {copy.joinedLabel}
              </dt>
              <dd className="text-foreground">{joined}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
