import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { italianAlternates } from "@/i18n/public-url";
import { requestLocale } from "@/i18n/request-locale";
import { routes } from "@/lib/routes";

export function generateStaticParams() {
  return urlLocaleParams;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  return {
    title: t.pages.auth.signIn.metaTitle,
    description: t.pages.auth.signIn.metaDescription,
    alternates: italianAlternates(routes(locale).signIn),
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
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.auth.signIn;

  return (
    <AuthShell
      kicker={copy.kicker}
      title={copy.title}
      lead={copy.lead}
      switchPrompt={copy.noAccountPrompt}
      switchHref={r.signUp}
      switchLabel={copy.noAccountLink}
    >
      <SignInForm
        locale={locale}
        t={t}
        nextPath={next}
        showPasswordLabel={copy.showPassword}
        hidePasswordLabel={copy.hidePassword}
      />
    </AuthShell>
  );
}
