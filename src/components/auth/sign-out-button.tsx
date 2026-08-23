import type { Locale } from "@/i18n/config";
import { signOutAction } from "@/lib/auth/actions";

export function SignOutButton({ locale, label }: { locale: Locale; label: string }) {
  return (
    <form action={signOutAction}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 border border-border px-4 py-2 text-[11px] tracking-[0.22em] uppercase transition hover:border-foreground"
      >
        {label}
      </button>
    </form>
  );
}
