import { AdminSection } from "@/components/admin/section";
import { CuratedReviewForm } from "@/components/admin/curated-review-form";
import { ReviewFeaturedToggle } from "@/components/admin/review-featured-toggle";
import { listReviews } from "@/lib/admin/data";
import { deleteReview, moderateReview } from "@/lib/admin/actions";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

function displayName(review: {
  author_name: string | null;
  customer: { full_name: string | null; email: string } | null;
}) {
  return (
    review.author_name?.trim() ||
    review.customer?.full_name?.trim() ||
    review.customer?.email ||
    "—"
  );
}

/** Shared admin Reviews UI — `/admin/recensioni` for both languages. */
export async function AdminReviewsView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const copy = t.pages.admin.reviews;
  const rows = await listReviews();
  const featuredCount = rows.filter((r) => r.is_featured && r.status === "approved").length;

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      <div className="flex flex-col gap-8">
        <CuratedReviewForm
          locale={locale}
          copy={{
            addTitle: copy.addTitle,
            addLead: copy.addLead,
            authorLabel: copy.authorLabel,
            authorHint: copy.authorHint,
            ratingLabel: copy.ratingLabel,
            commentLabel: copy.commentLabel,
            commentHint: copy.commentHint,
            featuredLabel: copy.featuredLabel,
            submit: copy.submit,
            success: copy.success,
            errorInvalid: copy.errorInvalid,
            errorFeaturedLimit: copy.errorFeaturedLimit,
            errorGeneric: copy.errorGeneric,
          }}
        />

        <p className="text-xs tracking-[0.18em] text-muted uppercase">
          {copy.featuredCount.replace("{count}", String(featuredCount))}
        </p>

        {rows.length === 0 ? (
          <p className="text-sm text-muted">{copy.empty}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((review) => (
              <li key={review.id} className="flex flex-col gap-3 border border-border p-4">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-lg leading-none" aria-hidden>
                    {"★".repeat(review.rating)}
                    <span className="text-muted">{"★".repeat(5 - review.rating)}</span>
                  </span>
                  <span className="text-sm text-body">{displayName(review)}</span>
                  <span
                    className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] tracking-[0.22em] uppercase ${
                      review.source === "google"
                        ? "border-brass/50 text-brass"
                        : "border-border text-muted"
                    }`}
                  >
                    {copy.sources[review.source]}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[10px] tracking-[0.22em] uppercase ${
                      review.status === "approved"
                        ? "border-brass text-brass"
                        : review.status === "rejected"
                          ? "border-border text-muted line-through"
                          : "border-border text-muted"
                    }`}
                  >
                    {copy.statuses[review.status]}
                  </span>
                  <span className="text-[10px] tracking-[0.22em] text-muted uppercase">
                    {new Date(review.created_at).toLocaleDateString(
                      locale === "it" ? "it-IT" : "en-GB",
                    )}
                  </span>
                </div>
                {review.comment ? (
                  <p className="max-w-3xl text-sm text-body">{review.comment}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  {(["approved", "pending", "rejected"] as const).map((s) => (
                    <form key={s} action={moderateReview}>
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={review.id} />
                      <input type="hidden" name="status" value={s} />
                      <input
                        type="hidden"
                        name="is_featured"
                        value={review.is_featured ? "on" : ""}
                      />
                      <button
                        type="submit"
                        className={`border px-3 py-2 text-[11px] tracking-[0.22em] uppercase transition ${
                          review.status === s
                            ? "border-foreground bg-surface"
                            : "border-border hover:border-foreground/60"
                        }`}
                      >
                        {copy.statuses[s]}
                      </button>
                    </form>
                  ))}
                  <ReviewFeaturedToggle
                    id={review.id}
                    locale={locale}
                    currentStatus={review.status}
                    defaultFeatured={review.is_featured}
                    label={copy.featured}
                  />
                  <form action={deleteReview}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={review.id} />
                    <button
                      type="submit"
                      className="border border-border px-3 py-2 text-[11px] tracking-[0.22em] uppercase transition hover:border-foreground"
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
    </AdminSection>
  );
}
