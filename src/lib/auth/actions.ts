"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { isLocale, type Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { getDictionary } from "@/i18n/dictionaries";
import {
  fdToObject,
  signInSchema,
  signUpSchema,
} from "@/lib/security/schemas";
import { limitByIp, limitByKey } from "@/lib/security/rate-limit";
import { syncAdminRole } from "@/lib/auth/admin-email";

export type AuthState = { error?: string; success?: string };

function coerceLocale(value: unknown): Locale {
  const raw = typeof value === "string" ? value : "";
  return isLocale(raw) ? raw : "it";
}

function safeNext(nextValue: unknown, locale: Locale) {
  const raw = typeof nextValue === "string" ? nextValue : "";
  // Only allow same-locale, relative paths — no absolute URLs or scheme
  // switches (which would enable an open redirect).
  if (raw.startsWith(`/${locale}/`) || raw === `/${locale}`) return raw;
  return routes(locale).account;
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const localeGuess = coerceLocale(formData.get("locale"));
  const t = getDictionary(localeGuess);

  if (!supabaseConfigured) {
    return { error: t.pages.auth.errors.notConfigured };
  }

  const parsed = signInSchema.safeParse(fdToObject(formData));
  if (!parsed.success) {
    return { error: t.pages.auth.errors.genericSignIn };
  }
  const { locale, email, password, next } = parsed.data;

  // Throttle: 5 attempts per IP per 5 minutes, and 5 per email per 15 min.
  const ipRl = await limitByIp("signIn", 5, 5 * 60_000);
  const emailRl = await limitByKey("signIn", email.toLowerCase(), 5, 15 * 60_000);
  if (!ipRl.ok || !emailRl.ok) {
    return { error: t.pages.auth.errors.tooMany };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { error: t.pages.auth.errors.genericSignIn };
  }

  // Re-assert role on every login so a stale `admin` row cannot linger
  // for a non-allowlisted mailbox.
  if (data.user) {
    await syncAdminRole(data.user.id, data.user.email ?? email);
  }

  revalidatePath(`/${locale}`, "layout");
  redirect(safeNext(next, locale));
}

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const localeGuess = coerceLocale(formData.get("locale"));
  const t = getDictionary(localeGuess);

  if (!supabaseConfigured) {
    return { error: t.pages.auth.errors.notConfigured };
  }

  const parsed = signUpSchema.safeParse(fdToObject(formData));
  if (!parsed.success) {
    return { error: t.pages.auth.errors.genericSignUp };
  }
  const { locale, email, password, full_name, phone } = parsed.data;

  // Sign-up is expensive (email dispatch, DB writes). 3 per IP per hour is
  // sufficient for legitimate customers and stops abuse.
  const ipRl = await limitByIp("signUp", 3, 60 * 60_000);
  if (!ipRl.ok) return { error: t.pages.auth.errors.tooMany };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name || null,
        phone: phone || null,
      },
    },
  });

  if (error) {
    return { error: t.pages.auth.errors.genericSignUp };
  }

  if (data.user) {
    await syncAdminRole(data.user.id, data.user.email ?? email);
  }

  if (data.session) {
    revalidatePath(`/${locale}`, "layout");
    redirect(routes(locale).account);
  }
  return { success: t.pages.auth.signUp.checkEmail };
}

export async function signOutAction(formData: FormData) {
  const locale = coerceLocale(formData.get("locale"));
  if (supabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  revalidatePath(`/${locale}`, "layout");
  redirect(routes(locale).home);
}
