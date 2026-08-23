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
    locale === "it" ? "EEEE d MMMM" : "EEEE d MMMM",
  );
  const timeLabel = formatInTimeZone(new Date(appointment.starts_at), SHOP_TZ, "HH:mm");
  const status = statusLabel(appointment.status, copy.statuses);
  const statusTone = statusClass(appointment.status);
  const showCancel = canCancel && appointment.status !== "cancelled";

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
    <article className="border border-border bg-surface p-5 md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center px-2 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase ${statusTone}`}
            >
              {status}
            </span>
            <span className="text-[11px] tracking-[0.18em] text-muted uppercase">
              {copy.refLabel} {appointment.reference_code}
            </span>
          </div>

          <h3 className="mt-3 font-display text-2xl leading-tight tracking-tight text-foreground md:text-[1.75rem]">
            {appointment.service?.name ?? "—"}
          </h3>

          <p className="mt-2 text-base text-foreground-soft">
            <span className="capitalize">{dateLabel}</span>
            <span className="mx-2 text-muted">·</span>
            <span className="tabular-nums text-brass">{timeLabel}</span>
          </p>

          <p className="mt-1.5 text-sm text-muted">
            {appointment.service?.duration_minutes ?? 0} min
            <span className="mx-2 text-border-strong">·</span>
            {appointment.service
              ? fmtCurrency(Number(appointment.service.price), locale)
              : "—"}
          </p>

          {appointment.customer_notes ? (
            <p className="mt-3 max-w-xl text-sm text-foreground-muted">
              {appointment.customer_notes}
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="mt-3 text-sm text-[#f4b0b0]">
              {error}
            </p>
          ) : null}
        </div>

        {showCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 self-start border border-border px-4 text-[11px] tracking-[0.22em] text-foreground-muted uppercase transition hover:border-foreground hover:text-foreground disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
            {copy.cancel}
          </button>
        ) : null}
      </div>
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

function statusClass(status: AppointmentSummary["status"]) {
  switch (status) {
    case "confirmed":
    case "arrived":
      return "bg-brass-subtle text-brass";
    case "pending":
      return "border border-brass/40 text-brass";
    case "completed":
      return "bg-surface-raised text-foreground-muted";
    case "cancelled":
    case "no_show":
      return "bg-[var(--error-bg)] text-[var(--error-text)]";
    default:
      return "bg-surface-raised text-muted";
  }
}
