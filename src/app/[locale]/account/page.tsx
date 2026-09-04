import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { AppointmentCard } from "@/components/account/appointment-card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ButtonLink } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, urlLocaleParams } from "@/i18n/config";
import { italianAlternates } from "@/i18n/public-url";
import { requestLocale } from "@/i18n/request-locale";
import { listAppointmentsForCurrentUser } from "@/lib/data/appointments";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { routes } from "@/lib/routes";
import { isAllowedAdminEmail } from "@/lib/auth/admin-email";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return urlLocaleParams;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  return {
    title: t.pages.account.metaTitle,
    description: t.pages.account.metaDescription,
    alternates: italianAlternates(routes(locale).account),
    robots: { index: false, follow: false },
  };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = await requestLocale(raw);
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.account;
  const appt = copy.appointments;

  if (!supabaseConfigured) {
    return (
      <AccountShell kicker={copy.kicker} title={copy.title.join(" ")} lead={copy.lead}>
        <p className="max-w-md text-lg text-muted">{t.pages.auth.errors.notConfigured}</p>
      </AccountShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`${r.signIn}?next=${encodeURIComponent(r.account)}`);

  const [{ data: profile }, { upcoming, past }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, phone, role, created_at")
      .eq("id", user.id)
      .maybeSingle(),
    listAppointmentsForCurrentUser(),
  ]);

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "";
  const isAdmin =
    profile?.role === "admin" &&
    isAllowedAdminEmail(profile?.email || user.email);
  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(
        locale === "it" ? "it-IT" : "en-GB",
        { day: "numeric", month: "short", year: "numeric" },
      )
    : null;

  return (
    <AccountShell
      kicker={copy.kicker}
      title={`${copy.greeting}${displayName ? `, ${displayName}` : ""}`}
      lead={copy.lead}
      actions={
        <>
          {isAdmin ? (
            <Link
              href={r.admin}
              className="inline-flex min-h-10 items-center border border-brass/60 px-4 text-[11px] font-semibold tracking-[0.22em] text-brass uppercase transition hover:bg-brass hover:text-background"
            >
              {copy.adminPanelCta}
            </Link>
          ) : null}
          <SignOutButton locale={locale} label={copy.signOut} />
        </>
      }
    >
      {/* Profile */}
      <section aria-labelledby="account-details">
        <h2
          id="account-details"
          className="text-[11px] tracking-[0.28em] text-muted uppercase"
        >
          {copy.detailsTitle}
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          <Detail
            label={copy.emailLabel}
            value={profile?.email || user.email || "—"}
          />
          {profile?.phone ? (
            <Detail label={copy.phoneLabel} value={profile.phone} />
          ) : null}
          {joined ? <Detail label={copy.joinedLabel} value={joined} /> : null}
          {isAdmin ? (
            <Detail label={copy.roleLabel} value={copy.adminRole} />
          ) : null}
        </dl>
      </section>

      {/* Upcoming */}
      <section id="appointments" aria-labelledby="upcoming-heading" className="scroll-mt-28">
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
          <h2
            id="upcoming-heading"
            className="text-[11px] tracking-[0.28em] text-muted uppercase"
          >
            {appt.upcomingTitle}
            {upcoming.length > 0 ? (
              <span className="ml-2 text-brass">({upcoming.length})</span>
            ) : null}
          </h2>
        </div>

        {upcoming.length === 0 ? (
          <div className="mt-6 flex flex-col items-start gap-5 border border-border/80 bg-surface p-6 md:p-8">
            <p className="max-w-md text-base text-body md:text-lg">{appt.emptyUpcomingLead}</p>
            <ButtonLink href={r.book} variant="book" arrow>
              {appt.bookCta}
            </ButtonLink>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {upcoming.map((appointment) => (
              <li key={appointment.id}>
                <AppointmentCard
                  appointment={appointment}
                  locale={locale}
                  t={t}
                  canCancel={appointment.can_cancel}
                  canReschedule={appointment.can_reschedule}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* History */}
      <section aria-labelledby="past-heading">
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
          <h2
            id="past-heading"
            className="text-[11px] tracking-[0.28em] text-muted uppercase"
          >
            {appt.pastTitle}
            {past.length > 0 ? (
              <span className="ml-2 text-foreground-muted">({past.length})</span>
            ) : null}
          </h2>
        </div>

        {past.length === 0 ? (
          <p className="mt-5 text-sm text-muted">{appt.emptyPastLead}</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {past.map((appointment) => (
              <li key={appointment.id}>
                <AppointmentCard
                  appointment={appointment}
                  locale={locale}
                  t={t}
                  canCancel={false}
                  canReschedule={false}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AccountShell>
  );
}

function AccountShell({
  kicker,
  title,
  lead,
  actions,
  children,
}: {
  kicker: string;
  title: string;
  lead: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="site-wrap-mid page-top-spacious pb-10 md:pb-12">
          <Kicker accent>{kicker}</Kicker>
          <div className="mt-5 flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
            <div className="min-w-0 max-w-xl">
              <h1 className="type-display-title text-foreground">
                {title}
              </h1>
              <p className="mt-3 text-base text-body md:text-lg">{lead}</p>
            </div>
            {actions ? (
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>
        </div>
      </header>
      <div className="bg-background">
        <div className="site-wrap-mid flex flex-col gap-14 py-12 md:gap-16 md:py-16">
          {children}
        </div>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 bg-surface px-5 py-4">
      <dt className="text-[10px] tracking-[0.24em] text-muted uppercase">{label}</dt>
      <dd className="break-all text-sm text-foreground md:text-[15px]">{value}</dd>
    </div>
  );
}
