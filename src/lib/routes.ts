import { defaultLocale, type Locale } from "@/i18n/config";

/**
 * Canonical routes. Path segments stay Italian per PRODUCT_SPEC §4.
 * Public hrefs always use the Italian locale prefix (`/it/...`). English is
 * a content language (cookie), not a second URL tree.
 */
function buildRoutes(locale: Locale) {
  return {
    home: `/${locale}`,
    services: `/${locale}/servizi`,
    service: (slug: string) => `/${locale}/servizi/${slug}`,
    gallery: `/${locale}/galleria`,
    about: `/${locale}/storia`,
    contact: `/${locale}/contatti`,
    book: `/${locale}/prenota`,
    bookPayment: (code: string, token: string) =>
      `/${locale}/prenota/pagamento?ref=${encodeURIComponent(code)}&p=${encodeURIComponent(token)}`,
    bookService: (slug: string) =>
      `/${locale}/prenota?service=${encodeURIComponent(slug)}`,
    bookReschedule: (appointmentId: string) =>
      `/${locale}/prenota?reschedule=${encodeURIComponent(appointmentId)}`,
    bookRescheduleGuest: (appointmentId: string, code: string, token: string) =>
      `/${locale}/prenota?reschedule=${encodeURIComponent(appointmentId)}&code=${encodeURIComponent(code)}&t=${encodeURIComponent(token)}`,
    manageBooking: (code: string, token: string) =>
      `/${locale}/gestisci-prenotazione/${encodeURIComponent(code)}?t=${encodeURIComponent(token)}`,
    account: `/${locale}/account`,
    accountAppointments: `/${locale}/account/appuntamenti`,
    signIn: `/${locale}/accedi`,
    signUp: `/${locale}/registrati`,
    admin: `/${locale}/admin`,
    adminAppointments: `/${locale}/admin/appuntamenti`,
    adminServices: `/${locale}/admin/servizi`,
    adminServiceNew: `/${locale}/admin/servizi/nuovo`,
    adminServiceEdit: (id: string) => `/${locale}/admin/servizi/${id}`,
    adminHours: `/${locale}/admin/orari`,
    adminCustomers: `/${locale}/admin/clienti`,
    adminGallery: `/${locale}/admin/galleria`,
    adminReviews: `/${locale}/admin/recensioni`,
    adminSettings: `/${locale}/admin/impostazioni`,
  } as const;
}

export type SiteRoutes = ReturnType<typeof buildRoutes>;

/** Links shown in the browser — always `/it/...`. */
export function routes(locale?: Locale) {
  void locale;
  return buildRoutes(defaultLocale);
}

export function forEachLocaleRoute(pick: (r: SiteRoutes) => string) {
  return [pick(routes())];
}
