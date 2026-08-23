import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "./env";

/**
 * Refresh the Supabase auth session on every request and forward the
 * updated cookies onto the response. Returns both the response and the
 * resolved user so callers can gate protected routes without a second
 * round-trip.
 */
export async function refreshSupabaseSession(request: NextRequest) {
  if (!supabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    return {
      response: NextResponse.next({ request }),
      user: null as null | { id: string; email?: string | null },
      role: null as null | "customer" | "admin",
    };
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options as CookieOptions);
        }
      },
    },
  });

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let role: "customer" | "admin" | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile?.role as "customer" | "admin" | undefined) ?? "customer";
  }

  return { response, user, role };
}
