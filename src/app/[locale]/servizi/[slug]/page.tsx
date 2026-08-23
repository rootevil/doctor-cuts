import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailView } from "@/components/services/service-detail-view";
import { BreadcrumbsJsonLd, ServiceJsonLd } from "@/components/seo/json-ld";
import { formatPrice, services as staticServices, type ServiceSlug } from "@/lib/site";
import {
  getActiveServices,
  getServiceBySlug,
} from "@/lib/data/services";
import { routes } from "@/lib/routes";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

export function generateStaticParams() {
  // Build-time only — cannot call Supabase/cookies here. Runtime page still
  // loads live service data; unknown slugs are handled via dynamicParams.
  return locales.flatMap((locale) =>
    staticServices.map((s) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const db = await getServiceBySlug(slug);
  const staticSvc = staticServices.find((s) => s.slug === slug);
  const dict = t.services.items[slug as ServiceSlug];
  const name = dict?.name ?? db?.name ?? staticSvc?.slug;
  if (!name) return {};
  const description = dict?.detail ?? db?.description ?? "";
  const image = db?.image_url || staticSvc?.heroImage || "/images/cut-detail.jpg";
  return {
    title: name,
    description,
    alternates: {
      canonical: routes(locale).service(slug),
      languages: {
        it: `/it/servizi/${slug}`,
        en: `/en/servizi/${slug}`,
        "x-default": `/it/servizi/${slug}`,
      },
    },
    openGraph: {
      title: name,
      description,
      url: routes(locale).service(slug),
      images: [{ url: image, width: 1200, height: 1500, alt: name }],
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const r = routes(locale);

  const [db, allActive] = await Promise.all([
    getServiceBySlug(slug),
    getActiveServices(),
  ]);
  const staticSvc = staticServices.find((s) => s.slug === slug);
  const dict = t.services.items[slug as ServiceSlug];

  if (!db && !staticSvc) notFound();

  const name = dict?.name ?? db?.name ?? slug;
  const detail = dict?.detail ?? db?.description ?? "";
  const price = Number(db?.price ?? staticSvc?.price ?? 0);
  const duration = db?.duration_minutes ?? staticSvc?.duration ?? 0;
  const image = db?.image_url || staticSvc?.heroImage || "/images/cut-detail.jpg";
  const includes = dict?.includes ?? [];
  const ideal = dict?.ideal ?? "";

  const others =
    allActive.length > 0
      ? allActive
          .filter((s) => s.slug !== slug)
          .map((s) => ({
            slug: s.slug,
            name: t.services.items[s.slug as ServiceSlug]?.name ?? s.name,
            price: Number(s.price),
            blurb: t.services.items[s.slug as ServiceSlug]?.blurb ?? s.description ?? "",
          }))
      : staticServices
          .filter((s) => s.slug !== slug)
          .map((s) => ({
            slug: s.slug,
            name: t.services.items[s.slug].name,
            price: s.price,
            blurb: t.services.items[s.slug].blurb,
          }));

  return (
    <>
      <ServiceJsonLd
        name={name}
        description={detail}
        price={price}
        duration={duration}
        locale={locale}
      />
      <BreadcrumbsJsonLd
        items={[
          { name: "Doctor Cuts", url: r.home },
          { name: t.nav.services, url: r.services },
          { name, url: r.service(slug) },
        ]}
      />
      <ServiceDetailView
        locale={locale}
        t={t}
        slug={slug}
        name={name}
        detail={detail}
        price={price}
        image={image}
        includes={includes}
        ideal={ideal}
        others={others}
      />
    </>
  );
}
