"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type {
  AdminCalendarDay,
  AdminCalendarSlot,
} from "@/lib/admin/calendar-data";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { dateFnsLocale } from "@/lib/booking/date-locale";
import { localizedServiceName } from "@/lib/services/localize";
import {
  cancelAndRefundAppointment,
  createAdminAppointment,
  deleteAppointment,
  rescheduleAdminAppointment,
} from "@/lib/admin/actions";

type ServiceOption = { id: string; slug: string; name: string; price: number };

type Props = {
  locale: Locale;
  t: Dictionary;
  mode: "day" | "week";
  dateISO: string;
  weekStartISO: string;
  day: AdminCalendarDay;
  week: AdminCalendarDay[];
  services: ServiceOption[];
  /** Base path only — query strings are built on the client (no functions across RSC). */
  calendarPath: string;
};

type Panel =
  | { kind: "book"; slot: AdminCalendarSlot }
  | { kind: "detail"; slot: AdminCalendarSlot }
  | { kind: "move"; slot: AdminCalendarSlot };

export function AdminCalendarView({
  locale,
  t,
  mode,
  dateISO,
  weekStartISO,
  day,
  week,
  services,
  calendarPath,
}: Props) {
  const copy = t.pages.admin.calendar;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [notes, setNotes] = useState("");

  const dayHref = (iso: string) =>
    `${calendarPath}?date=${iso}&view=day`;
  const weekHref = (iso: string) =>
    `${calendarPath}?date=${iso}&view=week`;
  const modeHref = (view: "day" | "week") =>
    `${calendarPath}?date=${dateISO}&view=${view}`;

  const moveTargets = useMemo(() => {
    if (panel?.kind !== "move" || !panel.slot.appointment) return [];
    const apptDay = formatInTimeZone(
      new Date(panel.slot.appointment.starts_at),
      SHOP_TZ,
      "yyyy-MM-dd",
    );
    const source =
      week.find((d) => d.dateISO === apptDay) ??
      (day.dateISO === apptDay ? day : null);
    return (source?.slots ?? []).filter((s) => s.state === "available");
  }, [panel, day, week]);

  const titleDate =
    mode === "day"
      ? formatInTimeZone(new Date(`${dateISO}T12:00:00Z`), SHOP_TZ, "EEEE d MMMM", {
          locale: dateFnsLocale(locale),
        })
      : copy.weekOf.replace(
          "{date}",
          formatInTimeZone(new Date(`${weekStartISO}T12:00:00Z`), SHOP_TZ, "d MMM", {
            locale: dateFnsLocale(locale),
          }),
        );

  const openBook = (slot: AdminCalendarSlot) => {
    setError(null);
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setServiceId(services[0]?.id ?? "");
    setPanel({ kind: "book", slot });
  };

  const openDetail = (slot: AdminCalendarSlot) => {
    setError(null);
    setPanel({ kind: "detail", slot });
  };

  const createBooking = () => {
    if (!panel || panel.kind !== "book") return;
    if (!serviceId || !name.trim() || !phone.trim()) {
      setError(copy.formRequired);
      return;
    }
    setError(null);
    start(async () => {
      const form = new FormData();
      form.set("locale", locale);
      form.set("service_id", serviceId);
      form.set("starts_at", panel.slot.startsAt);
      form.set("guest_name", name.trim());
      form.set("guest_phone", phone.trim());
      form.set("guest_email", email.trim());
      form.set("admin_notes", notes.trim());
      const res = await createAdminAppointment(form);
      if (!res.ok) {
        setError(
          res.reason === "slot_taken" ? copy.slotTaken : copy.actionFailed,
        );
        return;
      }
      setPanel(null);
      router.refresh();
    });
  };

  const moveTo = (startsAt: string) => {
    if (!panel || panel.kind !== "move" || !panel.slot.appointment) return;
    setError(null);
    start(async () => {
      const form = new FormData();
      form.set("locale", locale);
      form.set("appointment_id", panel.slot.appointment!.id);
      form.set("starts_at", startsAt);
      const res = await rescheduleAdminAppointment(form);
      if (!res.ok) {
        setError(
          res.reason === "slot_taken" ? copy.slotTaken : copy.actionFailed,
        );
        return;
      }
      setPanel(null);
      router.refresh();
    });
  };

  const runCancel = () => {
    const appt = panel?.kind === "detail" ? panel.slot.appointment : null;
    if (!appt) return;
    const msg = appt.can_refund ? copy.confirmCancelRefund : copy.confirmCancel;
    if (!window.confirm(msg)) return;
    setError(null);
    start(async () => {
      const form = new FormData();
      form.set("locale", locale);
      form.set("appointment_id", appt.id);
      const res = await cancelAndRefundAppointment(form);
      if (!res.ok) {
        setError(copy.actionFailed);
        return;
      }
      setPanel(null);
      router.refresh();
    });
  };

  const runDelete = () => {
    const appt = panel?.kind === "detail" ? panel.slot.appointment : null;
    if (!appt?.can_delete) return;
    if (!window.confirm(copy.confirmDelete)) return;
    setError(null);
    start(async () => {
      const form = new FormData();
      form.set("locale", locale);
      form.set("appointment_id", appt.id);
      const res = await deleteAppointment(form);
      if (!res.ok) {
        setError(copy.actionFailed);
        return;
      }
      setPanel(null);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="admin-filters">
        <div className="admin-filter-group">
          <span className="admin-filter-label">{copy.viewLabel}</span>
          <a
            href={modeHref("day")}
            aria-current={mode === "day" ? "page" : undefined}
            className="admin-chip"
          >
            {copy.dayView}
          </a>
          <a
            href={modeHref("week")}
            aria-current={mode === "week" ? "page" : undefined}
            className="admin-chip"
          >
            {copy.weekView}
          </a>
        </div>
        <div className="admin-filter-group">
          <a href={dayHref(shiftIso(dateISO, -1))} className="admin-btn admin-btn-ghost">
            ←
          </a>
          <a href={dayHref(shopTodayClient())} className="admin-btn admin-btn-ghost">
            {copy.today}
          </a>
          <a href={dayHref(shiftIso(dateISO, 1))} className="admin-btn admin-btn-ghost">
            →
          </a>
          {mode === "week" ? (
            <>
              <a
                href={weekHref(shiftIso(weekStartISO, -7))}
                className="admin-btn admin-btn-ghost"
              >
                {copy.prevWeek}
              </a>
              <a
                href={weekHref(shiftIso(weekStartISO, 7))}
                className="admin-btn admin-btn-ghost"
              >
                {copy.nextWeek}
              </a>
            </>
          ) : null}
        </div>
        <p className="text-sm text-body capitalize md:ml-auto">{titleDate}</p>
      </div>

      <div className="admin-cal-legend">
        <span data-state="available">{copy.legendFree}</span>
        <span data-state="booked">{copy.legendBooked}</span>
        <span data-state="break">{copy.legendBreak}</span>
        <span data-state="unavailable">{copy.legendBlocked}</span>
      </div>

      {mode === "day" ? (
        <DayColumn
          day={day}
          locale={locale}
          copy={copy}
          onBook={openBook}
          onOpen={openDetail}
        />
      ) : (
        <div className="admin-cal-week">
          {week.map((d) => (
            <div key={d.dateISO} className="admin-cal-week-col">
              <a href={dayHref(d.dateISO)} className="admin-cal-week-head">
                {formatInTimeZone(
                  new Date(`${d.dateISO}T12:00:00Z`),
                  SHOP_TZ,
                  "EEE d",
                  { locale: dateFnsLocale(locale) },
                )}
              </a>
              <DayColumn
                day={d}
                locale={locale}
                copy={copy}
                compact
                onBook={openBook}
                onOpen={openDetail}
              />
            </div>
          ))}
        </div>
      )}

      {panel ? (
        <div className="admin-cal-panel" role="dialog" aria-modal="true">
          <div className="admin-cal-panel-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.22em] text-muted uppercase">
                  {formatInTimeZone(new Date(panel.slot.startsAt), SHOP_TZ, "EEE d MMM · HH:mm", {
                    locale: dateFnsLocale(locale),
                  })}
                </p>
                <h3 className="mt-1 font-display text-2xl">
                  {panel.kind === "book"
                    ? copy.bookTitle
                    : panel.kind === "move"
                      ? copy.moveTitle
                      : copy.detailTitle}
                </h3>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setPanel(null)}
              >
                {copy.close}
              </button>
            </div>

            {panel.kind === "book" ? (
              <div className="mt-4 grid gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] tracking-[0.18em] text-muted uppercase">
                    {copy.nameLabel}
                  </span>
                  <input
                    className="admin-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] tracking-[0.18em] text-muted uppercase">
                    {copy.phoneLabel}
                  </span>
                  <input
                    className="admin-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] tracking-[0.18em] text-muted uppercase">
                    {copy.emailLabel}
                  </span>
                  <input
                    className="admin-field"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={copy.emailOptional}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] tracking-[0.18em] text-muted uppercase">
                    {copy.serviceLabel}
                  </span>
                  <select
                    className="admin-field"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {localizedServiceName(locale, s.slug, s.name)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] tracking-[0.18em] text-muted uppercase">
                    {copy.notesLabel}
                  </span>
                  <textarea
                    className="admin-field min-h-20"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  disabled={pending || services.length === 0}
                  onClick={createBooking}
                  className="admin-btn admin-btn-primary"
                >
                  {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  {copy.bookSubmit}
                </button>
              </div>
            ) : null}

            {panel.kind === "detail" && panel.slot.appointment ? (
              <div className="mt-4 flex flex-col gap-3">
                <p className="font-display text-xl">
                  {panel.slot.appointment.customer?.full_name ||
                    panel.slot.appointment.customer?.email ||
                    "—"}
                </p>
                <p className="text-sm text-muted">
                  {localizedServiceName(
                    locale,
                    panel.slot.appointment.service?.slug,
                    panel.slot.appointment.service?.name,
                  )}{" "}
                  · {panel.slot.appointment.reference_code}
                </p>
                {panel.slot.appointment.customer?.phone ? (
                  <a
                    href={`tel:${panel.slot.appointment.customer.phone}`}
                    className="text-sm text-brass"
                  >
                    {panel.slot.appointment.customer.phone}
                  </a>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {panel.slot.appointment.can_cancel ||
                  panel.slot.appointment.can_refund ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={runCancel}
                      className="admin-btn admin-btn-primary"
                    >
                      {panel.slot.appointment.can_refund
                        ? copy.cancelRefund
                        : copy.cancel}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      setPanel({ kind: "move", slot: panel.slot })
                    }
                    className="admin-btn admin-btn-brass"
                  >
                    {copy.move}
                  </button>
                  {panel.slot.appointment.can_delete ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={runDelete}
                      className="admin-btn admin-btn-ghost"
                    >
                      {copy.delete}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {panel.kind === "move" ? (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-sm text-body">{copy.moveLead}</p>
                <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                  {moveTargets.map((s) => (
                    <button
                      key={s.startsAt}
                      type="button"
                      disabled={pending}
                      onClick={() => moveTo(s.startsAt)}
                      className="admin-cal-slot is-available !min-h-10"
                    >
                      {formatInTimeZone(new Date(s.startsAt), SHOP_TZ, "HH:mm")}
                    </button>
                  ))}
                </div>
                {moveTargets.length === 0 ? (
                  <p className="text-sm text-muted">{copy.noMoveSlots}</p>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="mt-3 text-sm text-[var(--error-text)]">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DayColumn({
  day,
  locale,
  copy,
  compact,
  onBook,
  onOpen,
}: {
  day: AdminCalendarDay;
  locale: Locale;
  copy: Dictionary["pages"]["admin"]["calendar"];
  compact?: boolean;
  onBook: (slot: AdminCalendarSlot) => void;
  onOpen: (slot: AdminCalendarSlot) => void;
}) {
  if (day.closed) {
    return (
      <p className={`text-sm text-muted ${compact ? "px-1 py-3" : ""}`}>
        {day.blocked ? copy.blockedDay : copy.closedDay}
      </p>
    );
  }
  if (day.slots.length === 0) {
    return <p className="text-sm text-muted">{copy.emptyDay}</p>;
  }

  return (
    <div className={compact ? "admin-cal-day is-compact" : "admin-cal-day is-dense"}>
      {day.slots.map((slot) => {
        const time = formatInTimeZone(new Date(slot.startsAt), SHOP_TZ, "HH:mm");
        const name =
          slot.appointment?.customer?.full_name?.trim() ||
          slot.appointment?.customer?.email ||
          "";
        const service = slot.appointment
          ? localizedServiceName(
              locale,
              slot.appointment.service?.slug,
              slot.appointment.service?.name,
            )
          : "";
        if (slot.state === "booked" && slot.appointment) {
          return (
            <button
              key={slot.startsAt}
              type="button"
              className="admin-cal-slot is-booked"
              onClick={() => onOpen(slot)}
            >
              <span>{time}</span>
              {!compact ? (
                <span className="admin-cal-slot-meta">
                  {name}
                  {service ? ` · ${service}` : ""}
                </span>
              ) : (
                <span className="admin-cal-slot-meta truncate">{name || "•"}</span>
              )}
            </button>
          );
        }
        if (slot.state === "available") {
          return (
            <button
              key={slot.startsAt}
              type="button"
              className="admin-cal-slot is-available"
              onClick={() => onBook(slot)}
            >
              <span>{time}</span>
              {!compact ? <span className="admin-cal-slot-meta">{copy.freeSlot}</span> : null}
            </button>
          );
        }
        if (slot.state === "break") {
          return (
            <div key={slot.startsAt} className="admin-cal-slot is-break">
              <span>{time}</span>
              {!compact ? (
                <span className="admin-cal-slot-meta">{copy.breakSlot}</span>
              ) : null}
            </div>
          );
        }
        return (
          <div key={slot.startsAt} className="admin-cal-slot is-unavailable">
            <span>{time}</span>
            {!compact ? (
              <span className="admin-cal-slot-meta">{copy.blockedSlot}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function shiftIso(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function shopTodayClient() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
