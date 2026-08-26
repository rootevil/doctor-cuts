import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep authenticated + admin areas out of the index. Auth pages
      // themselves are OK because they're linked from the header.
      disallow: [
        "/it/account",
        "/it/admin",
        "/it/gestisci-prenotazione",
        "/en",
        "/api",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
