import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "brass" | "book";
type Size = "default" | "sm";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  brass: "btn-brass",
  book: "btn-book",
};

const sizeClass: Record<Size, string> = {
  default: "",
  sm: "btn-sm",
};

function BookLines() {
  return (
    <>
      <span aria-hidden className="btn-book-line btn-book-line-t" />
      <span aria-hidden className="btn-book-line btn-book-line-r" />
      <span aria-hidden className="btn-book-line btn-book-line-b" />
      <span aria-hidden className="btn-book-line btn-book-line-l" />
    </>
  );
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "default",
  arrow = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const isBook = variant === "book";
  return (
    <button
      type="button"
      className={`${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()}
      {...props}
    >
      {isBook ? <BookLines /> : null}
      {isBook ? (
        <span className="btn-book-label">
          {children}
          {arrow ? (
            <span aria-hidden className="btn-arrow">
              →
            </span>
          ) : null}
        </span>
      ) : (
        <>
          {children}
          {arrow ? (
            <span aria-hidden className="btn-arrow">
              →
            </span>
          ) : null}
        </>
      )}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  children: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "default",
  arrow = false,
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  const isBook = variant === "book";
  return (
    <Link
      className={`${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()}
      {...props}
    >
      {isBook ? <BookLines /> : null}
      {isBook ? (
        <span className="btn-book-label">
          {children}
          {arrow ? (
            <span aria-hidden className="btn-arrow">
              →
            </span>
          ) : null}
        </span>
      ) : (
        <>
          {children}
          {arrow ? (
            <span aria-hidden className="btn-arrow">
              →
            </span>
          ) : null}
        </>
      )}
    </Link>
  );
}
