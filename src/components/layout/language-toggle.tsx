"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, type Locale } from "@/i18n/config";
import { persistLocale } from "@/i18n/cookie";
import { switchLocaleHref } from "@/i18n/switch-locale-path";

type Props = {
  locale: Locale;
  label: string;
  labels: Record<Locale, string>;
  variant?: "inline" | "stacked";
  /** Called after a locale is chosen (e.g. close mobile menu). */
  onSwitch?: () => void;
};

export function LanguageToggle({
  locale,
  label,
  labels,
  variant = "inline",
  onSwitch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === locale || pending) return;

    persistLocale(next);

    const { search, hash } = window.location;
    const href = switchLocaleHref(pathname, next, search, hash);

    startTransition(() => {
      router.push(href);
      onSwitch?.();
    });
  };

  const inactiveClass =
    "min-h-11 min-w-11 rounded-sm px-1 text-muted transition hover:text-foreground-soft disabled:opacity-50";
  const activeClass =
    "min-h-11 min-w-11 rounded-sm px-1 text-brass disabled:opacity-50";

  if (variant === "stacked") {
    return (
      <div className="flex flex-col gap-3" aria-label={label}>
        <span className="text-label">{label}</span>
        <div
          className="flex gap-2 text-[13px] tracking-[0.22em] uppercase"
          aria-busy={pending}
        >
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => switchTo(code)}
              disabled={pending}
              aria-pressed={code === locale}
              aria-label={labels[code]}
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
      aria-busy={pending}
      className="flex items-center gap-1 text-[11px] tracking-[0.22em] uppercase"
    >
      {locales.map((code, idx) => (
        <span key={code} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => switchTo(code)}
            disabled={pending}
            aria-pressed={code === locale}
            aria-label={labels[code]}
            className={code === locale ? activeClass : inactiveClass}
          >
            {code.toUpperCase()}
          </button>
          {idx === 0 ? (
            <span className="pointer-events-none text-caption" aria-hidden>
              /
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
