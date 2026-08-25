import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type PublicReview = {
  id: string;
  quote: string;
  name: string;
  rating: number;
  source: "site" | "google";
};

const FEATURED_LIMIT = 5;

/**
 * Featured approved reviews for the homepage social-proof section.
 * Returns [] when none — UI hides the section (no invented quotes).
 */
export async function getFeaturedReviews(
  limit = FEATURED_LIMIT,
): Promise<PublicReview[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `id, rating, comment, is_featured, status, author_name, source,
       customer:profiles ( full_name, email )`,
    )
    .eq("status", "approved")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), FEATURED_LIMIT));

  if (error || !data?.length) {
    if (error) console.warn("[reviews] featured fetch failed:", error.message);
    return [];
  }

  return data
    .filter((row) => Boolean(row.comment?.trim()))
    .map((row) => {
      const customer = Array.isArray(row.customer) ? row.customer[0] : row.customer;
      const profileName =
        (customer as { full_name?: string | null; email?: string } | null)?.full_name?.trim() ||
        (customer as { email?: string } | null)?.email?.split("@")[0] ||
        null;
      const author = (row.author_name as string | null)?.trim() || null;
      const source = row.source === "google" ? "google" : "site";
      return {
        id: row.id as string,
        quote: (row.comment as string).trim(),
        name: author || profileName || "Cliente",
        rating: row.rating as number,
        source,
      };
    });
}
