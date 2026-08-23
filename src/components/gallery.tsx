"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { GalleryLightbox } from "@/components/gallery/lightbox";
import { Kicker } from "@/components/ui/kicker";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { GalleryFilter } from "@/lib/site";
import type { PublicGalleryItem } from "@/lib/data/gallery-types";
import { galleryFilterKeys } from "@/lib/data/gallery-shared";

export function Gallery({
  t,
  items,
}: {
  t: Dictionary;
  locale: Locale;
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
    <section id="gallery" className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex flex-col gap-6 border-b border-border py-10 md:flex-row md:items-center md:justify-between">
          <Kicker>{t.gallery.kicker}</Kicker>
          <ul className="flex flex-wrap gap-4 text-[11px] tracking-[0.28em] uppercase">
            {filters.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  className={`relative pb-1 transition ${
                    filter === key
                      ? "text-brass after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-brass"
                      : "text-caption hover:text-foreground"
                  }`}
                >
                  {t.gallery.filters[key as GalleryFilter] ?? key}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <ul className="grid grid-cols-2 gap-2 py-10 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group relative block aspect-[3/4] w-full overflow-hidden focus:outline-none"
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
                  className="absolute inset-0 bg-brass/0 transition group-hover:bg-brass/10"
                />
                {item.title ? (
                  <span className="absolute bottom-3 left-3 text-[11px] tracking-[0.28em] text-foreground uppercase opacity-0 transition-opacity group-hover:opacity-100">
                    {item.title}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
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
