"use client";

import { useState } from "react";
import { Map as MapIcon } from "lucide-react";

type Props = {
  src: string;
  title: string;
  reveal: string;
  /** Tall panel for side-by-side Find us layouts. */
  tall?: boolean;
};

/**
 * Loads Google Maps only after explicit user intent — the iframe is not
 * injected on first paint, keeping the JS/network budget clean.
 */
export function LazyMap({ src, title, reveal, tall }: Props) {
  const [enabled, setEnabled] = useState(false);
  const frame = tall
    ? "relative h-full min-h-[28rem] w-full overflow-hidden border border-border md:min-h-[36rem]"
    : "relative aspect-[16/10] w-full overflow-hidden border border-border";

  if (enabled) {
    return (
      <div className={frame}>
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full grayscale-[30%] contrast-[1.05]"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEnabled(true)}
      className={`group ${frame} flex items-center justify-center bg-surface transition hover:border-brass-muted`}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,182,166,0.1),transparent_65%)]"
      />
      <span className="relative flex flex-col items-center gap-4 px-6 text-center">
        <MapIcon className="h-6 w-6 text-brass" aria-hidden />
        <span className="text-[11px] tracking-[0.28em] text-foreground uppercase">
          {reveal}
        </span>
        <span
          aria-hidden
          className="h-px w-10 bg-brass/50 transition group-hover:w-16"
        />
      </span>
    </button>
  );
}
