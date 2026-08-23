"use client";

import { useState, useTransition } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Loader2 } from "lucide-react";
import type { AdminAppointment } from "@/lib/admin/data";
import type { AppointmentStatus } from "@/lib/supabase/types";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { SHOP_TZ } from "@/lib/booking/timezone";
import {
  updateAppointmentNotes,
  updateAppointmentStatus,
} from "@/lib/admin/actions";

type Props = {
  appointment: AdminAppointment;
  locale: Locale;
  t: Dictionary;
};

const STATUS_ORDER: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "arrived",
  "completed",
  "cancelled",
  "no_show",
];

function fmtCurrency(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AppointmentRow({ appointment, locale, t }: Props) {
  const copy = t.pages.admin.appointments;
  const statusLabels = t.pages.account.appointments.statuses;
  const [saving, startSaving] = useTransition();
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(appointment.admin_notes ?? "");

  const startsAt = formatInTimeZone(new Date(appointment.starts_at), SHOP_TZ, "HH:mm");
  const day = formatInTimeZone(new Date(appointment.starts_at), SHOP_TZ, "EEE d MMM");

  const setStatus = (status: AppointmentStatus) => {
    startSaving(async () => {
      const form = new FormData();
      form.set("appointment_id", appointment.id);
      form.set("status", status);
      form.set("locale", locale);
      await updateAppointmentStatus(form);
    });
  };

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

  return (
    <article className="flex flex-col gap-4 border border-border p-4 md:flex-row md:items-center md:justify-between">
      <div className="grid min-w-0 flex-1 grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 md:grid-cols-[80px_1fr]">
        <div className="flex flex-col leading-none">
          <span className="font-display text-2xl">{startsAt}</span>
          <span className="text-[10px] tracking-[0.22em] text-muted uppercase">{day}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h3 className="font-display text-lg leading-none">
              {appointment.customer?.full_name?.trim() ||
                appointment.customer?.email ||
                copy.unknownCustomer}
            </h3>
            {appointment.is_guest ? (
              <span className="text-[10px] tracking-[0.22em] text-brass uppercase">
                {copy.guestBadge}
              </span>
            ) : null}
            <span className="text-[11px] tracking-[0.22em] text-muted uppercase">
              {appointment.reference_code}
            </span>
          </div>
          <p className="truncate text-xs text-muted">
            {appointment.service?.name ?? "—"} · {appointment.service?.duration_minutes ?? 0} min ·{" "}
            {appointment.service ? fmtCurrency(Number(appointment.service.price), locale) : "—"}
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
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2 md:items-end">
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`status-${appointment.id}`}>
            {copy.statusLabel}
          </label>
          <select
            id={`status-${appointment.id}`}
            defaultValue={appointment.status}
            disabled={saving}
            onChange={(event) => setStatus(event.target.value as AppointmentStatus)}
            className="border border-border bg-background px-3 py-2 text-[11px] tracking-[0.22em] text-foreground uppercase outline-none focus:border-foreground"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {statusLabelFor(s, statusLabels)}
              </option>
            ))}
          </select>
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

function statusLabelFor(
  status: AppointmentStatus,
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
