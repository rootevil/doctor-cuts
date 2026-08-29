"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  supabaseConfigured,
  supabaseServiceRoleKey,
} from "@/lib/supabase/env";
import { isLocale, type Locale } from "@/i18n/config";
import { routes, forEachLocaleRoute, type SiteRoutes } from "@/lib/routes";
import {
  adminAppointmentNotesSchema,
  adminCancelRefundSchema,
  curatedReviewSchema,
  fdToObject,
  serviceSchema,
  settingsSchema,
} from "@/lib/security/schemas";
import { getDictionary } from "@/i18n/dictionaries";
import { isAllowedAdminEmail } from "@/lib/auth/admin-email";
import { cancelAppointmentAndRefund } from "@/lib/payments/cancel";
import { bookingAlertAddress, sendEmail } from "@/lib/email/send";
import {
  cancellationEmail,
  shopCancellationAlertEmail,
  resolveCustomerDisplayName,
} from "@/lib/email/templates";
import { getSettings } from "@/lib/data/settings";
import { localizedServiceName } from "@/lib/services/localize";
import { BOOKING_SLOT_MINUTES } from "@/lib/booking/slot";
import { formatEurFromCents } from "@/lib/payments/deposit";
import { siteUrl } from "@/lib/seo/site-url";

function coerceLocale(value: FormDataEntryValue | null): Locale {
  const raw = typeof value === "string" ? value : "";
  return isLocale(raw) ? raw : "it";
}

async function requireAdminClient() {
  if (!supabaseConfigured) throw new Error("Supabase not configured");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  if (!isAllowedAdminEmail(user.email)) throw new Error("Not authorised");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Not authorised");
  return { supabase, userId: user.id };
}

function revalidatePicked(pick: (r: SiteRoutes) => string, type?: "layout") {
  for (const path of forEachLocaleRoute(pick)) {
    if (type) revalidatePath(path, type);
    else revalidatePath(path);
  }
}

function revalidatePublic() {
  for (const path of forEachLocaleRoute((r) => r.home)) revalidatePath(path);
  for (const path of forEachLocaleRoute((r) => r.services)) revalidatePath(path);
  for (const path of forEachLocaleRoute((r) => r.gallery)) revalidatePath(path);
  for (const path of forEachLocaleRoute((r) => r.contact)) revalidatePath(path);
  for (const path of forEachLocaleRoute((r) => r.about)) revalidatePath(path);
  for (const path of forEachLocaleRoute((r) => r.book)) revalidatePath(path);
  for (const path of forEachLocaleRoute((r) => r.admin)) revalidatePath(path, "layout");
}

function revalidateReviewsAdmin() {
  for (const path of forEachLocaleRoute((r) => r.adminReviews)) revalidatePath(path);
}

/* ------------------------------------------------------------------ */
/*  Appointments                                                       */
/* ------------------------------------------------------------------ */

export async function cancelAndRefundAppointment(formData: FormData) {
  await requireAdminClient();
  if (!supabaseServiceRoleKey) {
    return { ok: false as const, reason: "unknown" as const, message: "not_configured" };
  }
  const parsed = adminCancelRefundSchema.safeParse(fdToObject(formData));
  if (!parsed.success) return { ok: false as const, reason: "not_found" as const };
  const { appointment_id, locale } = parsed.data;

  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("appointments")
    .select(
      `id, starts_at, status, reference_code, deposit_cents, locale,
       customer_id, guest_name, guest_email, guest_phone, manage_token,
       service:services ( slug, name, price )`,
    )
    .eq("id", appointment_id)
    .maybeSingle();
  if (!existing) return { ok: false as const, reason: "not_found" as const };

  const alreadyCancelled = existing.status === "cancelled";
  const result = await cancelAppointmentAndRefund(appointment_id);
  if (!result.ok) {
    return {
      ok: false as const,
      reason: result.reason ?? ("unknown" as const),
      message: result.message,
    };
  }

  const service = Array.isArray(existing.service)
    ? existing.service[0]
    : existing.service;
  let to = existing.guest_email as string | null;
  let customerName: string | null = existing.guest_name;
  let customerPhone = existing.guest_phone as string | null;
  if (existing.customer_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", existing.customer_id)
      .maybeSingle();
    to = profile?.email ?? to;
    customerName = resolveCustomerDisplayName({
      fullName: profile?.full_name,
      guestName: existing.guest_name,
      email: to,
    });
    customerPhone = profile?.phone?.trim() || customerPhone;
  } else {
    customerName = resolveCustomerDisplayName({
      guestName: existing.guest_name,
      email: to,
    });
  }

  if (to && service && !alreadyCancelled) {
    const settings = await getSettings();
    const mailLocale = isLocale(locale) ? locale : "it";
    const refundLabel =
      result.refunded && Number(existing.deposit_cents) > 0
        ? formatEurFromCents(Number(existing.deposit_cents), mailLocale)
        : null;
    const managePath =
      !existing.customer_id && existing.manage_token
        ? routes(mailLocale).manageBooking(
            existing.reference_code,
            existing.manage_token,
          )
        : routes(mailLocale).account;
    const origin = siteUrl;
    const template = cancellationEmail({
      locale: mailLocale,
      customerName,
      serviceName: localizedServiceName(mailLocale, service.slug, service.name),
      startsAt: existing.starts_at,
      durationMinutes: BOOKING_SLOT_MINUTES,
      referenceCode: existing.reference_code,
      price: Number(service.price),
      settings,
      manageUrl: `${origin}${managePath}`,
      depositRefundedLabel: refundLabel,
    });
    await sendEmail({ to, ...template });
    const alert = shopCancellationAlertEmail({
      customerName,
      customerEmail: to,
      customerPhone,
      serviceName: localizedServiceName("en", service.slug, service.name),
      startsAt: existing.starts_at,
      durationMinutes: BOOKING_SLOT_MINUTES,
      referenceCode: existing.reference_code,
      price: Number(service.price),
      adminUrl: `${origin}${routes("it").adminAppointments}`,
      depositRefundedLabel: refundLabel,
    });
    await sendEmail({ to: bookingAlertAddress(), ...alert, replyTo: to });
  }

  revalidatePicked((r) => r.admin, "layout");
  revalidatePicked((r) => r.account);
  revalidatePicked((r) => r.accountAppointments);
  return { ok: true as const, refunded: result.refunded };
}

export async function updateAppointmentNotes(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const parsed = adminAppointmentNotesSchema.safeParse(fdToObject(formData));
  if (!parsed.success) return;
  const { appointment_id, admin_notes } = parsed.data;

  const { error } = await supabase
    .from("appointments")
    .update({ admin_notes: admin_notes || null })
    .eq("id", appointment_id);
  if (error) throw new Error(error.message);
  revalidatePicked((r) => r.admin, "layout");
}

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */

export type ServiceFormState = { error?: string; success?: string };

function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveService(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const { supabase } = await requireAdminClient();
  const parsed = serviceSchema.safeParse(fdToObject(formData));
  const localeHint = coerceLocale(formData.get("locale"));
  const messages = getDictionary(localeHint).pages.admin.messages;
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? messages.invalid };
  }
  const v = parsed.data;

  const locale = v.locale;
  const id = v.id || null;
  const slug = v.slug && v.slug.length > 0 ? v.slug : slugify(v.name);

  const payload = {
    slug,
    name: v.name,
    description: v.description || null,
    price: v.price,
    duration_minutes: v.duration_minutes,
    image_url: v.image_url || null,
    sort_order: v.sort_order ?? 0,
    is_active: v.is_active === "on",
  };

  const humanise = (message: string) =>
    /duplicate key|unique constraint/i.test(message)
      ? messages.slugTaken.replace("{slug}", slug)
      : message;

  if (id) {
    const { error } = await supabase.from("services").update(payload).eq("id", id);
    if (error) return { error: humanise(error.message) };
  } else {
    const { error } = await supabase.from("services").insert(payload);
    if (error) return { error: humanise(error.message) };
  }

  revalidatePicked((r) => r.adminServices, "layout");
  revalidatePublic();
  redirect(routes(locale).adminServices);
}

export async function toggleServiceActive(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const id = String(formData.get("id") ?? "");
  const is_active = formData.get("is_active") === "on";
  if (!id) return;
  const { error } = await supabase.from("services").update({ is_active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePicked((r) => r.adminServices, "layout");
  revalidatePublic();
}

export async function deleteService(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePicked((r) => r.adminServices, "layout");
  revalidatePublic();
}

/* ------------------------------------------------------------------ */
/*  Hours + breaks + blocked dates                                     */
/* ------------------------------------------------------------------ */

export async function saveHours(formData: FormData) {
  const { supabase } = await requireAdminClient();

  // Fields come as e.g. hours[1][open]=10:00, hours[1][close]=21:00, hours[1][closed]=on
  const updates: Array<{
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }> = [];

  for (let dow = 1; dow <= 7; dow++) {
    const closed = formData.get(`hours[${dow}][closed]`) === "on";
    const open = String(formData.get(`hours[${dow}][open]`) ?? "").trim();
    const close = String(formData.get(`hours[${dow}][close]`) ?? "").trim();
    updates.push({
      day_of_week: dow,
      open_time: closed ? null : (open || null),
      close_time: closed ? null : (close || null),
      is_closed: closed,
    });
  }

  const { error } = await supabase
    .from("business_hours")
    .upsert(updates, { onConflict: "day_of_week" });
  if (error) throw new Error(error.message);
  revalidatePicked((r) => r.adminHours);
  revalidatePublic();
}

export async function addBlockedDate(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const date = String(formData.get("date") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() || null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const { error } = await supabase.from("blocked_dates").insert({ date, reason });
  if (error && !error.message.includes("duplicate")) throw new Error(error.message);
  revalidatePicked((r) => r.adminHours);
  revalidatePublic();
}

export async function removeBlockedDate(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePicked((r) => r.adminHours);
  revalidatePublic();
}

export async function addBreak(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const dayRaw = String(formData.get("day_of_week") ?? "").trim();
  const start = String(formData.get("start_time") ?? "").trim();
  const end = String(formData.get("end_time") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  if (!start || !end) return;
  const day_of_week = dayRaw === "" || dayRaw === "all" ? null : Number(dayRaw);
  const { error } = await supabase.from("breaks").insert({
    day_of_week: Number.isFinite(day_of_week as number) ? day_of_week : null,
    start_time: start.length === 5 ? `${start}:00` : start,
    end_time: end.length === 5 ? `${end}:00` : end,
    label,
  });
  if (error) throw new Error(error.message);
  revalidatePicked((r) => r.adminHours);
  revalidatePublic();
}

export async function removeBreak(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("breaks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePicked((r) => r.adminHours);
  revalidatePublic();
}

/* ------------------------------------------------------------------ */
/*  Gallery (Supabase Storage bucket "gallery")                        */
/* ------------------------------------------------------------------ */

export type GalleryFormState = { error?: string; success?: string };

export async function uploadGalleryImage(
  _prevState: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  const { supabase } = await requireAdminClient();
  const locale = coerceLocale(formData.get("locale"));
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);

  if (!(file instanceof File) || file.size === 0) {
    return { error: getDictionary(locale).pages.admin.messages.selectImage };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: getDictionary(locale).pages.admin.messages.imageTooLarge };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const uploadClient = supabaseServiceRoleKey
    ? createSupabaseAdminClient()
    : supabase; // Falls back to the RLS-scoped client; Storage RLS still allows admins.

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await uploadClient.storage
    .from("gallery")
    .upload(key, bytes, { contentType: file.type || "image/jpeg", upsert: false });
  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = uploadClient.storage.from("gallery").getPublicUrl(key);

  const { error: insertError } = await supabase.from("gallery").insert({
    image_url: publicUrl,
    title,
    category,
    sort_order: Number.isFinite(sort_order) ? sort_order : 0,
  });
  if (insertError) return { error: insertError.message };

  revalidatePicked((r) => r.adminGallery);
  revalidatePublic();
  return { success: getDictionary(locale).pages.admin.messages.uploaded };
}

export async function updateGalleryItem(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const id = String(formData.get("id") ?? "");
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const is_featured = formData.get("is_featured") === "on";
  const title = String(formData.get("title") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  if (!id) return;
  const { error } = await supabase
    .from("gallery")
    .update({
      sort_order: Number.isFinite(sort_order) ? sort_order : 0,
      is_featured,
      title,
      category,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePicked((r) => r.adminGallery);
  revalidatePublic();
}

export async function deleteGalleryItem(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const id = String(formData.get("id") ?? "");
  const imageUrl = String(formData.get("image_url") ?? "");
  if (!id) return;

  await supabase.from("gallery").delete().eq("id", id);

  // Remove the Storage object too, but only for files we uploaded (URLs that
  // point at the gallery bucket). Static /images/* files are left alone.
  if (imageUrl.includes("/storage/v1/object/public/gallery/")) {
    const key = imageUrl.split("/storage/v1/object/public/gallery/")[1];
    if (key) {
      const client = supabaseServiceRoleKey ? createSupabaseAdminClient() : supabase;
      await client.storage.from("gallery").remove([key]);
    }
  }

  revalidatePicked((r) => r.adminGallery);
  revalidatePublic();
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

export type CuratedReviewFormState = { error?: string; success?: string };

/** Admin-curated quote from Google Maps (no API). Goes live as approved + optional featured. */
export async function createCuratedReview(
  _prevState: CuratedReviewFormState,
  formData: FormData,
): Promise<CuratedReviewFormState> {
  const { supabase } = await requireAdminClient();
  const parsed = curatedReviewSchema.safeParse(fdToObject(formData));
  if (!parsed.success) {
    return { error: "invalid" };
  }
  const { author_name, rating, comment, is_featured } = parsed.data;
  const featured = is_featured === "on";

  if (featured) {
    const { count } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_featured", true);
    if ((count ?? 0) >= 5) {
      return { error: "featured_limit" };
    }
  }

  const { error } = await supabase.from("reviews").insert({
    author_name,
    rating,
    comment,
    source: "google",
    status: "approved",
    is_featured: featured,
    customer_id: null,
    appointment_id: null,
  });
  if (error) return { error: error.message };

  revalidateReviewsAdmin();
  revalidatePublic();
  return { success: "created" };
}

export async function moderateReview(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as
    | "approved"
    | "rejected"
    | "pending";
  const is_featured = formData.get("is_featured") === "on";
  if (!id) return;

  if (is_featured && status === "approved") {
    const { count } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_featured", true)
      .neq("id", id);
    if ((count ?? 0) >= 5) {
      // Soft-fail: keep previous featured state rather than exceeding homepage cap.
      const payload: Record<string, unknown> = { status };
      const { error } = await supabase.from("reviews").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      revalidateReviewsAdmin();
      revalidatePublic();
      return;
    }
  }

  const payload: Record<string, unknown> = { is_featured };
  if (["approved", "rejected", "pending"].includes(status)) payload.status = status;
  const { error } = await supabase.from("reviews").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateReviewsAdmin();
  revalidatePublic();
}

export async function deleteReview(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateReviewsAdmin();
  revalidatePublic();
}

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

export type SettingsFormState = { error?: string; success?: string };

export async function saveSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const { supabase } = await requireAdminClient();
  const parsed = settingsSchema.safeParse(fdToObject(formData));
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        getDictionary(coerceLocale(formData.get("locale"))).pages.admin.messages.invalid,
    };
  }
  const v = parsed.data;
  const locale = v.locale;

  const payload = {
    business_name: v.business_name,
    address: v.address,
    phone: v.phone || null,
    email: v.email || null,
    instagram: v.instagram || null,
    facebook: v.facebook || null,
    whatsapp: v.whatsapp || null,
    booking_notice_hours: v.booking_notice_hours,
    max_booking_days: v.max_booking_days,
    cancellation_hours: v.cancellation_hours,
    require_confirmation: v.require_confirmation === "on",
    bookings_enabled: v.bookings_enabled === "on",
    deposit_required: v.deposit_required === "on",
    deposit_cents: v.deposit_cents ?? 500,
    slot_interval_minutes: v.slot_interval_minutes,
  };

  const { data: existing } = await supabase.from("settings").select("id").maybeSingle();
  if (existing?.id) {
    const { error } = await supabase.from("settings").update(payload).eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("settings").insert({ ...payload, singleton: true });
    if (error) return { error: error.message };
  }
  revalidatePicked((r) => r.adminSettings, "layout");
  revalidatePublic();
  return { success: getDictionary(locale).pages.admin.messages.saved };
}
