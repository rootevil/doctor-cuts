"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cancelGuestBooking } from "@/lib/booking/actions";
import type { Locale } from "@/i18n/config";

export function GuestCancelButton({
  locale,
  referenceCode,
  token,
  label,
  confirmLabel,
  tooLate,
}: {
  locale: Locale;
  referenceCode: string;
  token: string;
  label: string;
  confirmLabel: string;
  tooLate: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onCancel = () => {
    if (!window.confirm(confirmLabel)) return;
    setError(null);
    start(async () => {
      const form = new FormData();
      form.set("locale", locale);
      form.set("reference_code", referenceCode);
      form.set("token", token);
      const res = await cancelGuestBooking(form);
      if (res.ok) {
        router.refresh();
        return;
      }
      setError(res.reason === "too_late" ? tooLate : label);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="inline-flex min-h-11 w-fit items-center gap-2 border border-border px-6 py-3 text-[11px] tracking-[0.28em] uppercase transition hover:border-foreground disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
        {label}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-[#f4b0b0]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
