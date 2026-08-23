import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type PublicReview = {
  id: string;
  quote: string;
  name: string;
  rating: number;
};

/** Featured approved reviews for the homepage. Empty if none — UI falls back. */
export async function getFeaturedReviews(limit = 3): Promise<PublicReview[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `id, rating, comment, is_featured, status,
       customer:profiles ( full_name, email )`,
    )
    .eq("status", "approved")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    if (error) console.warn("[reviews] featured fetch failed:", error.message);
    return [];
  }

  return data
    .filter((row) => Boolean(row.comment?.trim()))
    .map((row) => {
      const customer = Array.isArray(row.customer) ? row.customer[0] : row.customer;
      const name =
        (customer as { full_name?: string | null; email?: string } | null)?.full_name?.trim() ||
        (customer as { email?: string } | null)?.email?.split("@")[0] ||
        "Cliente";
      return {
        id: row.id as string,
        quote: (row.comment as string).trim(),
        name,
        rating: row.rating as number,
      };
    });
}
