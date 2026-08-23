import type { GalleryFilter } from "@/lib/site";
import { galleryFilters } from "@/lib/site";
import type { PublicGalleryItem } from "@/lib/data/gallery-types";

export type { PublicGalleryItem } from "@/lib/data/gallery-types";

const KNOWN = new Set<string>(galleryFilters);

export function galleryFilterKeys(items: PublicGalleryItem[]): GalleryFilter[] {
  const present = new Set(
    items.map((i) => String(i.category).toLowerCase()).filter((c) => KNOWN.has(c)),
  );
  return galleryFilters.filter((f) => f === "all" || present.has(f));
}

export function normalizeGalleryCategory(category: string | null | undefined): string {
  const cat = (category ?? "studio").toLowerCase();
  return KNOWN.has(cat) ? cat : cat;
}
