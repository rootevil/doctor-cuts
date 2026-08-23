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
    <section id="gallery" className="section-shell bg-background">
      <div className="site-wrap-wide section-pad-y">
        <div className="section-head flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Kicker>{t.gallery.kicker}</Kicker>
          <div
            role="radiogroup"
            aria-label={t.gallery.kicker}
            className="flex flex-wrap gap-2"
          >
            {filters.map((key) => {
              const pressed = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={pressed}
                  onClick={() => setFilter(key)}
                  className={`inline-flex min-h-11 items-center px-3 text-[11px] tracking-[0.22em] uppercase transition ${
                    pressed
                      ? "border border-brass/50 text-brass"
                      : "border border-transparent text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {t.gallery.filters[key as GalleryFilter] ?? key}
                </button>
              );
            })}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {filtered.length}
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-2 sm:gap-2.5 md:mt-10 md:grid-cols-4 md:gap-3">
          {filtered.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group relative block aspect-[4/5] w-full overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                aria-label={
                  item.title
                    ? `${t.gallery.open}: ${item.title}`
                    : t.gallery.open
                }
              >
                <Image
                  src={item.src}
                  alt={item.title || t.gallery.kicker}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  unoptimized={item.src.startsWith("http")}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-80 transition group-hover:from-background/80"
                />
                {item.title ? (
                  <span className="absolute bottom-2.5 left-2.5 text-[10px] tracking-[0.2em] text-foreground uppercase md:bottom-3 md:left-3 md:text-[11px] md:tracking-[0.22em]">
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
