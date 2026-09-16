import { revalidatePath } from "next/cache";
import { defaultLocale } from "@/i18n/config";

/**
 * Invalidate the entire public + admin locale tree (layout and pages).
 * Page-only revalidates miss the locale layout (footer contact from settings)
 * and nested routes like `/servizi/[slug]`.
 */
export function revalidateSite() {
  revalidatePath(`/${defaultLocale}`, "layout");
}
