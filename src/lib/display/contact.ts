import type { Locale } from "@/i18n/config";
import type { BusinessHour } from "@/lib/booking/availability";
import type { SettingsRow } from "@/lib/supabase/types";
import { hours as staticHours, site } from "@/lib/site";

const DAY_LABELS: Record<number, { it: string; en: string }> = {
  1: { it: "LUN", en: "MON" },
  2: { it: "MAR", en: "TUE" },
  3: { it: "MER", en: "WED" },
  4: { it: "GIO", en: "THU" },
  5: { it: "VEN", en: "FRI" },
  6: { it: "SAB", en: "SAT" },
  7: { it: "DOM", en: "SUN" },
};

/** Split a settings address into street + city lines for display. */
export function parseAddress(address: string | null | undefined) {
  const raw = (address ?? "").trim();
  if (!raw) {
    return { line: site.addressLine, city: site.postalCity };
  }
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    // Drop trailing country if present
    const last = parts[parts.length - 1]?.toLowerCase();
    if (last === "italia" || last === "italy" || last === "it") {
      parts.pop();
    }
    if (parts.length === 1) {
      return { line: parts[0], city: "" };
    }
    const city = parts[parts.length - 1];
    const line = parts.slice(0, -1).join(", ");
    return { line, city };
  }
  return { line: raw, city: "" };
}

export function formatPhoneDisplay(phone: string | null | undefined) {
  const raw = (phone ?? site.phoneE164).replace(/\s+/g, "");
  const digits = raw.replace(/^\+39/, "").replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone?.trim() || site.phoneDisplay;
}

export function telHrefFrom(phone: string | null | undefined) {
  const raw = (phone ?? site.phoneE164).replace(/\s+/g, "");
  if (raw.startsWith("tel:")) return raw;
  if (raw.startsWith("+")) return `tel:${raw}`;
  if (raw.startsWith("00")) return `tel:+${raw.slice(2)}`;
  return `tel:+39${raw.replace(/\D/g, "")}`;
}

export function mapsUrlFromAddress(address: string | null | undefined) {
  const q = encodeURIComponent(address?.trim() || `${site.addressLine} ${site.postalCity}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function contactFromSettings(settings: SettingsRow) {
  const { line, city } = parseAddress(settings.address);
  const phoneDisplay = formatPhoneDisplay(settings.phone);
  const email = (settings.email?.trim() || site.email).toLowerCase();
  return {
    businessName: settings.business_name || site.name,
    addressLine: line,
    postalCity: city,
    phoneDisplay,
    telHref: telHrefFrom(settings.phone),
    email,
    mailtoHref: `mailto:${email}`,
    whatsapp: settings.whatsapp || site.whatsapp,
    instagram: settings.instagram || site.instagram,
    facebook: settings.facebook || site.facebook,
    mapsUrl: mapsUrlFromAddress(settings.address),
  };
}

function fmtTime(t: string | null) {
  if (!t) return "";
  return t.slice(0, 5);
}

/**
 * Collapse weekly hours into compact display rows (e.g. MON — SAT / SUN),
 * matching the marketing site pattern.
 */
export function displayHoursRows(
  rows: BusinessHour[],
  locale: Locale,
): { id: string; days: string; time: string }[] {
  if (!rows.length) {
    return staticHours.map((h) => ({
      id: h.id,
      days: h.days[locale],
      time: h.time[locale],
    }));
  }

  const sorted = [...rows].sort((a, b) => a.day_of_week - b.day_of_week);
  const groups: { days: number[]; open: string | null; close: string | null; closed: boolean }[] =
    [];

  for (const row of sorted) {
    const open = row.is_closed ? null : row.open_time;
    const close = row.is_closed ? null : row.close_time;
    const last = groups[groups.length - 1];
    if (
      last &&
      last.closed === row.is_closed &&
      last.open === open &&
      last.close === close &&
      last.days[last.days.length - 1] === row.day_of_week - 1
    ) {
      last.days.push(row.day_of_week);
    } else {
      groups.push({
        days: [row.day_of_week],
        open,
        close,
        closed: row.is_closed,
      });
    }
  }

  return groups.map((g, i) => {
    const labels = g.days.map((d) => DAY_LABELS[d]?.[locale] ?? String(d));
    const daysLabel =
      labels.length === 1
        ? labels[0]
        : `${labels[0]} — ${labels[labels.length - 1]}`;
    const time = g.closed
      ? locale === "it"
        ? "Chiuso"
        : "Closed"
      : `${fmtTime(g.open)} — ${fmtTime(g.close)}`;
    return { id: `g-${i}`, days: daysLabel, time };
  });
}
