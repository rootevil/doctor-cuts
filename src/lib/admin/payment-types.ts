export type PaymentLedgerRow = {
  id: string;
  starts_at: string;
  reference_code: string;
  payment_status: string;
  deposit_cents: number;
  status: string;
  guest_name: string | null;
  guest_email: string | null;
  customer_name: string | null;
  customer_email: string | null;
  service_name: string | null;
  stripe_session: string | null;
  created_at: string;
};

export type PaymentRange = "today" | "week" | "month" | "all";

export type PaymentTotals = {
  collectedCents: number;
  refundedCents: number;
  awaitingCents: number;
  collectedCount: number;
  refundedCount: number;
  awaitingCount: number;
};
