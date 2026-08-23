import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  accent?: boolean;
  className?: string;
};

/** Editorial section label — wide tracking, muted or brass accent. */
export function Kicker({ children, accent, className = "" }: Props) {
  return (
    <p
      className={`kicker ${accent ? "kicker-accent" : ""} ${className}`.trim()}
    >
      {children}
    </p>
  );
}
