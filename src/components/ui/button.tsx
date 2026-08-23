import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "brass";
type Size = "default" | "sm";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  brass: "btn-brass",
};

const sizeClass: Record<Size, string> = {
  default: "",
  sm: "btn-sm",
};

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
  return (
    <button
      type="button"
      className={`${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      {arrow ? (
        <span aria-hidden className="btn-arrow">
          →
        </span>
      ) : null}
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
  return (
    <Link
      className={`${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      {arrow ? (
        <span aria-hidden className="btn-arrow">
          →
        </span>
      ) : null}
    </Link>
  );
}
