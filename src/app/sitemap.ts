import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site-url";
import { locales } from "@/i18n/config";
import { services as staticServices } from "@/lib/site";
import { getActiveServices } from "@/lib/data/services";
import { supabaseConfigured } from "@/lib/supabase/env";

// Public, indexable pages only. Auth + admin are blocked in robots.ts.
const publicPaths = ["", "/servizi", "/galleria", "/storia", "/contatti", "/prenota"] as const;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Prefer live services from Supabase (an admin might have added new ones).
  // Fall back to the static list when Supabase isn't wired up yet so build
  // still produces a valid sitemap.
  const services: { slug: string }[] = supabaseConfigured
    ? (await getActiveServices()).map((s) => ({ slug: s.slug }))
    : staticServices.map((s) => ({ slug: s.slug }));

  const entries: MetadataRoute.Sitemap = [];

  for (const path of publicPaths) {
    entries.push({
      url: `${siteUrl}/it${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path === "/prenota" ? 0.9 : 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])),
      },
    });
  }

  for (const s of services) {
    entries.push({
      url: `${siteUrl}/it/servizi/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}/${l}/servizi/${s.slug}`]),
        ),
      },
    });
  }

  return entries;
}
