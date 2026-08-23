export const site = {
  name: "Doctor Cuts",
  addressLine: "Via Antelmo Severini, 4/c",
  postalCity: "62100 Macerata MC",
  phoneDisplay: "348 174 8052",
  phoneE164: "+393481748052",
  telHref: "tel:+393481748052",
  instagram: "https://www.instagram.com/dr_barbiere/",
  instagramHandle: "dr_barbiere",
  facebook: "https://www.facebook.com/206368819943168",
  whatsapp: "https://wa.me/393481748052",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Via+Antelmo+Severini+4/C+62100+Macerata",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Via+Antelmo+Severini+4%2FC+62100+Macerata&output=embed",
  established: 2025,
} as const;

export const hours = [
  {
    id: "week",
    days: { it: "LUN — SAB", en: "MON — SAT" },
    time: { it: "08:30 — 21:00", en: "08:30 — 21:00" },
  },
  {
    id: "sun",
    days: { it: "DOM", en: "SUN" },
    time: { it: "Chiuso", en: "Closed" },
  },
] as const;

export const services = [
  {
    id: "01",
    slug: "haircut",
    price: 15,
    duration: 30,
    image: "/images/cut-detail.jpg",
    heroImage: "/images/cut-detail.jpg",
  },
  {
    id: "02",
    slug: "beard-fade",
    price: 10,
    duration: 25,
    image: "/images/beard.jpg",
    heroImage: "/images/beard.jpg",
  },
  {
    id: "03",
    slug: "face-mask",
    price: 10,
    duration: 25,
    image: "/images/portrait.jpg",
    heroImage: "/images/portrait.jpg",
  },
  {
    id: "04",
    slug: "face-massage",
    price: 40,
    duration: 45,
    image: "/images/leave.jpg",
    heroImage: "/images/leave.jpg",
  },
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];

export const galleryItems = [
  { src: "/images/gallery-01.jpg", category: "studio", title: { it: "In studio", en: "In studio" } },
  { src: "/images/gallery-02.jpg", category: "cuts", title: { it: "Ritratto", en: "Portrait" } },
  { src: "/images/gallery-03.jpg", category: "fade", title: { it: "Fade", en: "Fade" } },
  { src: "/images/gallery-04.jpg", category: "studio", title: { it: "Al lavoro", en: "At work" } },
  { src: "/images/gallery-05.jpg", category: "fade", title: { it: "Texture", en: "Texture" } },
  { src: "/images/gallery-06.jpg", category: "style", title: { it: "Design", en: "Design" } },
  { src: "/images/gallery-07.jpg", category: "cuts", title: { it: "Taglio", en: "Cut" } },
  { src: "/images/gallery-08.jpg", category: "style", title: { it: "Linee", en: "Lines" } },
] as const;

export const galleryFilters = [
  "all",
  "cuts",
  "fade",
  "beard",
  "style",
  "studio",
] as const;

export type GalleryFilter = (typeof galleryFilters)[number];

export function formatPrice(amount: number, locale: "it" | "en") {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
