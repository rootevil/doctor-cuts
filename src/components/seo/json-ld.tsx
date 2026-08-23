import { site } from "@/lib/site";
import { siteUrl } from "@/lib/seo/site-url";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

function stringify(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function JsonLd({ id, data }: { id: string; data: unknown }) {
  // Next.js's documented pattern. `dangerouslySetInnerHTML` (not children)
  // keeps the node in place when React 19 would otherwise hoist a child
  // text script into <head> and then fail `removeChild` on navigation.
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: stringify(data) }}
    />
  );
}

/**
 * Site-wide LocalBusiness schema. Emit once from the locale layout so every
 * page benefits without duplicating the object.
 */
export function LocalBusinessJsonLd({
  locale,
  t,
}: {
  locale: Locale;
  t: Dictionary;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${siteUrl}#business`,
    name: site.name,
    url: `${siteUrl}/${locale}`,
    telephone: site.phoneE164,
    image: `${siteUrl}/images/portrait.jpg`,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.addressLine,
      postalCode: site.postalCity.split(" ")[0],
      addressLocality: site.postalCity.split(" ").slice(1).join(" "),
      addressCountry: "IT",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.3006,
      longitude: 13.4534,
    },
    sameAs: [site.instagram, site.whatsapp].filter(Boolean),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "08:30",
        closes: "21:00",
      },
    ],
    description: t.meta.description,
    inLanguage: locale === "it" ? "it-IT" : "en-GB",
  };

  return <JsonLd id="ld-local-business" data={data} />;
}

export function BreadcrumbsJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };
  return <JsonLd id="ld-breadcrumbs" data={data} />;
}

export function ServiceJsonLd({
  name,
  description,
  price,
  duration,
  locale,
}: {
  name: string;
  description: string;
  price: number;
  duration: number;
  locale: Locale;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: name,
    name,
    description,
    provider: { "@id": `${siteUrl}#business` },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/${locale}/prenota`,
    },
    additionalProperty: {
      "@type": "PropertyValue",
      name: "duration",
      value: `PT${duration}M`,
    },
  };
  return <JsonLd id="ld-service" data={data} />;
}
