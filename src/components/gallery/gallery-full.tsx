"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { GalleryFilter } from "@/lib/site";
import type { PublicGalleryItem } from "@/lib/data/gallery-types";
import { galleryFilterKeys } from "@/lib/data/gallery-shared";
import { routes } from "@/lib/routes";
import { GalleryLightbox } from "@/components/gallery/lightbox";
import { PageBookCta } from "@/components/layout/page-book-cta";
import { Kicker } from "@/components/ui/kicker";

/**
 * Full gallery page: studio hero + filters + clear uniform grid + book CTA.
 */
export function GalleryFull({
  t,
  locale,
  items,
}: {
  t: Dictionary;
  locale: Locale;
  items: PublicGalleryItem[];
}) {
  const page = t.pages.galleria;
  const r = routes(locale);
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
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[70dvh] w-full flex-col justify-end overflow-hidden md:min-h-[75dvh]">
        <Image
          src="/images/gallery-hero.jpg"
          alt={page.heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent"
        />

        <div className="site-wrap-wide relative z-10 pb-14 page-top-spacious md:pb-20">
          <Kicker accent>{page.kicker}</Kicker>
          <h1 className="type-display-section mt-5 max-w-[14ch] text-foreground">
            {page.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-md text-base text-foreground-soft md:text-lg">
            {page.intro}
          </p>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="bg-background" aria-labelledby="gallery-grid-heading">
        <div className="sticky-below-header border-b border-border/80 bg-background/90 backdrop-blur-md">
          <div className="site-wrap-wide flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-baseline gap-3">
              <h2
                id="gallery-grid-heading"
                className="text-[11px] tracking-[0.28em] text-muted uppercase"
              >
                {page.filterLabel}
              </h2>
              <p className="text-[11px] tabular-nums tracking-[0.16em] text-brass-muted" aria-live="polite">
                {filtered.length}
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label={page.filterLabel}
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
                    className={`inline-flex min-h-10 items-center px-3.5 text-[11px] tracking-[0.2em] uppercase transition ${
                      pressed
                        ? "border border-brass/55 bg-brass-subtle text-brass"
                        : "border border-border/70 text-foreground-muted hover:border-border-strong hover:text-foreground"
                    }`}
                  >
                    {t.gallery.filters[key as GalleryFilter] ?? key}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="site-wrap-wide py-10 md:py-14">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-base text-muted">{page.empty}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
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
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      unoptimized={item.src.startsWith("http")}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-transparent opacity-90"
                    />
                    {item.title ? (
                      <span className="absolute bottom-3 left-3 right-3 text-left text-[10px] tracking-[0.2em] text-foreground uppercase md:text-[11px] md:tracking-[0.22em]">
                        {item.title}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <PageBookCta
        headline={t.cta.lines.join(" ")}
        buttonLabel={page.bookCta}
        href={r.book}
      />

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
    </>
  );
}
