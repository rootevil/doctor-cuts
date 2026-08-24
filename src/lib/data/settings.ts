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
  email: "info@dr-cuts.com",
  instagram: "https://www.instagram.com/dr_barbiere/",
  facebook: "https://www.facebook.com/206368819943168",
  whatsapp: "https://wa.me/393481748052",
  booking_notice_hours: 2,
  max_booking_days: 30,
  cancellation_hours: 12,
  require_confirmation: false,
  bookings_enabled: true,
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
  const row = data as SettingsRow;
  return {
    ...DEFAULT_SETTINGS,
    ...row,
    // Graceful if migration not applied yet
    bookings_enabled: row.bookings_enabled ?? true,
    require_confirmation: row.require_confirmation ?? false,
  };
}
