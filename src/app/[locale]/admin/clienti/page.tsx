import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import { listCustomers } from "@/lib/admin/data";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { requestLocale } from "@/i18n/request-locale";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return urlLocaleParams;
}

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
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
        <div className="overflow-x-auto border border-border">
          <table className="admin-table min-w-[720px]">
            <thead>
              <tr>
                <th>{copy.name}</th>
                <th>{copy.email}</th>
                <th>{copy.phone}</th>
                <th>{copy.role}</th>
                <th>{copy.bookings}</th>
                <th>{copy.last}</th>
                <th>{copy.joined}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name?.trim() || "—"}</td>
                  <td>
                    <a href={`mailto:${c.email}`} className="hover:text-foreground">
                      {c.email}
                    </a>
                  </td>
                  <td>
                    {c.phone ? (
                      <a href={`tel:${c.phone}`} className="hover:text-foreground">
                        {c.phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
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
                  <td>{c.appointment_count}</td>
                  <td>
                    {c.last_appointment_at ? dateFmt.format(new Date(c.last_appointment_at)) : "—"}
                  </td>
                  <td>{dateFmt.format(new Date(c.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSection>
  );
}
