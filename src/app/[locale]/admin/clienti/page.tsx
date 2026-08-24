import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import { listCustomers } from "@/lib/admin/data";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const copy = t.pages.admin.customers;
  const customers = await listCustomers();
  const dateFmt = new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <AdminSection
      kicker={copy.kicker}
      title={copy.title}
      lead={copy.lead}
      right={
        <span className="text-[11px] tracking-[0.22em] text-muted uppercase">
          {customers.length} {copy.total}
        </span>
      }
    >
      {customers.length === 0 ? (
        <p className="text-sm text-muted">{copy.empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border border-border text-sm">
            <thead>
              <tr className="text-left text-[10px] tracking-[0.22em] text-muted uppercase">
                <th className="border-b border-border p-3">{copy.name}</th>
                <th className="border-b border-border p-3">{copy.email}</th>
                <th className="border-b border-border p-3">{copy.phone}</th>
                <th className="border-b border-border p-3">{copy.role}</th>
                <th className="border-b border-border p-3">{copy.bookings}</th>
                <th className="border-b border-border p-3">{copy.last}</th>
                <th className="border-b border-border p-3">{copy.joined}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="p-3">{c.full_name?.trim() || "—"}</td>
                  <td className="p-3 text-body">
                    <a href={`mailto:${c.email}`} className="hover:text-foreground">
                      {c.email}
                    </a>
                  </td>
                  <td className="p-3 text-body">
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="hover:text-foreground">
                        {c.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 border px-2 py-1 text-[10px] tracking-[0.22em] uppercase ${
                        c.role === "admin"
                          ? "border-brass text-brass"
                          : "border-border text-muted"
                      }`}
                    >
                      {c.role === "admin"
                        ? t.pages.admin.roles.admin
                        : t.pages.admin.roles.customer}
                    </span>
                  </td>
                  <td className="p-3">{c.appointment_count}</td>
                  <td className="p-3 text-body">
                    {c.last_appointment_at ? dateFmt.format(new Date(c.last_appointment_at)) : "—"}
                  </td>
                  <td className="p-3 text-body">
                    {dateFmt.format(new Date(c.created_at))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSection>
  );
}
