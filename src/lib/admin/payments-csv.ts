import type { PaymentLedgerRow } from "@/lib/admin/payment-types";

function displayName(row: PaymentLedgerRow) {
  return (
    row.customer_name?.trim() ||
    row.guest_name?.trim() ||
    row.customer_email ||
    row.guest_email ||
    "—"
  );
}

export function paymentLedgerToCsv(rows: PaymentLedgerRow[]) {
  const header = [
    "reference",
    "created_at",
    "starts_at",
    "customer",
    "email",
    "service",
    "status",
    "payment_status",
    "deposit_eur",
    "stripe_session",
  ];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.reference_code,
        row.created_at,
        row.starts_at,
        displayName(row),
        row.customer_email || row.guest_email || "",
        row.service_name || "",
        row.status,
        row.payment_status,
        (row.deposit_cents / 100).toFixed(2),
        row.stripe_session || "",
      ]
        .map((v) => escape(String(v)))
        .join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}
