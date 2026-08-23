import { notFound } from "next/navigation";
import { AdminSection } from "@/components/admin/section";
import { ReviewFeaturedToggle } from "@/components/admin/review-featured-toggle";
import { listReviews } from "@/lib/admin/data";
import { deleteReview, moderateReview } from "@/lib/admin/actions";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const copy = t.pages.admin.reviews;
  const rows = await listReviews();

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((review) => (
            <li key={review.id} className="flex flex-col gap-3 border border-border p-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-lg leading-none">
                  {"★".repeat(review.rating)}
                  <span className="text-muted">{"★".repeat(5 - review.rating)}</span>
                </span>
                <span className="text-sm text-body">
                  {review.customer?.full_name?.trim() || review.customer?.email || "—"}
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
    </AdminSection>
  );
}
