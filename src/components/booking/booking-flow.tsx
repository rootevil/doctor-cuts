"use client";

/**
 * Booking flow — HCI-informed interaction design
 *
 * Nielsen heuristics applied:
 * 1. Visibility of system status — progress rail + sticky summary + live hints
 * 2. Match real world — familiar calendar, morning/afternoon/evening slots
 * 3. User control — earlier steps stay editable; change service/date anytime
 * 4. Consistency — shared tiles, badges, confirm pattern with the rest of the site
 * 5. Error prevention — unavailable dates disabled; later steps locked until ready
 * 6. Recognition over recall — selection always visible in the sticky bar
 * 7. Flexibility — jump back by changing any earlier choice
 * 8. Minimalist design — progressive disclosure (date → time → details)
 * 9. Error recovery — slot-taken refreshes availability; alerts near the CTA
 * 10. Help — assist strip + optional notes deferred until a time is chosen
 *
 * UX laws: Fitts (≥44px targets + sticky primary CTA), Miller (≤4 steps),
 * Hick (one decision per stage), progressive disclosure (NN/g).
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarCheck, Check, Loader2, Lock } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ServiceDTO } from "@/lib/data/services";
import type { SlotOption } from "@/lib/booking/availability";
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
  /** Preselect from `/prenota?service=slug` (deep-link continuity). */
  initialServiceSlug?: string | null;
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

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BookingFlow({
  locale,
  t,
  services,
  maxDays,
  timezone,
  isAuthenticated,
  initialServiceSlug = null,
}: Props) {
  const copy = t.pages.prenota;
  const r = routes(locale);

  // Intentional choice unless deep-linked (error prevention + clear step 1)
  const initialServiceId =
    (initialServiceSlug
      ? services.find((s) => s.slug === initialServiceSlug)?.id
      : null) ?? null;

  const [serviceId, setServiceId] = useState<string | null>(initialServiceId);
  const [dateISO, setDateISO] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);

  const dateSectionRef = useRef<HTMLElement>(null);
  const timeSectionRef = useRef<HTMLElement>(null);
  const detailsSectionRef = useRef<HTMLElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

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
                  : res.reason === "bookings_closed"
                    ? copy.errors.bookingsClosed
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

  const scrollToSection = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    // Offset for sticky confirm + header
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior });
  }, []);

  const pickService = (id: string) => {
    if (id === serviceId) return;
    setServiceId(id);
    setSubmitError(null);
    if (dateISO) fetchSlots(id, dateISO);
    // Guide attention to the next decision (Hick: one stage at a time)
    requestAnimationFrame(() => scrollToSection(dateSectionRef.current));
  };

  const pickDate = (iso: string) => {
    if (iso === dateISO) return;
    setDateISO(iso);
    setSubmitError(null);
    if (serviceId) fetchSlots(serviceId, iso);
    requestAnimationFrame(() => scrollToSection(timeSectionRef.current));
  };

  const pickSlot = (iso: string) => {
    setSlot(iso);
    setSubmitError(null);
    if (!isAuthenticated) {
      requestAnimationFrame(() => {
        scrollToSection(detailsSectionRef.current);
        nameInputRef.current?.focus();
      });
    }
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
  const detailsReady = isAuthenticated || guestReady;
  const canConfirm = Boolean(
    serviceId && dateISO && slot && detailsReady && !submitting,
  );

  const dateUnlocked = Boolean(serviceId);
  const timeUnlocked = Boolean(serviceId && dateISO);
  const detailsUnlocked = Boolean(slot);

  const progress = [
    { id: "service", label: copy.steps.service.title, done: Boolean(serviceId) },
    { id: "date", label: copy.steps.date.title, done: Boolean(dateISO) },
    { id: "time", label: copy.steps.time.title, done: Boolean(slot) },
    {
      id: "details",
      label: isAuthenticated ? copy.confirm : copy.guest.title,
      done: detailsReady && Boolean(slot),
    },
  ] as const;

  const activeStep = !serviceId
    ? 0
    : !dateISO
      ? 1
      : !slot
        ? 2
        : !detailsReady
          ? 3
          : 3;

  const nextHint = !serviceId
    ? copy.nextHint.pickService
    : !dateISO
      ? copy.nextHint.pickDate
      : !slot
        ? copy.nextHint.pickTime
        : !detailsReady
          ? copy.nextHint.addDetails
          : copy.nextHint.ready;

  // When deep-linked with a service, nudge toward the date step once
  useEffect(() => {
    if (initialServiceId && !dateISO) {
      const t = window.setTimeout(() => scrollToSection(dateSectionRef.current), 120);
      return () => window.clearTimeout(t);
    }
  }, [initialServiceId, dateISO, scrollToSection]);

  const submit = () => {
    if (!service || !slot) return;
    if (!isAuthenticated && !guestReady) {
      setSubmitError(copy.errors.guestRequired);
      scrollToSection(detailsSectionRef.current);
      nameInputRef.current?.focus();
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
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
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
                  : res.reason === "bookings_closed"
                    ? copy.errors.bookingsClosed
                    : copy.errors.createFailed,
        );
        if (res.reason === "slot_taken" && dateISO) {
          setSlot(null);
          const refreshed = await getAvailableSlots(service.id, dateISO);
          if (refreshed.ok) setSlots(refreshed.slots);
          scrollToSection(timeSectionRef.current);
        }
      }
    });
  };

  if (success) {
    return (
      <div
        className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 py-16 text-center md:py-24"
        role="status"
        aria-live="polite"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brass text-brass">
          <Check className="h-6 w-6" aria-hidden />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[11px] tracking-[0.28em] text-brass uppercase">
            {copy.success.kicker}
          </p>
          <h2 className="font-display text-3xl leading-[0.95] uppercase md:text-5xl">
            {copy.success.title}
          </h2>
          <p className="text-base text-body md:text-lg">
            {copy.success.body.replace("{service}", success.serviceName)}
          </p>
        </div>
        <dl className="grid w-full grid-cols-1 gap-2 border-y border-border py-5 text-left sm:grid-cols-2">
          <div>
            <dt className="text-label uppercase">{copy.success.dateLabel}</dt>
            <dd className="font-display text-lg md:text-xl">
              {formatInTimeZone(new Date(success.startsAt), timezone, "EEE d MMM · HH:mm")}
            </dd>
          </div>
          <div>
            <dt className="text-label uppercase">{copy.success.referenceLabel}</dt>
            <dd className="font-display text-lg md:text-xl">{success.referenceCode}</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={success.managePath} variant="book" arrow>
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
    <div className="booking-flow site-wrap-narrow pt-5 md:pt-6">
      {/* Status — always visible path through the task */}
      <nav aria-label="Booking progress" className="booking-progress mb-5">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
          {progress.map((step, index) => {
            const current = index === activeStep;
            return (
              <li key={step.id} className="flex items-center gap-1">
                {index > 0 ? (
                  <span className="booking-progress-sep" aria-hidden>
                    /
                  </span>
                ) : null}
                <span
                  className={`booking-progress-item ${step.done ? "is-done" : ""} ${
                    current ? "is-current" : ""
                  }`}
                  aria-current={current ? "step" : undefined}
                >
                  <span className="booking-progress-n" aria-hidden>
                    {step.done ? (
                      <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span>{step.label}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-2 text-xs text-body" aria-live="polite">
          {nextHint}
        </p>
      </nav>

      <div className="flex flex-col gap-4">
        {/* 1 — Service (always available) */}
        <section
          aria-labelledby="book-step-service"
          className={`booking-panel ${activeStep === 0 ? "is-active" : ""}`}
        >
          <StepHeader
            step={1}
            title={copy.steps.service.title}
            lead={copy.steps.service.lead}
            done={Boolean(serviceId)}
            active={activeStep === 0}
          />
          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2" role="radiogroup" aria-label={copy.steps.service.title}>
            {services.map((s) => {
              const selected = s.id === serviceId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    role="radio"
                    onClick={() => pickService(s.id)}
                    aria-checked={selected}
                    data-selected={selected}
                    className="select-tile booking-touch flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                  >
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <span className="font-display text-[15px] leading-none tracking-tight">
                        {s.name}
                      </span>
                      <span className="text-[10px] tracking-[0.12em] text-muted uppercase">
                        {formatCurrency(Number(s.price), locale)}
                      </span>
                    </div>
                    <span
                      aria-hidden
                      className={`select-indicator h-2.5 w-2.5 shrink-0 rounded-full border ${
                        selected ? "" : "border-border"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 2 + 3 — Date then Time (progressive) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
          <section
            ref={dateSectionRef}
            aria-labelledby="book-step-date"
            inert={!dateUnlocked ? true : undefined}
            className={`booking-panel ${activeStep === 1 ? "is-active" : ""} ${
              !dateUnlocked ? "is-locked" : ""
            }`}
          >
            <StepHeader
              step={2}
              title={copy.steps.date.title}
              lead={copy.steps.date.lead}
              done={Boolean(dateISO)}
              active={activeStep === 1}
              locked={!dateUnlocked}
            />
            <div className="mt-3">
              {dateUnlocked ? (
                <BookingCalendar
                  locale={locale}
                  timezone={timezone}
                  maxDays={maxDays}
                  value={dateISO}
                  onChange={pickDate}
                  copy={copy.steps.calendar}
                />
              ) : (
                <LockedHint message={copy.locked.needService} />
              )}
            </div>
          </section>

          <section
            ref={timeSectionRef}
            aria-labelledby="book-step-time"
            inert={!timeUnlocked ? true : undefined}
            className={`booking-panel ${activeStep === 2 ? "is-active" : ""} ${
              !timeUnlocked ? "is-locked" : ""
            }`}
          >
            <StepHeader
              step={3}
              title={copy.steps.time.title}
              lead={copy.steps.time.lead}
              done={Boolean(slot)}
              active={activeStep === 2}
              locked={!timeUnlocked}
            />
            <div className="mt-3">
              {timeUnlocked ? (
                <TimeSlotPicker
                  locale={locale}
                  timezone={timezone}
                  dateISO={dateISO}
                  slots={slots}
                  value={slot}
                  loading={loadingSlots}
                  error={slotError}
                  onChange={pickSlot}
                  copy={copy.steps.time}
                />
              ) : (
                <LockedHint
                  message={
                    !serviceId ? copy.locked.needService : copy.locked.needDate
                  }
                />
              )}
            </div>
          </section>
        </div>

        {/* 4 — Details only after a time is chosen (progressive disclosure) */}
        {!isAuthenticated && detailsUnlocked ? (
          <section
            ref={detailsSectionRef}
            aria-labelledby="book-step-details"
            className={`booking-panel ${activeStep === 3 ? "is-active" : ""}`}
          >
            <StepHeader
              step={4}
              title={copy.guest.title}
              lead={copy.guest.lead}
              done={guestReady}
              active={activeStep === 3}
            />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="guest_name">{copy.guest.name}</FieldLabel>
                <FieldInput
                  ref={nameInputRef}
                  id="guest_name"
                  type="text"
                  name="guest_name"
                  autoComplete="name"
                  required
                  value={guestName}
                  onChange={(event) => setGuestName(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="guest_email">{copy.guest.email}</FieldLabel>
                <FieldInput
                  id="guest_email"
                  type="email"
                  name="guest_email"
                  autoComplete="email"
                  required
                  value={guestEmail}
                  onChange={(event) => setGuestEmail(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <FieldLabel htmlFor="guest_phone">{copy.guest.phone}</FieldLabel>
                <FieldInput
                  id="guest_phone"
                  type="tel"
                  name="guest_phone"
                  autoComplete="tel"
                  value={guestPhone}
                  onChange={(event) => setGuestPhone(event.target.value)}
                />
              </label>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
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
            </div>
            <p className="mt-3 text-xs text-body">
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

        {/* Authenticated: optional notes only (no guest form) */}
        {isAuthenticated && detailsUnlocked ? (
          <section
            ref={detailsSectionRef}
            aria-labelledby="book-step-notes"
            className={`booking-panel ${canConfirm ? "is-active" : ""}`}
          >
            <StepHeader
              step={4}
              title={copy.notesLabel}
              lead={copy.nextHint.ready}
              done
              active={canConfirm}
              headingId="book-step-notes"
            />
            <div className="mt-3 flex flex-col gap-1.5">
              <FieldTextarea
                id="booking-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={2}
                maxLength={280}
                placeholder={copy.notesPlaceholder}
              />
            </div>
          </section>
        ) : null}
      </div>

      {/* Recognition over recall + Fitts: sticky summary + large primary CTA */}
      <div className="booking-confirm-bar" role="region" aria-label={copy.confirm}>
        <div className="site-wrap-narrow flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[10px] tracking-[0.12em] uppercase">
              <div className="flex items-baseline gap-1.5">
                <dt className="text-muted">{copy.summary.service}</dt>
                <dd className="font-display text-sm tracking-normal text-foreground normal-case">
                  {service?.name ?? "—"}
                </dd>
              </div>
              <div className="flex items-baseline gap-1.5">
                <dt className="text-muted">{copy.summary.date}</dt>
                <dd className="text-foreground">{dateISO ? dateLabel(dateISO) : "—"}</dd>
              </div>
              <div className="flex items-baseline gap-1.5">
                <dt className="text-muted">{copy.summary.time}</dt>
                <dd className="text-foreground">{slot ? timeLabel(slot) : "—"}</dd>
              </div>
              {service ? (
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-muted">{copy.summary.total}</dt>
                  <dd className="font-display text-base tracking-normal text-brass">
                    {formatCurrency(Number(service.price), locale)}
                  </dd>
                </div>
              ) : null}
            </dl>
            {!canConfirm ? (
              <p className="mt-1 text-xs text-foreground-muted" aria-live="polite">
                {nextHint}
              </p>
            ) : null}
            {submitError ? (
              <Alert className="mt-1.5 md:max-w-md">{submitError}</Alert>
            ) : null}
          </div>

          <Button
            type="button"
            onClick={submit}
            disabled={!canConfirm}
            variant="book"
            arrow
            className="booking-confirm-cta w-full shrink-0 sm:w-auto"
            aria-describedby={!canConfirm ? "booking-next-hint" : undefined}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                <span>{copy.submitting}</span>
              </>
            ) : (
              <>
                <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden />
                <span>{copy.confirm}</span>
              </>
            )}
          </Button>
          {!canConfirm ? (
            <span id="booking-next-hint" className="sr-only">
              {nextHint}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LockedHint({ message }: { message: string }) {
  return (
    <div className="time-slot-panel time-slot-panel--hint" role="status">
      <Lock className="h-4 w-4 text-muted" aria-hidden />
      <p className="text-xs text-body">{message}</p>
    </div>
  );
}

function StepHeader({
  step,
  title,
  lead,
  done,
  active,
  locked = false,
  headingId,
}: {
  step: number;
  title: string;
  lead: string;
  done: boolean;
  active: boolean;
  locked?: boolean;
  headingId?: string;
}) {
  const id =
    headingId ??
    (step === 1
      ? "book-step-service"
      : step === 2
        ? "book-step-date"
        : step === 3
          ? "book-step-time"
          : "book-step-details");

  return (
    <header className="flex flex-col gap-0.5 border-b border-border pb-2">
      <div className="flex items-center gap-2">
        <span
          className="step-badge !h-5 !w-5 !text-[10px]"
          data-active={active || done ? "true" : "false"}
          data-done={done ? "true" : "false"}
        >
          {done ? (
            <Check className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
          ) : locked ? (
            <Lock className="h-2.5 w-2.5" aria-hidden />
          ) : (
            step
          )}
        </span>
        <h2
          id={id}
          className={`text-[10px] font-bold tracking-[0.18em] uppercase ${
            active || done ? "text-foreground" : "text-muted"
          }`}
        >
          {title}
        </h2>
      </div>
      <p className="text-xs text-body">{lead}</p>
    </header>
  );
}
