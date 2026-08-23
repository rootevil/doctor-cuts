import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getSettings } from "@/lib/data/settings";
import { contactFromSettings } from "@/lib/display/contact";
import { SiteFooterView } from "@/components/layout/site-footer-view";

export async function SiteFooter({ locale, t }: { locale: Locale; t: Dictionary }) {
  const settings = await getSettings();
  const contact = contactFromSettings(settings);

  return (
    <SiteFooterView
      locale={locale}
      t={t}
      contact={{
        businessName: contact.businessName,
        addressLine: contact.addressLine,
        postalCity: contact.postalCity,
        phoneDisplay: contact.phoneDisplay,
        telHref: contact.telHref,
        whatsapp: contact.whatsapp,
        instagram: contact.instagram,
      }}
    />
  );
}
