import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import type { ServiceRow } from "@/lib/supabase/types";

export type ServiceDTO = Pick<
  ServiceRow,
  "id" | "slug" | "name" | "description" | "price" | "duration_minutes" | "image_url" | "is_active"
>;

/**
 * Fetches active services from Supabase, ordered by `sort_order`. Returns an
 * empty array when Supabase isn't configured yet — the UI shows a helpful
 * empty state and links to the README.
 */
export async function getActiveServices(): Promise<ServiceDTO[]> {
  if (!supabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, slug, name, description, price, duration_minutes, image_url, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("[services] fetch failed:", error.message);
    return [];
  }
  return (data ?? []) as ServiceDTO[];
}

export async function getServiceById(id: string): Promise<ServiceDTO | null> {
  if (!supabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("services")
    .select("id, slug, name, description, price, duration_minutes, image_url, is_active")
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as ServiceDTO | null;
}

export async function getServiceBySlug(slug: string): Promise<ServiceDTO | null> {
  if (!supabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("services")
    .select("id, slug, name, description, price, duration_minutes, image_url, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return (data ?? null) as ServiceDTO | null;
}

export async function getActiveServiceSlugs(): Promise<string[]> {
  const rows = await getActiveServices();
  return rows.map((r) => r.slug);
}
