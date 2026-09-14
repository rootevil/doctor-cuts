"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type {
  PaymentLedgerRow,
  PaymentRange,
  PaymentTotals,
} from "@/lib/admin/payment-types";
import { paymentLedgerToCsv } from "@/lib/admin/payments-csv";
import { formatEurFromCents } from "@/lib/payments/deposit";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { dateFnsLocale } from "@/lib/booking/date-locale";
import { syncAdminPayments } from "@/lib/admin/actions";
import { StatCard } from "@/components/admin/section";

type Props = {
  locale: Locale;
  t: Dictionary;
  range: PaymentRange;
  rows: PaymentLedgerRow[];
  totals: PaymentTotals;
  rangeHref: (range: PaymentRange) => string;
};

export function AdminPaymentsView({
  locale,
  t,
  range,
  rows,
  totals,
  rangeHref,
}: Props) {
  const copy = t.pages.admin.payments;
  const router = useRouter();
  const [pending, start] = useTransition();

  const ranges: PaymentRange[] = ["today", "week", "month", "all"];

  const downloadCsv = () => {
    const csv = paymentLedgerToCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doctor-cuts-payments-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sync = () => {
    start(async () => {
      await syncAdminPayments();
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="admin-filters">
        <div className="admin-filter-group">
          <span className="admin-filter-label">{copy.rangeLabel}</span>
          {ranges.map((rng) => (
            <a
              key={rng}
              href={rangeHref(rng)}
              aria-current={range === rng ? "page" : undefined}
              className="admin-chip"
            >
              {copy.ranges[rng]}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 md:ml-auto">
          <button
            type="button"
            onClick={sync}
            disabled={pending}
            className="admin-btn admin-btn-ghost"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {copy.syncStripe}
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            className="admin-btn admin-btn-primary"
            disabled={rows.length === 0}
          >
            {copy.exportCsv}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <StatCard
          label={copy.collected}
          value={formatEurFromCents(totals.collectedCents, locale)}
          hint={`${totals.collectedCount} ${copy.payments}`}
          emphasize
        />
        <StatCard
          label={copy.refunded}
          value={formatEurFromCents(totals.refundedCents, locale)}
          hint={`${totals.refundedCount} ${copy.payments}`}
        />
        <StatCard
          label={copy.awaiting}
          value={formatEurFromCents(totals.awaitingCents, locale)}
          hint={`${totals.awaitingCount} ${copy.payments}`}
        />
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted">{copy.empty}</p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{copy.colRef}</th>
                <th>{copy.colWhen}</th>
                <th>{copy.colCustomer}</th>
                <th>{copy.colService}</th>
                <th>{copy.colPayment}</th>
                <th>{copy.colAmount}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="font-mono text-xs tracking-wider">
                    {row.reference_code}
                  </td>
                  <td>
                    {formatInTimeZone(
                      new Date(row.created_at),
                      SHOP_TZ,
                      "d MMM · HH:mm",
                      { locale: dateFnsLocale(locale) },
                    )}
                  </td>
                  <td>
                    {row.customer_name?.trim() ||
                      row.guest_name?.trim() ||
                      row.customer_email ||
                      row.guest_email ||
                      "—"}
                  </td>
                  <td>{row.service_name || "—"}</td>
                  <td>
                    <span className="text-[10px] tracking-[0.18em] uppercase">
                      {row.payment_status === "paid"
                        ? copy.statusPaid
                        : row.payment_status === "refunded"
                          ? copy.statusRefunded
                          : copy.statusAwaiting}
                    </span>
                  </td>
                  <td>{formatEurFromCents(row.deposit_cents, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
