"use client";

import { useState } from "react";

const DAYS: Record<number, { it: string; en: string }> = {
  1: { it: "Lunedì", en: "Monday" },
  2: { it: "Martedì", en: "Tuesday" },
  3: { it: "Mercoledì", en: "Wednesday" },
  4: { it: "Giovedì", en: "Thursday" },
  5: { it: "Venerdì", en: "Friday" },
  6: { it: "Sabato", en: "Saturday" },
  7: { it: "Domenica", en: "Sunday" },
};

export type BreakDayFieldsCopy = {
  breakDay: string;
  breakDayAll: string;
  breakDayCustom: string;
  breakDate: string;
};

type Props = {
  locale: "it" | "en";
  copy: BreakDayFieldsCopy;
  /** Recurring weekday, "all", or omit when using `date`. */
  defaultDay?: number | null;
  /** One-off date (YYYY-MM-DD). */
  defaultDate?: string | null;
  compact?: boolean;
};

export function BreakDayFields({
  locale,
  copy,
  defaultDay = null,
  defaultDate = null,
  compact = false,
}: Props) {
  const initialMode = defaultDate
    ? "custom"
    : defaultDay == null
      ? "all"
      : String(defaultDay);
  const [mode, setMode] = useState(initialMode);
  const labelClass = compact ? "admin-hours-field-label" : "text-caption";
  const fieldClass = compact ? "admin-hours-field" : "flex flex-col gap-1";

  return (
    <>
      <label className={fieldClass}>
        <span className={labelClass}>{copy.breakDay}</span>
        <select
          name="day_of_week"
          className="admin-field"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="all">{copy.breakDayAll}</option>
          <option value="custom">{copy.breakDayCustom}</option>
          {Object.entries(DAYS).map(([dow, name]) => (
            <option key={dow} value={dow}>
              {name[locale]}
            </option>
          ))}
        </select>
      </label>
      {mode === "custom" ? (
        <label className={fieldClass}>
          <span className={labelClass}>{copy.breakDate}</span>
          <input
            type="date"
            name="date"
            required
            defaultValue={defaultDate ?? ""}
            className="admin-field"
          />
        </label>
      ) : null}
    </>
  );
}
