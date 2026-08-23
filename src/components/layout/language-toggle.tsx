"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, type Locale } from "@/i18n/config";
import { persistLocale } from "@/i18n/cookie";

type Props = {
  locale: Locale;
  label: string;
  labels: Record<Locale, string>;
  variant?: "inline" | "stacked";
};

export function LanguageToggle({ locale, label, labels, variant = "inline" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === locale || pending) return;
    persistLocale(next);
    const parts = pathname.split("/");
    if (locales.includes(parts[1] as Locale)) {
      parts[1] = next;
    } else {
      parts.splice(1, 0, next);
    }
    const nextPath = parts.join("/") || `/${next}`;
    startTransition(() => {
      router.replace(nextPath);
      router.refresh();
    });
  };

  const inactiveClass = "text-muted transition hover:text-foreground-soft";
  const activeClass = "text-brass";

  if (variant === "stacked") {
    return (
      <div className="flex flex-col gap-3" aria-label={label}>
        <span className="text-label">{label}</span>
        <div className="flex gap-4 text-[13px] tracking-[0.22em] uppercase">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => switchTo(code)}
              aria-current={code === locale ? "true" : undefined}
              className={code === locale ? activeClass : inactiveClass}
            >
              {labels[code]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase"
    >
      {locales.map((code, idx) => (
        <span key={code} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchTo(code)}
            aria-current={code === locale ? "true" : undefined}
            className={code === locale ? activeClass : inactiveClass}
          >
            {code.toUpperCase()}
          </button>
          {idx === 0 ? <span className="text-caption">/</span> : null}
        </span>
      ))}
    </div>
  );
}
