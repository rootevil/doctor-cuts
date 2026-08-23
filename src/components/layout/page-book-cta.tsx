import { ButtonLink } from "@/components/ui/button";

type Props = {
  headline: string;
  buttonLabel: string;
  href: string;
  className?: string;
};

/** Bottom-of-page book prompt — headline + CTA on one aligned row. */
export function PageBookCta({
  headline,
  buttonLabel,
  href,
  className = "bg-surface",
}: Props) {
  return (
    <section className={`border-t border-border ${className}`}>
      <div className="site-wrap-wide flex flex-col gap-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8 md:py-14">
        <p className="type-cta-headline min-w-0 text-foreground">
          {headline}
        </p>
        <ButtonLink href={href} variant="book" arrow className="shrink-0 self-start sm:self-center">
          {buttonLabel}
        </ButtonLink>
      </div>
    </section>
  );
}
