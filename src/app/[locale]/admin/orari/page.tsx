import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import {
  listAdminBlockedDates,
  listAdminBreaks,
  listAdminHours,
  listAdminSpecialHours,
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
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { requestLocale } from "@/i18n/request-locale";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return urlLocaleParams;
}

const DAYS: Record<number, { it: string; en: string }> = {
  1: { it: "Lunedì", en: "Monday" },
  2: { it: "Martedì", en: "Tuesday" },
  3: { it: "Mercoledì", en: "Wednesday" },
  4: { it: "Giovedì", en: "Thursday" },
  5: { it: "Venerdì", en: "Friday" },
  6: { it: "Sabato", en: "Saturday" },
  7: { it: "Domenica", en: "Sunday" },
};

function formatAdminDate(dateISO: string, locale: "it" | "en") {
  return new Date(dateISO + "T12:00:00").toLocaleDateString(
    locale === "it" ? "it-IT" : "en-GB",
    { weekday: "short", day: "numeric", month: "short", year: "numeric" },
  );
}

function breakScopeLabel(
  locale: "it" | "en",
  copy: { breakDayAll: string },
  dayOfWeek: number | null,
  date: string | null,
) {
  if (date) return formatAdminDate(date, locale);
  if (dayOfWeek == null) return copy.breakDayAll;
  return DAYS[dayOfWeek]?.[locale] ?? String(dayOfWeek);
}

export default async function AdminHoursPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const flash = await searchParams;
  const t = getDictionary(locale);
  const copy = t.pages.admin.hours;

  const [hours, blocked, breaks, special] = await Promise.all([
    listAdminHours(),
    listAdminBlockedDates(),
    listAdminBreaks(),
    listAdminSpecialHours(),
  ]);
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

  const flashMessage =
    flash.ok === "1"
      ? copy.flashSaved
      : flash.err === "invalid_times"
        ? copy.flashInvalidTimes
        : flash.err === "invalid_date"
          ? copy.flashInvalidDate
          : null;
  const flashTone = flash.ok === "1" ? "ok" : flashMessage ? "err" : null;

  const breakCopy = {
    breakDay: copy.breakDay,
    breakDayAll: copy.breakDayAll,
    breakDayCustom: copy.breakDayCustom,
    breakDate: copy.breakDate,
  };

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      {flashMessage && flashTone ? (
        <p
          role="status"
          className={
            flashTone === "ok"
              ? "admin-hours-flash admin-hours-flash--ok"
              : "admin-hours-flash admin-hours-flash--err"
          }
        >
          {flashMessage}
        </p>
      ) : null}

      <div className="admin-hours-layout">
        {/* —— Weekly hours —— */}
        <section className="admin-hours-block admin-hours-block--weekly">
          <header className="admin-hours-block-head">
            <h2 className="admin-hours-block-title">{copy.saveHours}</h2>
            <p className="admin-hours-block-lead">
              {locale === "it"
                ? "Orario ricorrente di apertura."
                : "Recurring open hours."}
            </p>
          </header>

          <form action={saveHours} className="admin-hours-weekly">
            <input type="hidden" name="locale" value={locale} />
            <div className="admin-hours-card">
              <div className="admin-hours-weekly-head" aria-hidden>
                <span />
                <span>{copy.open}</span>
                <span>{copy.close}</span>
                <span>{copy.closed}</span>
              </div>
              <ul className="admin-hours-weekly-list">
                {Object.entries(DAYS).map(([dowStr, name]) => {
                  const dow = Number(dowStr);
                  const row = byDay.get(dow);
                  const closed = row?.is_closed ?? false;
                  const open = row?.open_time?.slice(0, 5) ?? "08:30";
                  const close = row?.close_time?.slice(0, 5) ?? "21:00";
                  return (
                    <li key={dow} className="admin-hours-weekly-row">
                      <span className="admin-hours-weekly-day">{name[locale]}</span>
                      <label className="admin-hours-weekly-time">
                        <span className="sr-only">{copy.open}</span>
                        <input
                          type="time"
                          name={`hours[${dow}][open]`}
                          defaultValue={open}
                          className="admin-field"
                        />
                      </label>
                      <label className="admin-hours-weekly-time">
                        <span className="sr-only">{copy.close}</span>
                        <input
                          type="time"
                          name={`hours[${dow}][close]`}
                          defaultValue={close}
                          className="admin-field"
                        />
                      </label>
                      <label className="admin-hours-weekly-closed">
                        <input
                          type="checkbox"
                          name={`hours[${dow}][closed]`}
                          defaultChecked={closed}
                          className="h-4 w-4 accent-brass"
                        />
                        <span className="admin-hours-weekly-closed-label">{copy.closed}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
            <button type="submit" className="admin-btn admin-btn-primary w-fit !min-h-9 !px-4 text-[10px]">
              {copy.saveHours}
            </button>
          </form>
        </section>

        {/* —— Breaks —— */}
        <section className="admin-hours-block">
          <header className="admin-hours-block-head">
            <h2 className="admin-hours-block-title">{copy.breaksTitle}</h2>
            <p className="admin-hours-block-lead">{copy.breaksLead}</p>
          </header>

          <div className="admin-hours-card">
            <form action={addBreak} className="admin-hours-composer">
              <input type="hidden" name="locale" value={locale} />
              <BreakDayFields locale={locale} copy={breakCopy} compact />
              <label className="admin-hours-field">
                <span className="admin-hours-field-label">{copy.breakStart}</span>
                <input
                  type="time"
                  name="start_time"
                  required
                  defaultValue="13:00"
                  className="admin-field"
                />
              </label>
              <label className="admin-hours-field">
                <span className="admin-hours-field-label">{copy.breakEnd}</span>
                <input
                  type="time"
                  name="end_time"
                  required
                  defaultValue="14:00"
                  className="admin-field"
                />
              </label>
              <label className="admin-hours-field admin-hours-field--grow">
                <span className="admin-hours-field-label">{copy.breakLabel}</span>
                <input
                  type="text"
                  name="label"
                  placeholder={copy.breakLabelPlaceholder}
                  className="admin-field"
                />
              </label>
              <button type="submit" className="admin-btn admin-btn-brass !min-h-9 !px-4 text-[10px]">
                {copy.addBreak}
              </button>
            </form>

            {breaks.length === 0 ? (
              <p className="admin-hours-empty">{copy.breaksEmpty}</p>
            ) : (
              <ul className="admin-hours-entries">
                {breaks.map((b) => (
                  <li key={b.id} className="admin-hours-entry">
                    <div className="admin-hours-entry-main">
                      <div className="admin-hours-entry-summary">
                        <span className="admin-hours-entry-title">
                          {breakScopeLabel(locale, copy, b.day_of_week, b.date)}
                        </span>
                        <span className="admin-hours-entry-meta">
                          {b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}
                          {b.label ? ` · ${b.label}` : ""}
                        </span>
                      </div>
                      <form action={removeBreak}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={b.id} />
                        <button
                          type="submit"
                          className="admin-btn admin-btn-ghost !min-h-8 !px-3 text-[10px]"
                        >
                          {copy.remove}
                        </button>
                      </form>
                    </div>
                    <details className="admin-hours-entry-edit">
                      <summary>{locale === "it" ? "Modifica" : "Edit"}</summary>
                      <form
                        action={updateBreak}
                        className="admin-hours-composer admin-hours-composer--nested"
                      >
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={b.id} />
                        <BreakDayFields
                          locale={locale}
                          copy={breakCopy}
                          defaultDay={b.day_of_week}
                          defaultDate={b.date}
                          compact
                        />
                        <label className="admin-hours-field">
                          <span className="admin-hours-field-label">{copy.breakStart}</span>
                          <input
                            type="time"
                            name="start_time"
                            required
                            defaultValue={b.start_time.slice(0, 5)}
                            className="admin-field"
                          />
                        </label>
                        <label className="admin-hours-field">
                          <span className="admin-hours-field-label">{copy.breakEnd}</span>
                          <input
                            type="time"
                            name="end_time"
                            required
                            defaultValue={b.end_time.slice(0, 5)}
                            className="admin-field"
                          />
                        </label>
                        <label className="admin-hours-field admin-hours-field--grow">
                          <span className="admin-hours-field-label">{copy.breakLabel}</span>
                          <input
                            type="text"
                            name="label"
                            defaultValue={b.label ?? ""}
                            placeholder={copy.breakLabelPlaceholder}
                            className="admin-field"
                          />
                        </label>
                        <button
                          type="submit"
                          className="admin-btn admin-btn-primary !min-h-9 !px-4 text-[10px]"
                        >
                          {copy.saveBreak}
                        </button>
                      </form>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* —— Special hours —— */}
        <section className="admin-hours-block">
          <header className="admin-hours-block-head">
            <h2 className="admin-hours-block-title">{copy.specialTitle}</h2>
            <p className="admin-hours-block-lead">{copy.specialLead}</p>
          </header>

          <div className="admin-hours-card">
            <form action={upsertSpecialHours} className="admin-hours-composer">
              <input type="hidden" name="locale" value={locale} />
              <label className="admin-hours-field">
                <span className="admin-hours-field-label">{copy.date}</span>
                <input type="date" name="date" required className="admin-field" />
              </label>
              <label className="admin-hours-field">
                <span className="admin-hours-field-label">{copy.specialOpen}</span>
                <input
                  type="time"
                  name="open_time"
                  defaultValue="08:30"
                  className="admin-field"
                />
              </label>
              <label className="admin-hours-field">
                <span className="admin-hours-field-label">{copy.specialClose}</span>
                <input
                  type="time"
                  name="close_time"
                  defaultValue="14:00"
                  className="admin-field"
                />
              </label>
              <label className="admin-hours-field admin-hours-field--grow">
                <span className="admin-hours-field-label">{copy.specialLabel}</span>
                <input
                  type="text"
                  name="label"
                  placeholder={copy.specialLabelPlaceholder}
                  className="admin-field"
                />
              </label>
              <label className="admin-hours-check">
                <input type="checkbox" name="closed" className="h-4 w-4 accent-brass" />
                <span>{copy.specialClosed}</span>
              </label>
              <button type="submit" className="admin-btn admin-btn-primary !min-h-9 !px-4 text-[10px]">
                {copy.addSpecial}
              </button>
            </form>

            {special.length === 0 ? (
              <p className="admin-hours-empty">{copy.specialEmpty}</p>
            ) : (
              <ul className="admin-hours-entries">
                {special.map((row) => (
                  <li key={row.id} className="admin-hours-entry">
                    <div className="admin-hours-entry-main">
                      <div className="admin-hours-entry-summary">
                        <span className="admin-hours-entry-title">
                          {formatAdminDate(row.date, locale)}
                        </span>
                        <span className="admin-hours-entry-meta">
                          {row.is_closed
                            ? copy.specialClosed
                            : `${row.open_time?.slice(0, 5) ?? "—"} – ${row.close_time?.slice(0, 5) ?? "—"}`}
                          {row.label ? ` · ${row.label}` : ""}
                        </span>
                      </div>
                      <form action={removeSpecialHours}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="admin-btn admin-btn-ghost !min-h-8 !px-3 text-[10px]"
                        >
                          {copy.remove}
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* —— Blocked dates —— */}
        <section className="admin-hours-block">
          <header className="admin-hours-block-head">
            <h2 className="admin-hours-block-title">{copy.blockedTitle}</h2>
            <p className="admin-hours-block-lead">{copy.blockedLead}</p>
          </header>

          <div className="admin-hours-card">
            <form action={addBlockedDate} className="admin-hours-composer">
              <input type="hidden" name="locale" value={locale} />
              <label className="admin-hours-field">
                <span className="admin-hours-field-label">{copy.date}</span>
                <input type="date" name="date" required className="admin-field" />
              </label>
              <label className="admin-hours-field admin-hours-field--grow">
                <span className="admin-hours-field-label">{copy.reason}</span>
                <input
                  type="text"
                  name="reason"
                  placeholder={copy.reasonPlaceholder}
                  className="admin-field"
                />
              </label>
              <button type="submit" className="admin-btn admin-btn-primary !min-h-9 !px-4 text-[10px]">
                {copy.addBlocked}
              </button>
            </form>

            {blocked.length === 0 ? (
              <p className="admin-hours-empty">{copy.blockedEmpty}</p>
            ) : (
              <ul className="admin-hours-entries">
                {blocked.map((b) => (
                  <li key={b.id} className="admin-hours-entry">
                    <div className="admin-hours-entry-main">
                      <div className="admin-hours-entry-summary">
                        <span className="admin-hours-entry-title">
                          {formatAdminDate(b.date, locale)}
                        </span>
                        {b.reason ? (
                          <span className="admin-hours-entry-meta">{b.reason}</span>
                        ) : null}
                      </div>
                      <form action={removeBlockedDate}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={b.id} />
                        <button
                          type="submit"
                          className="admin-btn admin-btn-ghost !min-h-8 !px-3 text-[10px]"
                        >
                          {copy.remove}
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </AdminSection>
  );
}
