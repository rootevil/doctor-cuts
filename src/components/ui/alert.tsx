import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  variant?: "error" | "success" | "info";
  className?: string;
};

export function Alert({ children, variant = "error", className = "" }: Props) {
  const variantClass =
    variant === "success"
      ? "alert-success"
      : variant === "info"
        ? "alert-info"
        : "alert-error";
  return (
    <p role="alert" className={`${variantClass} ${className}`.trim()}>
      {children}
    </p>
  );
}
