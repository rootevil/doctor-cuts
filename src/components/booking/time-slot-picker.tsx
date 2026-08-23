"use client";

import { useMemo } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { CalendarClock, Clock, Loader2, Moon, Sun, Sunrise } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { Alert } from "@/components/ui/alert";

export type TimeSlotCopy = {
  loading: string;
  empty: string;
  pickDateFirst: string;
  pickSlot: string;
  selectedLead: string;
  groups: { morning: string; afternoon: string; evening: string };
  slotsAvailable: string;
  selected: string;
  timezoneNote: string;
};

type Props = {
  locale: Locale;
  timezone: string;
  dateISO: string | null;
  slots: string[];
  value: string | null;
  loading: boolean;
  error: string | null;
  onChange: (iso: string) => void;
  copy: TimeSlotCopy;
};

type SlotGroup = "morning" | "afternoon" | "evening";

const GROUP_META: Record<
  SlotGroup,
  { icon: typeof Sunrise; range: string }
> = {
  morning: { icon: Sunrise, range: "08:30 – 12:00" },
  afternoon: { icon: Sun, range: "12:00 – 17:00" },
  evening: { icon: Moon, range: "17:00 – 21:00" },
};

function slotGroup(iso: string, timezone: string): SlotGroup {
  const hour = Number(formatInTimeZone(new Date(iso), timezone, "H"));
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function formatBookingDate(iso: string, locale: Locale, timezone: string) {
  return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timezone,
  }).format(new Date(`${iso}T12:00:00Z`));
}

function LoadingSkeleton() {
  return (
    <div className="time-slot-skeleton-grid" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="time-slot-skeleton" />
      ))}
    </div>
  );
}

export function TimeSlotPicker({
  locale,
  timezone,
  dateISO,
  slots,
  value,
  loading,
  error,
  onChange,
  copy,
}: Props) {
  const grouped = useMemo(() => {
    const map: Record<SlotGroup, string[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    for (const iso of slots) {
      map[slotGroup(iso, timezone)].push(iso);
    }
    return map;
  }, [slots, timezone]);

  const timeLabel = (iso: string) => formatInTimeZone(new Date(iso), timezone, "HH:mm");
  const selectedTime = value ? timeLabel(value) : null;
  const dateHeading =
    dateISO && !loading ? formatBookingDate(dateISO, locale, timezone) : null;

  if (!dateISO) {
    return (
      <div className="time-slot-panel time-slot-panel--hint">
        <Clock className="h-8 w-8 text-brass-muted" aria-hidden />
        <p className="text-sm text-body">{copy.pickDateFirst}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="time-slot-panel" role="status" aria-live="polite">
        <div className="time-slot-panel-head">
          <p className="time-slot-date capitalize">{dateHeading}</p>
          <span className="time-slot-badge time-slot-badge--loading">
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
            {copy.loading}
          </span>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="time-slot-panel">
        {dateHeading ? (
          <div className="time-slot-panel-head">
            <p className="time-slot-date capitalize">{dateHeading}</p>
          </div>
        ) : null}
        <Alert>{error}</Alert>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="time-slot-panel time-slot-panel--hint" role="status">
        <CalendarClock className="h-8 w-8 text-muted" aria-hidden />
        <div className="flex flex-col gap-1 text-center">
          <p className="text-sm text-foreground">{copy.empty}</p>
          {dateHeading ? (
            <p className="text-label capitalize">
              {dateHeading}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  const groupOrder: SlotGroup[] = ["morning", "afternoon", "evening"];

  return (
    <div className="time-slot-panel">
      <div className="time-slot-panel-head">
        <div className="min-w-0 flex-1">
          <p className="time-slot-date capitalize">{dateHeading}</p>
          <p className="mt-1 text-caption uppercase">
            {copy.timezoneNote}
          </p>
        </div>
        <span className="time-slot-badge" role="status">
          {copy.slotsAvailable.replace("{count}", String(slots.length))}
        </span>
      </div>

      {selectedTime ? (
        <div className="time-slot-selected" role="status" aria-live="polite">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] tracking-[0.24em] text-brass-muted uppercase">
              {copy.selectedLead}
            </p>
            <p className="time-slot-selected-clock">{selectedTime}</p>
          </div>
          <p className="text-label uppercase">
            {copy.selected.replace("{time}", selectedTime)}
          </p>
        </div>
      ) : (
        <p className="time-slot-pick-hint">{copy.pickSlot}</p>
      )}

      <div className="time-slot-scroll">
        {groupOrder.map((key) => {
          const list = grouped[key];
          if (list.length === 0) return null;
          const { icon: Icon, range } = GROUP_META[key];
          return (
            <section key={key} className="time-slot-group" aria-labelledby={`slot-group-${key}`}>
              <div className="time-slot-group-head">
                <Icon className="h-3.5 w-3.5 text-brass" aria-hidden />
                <h4 id={`slot-group-${key}`} className="time-slot-group-title">
                  {copy.groups[key]}
                </h4>
                <span className="time-slot-group-range">{range}</span>
                <span className="time-slot-group-count">{list.length}</span>
              </div>
              <div className="time-slot-grid" role="group" aria-label={copy.groups[key]}>
                {list.map((iso) => {
                  const selected = iso === value;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => onChange(iso)}
                      aria-pressed={selected}
                      aria-label={`${timeLabel(iso)}${selected ? `, ${copy.selected.replace("{time}", timeLabel(iso))}` : ""}`}
                      className={`time-slot-btn ${selected ? "time-slot-btn--selected" : ""}`}
                    >
                      <span className="time-slot-btn-time">{timeLabel(iso)}</span>
                      {selected ? (
                        <span className="time-slot-btn-check" aria-hidden>
                          ✓
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
