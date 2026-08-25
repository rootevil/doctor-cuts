import { Lock, ShieldCheck } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  depositBreakdown,
  formatEurFromCents,
} from "@/lib/payments/deposit";

type Props = {
  locale: Locale;
  copy: Dictionary["pages"]["prenota"]["payment"];
  servicePriceEuro: number;
  depositCents: number;
};

export function PaymentReview({ locale, copy, servicePriceEuro, depositCents }: Props) {
  const breakdown = depositBreakdown(servicePriceEuro, depositCents);
  const payNow = formatEurFromCents(breakdown.payNowCents, locale);
  const service = formatEurFromCents(breakdown.serviceCents, locale);
  const rest = formatEurFromCents(breakdown.remainderCents, locale);

  return (
    <div className="payment-review">
      <p className="text-sm leading-snug text-body">{copy.banner}</p>

      <dl className="payment-review-rows">
        <div>
          <dt>{copy.servicePrice}</dt>
          <dd>{service}</dd>
        </div>
        <div className="is-now">
          <dt>{copy.payNow}</dt>
          <dd>{payNow}</dd>
        </div>
        <div>
          <dt>{copy.payInShop}</dt>
          <dd>
            {breakdown.remainderCents === 0 ? copy.payInShopZero : rest}
          </dd>
        </div>
      </dl>

      <ul className="payment-review-trust">
        <li>
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{copy.holdNote}</span>
        </li>
        <li>
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            {copy.trustProvider} · {copy.trustSecure}
          </span>
        </li>
      </ul>
    </div>
  );
}
