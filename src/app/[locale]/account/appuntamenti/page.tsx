import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

/** Appointments now live on the main account page. */
export default async function AppointmentsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  redirect(`${routes(raw).account}#appointments`);
}
