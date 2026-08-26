"use client";

import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const switchTo = (next: Locale) => {
    if (next === locale) return;

    persistLocale(next);
    onSwitch?.();

    const { search, hash } = window.location;
    const href = switchLocaleHref(pathname, next, search, hash);

    // Full load so `/it` is rendered with the new cookie. If a leftover
    // `/en/...` bookmark is still in the address bar, send it to `/it/...`.
    if (window.location.pathname.startsWith("/en")) {
      window.location.assign(href);
    } else {
      window.location.reload();
    }
  };

  if (variant === "stacked") {
    return (
      <div className="flex flex-col gap-3" aria-label={label}>
        <span className="text-label">{label}</span>
        <div role="group" aria-label={label} className="lang-toggle lang-toggle--stacked">
          {locales.map((code) => {
            const active = code === locale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => switchTo(code)}
                aria-pressed={active}
                aria-current={active ? "true" : undefined}
                aria-label={labels[code]}
                className={`lang-toggle__btn ${active ? "is-active" : ""}`}
              >
                <span className="lang-toggle__code">{code.toUpperCase()}</span>
                <span className="lang-toggle__name">{labels[code]}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div role="group" aria-label={label} className="lang-toggle" title={labels[locale]}>
      {locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => switchTo(code)}
            aria-pressed={active}
            aria-current={active ? "true" : undefined}
            aria-label={labels[code]}
            className={`lang-toggle__btn ${active ? "is-active" : ""}`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
