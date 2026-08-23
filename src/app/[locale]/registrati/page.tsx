import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { SignUpForm } from "@/components/auth/sign-up-form";
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
    title: t.pages.auth.signUp.metaTitle,
    description: t.pages.auth.signUp.metaDescription,
    alternates: {
      canonical: routes(locale).signUp,
      languages: { it: "/it/registrati", en: "/en/registrati" },
    },
  };
}

export default async function RegistratiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.auth.signUp;

  return (
    <>
      <PageHero kicker={copy.kicker} title={copy.title} lead={copy.lead} />
      <section className="bg-background">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[minmax(0,36rem)_1fr] md:gap-24 md:px-10 md:py-24">
          <SignUpForm locale={locale} t={t} />
          <aside className="flex flex-col justify-end gap-4 border-t border-border pt-8 md:border-l md:border-t-0 md:pl-16 md:pt-0">
            <p className="text-[11px] tracking-[0.28em] text-muted uppercase">
              {copy.haveAccountPrompt}
            </p>
            <ButtonLink href={r.signIn} variant="secondary" arrow>
              {copy.haveAccountLink}
            </ButtonLink>
          </aside>
        </div>
      </section>
    </>
  );
}
