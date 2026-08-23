"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import {
  buildMonthGrid,
  monthContainsSelectableDay,
  monthStartISO,
  parseViewMonth,
  shiftMonth,
} from "@/lib/booking/calendar-grid";
import { shiftDate, shopToday } from "@/lib/booking/timezone";

export type CalendarCopy = {
  prevMonth: string;
  nextMonth: string;
  today: string;
  weekdays: readonly [string, string, string, string, string, string, string];
  gridLabel: string;
};

type Props = {
  locale: Locale;
  timezone: string;
  maxDays: number;
  value: string | null;
  onChange: (iso: string) => void;
  copy: CalendarCopy;
};

/**
 * Month-grid date picker aligned with HCI guidelines:
 * - Recognition over recall (standard calendar layout, weekday headers)
 * - Visibility of system status (today ring, selected brass, disabled muted)
 * - Consistency (ISO week Mon–Sun, Europe/Rome)
 * - Error prevention (past / out-of-window dates not selectable)
 * - Keyboard support (arrows, Home/End, Enter/Space)
 * - Fitts's law (44px min touch targets)
 */
export function BookingCalendar({
  locale,
  timezone,
  maxDays,
  value,
  onChange,
  copy,
}: Props) {
  const liveId = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  const todayISO = useMemo(() => shopToday(), []);
  const minISO = todayISO;
  const maxISO = useMemo(() => shiftDate(todayISO, maxDays - 1), [todayISO, maxDays]);

  const initialView = value ?? todayISO;
  const [{ year, month }, setView] = useState(() => parseViewMonth(initialView));

  const [announcement, setAnnouncement] = useState("");

  const weeks = useMemo(
    () =>
      buildMonthGrid(year, month, {
        todayISO,
        minISO,
        maxISO,
        timezone,
      }),
    [year, month, todayISO, minISO, maxISO, timezone],
  );

  const flatSelectable = useMemo(
    () => weeks.flat().filter((c) => c.isSelectable),
    [weeks],
  );

  const monthTitle = useMemo(() => {
    const anchor = monthStartISO(year, month);
    return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
      month: "long",
      year: "numeric",
      timeZone: timezone,
    }).format(new Date(`${anchor}T12:00:00Z`));
  }, [year, month, timezone, locale]);

  const canPrev = monthContainsSelectableDay(
    shiftMonth(year, month, -1).year,
    shiftMonth(year, month, -1).month,
    minISO,
    maxISO,
  );
  const canNext = monthContainsSelectableDay(
    shiftMonth(year, month, 1).year,
    shiftMonth(year, month, 1).month,
    minISO,
    maxISO,
  );

  const goPrev = () => {
    if (!canPrev) return;
    const next = shiftMonth(year, month, -1);
    setView(next);
    setAnnouncement(
      new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
        month: "long",
        year: "numeric",
        timeZone: timezone,
      }).format(new Date(`${monthStartISO(next.year, next.month)}T12:00:00Z`)),
    );
  };

  const goNext = () => {
    if (!canNext) return;
    const next = shiftMonth(year, month, 1);
    setView(next);
    setAnnouncement(
      new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
        month: "long",
        year: "numeric",
        timeZone: timezone,
      }).format(new Date(`${monthStartISO(next.year, next.month)}T12:00:00Z`)),
    );
  };

  const selectDate = useCallback(
    (iso: string) => {
      const { year: y, month: m } = parseViewMonth(iso);
      setView({ year: y, month: m });
      onChange(iso);
    },
    [onChange],
  );

  const focusDate = useCallback(
    (iso: string) => {
      const btn = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`);
      btn?.focus();
    },
    [],
  );

  const moveSelection = useCallback(
    (iso: string, delta: number) => {
      const idx = flatSelectable.findIndex((c) => c.iso === iso);
      if (idx < 0) return;
      const next = flatSelectable[idx + delta];
      if (next) {
        selectDate(next.iso);
        requestAnimationFrame(() => focusDate(next.iso));
      }
    },
    [flatSelectable, selectDate, focusDate],
  );

  const onKeyDown = (event: React.KeyboardEvent, iso: string, selectable: boolean) => {
    if (!selectable) return;
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        moveSelection(iso, -1);
        break;
      case "ArrowRight":
        event.preventDefault();
        moveSelection(iso, 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveSelection(iso, -7);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveSelection(iso, 7);
        break;
      case "Home":
        event.preventDefault();
        if (flatSelectable[0]) selectDate(flatSelectable[0].iso);
        break;
      case "End":
        event.preventDefault();
        if (flatSelectable.at(-1)) selectDate(flatSelectable.at(-1)!.iso);
        break;
      default:
        break;
    }
  };

  return (
    <div className="booking-calendar">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label={copy.prevMonth}
          className="calendar-nav-btn"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        </button>
        <h3
          className="font-display text-base tracking-tight text-foreground capitalize md:text-lg"
          aria-live="polite"
        >
          {monthTitle}
        </h3>
        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          aria-label={copy.nextMonth}
          className="calendar-nav-btn"
        >
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <p id={liveId} className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div
        ref={gridRef}
        role="grid"
        aria-label={copy.gridLabel}
        className="grid grid-cols-7 gap-1"
      >
        {copy.weekdays.map((label) => (
          <div
            key={label}
            role="columnheader"
            className="calendar-weekday"
            aria-hidden={false}
          >
            {label}
          </div>
        ))}

        {weeks.flat().map((cell) => {
          const selected = value === cell.iso;
          const { iso, day, inMonth, isToday, isSelectable } = cell;

          if (!inMonth) {
            return (
              <div
                key={`pad-${iso}`}
                role="gridcell"
                aria-hidden
                className="calendar-day calendar-day--pad"
              />
            );
          }

          if (!isSelectable) {
            return (
              <div
                key={iso}
                role="gridcell"
                aria-disabled="true"
                className="calendar-day calendar-day--disabled"
              >
                <span className="calendar-day-num">{day}</span>
              </div>
            );
          }

          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              data-date={iso}
              tabIndex={selected || (!value && isToday) ? 0 : -1}
              aria-selected={selected}
              aria-current={isToday ? "date" : undefined}
              aria-label={
                isToday
                  ? `${copy.today}, ${formatDayLong(iso, timezone, locale)}`
                  : formatDayLong(iso, timezone, locale)
              }
              onClick={() => selectDate(iso)}
              onKeyDown={(e) => onKeyDown(e, iso, true)}
              className={`calendar-day calendar-day--selectable ${
                selected ? "calendar-day--selected" : ""
              } ${isToday ? "calendar-day--today" : ""}`}
            >
              <span className="calendar-day-num">{day}</span>
              {isToday ? (
                <span className="calendar-today-dot" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatDayLong(iso: string, timezone: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timezone,
  }).format(new Date(`${iso}T12:00:00Z`));
}
