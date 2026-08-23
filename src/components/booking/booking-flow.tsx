"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarCheck, Check, Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ServiceDTO } from "@/lib/data/services";
import { createBooking, getAvailableSlots } from "@/lib/booking/actions";
import { routes } from "@/lib/routes";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldInput, FieldLabel, FieldTextarea } from "@/components/ui/field";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";

type Props = {
  locale: Locale;
  t: Dictionary;
  services: ServiceDTO[];
  maxDays: number;
  timezone: string;
  isAuthenticated: boolean;
};

type Success = {
  referenceCode: string;
  serviceName: string;
  startsAt: string;
  managePath: string;
};

function formatCurrency(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BookingFlow({
  locale,
  t,
  services,
  maxDays,
  timezone,
  isAuthenticated,
}: Props) {
  const copy = t.pages.prenota;
  const r = routes(locale);

  const [serviceId, setServiceId] = useState<string | null>(services[0]?.id ?? null);
  const [dateISO, setDateISO] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);

  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId],
  );

  const slotsRequestRef = useRef(0);
  const fetchSlots = useCallback(
    (sid: string, iso: string) => {
      const token = ++slotsRequestRef.current;
      setLoadingSlots(true);
      setSlots([]);
      setSlot(null);
      setSlotError(null);
      getAvailableSlots(sid, iso)
        .then((res) => {
          if (token !== slotsRequestRef.current) return;
          if (res.ok) {
            setSlots(res.slots);
          } else {
            setSlotError(
              res.reason === "not_configured"
                ? copy.errors.notConfigured
                : res.reason === "unknown_service"
                  ? copy.errors.unknownService
                  : copy.errors.slotsFailed,
            );
          }
        })
        .catch(() => {
          if (token !== slotsRequestRef.current) return;
          setSlotError(copy.errors.slotsFailed);
        })
        .finally(() => {
          if (token !== slotsRequestRef.current) return;
          setLoadingSlots(false);
        });
    },
    [copy.errors],
  );

  const pickService = (id: string) => {
    if (id === serviceId) return;
    setServiceId(id);
    if (dateISO) fetchSlots(id, dateISO);
  };
  const pickDate = (iso: string) => {
    if (iso === dateISO) return;
    setDateISO(iso);
    if (serviceId) fetchSlots(serviceId, iso);
  };

  const dateLabel = useCallback(
    (iso: string) =>
      formatInTimeZone(new Date(`${iso}T12:00:00Z`), timezone, "EEE d MMM").toUpperCase(),
    [timezone],
  );
  const timeLabel = useCallback(
    (iso: string) => formatInTimeZone(new Date(iso), timezone, "HH:mm"),
    [timezone],
  );

  const guestReady =
    guestName.trim().length > 0 && /.+@.+\..+/.test(guestEmail.trim());
  const canConfirm = Boolean(
    serviceId &&
      dateISO &&
      slot &&
      (isAuthenticated || guestReady) &&
      !submitting,
  );

  const submit = () => {
    if (!service || !slot) return;
    if (!isAuthenticated && !guestReady) {
      setSubmitError(copy.errors.guestRequired);
      return;
    }
    setSubmitError(null);
    startSubmit(async () => {
      const res = await createBooking({
        serviceId: service.id,
        startsAtUTC: slot,
        notes,
        locale,
        guest: isAuthenticated
          ? undefined
          : {
              name: guestName.trim(),
              email: guestEmail.trim(),
              phone: guestPhone.trim() || undefined,
            },
      });
      if (res.ok) {
        setSuccess({
          referenceCode: res.referenceCode,
          serviceName: service.name,
          startsAt: slot,
          managePath: res.managePath,
        });
      } else {
        setSubmitError(
          res.reason === "slot_taken"
            ? copy.errors.slotTaken
            : res.reason === "guest_required"
              ? copy.errors.guestRequired
              : res.reason === "auth_required"
                ? copy.errors.authRequired
                : res.reason === "not_configured"
                  ? copy.errors.notConfigured
                  : copy.errors.createFailed,
        );
        if (res.reason === "slot_taken" && dateISO) {
          const refreshed = await getAvailableSlots(service.id, dateISO);
          if (refreshed.ok) setSlots(refreshed.slots);
        }
      }
    });
  };

  if (success) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brass text-brass">
          <Check className="h-7 w-7" aria-hidden />
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-[11px] tracking-[0.28em] text-brass uppercase">
            {copy.success.kicker}
          </p>
          <h2 className="font-display text-4xl leading-[0.95] uppercase md:text-6xl">
            {copy.success.title}
          </h2>
          <p className="text-lg text-body">
            {copy.success.body.replace("{service}", success.serviceName)}
          </p>
        </div>
        <dl className="grid w-full grid-cols-1 gap-2 border-y border-border py-6 text-left sm:grid-cols-2">
          <div>
            <dt className="text-label uppercase">
              {copy.success.dateLabel}
            </dt>
            <dd className="font-display text-xl">
              {formatInTimeZone(new Date(success.startsAt), timezone, "EEE d MMM · HH:mm")}
            </dd>
          </div>
          <div>
            <dt className="text-label uppercase">
              {copy.success.referenceLabel}
            </dt>
            <dd className="font-display text-xl">{success.referenceCode}</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={success.managePath} variant="primary" arrow>
            {copy.success.manageCta}
          </ButtonLink>
          <ButtonLink href={r.home} variant="ghost">
            {copy.success.homeCta}
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-6 py-12 md:px-10 md:py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
        {/* Step 1 — Service */}
        <section className="flex flex-col gap-5 lg:col-span-4">
          <StepHeader step={1} title={copy.steps.service.title} lead={copy.steps.service.lead} />
          <ul className="flex flex-col gap-2">
            {services.map((s) => {
              const selected = s.id === serviceId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => pickService(s.id)}
                    aria-pressed={selected}
                    data-selected={selected}
                    className="select-tile flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-display text-lg leading-none">{s.name}</span>
                      <span className="text-label uppercase">
                        {s.duration_minutes} min · {formatCurrency(Number(s.price), locale)}
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className={`select-indicator h-3 w-3 rounded-full border ${
                        selected ? "" : "border-border"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Step 2 — Date (month grid) */}
        <section className="flex flex-col gap-5 lg:col-span-4">
          <StepHeader step={2} title={copy.steps.date.title} lead={copy.steps.date.lead} />
          <BookingCalendar
            locale={locale}
            timezone={timezone}
            maxDays={maxDays}
            value={dateISO}
            onChange={pickDate}
            copy={copy.steps.calendar}
          />
        </section>

        {/* Step 3 — Time */}
        <section className="flex flex-col gap-5 lg:col-span-4">
          <StepHeader step={3} title={copy.steps.time.title} lead={copy.steps.time.lead} />
          <TimeSlotPicker
            locale={locale}
            timezone={timezone}
            dateISO={dateISO}
            slots={slots}
            value={slot}
            loading={loadingSlots}
            error={slotError}
            onChange={setSlot}
            copy={copy.steps.time}
          />

          {slot ? (
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="booking-notes">{copy.notesLabel}</FieldLabel>
              <FieldTextarea
                id="booking-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                maxLength={280}
                placeholder={copy.notesPlaceholder}
              />
            </div>
          ) : null}
        </section>
      </div>

      {!isAuthenticated ? (
        <section className="flex max-w-2xl flex-col gap-5">
          <StepHeader step={4} title={copy.guest.title} lead={copy.guest.lead} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <FieldLabel>{copy.guest.name}</FieldLabel>
              <FieldInput
                type="text"
                name="guest_name"
                autoComplete="name"
                required
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <FieldLabel>{copy.guest.email}</FieldLabel>
              <FieldInput
                type="email"
                name="guest_email"
                autoComplete="email"
                required
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <FieldLabel>{copy.guest.phone}</FieldLabel>
              <FieldInput
                type="tel"
                name="guest_phone"
                autoComplete="tel"
                value={guestPhone}
                onChange={(event) => setGuestPhone(event.target.value)}
              />
            </label>
          </div>
          <p className="text-sm text-body">
            {copy.guest.haveAccount}{" "}
            <Link
              href={`${r.signIn}?next=${encodeURIComponent(r.book)}`}
              className="link-brass"
            >
              {copy.guest.signInLink}
            </Link>
          </p>
        </section>
      ) : null}

      {/* Sticky summary bar */}
      <div className="sticky bottom-0 z-10 -mx-6 mt-2 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur md:-mx-10 md:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <dl className="flex flex-wrap items-center gap-x-8 gap-y-2 text-label uppercase">
            <div className="flex items-center gap-2">
              <dt>{copy.summary.service}</dt>
              <dd className="text-value">{service?.name ?? "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt>{copy.summary.date}</dt>
              <dd className="text-value">{dateISO ? dateLabel(dateISO) : "—"}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt>{copy.summary.time}</dt>
              <dd className="text-value">{slot ? timeLabel(slot) : "—"}</dd>
            </div>
            {service ? (
              <div className="flex items-center gap-2">
                <dt>{copy.summary.total}</dt>
                <dd className="font-display text-lg tracking-normal text-value">
                  {formatCurrency(Number(service.price), locale)}
                </dd>
              </div>
            ) : null}
          </dl>

          {submitError ? (
            <Alert className="md:max-w-xs">{submitError}</Alert>
          ) : null}

          {isAuthenticated || guestReady ? (
            <Button
              type="button"
              onClick={submit}
              disabled={!canConfirm}
              variant="brass"
              arrow
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {copy.submitting}
                </>
              ) : (
                <>
                  <CalendarCheck className="h-4 w-4" aria-hidden />
                  {copy.confirm}
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setSubmitError(copy.errors.guestRequired)}
              variant="secondary"
              arrow
            >
              {copy.confirm}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  step,
  title,
  lead,
  active = true,
}: {
  step: number;
  title: string;
  lead: string;
  active?: boolean;
}) {
  return (
    <header className="flex flex-col gap-2 border-b border-border pb-4">
      <div className="flex items-center gap-3 text-label uppercase">
        <span className="step-badge" data-active={active ? "true" : "false"}>
          {step}
        </span>
        <span className={active ? "text-value" : undefined}>{title}</span>
      </div>
      <p className="text-sm text-body">{lead}</p>
    </header>
  );
}
