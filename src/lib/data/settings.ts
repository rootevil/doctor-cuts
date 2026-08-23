import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import type { SettingsRow } from "@/lib/supabase/types";

/** Baked-in defaults — used as a fallback when Supabase isn't configured. */
export const DEFAULT_SETTINGS: SettingsRow = {
  id: "default",
  singleton: true,
  business_name: "Doctor Cuts",
  address: "Via Antelmo Severini, 4/c, 62100 Macerata MC",
  phone: "+393481748052",
  email: null,
  instagram: "https://www.instagram.com/dr_barbiere/",
  facebook: null,
  whatsapp: "https://wa.me/393481748052",
  booking_notice_hours: 2,
  max_booking_days: 30,
  cancellation_hours: 12,
  require_confirmation: false,
  slot_interval_minutes: 15,
  updated_at: new Date().toISOString(),
};

export async function getSettings(): Promise<SettingsRow> {
  if (!supabaseConfigured) return DEFAULT_SETTINGS;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("settings").select("*").maybeSingle();
  if (error || !data) {
    if (error) console.warn("[settings] fetch failed:", error.message);
    return DEFAULT_SETTINGS;
  }
  return data as SettingsRow;
}
