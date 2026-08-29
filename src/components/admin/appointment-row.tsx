"use client";

import { useState, useTransition } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Loader2 } from "lucide-react";
import type { AdminAppointment } from "@/lib/admin/data";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { dateFnsLocale } from "@/lib/booking/date-locale";
import { localizedServiceName } from "@/lib/services/localize";
import { formatEurFromCents } from "@/lib/payments/deposit";
import {
  updateAppointmentNotes,
  cancelAndRefundAppointment,
} from "@/lib/admin/actions";

type Props = {
  appointment: AdminAppointment;
  locale: Locale;
  t: Dictionary;
};

function fmtCurrency(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function bucketLabel(
  appointment: AdminAppointment,
  copy: Dictionary["pages"]["admin"]["appointments"],
  statuses: Dictionary["pages"]["account"]["appointments"]["statuses"],
) {
  if (appointment.status === "completed") return statuses.completed;
  if (appointment.status === "cancelled") return statuses.cancelled;
  return copy.waitingLabel;
}

export function AppointmentRow({ appointment, locale, t }: Props) {
  const copy = t.pages.admin.appointments;
  const statusLabels = t.pages.account.appointments.statuses;
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(appointment.admin_notes ?? "");

  const startsAt = formatInTimeZone(new Date(appointment.starts_at), SHOP_TZ, "HH:mm");
  const day = formatInTimeZone(new Date(appointment.starts_at), SHOP_TZ, "EEE d MMM", {
    locale: dateFnsLocale(locale),
  });
  const serviceName = localizedServiceName(
    locale,
    appointment.service?.slug,
    appointment.service?.name,
  );

  const saveNotes = () => {
    startSaving(async () => {
      const form = new FormData();
      form.set("appointment_id", appointment.id);
      form.set("admin_notes", notes);
      form.set("locale", locale);
      await updateAppointmentNotes(form);
      setNotesOpen(false);
    });
  };

  const cancelAndRefund = () => {
    if (!window.confirm(copy.confirmCancelRefund)) return;
    setError(null);
    startSaving(async () => {
      const form = new FormData();
      form.set("appointment_id", appointment.id);
      form.set("locale", locale);
      const res = await cancelAndRefundAppointment(form);
      if (!res.ok) {
        setError(copy.refundFailed);
      }
    });
  };

  return (
    <article className="flex flex-col gap-3 border border-border bg-[var(--admin-panel)] p-3 md:flex-row md:items-center md:justify-between md:gap-4 md:p-3.5">
      <div className="grid min-w-0 flex-1 grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 md:grid-cols-[72px_1fr]">
        <div className="flex flex-col leading-none">
          <span className="font-display text-xl md:text-2xl">{startsAt}</span>
          <span className="text-[10px] tracking-[0.18em] text-muted uppercase">{day}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <h3 className="font-display text-base leading-none md:text-lg">
              {appointment.customer?.full_name?.trim() ||
                appointment.customer?.email ||
                copy.unknownCustomer}
            </h3>
            {appointment.is_guest ? (
              <span className="text-[10px] tracking-[0.22em] text-brass uppercase">
                {copy.guestBadge}
              </span>
            ) : null}
            <span className="text-[10px] tracking-[0.22em] text-muted uppercase">
              {bucketLabel(appointment, copy, statusLabels)}
            </span>
            {appointment.payment_status === "paid" ? (
              <span className="text-[10px] tracking-[0.22em] text-brass uppercase">
                {copy.depositPaid}
              </span>
            ) : null}
            {appointment.payment_status === "refunded" ? (
              <span className="text-[10px] tracking-[0.22em] text-brass uppercase">
                {copy.refundedBadge}
              </span>
            ) : null}
            <span className="text-[11px] tracking-[0.22em] text-muted uppercase">
              {appointment.reference_code}
            </span>
          </div>
          <p className="truncate text-xs text-muted">
            {serviceName}
            {appointment.service
              ? ` · ${fmtCurrency(Number(appointment.service.price), locale)}`
              : ""}
            {appointment.deposit_cents > 0 &&
            (appointment.payment_status === "paid" ||
              appointment.payment_status === "refunded")
              ? ` · ${formatEurFromCents(appointment.deposit_cents, locale)}`
              : ""}
          </p>
          {appointment.customer?.phone ? (
            <a
              href={`tel:${appointment.customer.phone}`}
              className="text-[11px] tracking-[0.22em] text-muted uppercase transition hover:text-foreground"
            >
              {appointment.customer.phone}
            </a>
          ) : null}
          {appointment.customer_notes ? (
            <p className="text-xs text-muted">
              <span className="text-[10px] tracking-[0.22em] text-muted uppercase">
                {copy.customerNotesLabel}:
              </span>{" "}
              {appointment.customer_notes}
            </p>
          ) : null}
          {appointment.admin_notes ? (
            <p className="text-xs text-brass/90">
              <span className="text-[10px] tracking-[0.22em] uppercase">
                {copy.internalNotesLabel}:
              </span>{" "}
              {appointment.admin_notes}
            </p>
          ) : null}
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2 md:items-end">
        <div className="flex flex-wrap items-center gap-2">
          {appointment.can_refund ? (
            <button
              type="button"
              onClick={cancelAndRefund}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-3 py-2 text-[11px] tracking-[0.22em] text-background uppercase transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : null}
              {copy.cancelAndRefund}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            className="inline-flex items-center gap-2 border border-border px-3 py-2 text-[11px] tracking-[0.22em] uppercase transition hover:border-foreground"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : null}
            {notesOpen ? copy.close : copy.internalNotesLabel}
          </button>
        </div>
        {notesOpen ? (
          <div className="flex flex-col items-stretch gap-2 md:w-72">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={copy.internalNotesPlaceholder}
              className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />
            <button
              type="button"
              onClick={saveNotes}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-foreground px-3 py-2 text-[11px] tracking-[0.22em] text-background uppercase transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : null}
              {copy.saveNotes}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
