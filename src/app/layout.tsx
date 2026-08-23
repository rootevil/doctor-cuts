import type { Metadata, Viewport } from "next";
import { preconnect, prefetchDNS } from "react-dom";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/seo/site-url";
import { supabaseUrl } from "@/lib/supabase/env";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Doctor Cuts — Barbershop premium",
    template: "%s · Doctor Cuts",
  },
  description: "Premium men’s grooming studio in Macerata.",
  applicationName: "Doctor Cuts",
  authors: [{ name: "Doctor Cuts" }],
  creator: "Doctor Cuts",
  publisher: "Doctor Cuts",
  formatDetection: { telephone: true, email: true, address: false },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "Doctor Cuts",
    url: "/",
    locale: "it_IT",
    alternateLocale: ["en_GB"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090909" },
    { media: "(prefers-color-scheme: light)", color: "#090909" },
  ],
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Resource hints go through React 19's preconnect API so we never render a
  // manual <head> — Next owns that node, and a competing <head> is what
  // throws `removeChild` during hydration / client navigations.
  if (supabaseUrl) {
    preconnect(supabaseUrl, { crossOrigin: "anonymous" });
    prefetchDNS(supabaseUrl);
  }

  return (
    <html
      lang="it"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${instrument.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
