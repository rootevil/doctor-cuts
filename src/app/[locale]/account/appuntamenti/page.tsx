import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { AppointmentCard } from "@/components/account/appointment-card";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";
import { listAppointmentsForCurrentUser } from "@/lib/data/appointments";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.pages.account.appointments.metaTitle,
    description: t.pages.account.appointments.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function AppointmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const r = routes(locale);
  const copy = t.pages.account.appointments;

  const { upcoming, past } = await listAppointmentsForCurrentUser();

  return (
    <>
      <PageHero
        kicker={copy.kicker}
        title={copy.title}
        lead={copy.lead}
        crumb={{ href: r.account, label: copy.backToAccount }}
      />
      <section className="bg-background">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-14 px-6 py-16 md:px-10 md:py-24">
          <div className="flex flex-col gap-6">
            <SectionHeader title={copy.upcomingTitle} />
            {upcoming.length === 0 ? (
              <EmptyState
                lead={copy.emptyUpcomingLead}
                cta={
                  <Link
                    href={r.book}
                    className="inline-flex w-fit items-center gap-3 bg-foreground px-5 py-3 text-[11px] tracking-[0.28em] text-background uppercase transition hover:opacity-90"
                  >
                    {copy.bookCta}
                    <span aria-hidden>→</span>
                  </Link>
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                {upcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    locale={locale}
                    t={t}
                    canCancel={appointment.can_cancel}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <SectionHeader title={copy.pastTitle} />
            {past.length === 0 ? (
              <p className="text-sm text-muted">{copy.emptyPastLead}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {past.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    locale={locale}
                    t={t}
                    canCancel={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border pb-3">
      <h2 className="text-[11px] tracking-[0.28em] text-muted uppercase">{title}</h2>
    </div>
  );
}

function EmptyState({ lead, cta }: { lead: string; cta: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-6 border border-border p-8">
      <p className="max-w-md text-lg text-muted">{lead}</p>
      {cta}
    </div>
  );
}
