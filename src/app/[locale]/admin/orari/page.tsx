import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import {
  listAdminBlockedDates,
  listAdminBreaks,
  listAdminHours,
} from "@/lib/admin/data";
import {
  addBlockedDate,
  addBreak,
  removeBlockedDate,
  removeBreak,
  saveHours,
} from "@/lib/admin/actions";
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

export default async function AdminHoursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const copy = t.pages.admin.hours;

  const [hours, blocked, breaks] = await Promise.all([
    listAdminHours(),
    listAdminBlockedDates(),
    listAdminBreaks(),
  ]);
  const byDay = new Map(hours.map((h) => [h.day_of_week, h]));

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      <form action={saveHours} className="flex flex-col gap-3">
        <input type="hidden" name="locale" value={locale} />
        {Object.entries(DAYS).map(([dowStr, name]) => {
          const dow = Number(dowStr);
          const row = byDay.get(dow);
          const closed = row?.is_closed ?? false;
          const open = row?.open_time?.slice(0, 5) ?? "08:30";
          const close = row?.close_time?.slice(0, 5) ?? "21:00";
          return (
            <div
              key={dow}
              className="admin-panel grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 md:grid-cols-[10rem_1fr_1fr_10rem]"
            >
              <span className="font-display text-lg">{name[locale]}</span>
              <label className="flex flex-col gap-1">
                <span className="text-caption">{copy.open}</span>
                <input
                  type="time"
                  name={`hours[${dow}][open]`}
                  defaultValue={open}
                  disabled={closed}
                  className="admin-field"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-caption">{copy.close}</span>
                <input
                  type="time"
                  name={`hours[${dow}][close]`}
                  defaultValue={close}
                  disabled={closed}
                  className="admin-field"
                />
              </label>
              <label className="flex items-center gap-2 text-[11px] tracking-[0.22em] text-foreground uppercase">
                <input
                  type="checkbox"
                  name={`hours[${dow}][closed]`}
                  defaultChecked={closed}
                  className="h-4 w-4 accent-brass"
                />
                {copy.closed}
              </label>
            </div>
          );
        })}
        <button type="submit" className="admin-btn admin-btn-primary w-fit">
          {copy.saveHours}
        </button>
      </form>

      <div className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-label text-accent-soft">{copy.breaksTitle}</h2>
        <p className="text-sm text-body">{copy.breaksLead}</p>

        <form action={addBreak} className="admin-panel grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_1.2fr_auto] md:items-end">
          <input type="hidden" name="locale" value={locale} />
          <label className="flex flex-col gap-1">
            <span className="text-caption">{copy.breakDay}</span>
            <select name="day_of_week" className="admin-field" defaultValue="all">
              <option value="all">{copy.breakDayAll}</option>
              {Object.entries(DAYS).map(([dow, name]) => (
                <option key={dow} value={dow}>
                  {name[locale]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-caption">{copy.breakStart}</span>
            <input type="time" name="start_time" required defaultValue="13:00" className="admin-field" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-caption">{copy.breakEnd}</span>
            <input type="time" name="end_time" required defaultValue="14:00" className="admin-field" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-caption">{copy.breakLabel}</span>
            <input
              type="text"
              name="label"
              placeholder={copy.breakLabelPlaceholder}
              className="admin-field"
            />
          </label>
          <button type="submit" className="admin-btn admin-btn-brass">
            {copy.addBreak}
          </button>
        </form>

        {breaks.length === 0 ? (
          <p className="text-sm text-body">{copy.breaksEmpty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {breaks.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <span className="font-display text-lg">
                    {b.day_of_week == null
                      ? copy.breakDayAll
                      : DAYS[b.day_of_week]?.[locale] ?? b.day_of_week}{" "}
                    · {b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}
                  </span>
                  {b.label ? <p className="text-xs text-muted">{b.label}</p> : null}
                </div>
                <form action={removeBreak}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="admin-btn admin-btn-ghost !min-h-9">
                    {copy.remove}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-label text-accent-soft">{copy.blockedTitle}</h2>
        <p className="text-sm text-body">{copy.blockedLead}</p>

        <form action={addBlockedDate} className="flex flex-col gap-3 md:flex-row md:items-end">
          <input type="hidden" name="locale" value={locale} />
          <label className="flex flex-col gap-1">
            <span className="text-caption">{copy.date}</span>
            <input type="date" name="date" required className="admin-field" />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-caption">{copy.reason}</span>
            <input
              type="text"
              name="reason"
              placeholder={copy.reasonPlaceholder}
              className="admin-field"
            />
          </label>
          <button type="submit" className="admin-btn admin-btn-primary">
            {copy.addBlocked}
          </button>
        </form>

        {blocked.length === 0 ? (
          <p className="text-sm text-body">{copy.blockedEmpty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {blocked.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="font-display text-lg">
                    {new Date(b.date + "T12:00:00").toLocaleDateString(
                      locale === "it" ? "it-IT" : "en-GB",
                      { weekday: "long", day: "numeric", month: "long", year: "numeric" },
                    )}
                  </span>
                  {b.reason ? <p className="text-xs text-muted">{b.reason}</p> : null}
                </div>
                <form action={removeBlockedDate}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="admin-btn admin-btn-ghost !min-h-9">
                    {copy.remove}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminSection>
  );
}
