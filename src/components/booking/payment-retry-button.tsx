"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { retryDepositCheckout } from "@/lib/payments/actions";

export function PaymentRetryButton({
  locale,
  referenceCode,
  paymentToken,
  label,
}: {
  locale: Locale;
  referenceCode: string;
  paymentToken: string;
  label: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="book"
        arrow
        disabled={pending}
        onClick={() => {
          setError(false);
          start(async () => {
            const res = await retryDepositCheckout({
              locale,
              referenceCode,
              paymentToken,
            });
            if (res.ok) {
              window.location.assign(res.checkoutUrl);
              return;
            }
            setError(true);
          });
        }}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {label}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-body">
          {locale === "it"
            ? "Non è stato possibile riaprire Nexi. Riprova tra un momento."
            : "Couldn’t reopen Nexi. Try again in a moment."}
        </p>
      ) : null}
    </div>
  );
}
