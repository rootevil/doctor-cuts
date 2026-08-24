import { site } from "@/lib/site";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseServiceRoleKey } from "@/lib/supabase/env";

/**
 * Single mailbox allowed to hold the admin role and open `/admin`.
 * Kept in code (not only env) so a mis-set SEED_ADMIN_EMAIL cannot
 * accidentally grant the panel to another signup.
 */
export function getAdminEmail(): string {
  return site.emails.admin.trim().toLowerCase();
}

export function isAllowedAdminEmail(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === getAdminEmail();
}

/**
 * Align `profiles.role` with the allowlisted admin email.
 * Call after sign-up / sign-in so demotions stick even if the row
 * was previously marked admin by mistake.
 */
export async function syncAdminRole(userId: string, email: string) {
  if (!supabaseServiceRoleKey) return;
  const shouldBeAdmin = isAllowedAdminEmail(email);
  try {
    const admin = createSupabaseAdminClient();
    await admin
      .from("profiles")
      .update({ role: shouldBeAdmin ? "admin" : "customer" })
      .eq("id", userId);
  } catch (err) {
    console.warn("[auth] admin role sync skipped:", err);
  }
}

/** Demote every profile whose email is not the allowlisted admin. */
export async function demoteNonAdminProfiles() {
  if (!supabaseServiceRoleKey) return { updated: 0 };
  const admin = createSupabaseAdminClient();
  const allow = getAdminEmail();
  const { data: admins, error: listError } = await admin
    .from("profiles")
    .select("id, email")
    .eq("role", "admin");
  if (listError) throw listError;

  const toDemote = (admins ?? []).filter(
    (row) => (row.email ?? "").trim().toLowerCase() !== allow,
  );
  if (toDemote.length === 0) return { updated: 0 };

  const { error } = await admin
    .from("profiles")
    .update({ role: "customer" })
    .in(
      "id",
      toDemote.map((row) => row.id),
    );
  if (error) throw error;
  return { updated: toDemote.length };
}
