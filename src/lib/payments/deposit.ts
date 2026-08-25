export const DEFAULT_DEPOSIT_CENTS = 500;
export const PAYMENT_HOLD_MS = 15 * 60 * 1000;

export type DepositBreakdown = {
  serviceCents: number;
  payNowCents: number;
  remainderCents: number;
};

/** Pay-now is the configured deposit, never more than the service price. */
export function depositBreakdown(
  servicePriceEuro: number,
  depositCents: number,
): DepositBreakdown {
  const serviceCents = Math.max(0, Math.round(Number(servicePriceEuro) * 100));
  const configured = Math.max(0, Math.round(depositCents));
  const payNowCents = Math.min(configured, serviceCents);
  return {
    serviceCents,
    payNowCents,
    remainderCents: Math.max(0, serviceCents - payNowCents),
  };
}

export function formatEurFromCents(cents: number, locale: "it" | "en") {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
