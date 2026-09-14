"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { purgeAppointments } from "@/lib/admin/actions";

type Props = {
  locale: Locale;
  t: Dictionary;
};

export function AppointmentCleanupPanel({ locale, t }: Props) {
  const copy = t.pages.admin.appointments;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [scope, setScope] = useState<"holds" | "cancelled" | "both">("both");
  const [days, setDays] = useState("14");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPurge = () => {
    const confirmMsg =
      scope === "holds"
        ? copy.confirmPurgeHolds
        : scope === "cancelled"
          ? copy.confirmPurgeCancelled.replace("{days}", days)
          : copy.confirmPurgeBoth.replace("{days}", days);
    if (!window.confirm(confirmMsg)) return;
    setMessage(null);
    setError(null);
    start(async () => {
      const form = new FormData();
      form.set("locale", locale);
      form.set("scope", scope);
      form.set("older_than_days", days);
      const res = await purgeAppointments(form);
      if (!res.ok) {
        setError(copy.purgeFailed);
        return;
      }
      setMessage(copy.purgeDone.replace("{count}", String(res.deleted)));
      router.refresh();
    });
  };

  return (
    <div className="border border-border bg-[var(--admin-panel)] p-4 md:p-5">
      <h3 className="text-[11px] tracking-[0.28em] text-muted uppercase">
        {copy.cleanupTitle}
      </h3>
      <p className="mt-2 max-w-2xl text-sm text-body">{copy.cleanupLead}</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[0.18em] text-muted uppercase">
            {copy.cleanupScope}
          </span>
          <select
            value={scope}
            onChange={(e) =>
              setScope(e.target.value as "holds" | "cancelled" | "both")
            }
            className="admin-field min-w-[12rem]"
          >
            <option value="holds">{copy.cleanupScopeHolds}</option>
            <option value="cancelled">{copy.cleanupScopeCancelled}</option>
            <option value="both">{copy.cleanupScopeBoth}</option>
          </select>
        </label>

        {scope !== "holds" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] tracking-[0.18em] text-muted uppercase">
              {copy.cleanupOlderThan}
            </span>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="admin-field min-w-[8rem]"
            >
              <option value="7">7</option>
              <option value="14">14</option>
              <option value="30">30</option>
              <option value="90">90</option>
            </select>
          </label>
        ) : null}

        <button
          type="button"
          onClick={runPurge}
          disabled={pending}
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-[var(--error-text)]/40 px-4 text-[11px] tracking-[0.22em] text-[var(--error-text)] uppercase transition hover:border-[var(--error-text)] disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          {copy.cleanupRun}
        </button>
      </div>

      {message ? (
        <p role="status" className="mt-3 text-sm text-body">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--error-text)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
