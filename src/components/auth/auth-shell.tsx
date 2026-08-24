import type { ReactNode } from "react";
import Link from "next/link";
import { Kicker } from "@/components/ui/kicker";

type Props = {
  kicker: string;
  title: readonly [string, string];
  lead: string;
  children: ReactNode;
  switchPrompt: string;
  switchHref: string;
  switchLabel: string;
};

/**
 * Single-column auth layout — one job, one viewport:
 * identity → explanation → form → quiet alternate path.
 */
export function AuthShell({
  kicker,
  title,
  lead,
  children,
  switchPrompt,
  switchHref,
  switchLabel,
}: Props) {
  return (
    <section className="auth-page">
      <div className="auth-shell site-wrap-narrow">
        <header className="auth-shell__intro">
          <Kicker accent>{kicker}</Kicker>
          <h1 className="auth-shell__title">
            {title
              .filter((line) => line.trim().length > 0)
              .map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
          </h1>
          <p className="auth-shell__lead">{lead}</p>
        </header>

        <div className="auth-shell__panel">{children}</div>

        <p className="auth-shell__switch">
          <span>{switchPrompt}</span>{" "}
          <Link href={switchHref} className="auth-shell__switch-link">
            {switchLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}
