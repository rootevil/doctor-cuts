"use client";

import { useLayoutEffect } from "react";
import type { Locale } from "@/i18n/config";

/**
 * Sync <html lang> with the content language (cookie), not the URL.
 * The root layout is always lang="it" because it renders before the
 * locale layout — this keeps assistive tech in sync after paint.
 */
export function HtmlLang({ locale }: { locale: Locale }) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
