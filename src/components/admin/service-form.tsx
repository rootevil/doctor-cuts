"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ServiceRow } from "@/lib/supabase/types";
import { saveService, type ServiceFormState } from "@/lib/admin/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

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

const initial: ServiceFormState = {};

export function ServiceForm({
  locale,
  t,
  service,
}: {
  locale: Locale;
  t: Dictionary;
  service?: ServiceRow;
}) {
  const [state, action] = useActionState(saveService, initial);
  const copy = t.pages.admin.services.form;

  return (
    <form action={action} className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <input type="hidden" name="locale" value={locale} />
      {service ? <input type="hidden" name="id" value={service.id} /> : null}

      <Field label={copy.name} name="name" defaultValue={service?.name ?? ""} required />
      <Field
        label={copy.slug}
        name="slug"
        defaultValue={service?.slug ?? ""}
        hint={copy.slugHint}
      />
      <Field
        label={copy.price}
        name="price"
        type="number"
        step="0.01"
        min="0"
        defaultValue={service?.price ?? 25}
        required
      />
      <Field
        label={copy.duration}
        name="duration_minutes"
        type="number"
        step="5"
        min="5"
        defaultValue={service?.duration_minutes ?? 45}
        required
      />
      <Field
        label={copy.image}
        name="image_url"
        defaultValue={service?.image_url ?? ""}
        hint={copy.imageHint}
        wide
      />
      <Field
        label={copy.description}
        name="description"
        defaultValue={service?.description ?? ""}
        as="textarea"
        wide
      />
      <Field
        label={copy.sortOrder}
        name="sort_order"
        type="number"
        step="1"
        defaultValue={service?.sort_order ?? 10}
      />
      <label className="flex items-center gap-3 text-[11px] tracking-[0.22em] text-foreground uppercase">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={service?.is_active ?? true}
          className="h-4 w-4 accent-brass"
        />
        {copy.active}
      </label>

      {state.error ? (
        <p
          role="alert"
          className="md:col-span-2 border border-[#3a1f1f] bg-[#1a0f0f] px-4 py-3 text-sm text-[#f4b0b0]"
        >
          {state.error}
        </p>
      ) : null}

      <div className="md:col-span-2">
        <SubmitButton label={service ? copy.saveEdit : copy.saveNew} pending={copy.saving} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  step,
  min,
  hint,
  as,
  wide,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  required?: boolean;
  type?: string;
  step?: string;
  min?: string;
  hint?: string;
  as?: "textarea";
  wide?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2 ${wide ? "md:col-span-2" : ""}`}>
      <label
        htmlFor={`f-${name}`}
        className="text-[11px] tracking-[0.28em] text-muted uppercase"
      >
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          id={`f-${name}`}
          name={name}
          defaultValue={defaultValue as string}
          rows={3}
          className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      ) : (
        <input
          id={`f-${name}`}
          name={name}
          type={type}
          step={step}
          min={min}
          required={required}
          defaultValue={defaultValue}
          className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      )}
      {hint ? <span className="text-[11px] text-muted">{hint}</span> : null}
    </div>
  );
}
