"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { GalleryFilter } from "@/lib/site";
import type { PublicGalleryItem } from "@/lib/data/gallery-types";
import { galleryFilterKeys } from "@/lib/data/gallery-shared";
import { GalleryLightbox } from "@/components/gallery/lightbox";

/**
 * Same design language as the homepage gallery, but taller layout with
 * varied aspect ratios and no section chrome (used inside a full page).
 */
export function GalleryFull({
  t,
  items,
}: {
  t: Dictionary;
  items: PublicGalleryItem[];
}) {
  const filters = useMemo(() => galleryFilterKeys(items), [items]);
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? items
        : items.filter((item) => String(item.category).toLowerCase() === filter),
    [filter, items],
  );

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex flex-col gap-6 border-b border-border py-10 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] tracking-[0.32em] text-muted uppercase">
            {t.gallery.kicker}
          </p>
          <ul className="flex flex-wrap gap-4 text-[11px] tracking-[0.28em] uppercase">
            {filters.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  className="transition data-[active=true]:text-foreground text-caption hover:text-foreground"
                  data-active={filter === key}
                >
                  {t.gallery.filters[key as GalleryFilter] ?? key}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <ul className="grid grid-cols-2 gap-3 py-10 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {filtered.map((item, index) => {
            const tall = index % 5 === 0;
            const wide = index % 7 === 3;
            return (
              <li
                key={item.id}
                className={tall ? "row-span-2" : wide ? "md:col-span-2" : ""}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(index)}
                  className={`group relative block w-full overflow-hidden focus:outline-none ${
                    tall ? "aspect-[3/5]" : wide ? "aspect-[16/9]" : "aspect-[3/4]"
                  }`}
                  aria-label={t.gallery.open}
                >
                  <Image
                    src={item.src}
                    alt={item.title || t.gallery.kicker}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    unoptimized={item.src.startsWith("http")}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-background/0 transition group-hover:bg-background/20"
                  />
                  {item.title ? (
                    <span className="absolute bottom-3 left-3 text-[11px] tracking-[0.28em] text-foreground uppercase opacity-0 transition-opacity group-hover:opacity-100">
                      {item.title}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {openIndex !== null ? (
        <GalleryLightbox
          items={filtered.map((item) => ({
            src: item.src,
            alt: item.title || t.gallery.kicker,
          }))}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
          labels={{
            close: t.gallery.close,
            prev: t.gallery.prev,
            next: t.gallery.next,
          }}
        />
      ) : null}
    </section>
  );
}
