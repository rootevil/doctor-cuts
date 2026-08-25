"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { SettingsRow } from "@/lib/supabase/types";
import { saveSettings, type SettingsFormState } from "@/lib/admin/actions";

function SubmitButton({ label, pending }: { label: string; pending: string }) {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex w-fit items-center gap-2 bg-foreground px-5 py-3 text-[11px] tracking-[0.28em] text-background uppercase transition hover:opacity-90 disabled:opacity-60"
    >
      {status.pending ? pending : label}
    </button>
  );
}

const initial: SettingsFormState = {};

export function SettingsForm({
  locale,
  t,
  settings,
}: {
  locale: Locale;
  t: Dictionary;
  settings: SettingsRow;
}) {
  const [state, action] = useActionState(saveSettings, initial);
  const copy = t.pages.admin.settings;

  return (
    <form action={action} className="flex flex-col gap-10">
      <input type="hidden" name="locale" value={locale} />

      <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Legend>{copy.identity}</Legend>
        <Field
          label={copy.businessName}
          name="business_name"
          defaultValue={settings.business_name}
          required
        />
        <Field label={copy.email} name="email" type="email" defaultValue={settings.email ?? ""} />
        <Field
          label={copy.address}
          name="address"
          defaultValue={settings.address}
          wide
          required
        />
        <Field label={copy.phone} name="phone" defaultValue={settings.phone ?? ""} />
        <Field
          label={copy.whatsapp}
          name="whatsapp"
          defaultValue={settings.whatsapp ?? ""}
        />
        <Field
          label={copy.instagram}
          name="instagram"
          defaultValue={settings.instagram ?? ""}
        />
        <Field
          label={copy.facebook}
          name="facebook"
          defaultValue={settings.facebook ?? ""}
        />
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Legend>{copy.bookingRules}</Legend>
        <Field
          label={copy.noticeHours}
          name="booking_notice_hours"
          type="number"
          min="0"
          defaultValue={settings.booking_notice_hours}
          hint={copy.noticeHint}
        />
        <Field
          label={copy.maxDays}
          name="max_booking_days"
          type="number"
          min="1"
          defaultValue={settings.max_booking_days}
          hint={copy.maxDaysHint}
        />
        <Field
          label={copy.cancellationHours}
          name="cancellation_hours"
          type="number"
          min="0"
          defaultValue={settings.cancellation_hours}
          hint={copy.cancellationHint}
        />
        <Field
          label={copy.slotInterval}
          name="slot_interval_minutes"
          type="number"
          min="5"
          step="5"
          defaultValue={settings.slot_interval_minutes}
          hint={copy.slotHint}
        />
        <label className="flex flex-col gap-2 md:col-span-4">
          <span className="inline-flex items-center gap-3 text-[11px] tracking-[0.22em] text-foreground uppercase">
            <input
              type="checkbox"
              name="bookings_enabled"
              defaultChecked={settings.bookings_enabled}
              className="h-4 w-4 accent-brass"
            />
            {copy.bookingsEnabled}
          </span>
          <span className="text-xs tracking-normal text-muted normal-case">
            {copy.bookingsEnabledHint}
          </span>
        </label>
        <label className="flex flex-col gap-2 md:col-span-4">
          <span className="inline-flex items-center gap-3 text-[11px] tracking-[0.22em] text-foreground uppercase">
            <input
              type="checkbox"
              name="require_confirmation"
              defaultChecked={settings.require_confirmation}
              className="h-4 w-4 accent-brass"
            />
            {copy.requireConfirm}
          </span>
          <span className="text-xs tracking-normal text-muted normal-case">
            {copy.requireConfirmHint}
          </span>
        </label>
        <label className="flex flex-col gap-2 md:col-span-4">
          <span className="inline-flex items-center gap-3 text-[11px] tracking-[0.22em] text-foreground uppercase">
            <input
              type="checkbox"
              name="deposit_required"
              defaultChecked={settings.deposit_required}
              className="h-4 w-4 accent-brass"
            />
            {copy.depositRequired}
          </span>
          <span className="text-xs tracking-normal text-muted normal-case">
            {copy.depositRequiredHint}
          </span>
        </label>
        <Field
          label={copy.depositAmount}
          name="deposit_cents"
          type="number"
          min="0"
          defaultValue={settings.deposit_cents}
          hint={copy.depositAmountHint}
        />
      </fieldset>

      {state.error ? (
        <p role="alert" className="border border-[#3a1f1f] bg-[#1a0f0f] px-4 py-3 text-sm text-[#f4b0b0]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="border border-border bg-surface px-4 py-3 text-sm text-body">
          {state.success}
        </p>
      ) : null}

      <SubmitButton label={copy.save} pending={copy.saving} />
    </form>
  );
}

function Legend({ children }: { children: React.ReactNode }) {
  return (
    <legend className="md:col-span-full text-[11px] tracking-[0.28em] text-muted uppercase">
      {children}
    </legend>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  min,
  step,
  hint,
  wide,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  required?: boolean;
  type?: string;
  min?: string;
  step?: string;
  hint?: string;
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2 ${wide ? "md:col-span-2" : ""}`}>
      <label
        htmlFor={`s-${name}`}
        className="text-[11px] tracking-[0.28em] text-muted uppercase"
      >
        {label}
      </label>
      <input
        id={`s-${name}`}
        name={name}
        type={type}
        min={min}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
      />
      {hint ? <span className="text-[11px] text-muted">{hint}</span> : null}
    </div>
  );
}
