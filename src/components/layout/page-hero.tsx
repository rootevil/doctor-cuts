import Link from "next/link";
import { Kicker } from "@/components/ui/kicker";
import { ButtonLink } from "@/components/ui/button";

type Props = {
  kicker: string;
  title: readonly [string, string] | readonly [string, string, string];
  lead?: string;
  crumb?: { href: string; label: string };
  action?: { href: string; label: string; primary?: boolean };
};

/**
 * Page hero is always above the fold — render title/lead directly instead
 * of gating on intersection observers, which can miss on tall headlines.
 */
export function PageHero({ kicker, title, lead, crumb, action }: Props) {
  return (
    <section className="section-alt border-b border-border">
      <div className="site-wrap-wide pb-16 page-top-spacious md:pb-24">
        {crumb ? (
          <Link
            href={crumb.href}
            className="link-brass mb-8 inline-flex items-center gap-2 text-[11px] tracking-[0.28em] uppercase"
          >
            <span aria-hidden>←</span>
            {crumb.label}
          </Link>
        ) : null}
        <Kicker accent>{kicker}</Kicker>
        <h1 className="type-display-page mt-6 text-foreground">
          {title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,32rem)_auto] md:items-end">
          {lead ? <p className="max-w-lg text-lg text-body">{lead}</p> : <div />}
          {action ? (
            <ButtonLink
              href={action.href}
              variant={action.primary ? "book" : "secondary"}
              arrow
            >
              {action.label}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
