"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  createCuratedReview,
  type CuratedReviewFormState,
} from "@/lib/admin/actions";
import { Alert } from "@/components/ui/alert";
import { FieldInput, FieldLabel, FieldTextarea } from "@/components/ui/field";

type Copy = {
  addTitle: string;
  addLead: string;
  authorLabel: string;
  authorHint: string;
  ratingLabel: string;
  commentLabel: string;
  commentHint: string;
  featuredLabel: string;
  submit: string;
  success: string;
  errorInvalid: string;
  errorFeaturedLimit: string;
  errorGeneric: string;
};

const initial: CuratedReviewFormState = {};

export function CuratedReviewForm({
  locale,
  copy,
}: {
  locale: string;
  copy: Copy;
}) {
  const [state, action, pending] = useActionState(createCuratedReview, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    router.refresh();
  }, [state.success, router]);

  const errorMessage =
    state.error === "featured_limit"
      ? copy.errorFeaturedLimit
      : state.error === "invalid"
        ? copy.errorInvalid
        : state.error
          ? copy.errorGeneric
          : null;

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-5 border border-border bg-surface p-4 md:p-5"
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-xl tracking-tight">{copy.addTitle}</h2>
        <p className="max-w-2xl text-sm text-body">{copy.addLead}</p>
      </div>

      <input type="hidden" name="locale" value={locale} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_8rem]">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="review-author">{copy.authorLabel}</FieldLabel>
          <FieldInput
            id="review-author"
            name="author_name"
            required
            maxLength={80}
            autoComplete="off"
            placeholder="Marco R."
          />
          <p className="text-xs text-muted">{copy.authorHint}</p>
        </div>
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="review-rating">{copy.ratingLabel}</FieldLabel>
          <select
            id="review-rating"
            name="rating"
            defaultValue="5"
            className="field-input"
            required
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="review-comment">{copy.commentLabel}</FieldLabel>
        <FieldTextarea
          id="review-comment"
          name="comment"
          required
          rows={4}
          maxLength={1200}
          placeholder={copy.commentHint}
        />
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-body">
        <input
          type="checkbox"
          name="is_featured"
          defaultChecked
          className="size-4 accent-[var(--brass)]"
        />
        {copy.featuredLabel}
      </label>

      {state.success ? <Alert variant="success">{copy.success}</Alert> : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start border border-brass px-4 py-2.5 text-[11px] tracking-[0.22em] text-brass uppercase transition hover:bg-brass hover:text-background disabled:opacity-50"
      >
        {copy.submit}
      </button>
    </form>
  );
}
