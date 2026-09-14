import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { AdminCalendarDay } from "@/lib/admin/calendar-data";
import type { AppointmentStatus } from "@/lib/supabase/types";
import { SHOP_TZ } from "@/lib/booking/timezone";
import { dateFnsLocale } from "@/lib/booking/date-locale";
import { localizedServiceName } from "@/lib/services/localize";

function statusLabel(
  status: AppointmentStatus,
  statuses: Dictionary["pages"]["account"]["appointments"]["statuses"],
) {
  switch (status) {
    case "pending":
      return statuses.pending;
    case "confirmed":
      return statuses.confirmed;
    case "arrived":
      return statuses.arrived;
    case "completed":
      return statuses.completed;
    case "cancelled":
      return statuses.cancelled;
    case "no_show":
      return statuses.noShow;
  }
}

type Props = {
  locale: Locale;
  t: Dictionary;
  day: AdminCalendarDay;
  calendarHref: string;
};

/** Read-only day grid for the admin overview — slots + appointment status. */
export function AdminOverviewDayCalendar({
  locale,
  t,
  day,
  calendarHref,
}: Props) {
  const copy = t.pages.admin.overview;
  const cal = t.pages.admin.calendar;
  const statusLabels = t.pages.account.appointments.statuses;
  const booked = day.slots.filter((s) => s.state === "booked").length;

  return (
    <div className="admin-overview-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2.5">
        <h2 className="admin-overview-panel-title">{copy.todayCalendar}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] tracking-[0.16em] text-muted uppercase">
            {copy.calendarBookedCount.replace("{count}", String(booked))}
          </span>
          <Link
            href={calendarHref}
            className="text-[10px] tracking-[0.16em] text-brass uppercase transition hover:text-foreground"
          >
            {copy.actionCalendar} →
          </Link>
        </div>
      </div>

      <div className="admin-cal-legend mt-3">
        <span data-state="available">{cal.legendFree}</span>
        <span data-state="booked">{cal.legendBooked}</span>
        <span data-state="unavailable">{cal.legendBlocked}</span>
      </div>

      {day.closed ? (
        <p className="mt-3 text-sm text-muted">
          {day.blocked ? cal.blockedDay : cal.closedDay}
        </p>
      ) : day.slots.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{cal.emptyDay}</p>
      ) : (
        <div className="admin-cal-day mt-3">
          {day.slots.map((slot) => {
            const time = formatInTimeZone(
              new Date(slot.startsAt),
              SHOP_TZ,
              "HH:mm",
              { locale: dateFnsLocale(locale) },
            );

            if (slot.state === "booked" && slot.appointment) {
              const appt = slot.appointment;
              const name =
                appt.customer?.full_name?.trim() ||
                appt.customer?.email ||
                t.pages.admin.appointments.unknownCustomer;
              const service = localizedServiceName(
                locale,
                appt.service?.slug,
                appt.service?.name,
              );
              const status = statusLabel(appt.status, statusLabels);
              const pay =
                appt.payment_status === "paid"
                  ? t.pages.admin.appointments.depositPaid
                  : appt.payment_status === "awaiting"
                    ? t.pages.admin.appointments.holdAwaiting
                    : null;

              return (
                <div key={slot.startsAt} className="admin-cal-slot is-booked">
                  <span>{time}</span>
                  <span className="admin-cal-slot-meta">
                    {name}
                    {service ? ` · ${service}` : ""}
                    {" · "}
                    {status}
                    {pay ? ` · ${pay}` : ""}
                  </span>
                </div>
              );
            }

            if (slot.state === "available") {
              return (
                <Link
                  key={slot.startsAt}
                  href={calendarHref}
                  className="admin-cal-slot is-available"
                >
                  <span>{time}</span>
                  <span className="admin-cal-slot-meta">{cal.freeSlot}</span>
                </Link>
              );
            }

            return (
              <div key={slot.startsAt} className="admin-cal-slot is-unavailable">
                <span>{time}</span>
                <span className="admin-cal-slot-meta">{cal.blockedSlot}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
