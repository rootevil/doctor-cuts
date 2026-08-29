import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { LanguageToggle } from "@/components/layout/language-toggle";

export function AdminTopbar({ locale, t }: { locale: Locale; t: Dictionary }) {
  const r = routes(locale);
  const copy = t.pages.admin.nav;

  return (
    <div className="admin-topbar">
      <div className="admin-topbar-brand">
        <Link href={r.admin}>
          <strong>Doctor Cuts</strong>
        </Link>
      </div>
      <div className="admin-topbar-actions">
        <LanguageToggle
          locale={locale}
          label={t.nav.language}
          labels={t.lang}
        />
        <Link href={r.home} className="admin-btn admin-btn-ghost !min-h-9 !px-3 text-[10px]">
          {copy.backToSite} ↗
        </Link>
      </div>
    </div>
  );
}
