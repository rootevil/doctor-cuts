import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { SignInForm } from "@/components/auth/sign-in-form";
import { ButtonLink } from "@/components/ui/button";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";
import { routes } from "@/lib/routes";

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
    title: t.pages.auth.signIn.metaTitle,
    description: t.pages.auth.signIn.metaDescription,
    alternates: {
      canonical: routes(locale).signIn,
      languages: { it: "/it/accedi", en: "/en/accedi" },
    },
  };
}

export default async function AccediPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const { next } = await searchParams;
  const locale = raw;
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.auth.signIn;

  return (
    <>
      <PageHero kicker={copy.kicker} title={copy.title} lead={copy.lead} />
      <section className="bg-background">
        <div className="site-wrap-wide grid grid-cols-1 gap-10 py-16 md:grid-cols-[minmax(0,32rem)_1fr] md:gap-24 md:py-24">
          <SignInForm locale={locale} t={t} nextPath={next} />
          <aside className="flex flex-col justify-end gap-4 border-t border-border pt-8 md:border-l md:border-t-0 md:pl-16 md:pt-0">
            <p className="text-[11px] tracking-[0.28em] text-muted uppercase">
              {copy.noAccountPrompt}
            </p>
            <ButtonLink href={r.signUp} variant="secondary" arrow>
              {copy.noAccountLink}
            </ButtonLink>
          </aside>
        </div>
      </section>
    </>
  );
}
