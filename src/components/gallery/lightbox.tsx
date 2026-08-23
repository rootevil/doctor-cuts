"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  items: { src: string; alt: string }[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
  labels: { close: string; prev: string; next: string };
};

export function GalleryLightbox({ items, index, onClose, onIndexChange, labels }: Props) {
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndexChange((index + 1) % items.length);
      if (event.key === "ArrowLeft")
        onIndexChange((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, items.length, onClose, onIndexChange]);

  const current = items[index];
  const goPrev = () => onIndexChange((index - 1 + items.length) % items.length);
  const goNext = () => onIndexChange((index + 1) % items.length);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label={labels.close}
        onClick={onClose}
        className="absolute top-4 right-4 z-10 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border border-border bg-surface/80 px-3 text-[11px] tracking-[0.28em] uppercase backdrop-blur transition hover:border-brass hover:text-brass md:top-6 md:right-6"
      >
        <X className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">{labels.close}</span>
      </button>

      <button
        type="button"
        aria-label={labels.prev}
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center border border-border bg-surface/80 backdrop-blur transition hover:border-brass hover:text-brass md:left-4"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      <div
        className="relative h-[75dvh] w-full max-w-5xl touch-pan-y md:h-[80dvh]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          const end = e.changedTouches[0]?.clientX;
          touchX.current = null;
          if (start == null || end == null) return;
          const delta = end - start;
          if (Math.abs(delta) < 48) return;
          if (delta > 0) goPrev();
          else goNext();
        }}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="100vw"
          className="object-contain"
          priority
          unoptimized={current.src.startsWith("http")}
        />
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.22em] text-foreground-muted uppercase">
          {index + 1} / {items.length}
        </p>
      </div>

      <button
        type="button"
        aria-label={labels.next}
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center border border-border bg-surface/80 backdrop-blur transition hover:border-brass hover:text-brass md:right-4"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
