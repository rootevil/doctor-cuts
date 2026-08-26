import { defaultLocale } from "@/i18n/config";
import { splitLocalePath } from "@/i18n/path-aliases";

/** Browser-facing URLs always use the Italian locale prefix. */
export const publicLocale = defaultLocale;

export function isHomePath(pathname: string) {
  const { rest } = splitLocalePath(pathname);
  return rest === "/";
}

/** Canonical + hreflang: Italian URLs only. English is cookie/content, not a second URL. */
export function italianAlternates(canonical: string) {
  return {
    canonical,
    languages: {
      it: canonical,
      "x-default": canonical,
    },
  };
}
