import { headers } from "next/headers";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { Kicker } from "@/components/ui/kicker";
import { ButtonLink } from "@/components/ui/button";

async function localeFromRequest() {
  try {
    const h = await headers();
    const path = h.get("x-invoke-path") ?? h.get("x-matched-path") ?? "/";
    const first = path.split("/")[1] ?? "";
    return isLocale(first) ? first : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export default async function NotFound() {
  const locale = await localeFromRequest();
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.notFound;

  return (
    <section className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-start justify-center px-6 py-24 md:px-10">
      <Kicker accent>{copy.kicker}</Kicker>
      <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight md:text-6xl">{copy.title}</h1>
      <p className="mt-6 max-w-md text-lg text-foreground-soft">{copy.lead}</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <ButtonLink href={r.home} variant="secondary">
          {copy.home}
        </ButtonLink>
        <ButtonLink href={r.services} variant="ghost">
          {copy.services}
        </ButtonLink>
      </div>
    </section>
  );
}
