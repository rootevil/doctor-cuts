"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  items: { src: string; alt: string }[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
  labels: { close: string; prev: string; next: string };
};

export function GalleryLightbox({ items, index, onClose, onIndexChange, labels }: Props) {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label={labels.close}
        onClick={onClose}
        className="absolute top-6 right-6 flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase"
      >
        <X className="h-4 w-4" />
        {labels.close}
      </button>

      <button
        type="button"
        aria-label={labels.prev}
        onClick={(e) => {
          e.stopPropagation();
          onIndexChange((index - 1 + items.length) % items.length);
        }}
        className="absolute left-4 hidden h-12 w-12 items-center justify-center border border-border md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        className="relative h-[80dvh] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      <button
        type="button"
        aria-label={labels.next}
        onClick={(e) => {
          e.stopPropagation();
          onIndexChange((index + 1) % items.length);
        }}
        className="absolute right-4 hidden h-12 w-12 items-center justify-center border border-border md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
