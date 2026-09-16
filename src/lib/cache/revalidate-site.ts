import { revalidatePath } from "next/cache";
import { defaultLocale } from "@/i18n/config";

/**
 * Invalidate the entire public + admin locale tree (layout and pages).
 * Page-only revalidates miss the locale layout (footer contact from settings)
 * and nested routes like `/servizi/[slug]`.
 *
 * English is a content language (cookie) on the same `/it/...` tree — one
 * layout revalidate covers both IT and EN Prenota.
 */
export function revalidateSite() {
  const root = `/${defaultLocale}`;
  revalidatePath(root, "layout");
  // Explicit booking + contact surfaces that mirror Orari.
  revalidatePath(`${root}/prenota`);
  revalidatePath(`${root}/contatti`);
  revalidatePath(`${root}/admin/orari`);
}
