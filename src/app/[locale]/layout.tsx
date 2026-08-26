import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HtmlLang } from "@/components/layout/html-lang";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale, isLocale, urlLocaleParams } from "@/i18n/config";
import { italianAlternates } from "@/i18n/public-url";
import { requestLocale } from "@/i18n/request-locale";

export function generateStaticParams() {
  return urlLocaleParams;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw) || raw !== defaultLocale) return {};
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const url = `/${defaultLocale}`;
  return {
    title: {
      default: "Doctor Cuts",
      template: "Doctor Cuts",
    },
    description: t.meta.description,
    alternates: italianAlternates(url),
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      url,
      locale: locale === "it" ? "it_IT" : "en_GB",
      alternateLocale: locale === "it" ? ["en_GB"] : ["it_IT"],
      type: "website",
      siteName: "Doctor Cuts",
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw) || raw !== defaultLocale) notFound();
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);

  return (
    <>
      <HtmlLang locale={locale} />
      <LocalBusinessJsonLd locale={locale} t={t} />
      {/* Skip-to-content link. Invisible until focused by keyboard users. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:z-[100] focus:bg-foreground focus:px-4 focus:py-2 focus:text-[11px] focus:tracking-[0.28em] focus:text-background focus:uppercase focus:top-[calc(0.75rem+var(--safe-top))]"
      >
        {locale === "it" ? "Vai al contenuto" : "Skip to content"}
      </a>
      {/* SiteHeader is async — resolves the current session for the header link. */}
      <SiteHeader locale={locale} t={t} />
      <main id="main" className="flex min-w-0 flex-1 flex-col overflow-x-clip">
        {children}
      </main>
      <SiteFooter locale={locale} t={t} />
    </>
  );
}
