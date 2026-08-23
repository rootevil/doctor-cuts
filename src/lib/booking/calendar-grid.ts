import { formatInTimeZone } from "date-fns-tz";
import { shiftDate, shopDayOfWeek } from "@/lib/booking/timezone";

export type CalendarCell = {
  iso: string;
  day: number;
  /** False for leading/trailing padding days from adjacent months. */
  inMonth: boolean;
  isToday: boolean;
  isSelectable: boolean;
};

/** Build a ISO-week (Mon–Sun) month grid for HCI calendar display. */
export function buildMonthGrid(
  viewYear: number,
  viewMonth: number,
  opts: {
    todayISO: string;
    minISO: string;
    maxISO: string;
    timezone: string;
  },
): CalendarCell[][] {
  const prefix = `${viewYear}-${String(viewMonth).padStart(2, "0")}`;
  const firstISO = `${prefix}-01`;
  const padBefore = shopDayOfWeek(firstISO) - 1;

  const inMonthDays: string[] = [];
  let cursor = firstISO;
  while (cursor.startsWith(prefix)) {
    inMonthDays.push(cursor);
    cursor = shiftDate(cursor, 1);
  }

  const cells: CalendarCell[] = [];

  for (let i = 0; i < padBefore; i++) {
    const iso = shiftDate(firstISO, i - padBefore);
    cells.push(makeCell(iso, opts, false));
  }

  for (const iso of inMonthDays) {
    cells.push(makeCell(iso, opts, true));
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]!.iso;
    cells.push(makeCell(shiftDate(last, 1), opts, false));
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function makeCell(
  iso: string,
  opts: { todayISO: string; minISO: string; maxISO: string; timezone: string },
  inMonth: boolean,
): CalendarCell {
  const day = Number(formatInTimeZone(new Date(`${iso}T12:00:00Z`), opts.timezone, "d"));
  const isToday = iso === opts.todayISO;
  const isSelectable = inMonth && iso >= opts.minISO && iso <= opts.maxISO;
  return { iso, day, inMonth, isToday, isSelectable };
}

export function parseViewMonth(iso: string): { year: number; month: number } {
  const [y, m] = iso.split("-").map(Number);
  return { year: y, month: m };
}

export function monthStartISO(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

export function monthContainsSelectableDay(
  year: number,
  month: number,
  minISO: string,
  maxISO: string,
): boolean {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const first = `${prefix}-01`;
  let last = first;
  while (last.startsWith(prefix)) {
    const next = shiftDate(last, 1);
    if (!next.startsWith(prefix)) break;
    last = next;
  }
  return last >= minISO && first <= maxISO;
}
