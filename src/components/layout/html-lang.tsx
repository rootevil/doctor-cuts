"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/config";

/**
 * Update <html lang> on locale change without another full navigation.
 * The root layout is neutral (lang="it") because it renders before the
 * locale segment resolves — this keeps assistive tech in sync.
 */
export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
