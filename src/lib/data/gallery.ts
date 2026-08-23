import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { galleryItems } from "@/lib/site";
import type { PublicGalleryItem } from "@/lib/data/gallery-types";
import { normalizeGalleryCategory } from "@/lib/data/gallery-shared";

export type { PublicGalleryItem };

/** Public gallery for marketing pages. Falls back to static seed when DB empty. */
export async function getPublicGallery(): Promise<PublicGalleryItem[]> {
  if (!supabaseConfigured) {
    return galleryItems.map((item, i) => ({
      id: `static-${i}`,
      src: item.src,
      title: item.title.it,
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
      title: item.title.it,
      category: item.category,
    }));
  }

  return data.map((row) => ({
    id: row.id as string,
    src: row.image_url as string,
    title: (row.title as string | null) ?? "",
    category: normalizeGalleryCategory(row.category as string | null),
  }));
}
