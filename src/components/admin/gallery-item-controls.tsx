"use client";

import { useRef, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  deleteGalleryItem,
  updateGalleryItem,
} from "@/lib/admin/actions";
import { galleryFilters, type GalleryFilter } from "@/lib/site";

export function GalleryItemControls({
  id,
  imageUrl,
  locale,
  defaultFeatured,
  defaultSortOrder,
  defaultTitle,
  defaultCategory,
  labels,
  categoryLabels,
}: {
  id: string;
  imageUrl: string;
  locale: string;
  defaultFeatured: boolean;
  defaultSortOrder: number;
  defaultTitle: string;
  defaultCategory: string;
  labels: {
    featured: string;
    remove: string;
    title: string;
    category: string;
    sortOrder: string;
    save: string;
  };
  categoryLabels: Record<Exclude<GalleryFilter, "all">, string>;
}) {
  const updateRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const submitUpdate = () => {
    const form = updateRef.current;
    if (!form) return;
    startTransition(async () => {
      const fd = new FormData(form);
      await updateGalleryItem(fd);
    });
  };

  const categories = galleryFilters.filter((f) => f !== "all");

  return (
    <div className="flex flex-col gap-2">
      <form ref={updateRef} action={updateGalleryItem} className="flex flex-col gap-2">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={id} />
        <label className="flex flex-col gap-1">
          <span className="text-caption">{labels.title}</span>
          <input
            type="text"
            name="title"
            defaultValue={defaultTitle}
            className="admin-field !py-1.5 text-xs"
            onBlur={submitUpdate}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-caption">{labels.category}</span>
          <select
            name="category"
            defaultValue={defaultCategory || "studio"}
            className="admin-field !py-1.5 text-xs"
            onChange={submitUpdate}
            disabled={pending}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[c]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-foreground uppercase">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={defaultFeatured}
              onChange={submitUpdate}
              disabled={pending}
              className="h-3.5 w-3.5 accent-brass"
            />
            {labels.featured}
          </label>
          <input
            type="number"
            name="sort_order"
            defaultValue={defaultSortOrder}
            step={10}
            aria-label={labels.sortOrder}
            onBlur={submitUpdate}
            disabled={pending}
            className="admin-field !w-16 !py-1 text-xs"
          />
        </div>
        {pending ? (
          <span className="inline-flex items-center gap-1 text-caption">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            …
          </span>
        ) : null}
      </form>
      <form action={deleteGalleryItem}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="image_url" value={imageUrl} />
        <button type="submit" className="admin-btn admin-btn-ghost w-full !min-h-9 text-[10px]">
          {labels.remove}
        </button>
      </form>
    </div>
  );
}
