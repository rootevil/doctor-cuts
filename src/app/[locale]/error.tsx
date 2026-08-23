"use client";

import { useEffect } from "react";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { Kicker } from "@/components/ui/kicker";
import { Button, ButtonLink } from "@/components/ui/button";

function localeFromPath() {
  if (typeof window === "undefined") return defaultLocale;
  const first = window.location.pathname.split("/")[1] ?? "";
  return isLocale(first) ? first : defaultLocale;
}

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] locale error", { digest: error.digest, message: error.message });
  }, [error]);

  const locale = localeFromPath();
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.error;

  return (
    <section className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-start justify-center px-6 py-24 md:px-10">
      <Kicker accent>{copy.kicker}</Kicker>
      <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight md:text-6xl">{copy.title}</h1>
      <p className="mt-6 max-w-md text-lg text-foreground-soft">{copy.lead}</p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted-subtle">
          {copy.reference} {error.digest}
        </p>
      ) : null}
      <div className="mt-10 flex flex-wrap gap-4">
        <Button type="button" variant="secondary" onClick={reset}>
          {copy.retry}
        </Button>
        <ButtonLink href={r.home} variant="ghost">
          {copy.home}
        </ButtonLink>
      </div>
    </section>
  );
}
