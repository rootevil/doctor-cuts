import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site-url";
import { services as staticServices } from "@/lib/site";
import { getActiveServices } from "@/lib/data/services";
import { supabaseConfigured } from "@/lib/supabase/env";

// Public, indexable pages only. Auth + admin are blocked in robots.ts.
// English is a content language, not a second URL tree.
const publicPaths = ["", "/servizi", "/galleria", "/storia", "/contatti", "/prenota"] as const;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const services: { slug: string }[] = supabaseConfigured
    ? (await getActiveServices()).map((s) => ({ slug: s.slug }))
    : staticServices.map((s) => ({ slug: s.slug }));

  const entries: MetadataRoute.Sitemap = [];

  for (const path of publicPaths) {
    const url = `${siteUrl}/it${path}`;
    entries.push({
      url,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path === "/prenota" ? 0.9 : 0.7,
      alternates: {
        languages: { it: url, "x-default": url },
      },
    });
  }

  for (const s of services) {
    const url = `${siteUrl}/it/servizi/${s.slug}`;
    entries.push({
      url,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: { it: url, "x-default": url },
      },
    });
  }

  return entries;
}
