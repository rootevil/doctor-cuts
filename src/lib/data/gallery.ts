import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { galleryItems } from "@/lib/site";
import type { Locale } from "@/i18n/config";
import type { PublicGalleryItem } from "@/lib/data/gallery-types";
import { normalizeGalleryCategory } from "@/lib/data/gallery-shared";

export type { PublicGalleryItem };

/** Public gallery for marketing pages. Falls back to static seed when DB empty. */
export async function getPublicGallery(locale: Locale = "it"): Promise<PublicGalleryItem[]> {
  const staticBySrc = new Map<string, string>(
    galleryItems.map((item) => [item.src, item.title[locale]]),
  );

  if (!supabaseConfigured) {
    return galleryItems.map((item, i) => ({
      id: `static-${i}`,
      src: item.src,
      title: item.title[locale],
      category: item.category,
    }));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gallery")
    .select("id, image_url, title, category, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    if (error) console.warn("[gallery] fetch failed:", error.message);
    return galleryItems.map((item, i) => ({
      id: `static-${i}`,
      src: item.src,
      title: item.title[locale],
      category: item.category,
    }));
  }

  return data.map((row) => {
    const src = row.image_url as string;
    return {
      id: row.id as string,
      src,
      title: staticBySrc.get(src) ?? ((row.title as string | null) ?? ""),
      category: normalizeGalleryCategory(row.category as string | null),
    };
  });
}
