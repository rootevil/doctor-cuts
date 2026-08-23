import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { formatPrice, services as staticServices } from "@/lib/site";
import { getActiveServices } from "@/lib/data/services";
import { routes } from "@/lib/routes";

export async function BookBar({ locale, t }: { locale: Locale; t: Dictionary }) {
  const r = routes(locale);
  const db = await getActiveServices();
  const signature = db[0]
    ? { price: Number(db[0].price), duration: db[0].duration_minutes }
    : { price: staticServices[0].price, duration: staticServices[0].duration };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="h-px bg-gradient-to-r from-brass/50 via-brass/20 to-transparent" aria-hidden />
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
        <div className="flex flex-col">
          <span className="text-sm text-foreground">{t.bookBar.label}</span>
          <span className="text-[11px] tracking-[0.22em] text-brass-muted uppercase">
            {formatPrice(signature.price, locale)} · {signature.duration}{" "}
            {t.services.minutes}
          </span>
        </div>
        <Link href={r.book} className="btn-brass btn-sm">
          {t.bookBar.cta}
        </Link>
      </div>
    </div>
  );
}
