"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, UploadCloud } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { uploadGalleryImage, type GalleryFormState } from "@/lib/admin/actions";

function SubmitButton({ label, pending }: { label: string; pending: string }) {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center gap-2 bg-foreground px-5 py-3 text-[11px] tracking-[0.28em] text-background uppercase transition hover:opacity-90 disabled:opacity-60"
    >
      {status.pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <UploadCloud className="h-3.5 w-3.5" aria-hidden />
      )}
      {status.pending ? pending : label}
    </button>
  );
}

const initial: GalleryFormState = {};

export function GalleryUploader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [state, action] = useActionState(uploadGalleryImage, initial);
  const formRef = useRef<HTMLFormElement | null>(null);
  const copy = t.pages.admin.gallery;

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={action}
      className="grid grid-cols-1 gap-4 border border-border p-6 md:grid-cols-4 md:items-end"
    >
      <input type="hidden" name="locale" value={locale} />

      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-[10px] tracking-[0.22em] text-muted uppercase">{copy.file}</span>
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.22em] text-muted uppercase">
          {copy.titleField}
        </span>
        <input
          type="text"
          name="title"
          className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.22em] text-muted uppercase">{copy.category}</span>
        <select
          name="category"
          defaultValue=""
          className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        >
          <option value="">—</option>
          {(["cuts", "fade", "beard", "style", "studio"] as const).map((c) => (
            <option key={c} value={c}>
              {t.gallery.filters[c]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] tracking-[0.22em] text-muted uppercase">{copy.sortOrder}</span>
        <input
          type="number"
          name="sort_order"
          defaultValue={100}
          step="10"
          className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </label>

      {state.error ? (
        <p className="md:col-span-4 border border-[#3a1f1f] bg-[#1a0f0f] px-4 py-3 text-sm text-[#f4b0b0]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="md:col-span-4 border border-border bg-surface px-4 py-3 text-sm text-body">
          {state.success}
        </p>
      ) : null}

      <div className="md:col-span-4">
        <SubmitButton label={copy.upload} pending={copy.uploading} />
      </div>
    </form>
  );
}
