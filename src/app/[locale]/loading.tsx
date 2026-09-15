"use client";

import { readPersistedLocale } from "@/i18n/cookie";

export default function LocaleLoading() {
  // Cookie is available on the client during render — no effect needed.
  const label = readPersistedLocale() === "en" ? "Loading" : "Caricamento";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="pointer-events-none fixed inset-x-0 top-16 z-40 h-px overflow-hidden bg-transparent"
    >
      <div className="h-full w-1/3 animate-pulse bg-brass/60" />
    </div>
  );
}
