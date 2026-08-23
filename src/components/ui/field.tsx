import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

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

export const FieldInput = forwardRef<HTMLInputElement, InputProps>(
  function FieldInput({ underline, className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`${underline ? "field-input-underline" : "field-input"} ${className}`.trim()}
        {...props}
      />
    );
  },
);

type TextareaProps = ComponentPropsWithoutRef<"textarea">;

export const FieldTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function FieldTextarea({ className = "", ...props }, ref) {
    return (
      <textarea ref={ref} className={`field-textarea ${className}`.trim()} {...props} />
    );
  },
);
