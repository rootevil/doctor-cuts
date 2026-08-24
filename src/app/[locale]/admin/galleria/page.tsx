import { notFound } from "next/navigation";
import Image from "next/image";
import { AdminSection } from "@/components/admin/section";
import { GalleryUploader } from "@/components/admin/gallery-uploader";
import { GalleryItemControls } from "@/components/admin/gallery-item-controls";
import { listGallery } from "@/lib/admin/data";
import { getDictionary } from "@/i18n/dictionaries";
import { isLocale, locales } from "@/i18n/config";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AdminGalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getDictionary(locale);
  const copy = t.pages.admin.gallery;
  const items = await listGallery();

  return (
    <AdminSection kicker={copy.kicker} title={copy.title} lead={copy.lead}>
      <div className="admin-panel">
        <GalleryUploader locale={locale} t={t} />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-body">{copy.empty}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="admin-panel-raised flex flex-col gap-2 p-3">
              <div className="relative aspect-square overflow-hidden bg-black/40">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title ?? ""}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized={item.image_url.startsWith("/images/") ? false : true}
                  />
                ) : null}
              </div>
              <GalleryItemControls
                id={item.id}
                imageUrl={item.image_url}
                locale={locale}
                defaultFeatured={item.is_featured}
                defaultSortOrder={item.sort_order}
                defaultTitle={item.title ?? ""}
                defaultCategory={item.category ?? "studio"}
                labels={{
                  featured: copy.featured,
                  remove: copy.remove,
                  title: copy.titleField,
                  category: copy.category,
                  sortOrder: copy.sortOrder,
                  save: copy.saveItem,
                }}
                categoryLabels={{
                  cuts: t.gallery.filters.cuts,
                  fade: t.gallery.filters.fade,
                  beard: t.gallery.filters.beard,
                  style: t.gallery.filters.style,
                  studio: t.gallery.filters.studio,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </AdminSection>
  );
}
