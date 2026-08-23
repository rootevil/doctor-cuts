import type { Locale } from "@/i18n/config";

/**
 * Canonical routes. Path segments stay Italian per PRODUCT_SPEC §4 —
 * both locales use the same URL structure, prefixed by the locale segment.
 */
export function routes(locale: Locale) {
  return {
    home: `/${locale}`,
    services: `/${locale}/servizi`,
    service: (slug: string) => `/${locale}/servizi/${slug}`,
    gallery: `/${locale}/galleria`,
    about: `/${locale}/storia`,
    contact: `/${locale}/contatti`,
    book: `/${locale}/prenota`,
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
