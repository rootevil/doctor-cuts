"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { useFormStatus } from "react-dom";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type {
  AdminBlockedDate,
  AdminBreak,
  AdminBusinessHour,
  AdminSpecialHours,
} from "@/lib/admin/data";
import {
  addBlockedDate,
  addBreak,
  removeBlockedDate,
  removeBreak,
  removeSpecialHours,
  saveHours,
  updateBreak,
  upsertSpecialHours,
} from "@/lib/admin/actions";
import { BreakDayFields } from "@/components/admin/break-day-fields";

const DAYS: Record<number, { it: string; en: string; shortIt: string; shortEn: string }> = {
  1: { it: "Lunedì", en: "Monday", shortIt: "Lun", shortEn: "Mon" },
  2: { it: "Martedì", en: "Tuesday", shortIt: "Mar", shortEn: "Tue" },
  3: { it: "Mercoledì", en: "Wednesday", shortIt: "Mer", shortEn: "Wed" },
  4: { it: "Giovedì", en: "Thursday", shortIt: "Gio", shortEn: "Thu" },
  5: { it: "Venerdì", en: "Friday", shortIt: "Ven", shortEn: "Fri" },
  6: { it: "Sabato", en: "Saturday", shortIt: "Sab", shortEn: "Sat" },
  7: { it: "Domenica", en: "Sunday", shortIt: "Dom", shortEn: "Sun" },
};

const TAB_ORDER: HoursTab[] = ["weekly", "breaks", "special", "blocked"];

/** Visual day window for the open-hours bar (shop typically 06:00–22:00). */
const BAR_START_MIN = 6 * 60;
const BAR_END_MIN = 22 * 60;

export type HoursTab = "weekly" | "breaks" | "special" | "blocked";

type HoursCopy = Dictionary["pages"]["admin"]["hours"];

type Props = {
  locale: Locale;
  copy: HoursCopy;
  initialTab: HoursTab;
  flash: { tone: "ok" | "err"; message: string } | null;
  hours: AdminBusinessHour[];
  breaks: AdminBreak[];
  special: AdminSpecialHours[];
  blocked: AdminBlockedDate[];
};

function formatAdminDate(dateISO: string, locale: Locale) {
  return new Date(dateISO + "T12:00:00").toLocaleDateString(
    locale === "it" ? "it-IT" : "en-GB",
    { weekday: "short", day: "numeric", month: "short" },
  );
}

function timeToMinutes(t: string) {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function openBarStyle(open: string, close: string) {
  const span = BAR_END_MIN - BAR_START_MIN;
  const start = Math.max(0, Math.min(span, timeToMinutes(open) - BAR_START_MIN));
  const end = Math.max(start + 4, Math.min(span, timeToMinutes(close) - BAR_START_MIN));
  return {
    left: `${(start / span) * 100}%`,
    width: `${((end - start) / span) * 100}%`,
  };
}

function breakScopeLabel(
  locale: Locale,
  copy: HoursCopy,
  dayOfWeek: number | null,
  date: string | null,
) {
  if (date) return formatAdminDate(date, locale);
  if (dayOfWeek == null) return copy.breakDayAll;
  return DAYS[dayOfWeek]?.[locale] ?? String(dayOfWeek);
}

function TabHidden({ tab }: { tab: HoursTab }) {
  return <input type="hidden" name="tab" value={tab} />;
}

function SaveButton({
  label,
  pendingLabel,
  className = "hours-cta",
}: {
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function PanelHeader({
  title,
  lead,
  stat,
}: {
  title: string;
  lead: string;
  stat?: string;
}) {
  return (
    <div className="hours-panel-intro">
      <div>
        <h2 className="hours-panel-title">{title}</h2>
        <p className="hours-panel-lead">{lead}</p>
      </div>
      {stat ? (
        <p className="hours-panel-stat" aria-live="polite">
          {stat}
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="hours-empty" role="status">
      <span className="hours-empty-mark" aria-hidden />
      <p>{message}</p>
    </div>
  );
}

function WeeklyEditor({
  locale,
  copy,
  hours,
}: {
  locale: Locale;
  copy: HoursCopy;
  hours: AdminBusinessHour[];
}) {
  const byDay = useMemo(() => new Map(hours.map((h) => [h.day_of_week, h])), [hours]);
  const [closed, setClosed] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    for (let d = 1; d <= 7; d++) {
      init[d] = byDay.get(d)?.is_closed ?? d === 7;
    }
    return init;
  });
  const [times, setTimes] = useState<Record<number, { open: string; close: string }>>(() => {
    const init: Record<number, { open: string; close: string }> = {};
    for (let d = 1; d <= 7; d++) {
      const row = byDay.get(d);
      init[d] = {
        open: row?.open_time?.slice(0, 5) ?? "08:30",
        close: row?.close_time?.slice(0, 5) ?? "21:00",
      };
    }
    return init;
  });

  const openCount = Object.values(closed).filter((v) => !v).length;
  const closedCount = 7 - openCount;

  return (
    <form action={saveHours} className="hours-panel">
      <input type="hidden" name="locale" value={locale} />
      <TabHidden tab="weekly" />

      <PanelHeader
        title={copy.weeklyTitle}
        lead={copy.weeklyLead}
        stat={copy.weeklyOpenCount
          .replace("{open}", String(openCount))
          .replace("{closed}", String(closedCount))}
      />

      <div className="hours-week" role="table" aria-label={copy.weeklyTitle}>
        <div className="hours-week-head" role="row">
          <span role="columnheader">{locale === "it" ? "Giorno" : "Day"}</span>
          <span role="columnheader">{copy.open}</span>
          <span role="columnheader">{copy.close}</span>
          <span role="columnheader" className="hours-week-head-status">
            {copy.closed}
          </span>
        </div>
        <ul className="hours-week-list" role="rowgroup">
          {Object.entries(DAYS).map(([dowStr, name]) => {
            const dow = Number(dowStr);
            const isClosed = closed[dow] ?? false;
            const open = times[dow]?.open ?? "08:30";
            const close = times[dow]?.close ?? "21:00";
            const short = locale === "it" ? name.shortIt : name.shortEn;
            return (
              <li
                key={dow}
                role="row"
                className={`hours-week-row ${isClosed ? "is-closed" : "is-open"}`}
              >
                <div className="hours-week-day" role="cell">
                  <span className="hours-week-day-full">{name[locale]}</span>
                  <span className="hours-week-day-short" aria-hidden>
                    {short}
                  </span>
                  <span
                    className="hours-week-bar"
                    aria-hidden
                    data-closed={isClosed ? "1" : "0"}
                  >
                    {!isClosed ? (
                      <span
                        className="hours-week-bar-fill"
                        style={openBarStyle(open, close)}
                      />
                    ) : null}
                  </span>
                </div>

                <div className="hours-week-times" role="cell">
                  {isClosed ? (
                    <span className="hours-week-closed-badge">{copy.closedShort}</span>
                  ) : (
                    <>
                      <label className="hours-week-time">
                        <span className="sr-only">{copy.open}</span>
                        <input
                          type="time"
                          name={`hours[${dow}][open]`}
                          value={open}
                          onChange={(e) =>
                            setTimes((prev) => ({
                              ...prev,
                              [dow]: { ...prev[dow], open: e.target.value },
                            }))
                          }
                          className="admin-field"
                          required
                        />
                      </label>
                      <span className="hours-week-sep" aria-hidden>
                        –
                      </span>
                      <label className="hours-week-time">
                        <span className="sr-only">{copy.close}</span>
                        <input
                          type="time"
                          name={`hours[${dow}][close]`}
                          value={close}
                          onChange={(e) =>
                            setTimes((prev) => ({
                              ...prev,
                              [dow]: { ...prev[dow], close: e.target.value },
                            }))
                          }
                          className="admin-field"
                          required
                        />
                      </label>
                    </>
                  )}
                  {isClosed ? (
                    <>
                      <input type="hidden" name={`hours[${dow}][open]`} value={open} />
                      <input type="hidden" name={`hours[${dow}][close]`} value={close} />
                    </>
                  ) : null}
                </div>

                <label className="hours-week-toggle" role="cell">
                  <span className="sr-only">
                    {name[locale]} — {copy.closed}
                  </span>
                  <input
                    type="checkbox"
                    name={`hours[${dow}][closed]`}
                    checked={isClosed}
                    onChange={(e) =>
                      setClosed((prev) => ({ ...prev, [dow]: e.target.checked }))
                    }
                    className="hours-toggle-input"
                  />
                  <span className="hours-toggle-track" aria-hidden>
                    <span className="hours-toggle-thumb" />
                  </span>
                  <span className="hours-week-toggle-label">
                    {isClosed ? copy.closedShort : copy.openShort}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="hours-panel-footer">
        <p className="hours-hint">{copy.weeklyHint}</p>
        <SaveButton label={copy.saveHours} pendingLabel={copy.saving} />
      </div>
    </form>
  );
}

function BreaksPanel({
  locale,
  copy,
  breaks,
}: {
  locale: Locale;
  copy: HoursCopy;
  breaks: AdminBreak[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const breakCopy = {
    breakDay: copy.breakDay,
    breakDayAll: copy.breakDayAll,
    breakDayCustom: copy.breakDayCustom,
    breakDate: copy.breakDate,
  };

  const sorted = useMemo(() => {
    return [...breaks].sort((a, b) => {
      if (a.date && b.date) return a.date.localeCompare(b.date);
      if (a.date) return 1;
      if (b.date) return -1;
      const da = a.day_of_week ?? -1;
      const db = b.day_of_week ?? -1;
      if (da !== db) return da - db;
      return a.start_time.localeCompare(b.start_time);
    });
  }, [breaks]);

  return (
    <div className="hours-panel">
      <PanelHeader title={copy.breaksTitle} lead={copy.breaksLead} />

      <section className="hours-zone" aria-labelledby="hours-breaks-add">
        <h3 id="hours-breaks-add" className="hours-zone-title">
          {copy.addSection}
        </h3>
        <form action={addBreak} className="hours-composer">
          <input type="hidden" name="locale" value={locale} />
          <TabHidden tab="breaks" />
          <BreakDayFields locale={locale} copy={breakCopy} compact />
          <label className="hours-field">
            <span className="hours-field-label">{copy.breakStart}</span>
            <input type="time" name="start_time" required defaultValue="14:00" className="admin-field" />
          </label>
          <label className="hours-field">
            <span className="hours-field-label">{copy.breakEnd}</span>
            <input type="time" name="end_time" required defaultValue="16:00" className="admin-field" />
          </label>
          <label className="hours-field hours-field--grow">
            <span className="hours-field-label">{copy.breakLabel}</span>
            <input
              type="text"
              name="label"
              placeholder={copy.breakLabelPlaceholder}
              className="admin-field"
            />
          </label>
          <SaveButton label={copy.addBreak} pendingLabel={copy.saving} />
        </form>
      </section>

      <section className="hours-zone hours-zone--list" aria-labelledby="hours-breaks-list">
        <div className="hours-zone-head">
          <h3 id="hours-breaks-list" className="hours-zone-title">
            {copy.listSection}
          </h3>
          <span className="hours-zone-count">{sorted.length}</span>
        </div>

        {sorted.length === 0 ? (
          <EmptyState message={copy.breaksEmpty} />
        ) : (
          <ul className="hours-list">
            {sorted.map((b) => {
              const isEditing = editingId === b.id;
              return (
                <li key={b.id} className={`hours-item ${isEditing ? "is-editing" : ""}`}>
                  <div className="hours-item-main">
                    <div className="hours-item-text">
                      <span className="hours-item-title">
                        {breakScopeLabel(locale, copy, b.day_of_week, b.date)}
                      </span>
                      <span className="hours-item-meta">
                        <span className="hours-pill">
                          {b.start_time.slice(0, 5)}–{b.end_time.slice(0, 5)}
                        </span>
                        {b.label ? <span>{b.label}</span> : null}
                        {b.date ? (
                          <span className="hours-chip">{copy.breakDayCustom}</span>
                        ) : b.day_of_week == null ? (
                          <span className="hours-chip">{copy.breakDayAll}</span>
                        ) : null}
                      </span>
                    </div>
                    <div className="hours-item-actions">
                      <button
                        type="button"
                        className="hours-ghost"
                        aria-expanded={isEditing}
                        onClick={() => setEditingId(isEditing ? null : b.id)}
                      >
                        {isEditing ? copy.cancelEdit : copy.edit}
                      </button>
                      <form action={removeBreak}>
                        <input type="hidden" name="locale" value={locale} />
                        <TabHidden tab="breaks" />
                        <input type="hidden" name="id" value={b.id} />
                        <button type="submit" className="hours-ghost hours-ghost--danger">
                          {copy.remove}
                        </button>
                      </form>
                    </div>
                  </div>
                  {isEditing ? (
                    <form action={updateBreak} className="hours-composer hours-composer--nested">
                      <input type="hidden" name="locale" value={locale} />
                      <TabHidden tab="breaks" />
                      <input type="hidden" name="id" value={b.id} />
                      <BreakDayFields
                        locale={locale}
                        copy={breakCopy}
                        defaultDay={b.day_of_week}
                        defaultDate={b.date}
                        compact
                      />
                      <label className="hours-field">
                        <span className="hours-field-label">{copy.breakStart}</span>
                        <input
                          type="time"
                          name="start_time"
                          required
                          defaultValue={b.start_time.slice(0, 5)}
                          className="admin-field"
                        />
                      </label>
                      <label className="hours-field">
                        <span className="hours-field-label">{copy.breakEnd}</span>
                        <input
                          type="time"
                          name="end_time"
                          required
                          defaultValue={b.end_time.slice(0, 5)}
                          className="admin-field"
                        />
                      </label>
                      <label className="hours-field hours-field--grow">
                        <span className="hours-field-label">{copy.breakLabel}</span>
                        <input
                          type="text"
                          name="label"
                          defaultValue={b.label ?? ""}
                          placeholder={copy.breakLabelPlaceholder}
                          className="admin-field"
                        />
                      </label>
                      <SaveButton label={copy.saveBreak} pendingLabel={copy.saving} />
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function SpecialPanel({
  locale,
  copy,
  special,
}: {
  locale: Locale;
  copy: HoursCopy;
  special: AdminSpecialHours[];
}) {
  const [closedAllDay, setClosedAllDay] = useState(false);
  const sorted = useMemo(
    () => [...special].sort((a, b) => a.date.localeCompare(b.date)),
    [special],
  );

  return (
    <div className="hours-panel">
      <PanelHeader title={copy.specialTitle} lead={copy.specialLead} />

      <section className="hours-zone" aria-labelledby="hours-special-add">
        <h3 id="hours-special-add" className="hours-zone-title">
          {copy.addSection}
        </h3>
        <form action={upsertSpecialHours} className="hours-composer hours-composer--special">
          <input type="hidden" name="locale" value={locale} />
          <TabHidden tab="special" />
          <label className="hours-field">
            <span className="hours-field-label">{copy.date}</span>
            <input type="date" name="date" required className="admin-field" />
          </label>
          <label className={`hours-field ${closedAllDay ? "is-disabled" : ""}`}>
            <span className="hours-field-label">{copy.specialOpen}</span>
            <input
              type="time"
              name="open_time"
              defaultValue="08:30"
              className="admin-field"
              disabled={closedAllDay}
              tabIndex={closedAllDay ? -1 : 0}
            />
          </label>
          <label className={`hours-field ${closedAllDay ? "is-disabled" : ""}`}>
            <span className="hours-field-label">{copy.specialClose}</span>
            <input
              type="time"
              name="close_time"
              defaultValue="14:00"
              className="admin-field"
              disabled={closedAllDay}
              tabIndex={closedAllDay ? -1 : 0}
            />
          </label>
          <label className="hours-field hours-field--grow">
            <span className="hours-field-label">{copy.specialLabel}</span>
            <input
              type="text"
              name="label"
              placeholder={copy.specialLabelPlaceholder}
              className="admin-field"
            />
          </label>
          <label className="hours-check">
            <input
              type="checkbox"
              name="closed"
              className="hours-switch"
              checked={closedAllDay}
              onChange={(e) => setClosedAllDay(e.target.checked)}
            />
            <span>{copy.specialClosed}</span>
          </label>
          <SaveButton label={copy.addSpecial} pendingLabel={copy.saving} />
        </form>
      </section>

      <section className="hours-zone hours-zone--list" aria-labelledby="hours-special-list">
        <div className="hours-zone-head">
          <h3 id="hours-special-list" className="hours-zone-title">
            {copy.listSection}
          </h3>
          <span className="hours-zone-count">{sorted.length}</span>
        </div>

        {sorted.length === 0 ? (
          <EmptyState message={copy.specialEmpty} />
        ) : (
          <ul className="hours-list">
            {sorted.map((row) => (
              <li key={row.id} className="hours-item">
                <div className="hours-item-main">
                  <div className="hours-item-text">
                    <span className="hours-item-title">
                      {formatAdminDate(row.date, locale)}
                    </span>
                    <span className="hours-item-meta">
                      <span className={`hours-pill ${row.is_closed ? "hours-pill--muted" : ""}`}>
                        {row.is_closed
                          ? copy.specialClosed
                          : `${row.open_time?.slice(0, 5) ?? "—"}–${row.close_time?.slice(0, 5) ?? "—"}`}
                      </span>
                      {row.label ? <span>{row.label}</span> : null}
                    </span>
                  </div>
                  <form action={removeSpecialHours}>
                    <input type="hidden" name="locale" value={locale} />
                    <TabHidden tab="special" />
                    <input type="hidden" name="id" value={row.id} />
                    <button type="submit" className="hours-ghost hours-ghost--danger">
                      {copy.remove}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function BlockedPanel({
  locale,
  copy,
  blocked,
}: {
  locale: Locale;
  copy: HoursCopy;
  blocked: AdminBlockedDate[];
}) {
  const sorted = useMemo(
    () => [...blocked].sort((a, b) => a.date.localeCompare(b.date)),
    [blocked],
  );

  return (
    <div className="hours-panel">
      <PanelHeader title={copy.blockedTitle} lead={copy.blockedLead} />

      <section className="hours-zone" aria-labelledby="hours-blocked-add">
        <h3 id="hours-blocked-add" className="hours-zone-title">
          {copy.addSection}
        </h3>
        <form action={addBlockedDate} className="hours-composer hours-composer--simple">
          <input type="hidden" name="locale" value={locale} />
          <TabHidden tab="blocked" />
          <label className="hours-field">
            <span className="hours-field-label">{copy.date}</span>
            <input type="date" name="date" required className="admin-field" />
          </label>
          <label className="hours-field hours-field--grow">
            <span className="hours-field-label">{copy.reason}</span>
            <input
              type="text"
              name="reason"
              placeholder={copy.reasonPlaceholder}
              className="admin-field"
            />
          </label>
          <SaveButton label={copy.addBlocked} pendingLabel={copy.saving} />
        </form>
      </section>

      <section className="hours-zone hours-zone--list" aria-labelledby="hours-blocked-list">
        <div className="hours-zone-head">
          <h3 id="hours-blocked-list" className="hours-zone-title">
            {copy.listSection}
          </h3>
          <span className="hours-zone-count">{sorted.length}</span>
        </div>

        {sorted.length === 0 ? (
          <EmptyState message={copy.blockedEmpty} />
        ) : (
          <ul className="hours-list">
            {sorted.map((b) => (
              <li key={b.id} className="hours-item">
                <div className="hours-item-main">
                  <div className="hours-item-text">
                    <span className="hours-item-title">
                      {formatAdminDate(b.date, locale)}
                    </span>
                    {b.reason ? (
                      <span className="hours-item-meta">{b.reason}</span>
                    ) : null}
                  </div>
                  <form action={removeBlockedDate}>
                    <input type="hidden" name="locale" value={locale} />
                    <TabHidden tab="blocked" />
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit" className="hours-ghost hours-ghost--danger">
                      {copy.remove}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function HoursWorkspace({
  locale,
  copy,
  initialTab,
  flash,
  hours,
  breaks,
  special,
  blocked,
}: Props) {
  const [tab, setTab] = useState<HoursTab>(initialTab);
  const [, startTransition] = useTransition();
  const tablistRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  const tabs: {
    id: HoursTab;
    label: string;
    hint: string;
    count: number;
  }[] = [
    {
      id: "weekly",
      label: copy.tabWeekly,
      hint: copy.tabWeeklyHint,
      count: hours.filter((h) => !h.is_closed).length,
    },
    { id: "breaks", label: copy.tabBreaks, hint: copy.tabBreaksHint, count: breaks.length },
    { id: "special", label: copy.tabSpecial, hint: copy.tabSpecialHint, count: special.length },
    { id: "blocked", label: copy.tabBlocked, hint: copy.tabBlockedHint, count: blocked.length },
  ];

  const selectTab = useCallback(
    (id: HoursTab) => {
      startTransition(() => setTab(id));
      const url = new URL(window.location.href);
      url.searchParams.set("tab", id);
      url.searchParams.delete("ok");
      url.searchParams.delete("err");
      window.history.replaceState(null, "", url.pathname + url.search);
    },
    [startTransition],
  );

  const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TAB_ORDER.indexOf(tab);
    if (i < 0) return;
    let next: HoursTab | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = TAB_ORDER[(i + 1) % TAB_ORDER.length];
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = TAB_ORDER[(i - 1 + TAB_ORDER.length) % TAB_ORDER.length];
    } else if (e.key === "Home") {
      next = TAB_ORDER[0];
    } else if (e.key === "End") {
      next = TAB_ORDER[TAB_ORDER.length - 1];
    }
    if (!next) return;
    e.preventDefault();
    selectTab(next);
    requestAnimationFrame(() => {
      tablistRef.current
        ?.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)
        ?.focus();
    });
  };

  return (
    <div className="hours-workspace">
      {flash ? (
        <p role="status" className={`hours-flash hours-flash--${flash.tone}`}>
          {flash.message}
        </p>
      ) : null}

      <div
        ref={tablistRef}
        className="hours-tabs"
        role="tablist"
        aria-label={copy.tabsLabel}
        onKeyDown={onTabKeyDown}
      >
        {tabs.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              data-tab={t.id}
              id={`${baseId}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              className={`hours-tab ${selected ? "is-active" : ""}`}
              onClick={() => selectTab(t.id)}
            >
              <span className="hours-tab-text">
                <span className="hours-tab-label">{t.label}</span>
                <span className="hours-tab-hint">{t.hint}</span>
              </span>
              <span className="hours-tab-count" aria-hidden>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${tab}`}
        className="hours-stage"
      >
        {tab === "weekly" ? (
          <WeeklyEditor locale={locale} copy={copy} hours={hours} />
        ) : null}
        {tab === "breaks" ? (
          <BreaksPanel locale={locale} copy={copy} breaks={breaks} />
        ) : null}
        {tab === "special" ? (
          <SpecialPanel locale={locale} copy={copy} special={special} />
        ) : null}
        {tab === "blocked" ? (
          <BlockedPanel locale={locale} copy={copy} blocked={blocked} />
        ) : null}
      </div>
    </div>
  );
}
