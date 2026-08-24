import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
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
    <AuthShell
      kicker={copy.kicker}
      title={copy.title}
      lead={copy.lead}
      switchPrompt={copy.haveAccountPrompt}
      switchHref={r.signIn}
      switchLabel={copy.haveAccountLink}
    >
      <SignUpForm
        locale={locale}
        t={t}
        showPasswordLabel={copy.showPassword}
        hidePasswordLabel={copy.hidePassword}
      />
    </AuthShell>
  );
}
