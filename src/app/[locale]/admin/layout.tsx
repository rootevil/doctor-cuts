import { notFound } from "next/navigation";
import { AdminMobileNav, AdminNav } from "@/components/admin/nav";
import { AdminShell } from "@/components/admin/shell";
import { AdminTopbar } from "@/components/admin/topbar";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

// Middleware already guarantees the caller is authenticated + admin.
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);

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
