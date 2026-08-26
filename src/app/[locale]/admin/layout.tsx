import { notFound, redirect } from "next/navigation";
import { AdminMobileNav, AdminNav } from "@/components/admin/nav";
import { AdminShell } from "@/components/admin/shell";
import { AdminTopbar } from "@/components/admin/topbar";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { requestLocale } from "@/i18n/request-locale";
import { isAllowedAdminEmail } from "@/lib/auth/admin-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { routes } from "@/lib/routes";

// Proxy already gates /admin, but we re-check here so a stale session or
// mis-marked profile cannot render the shell.
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const r = routes(locale);

  if (supabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAllowedAdminEmail(user.email)) {
      redirect(r.home);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") {
      redirect(r.home);
    }
  } else {
    redirect(r.home);
  }

  return (
    <AdminShell>
      <div className="admin-shell">
        <AdminTopbar locale={locale} t={t} />
        <div className="admin-layout">
          <div className="admin-sidebar">
            <AdminNav locale={locale} t={t} />
          </div>
          <div className="admin-content flex min-w-0 flex-1 flex-col">
            <AdminMobileNav locale={locale} t={t} />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
