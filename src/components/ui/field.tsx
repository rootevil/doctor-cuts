import type { ComponentPropsWithoutRef, ReactNode } from "react";

type LabelProps = {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
};

export function FieldLabel({ htmlFor, children, className = "" }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={`field-label ${className}`.trim()}>
      {children}
    </label>
  );
}

type InputProps = ComponentPropsWithoutRef<"input"> & {
  underline?: boolean;
};

export function FieldInput({ underline, className = "", ...props }: InputProps) {
  return (
    <input
      className={`${underline ? "field-input-underline" : "field-input"} ${className}`.trim()}
      {...props}
    />
  );
}

type TextareaProps = ComponentPropsWithoutRef<"textarea">;

export function FieldTextarea({ className = "", ...props }: TextareaProps) {
  return <textarea className={`field-textarea ${className}`.trim()} {...props} />;
}
