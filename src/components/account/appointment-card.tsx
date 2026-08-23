"use client";

import { useState, useTransition } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Loader2 } from "lucide-react";
import type { AppointmentSummary } from "@/lib/data/appointments";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { cancelBooking } from "@/lib/booking/actions";

type Props = {
  appointment: AppointmentSummary;
  locale: Locale;
  t: Dictionary;
  canCancel: boolean;
};

function fmtCurrency(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AppointmentCard({ appointment, locale, t, canCancel }: Props) {
  const copy = t.pages.account.appointments;
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const dateLabel = formatInTimeZone(
    new Date(appointment.starts_at),
    SHOP_TZ,
    "EEE d MMM · HH:mm",
  );

  const onCancel = () => {
    if (!confirm(copy.confirmCancel)) return;
    setError(null);
    startTransition(async () => {
      const form = new FormData();
      form.set("appointment_id", appointment.id);
      form.set("locale", locale);
      const res = await cancelBooking(form);
      if (res.ok) {
        setDismissed(true);
      } else {
        setError(
          res.reason === "too_late"
            ? copy.errors.tooLate
            : res.reason === "not_found"
              ? copy.errors.notFound
              : copy.errors.generic,
        );
      }
    });
  };

  return (
    <article className="flex flex-col gap-4 border border-border p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] tracking-[0.28em] text-muted uppercase">
          {appointment.reference_code} · {statusLabel(appointment.status, copy.statuses)}
        </span>
        <h3 className="font-display text-2xl leading-none">
          {appointment.service?.name ?? "—"}
        </h3>
        <p className="text-sm text-muted">
          {dateLabel} · {appointment.service?.duration_minutes ?? 0} min ·{" "}
          {appointment.service ? fmtCurrency(Number(appointment.service.price), locale) : "—"}
        </p>
        {appointment.customer_notes ? (
          <p className="mt-2 max-w-lg text-sm text-muted">
            {appointment.customer_notes}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-2 text-sm text-[#f4b0b0]">
            {error}
          </p>
        ) : null}
      </div>

      {canCancel && appointment.status !== "cancelled" ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex w-fit items-center gap-2 border border-border px-4 py-2 text-[11px] tracking-[0.22em] uppercase transition hover:border-foreground disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          {copy.cancel}
        </button>
      ) : null}
    </article>
  );
}

function statusLabel(
  status: AppointmentSummary["status"],
  labels: Dictionary["pages"]["account"]["appointments"]["statuses"],
) {
  switch (status) {
    case "pending":
      return labels.pending;
    case "confirmed":
      return labels.confirmed;
    case "arrived":
      return labels.arrived;
    case "completed":
      return labels.completed;
    case "cancelled":
      return labels.cancelled;
    case "no_show":
      return labels.noShow;
  }
}
