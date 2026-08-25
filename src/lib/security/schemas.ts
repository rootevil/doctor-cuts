import { z } from "zod";
import { isLocale } from "@/i18n/config";

// One place for every form/action's input contract. Keep the messages here
// generic — user-facing copy is picked from the dictionary in the caller so
// we don't hardcode language here.

const trimmed = (max: number) =>
  z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(max));

export const localeSchema = z.string().refine(isLocale, {
  message: "invalid_locale",
});

export const emailSchema = trimmed(254).pipe(z.string().email());

// Supabase enforces min 6; we require 8. Keep the upper bound generous but
// finite so a malicious client can't send a 10 MB "password".
export const passwordSchema = z.string().min(8).max(200);

export const signInSchema = z.object({
  locale: localeSchema,
  email: emailSchema,
  password: passwordSchema,
  next: z.string().max(500).optional(),
});

export const signUpSchema = z.object({
  locale: localeSchema,
  full_name: trimmed(120).optional(),
  phone: trimmed(40).optional(),
  email: emailSchema,
  password: passwordSchema,
});

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "invalid_date");

export const uuidSchema = z.string().uuid();

export const guestDetailsSchema = z.object({
  name: trimmed(120).pipe(z.string().min(1)),
  email: emailSchema,
  phone: trimmed(40).optional(),
});

export const bookingInputSchema = z.object({
  serviceId: uuidSchema,
  startsAtUTC: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/)),
  notes: trimmed(500).optional(),
  locale: localeSchema,
  guest: guestDetailsSchema.optional(),
});

export const cancelBookingSchema = z.object({
  appointment_id: uuidSchema,
  locale: localeSchema,
});

export const manageTokenSchema = z
  .string()
  .min(24)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/);

export const guestManageSchema = z.object({
  locale: localeSchema,
  reference_code: z
    .string()
    .regex(/^DC-[A-Z0-9]{4}$/),
  token: manageTokenSchema,
});

// Admin ------------------------------------------------------------------

export const appointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "arrived",
  "completed",
  "cancelled",
  "no_show",
]);

export const adminAppointmentStatusSchema = z.object({
  locale: localeSchema,
  appointment_id: uuidSchema,
  status: appointmentStatusSchema,
});

export const adminAppointmentNotesSchema = z.object({
  locale: localeSchema,
  appointment_id: uuidSchema,
  admin_notes: trimmed(2000).optional(),
});

export const serviceSchema = z.object({
  locale: localeSchema,
  id: uuidSchema.optional().nullable(),
  name: trimmed(120).pipe(z.string().min(1)),
  slug: trimmed(120)
    .transform((v) => v.toLowerCase())
    .pipe(z.string().regex(/^[a-z0-9-]+$/, "invalid_slug"))
    .optional()
    .or(z.literal("")),
  description: trimmed(2000).optional(),
  price: z.coerce.number().min(0).max(9999),
  duration_minutes: z.coerce.number().int().min(5).max(600),
  image_url: trimmed(500).optional(),
  sort_order: z.coerce.number().int().min(0).max(9999).optional(),
  is_active: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

export const curatedReviewSchema = z.object({
  locale: localeSchema,
  author_name: trimmed(80).pipe(z.string().min(1)),
  rating: z.coerce.number().int().min(1).max(5),
  comment: trimmed(1200).pipe(z.string().min(8)),
  is_featured: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
});

export const settingsSchema = z.object({
  locale: localeSchema,
  business_name: trimmed(120).pipe(z.string().min(1)),
  address: trimmed(200),
  phone: trimmed(40).optional(),
  email: trimmed(254).optional(),
  instagram: trimmed(200).optional(),
  facebook: trimmed(200).optional(),
  whatsapp: trimmed(200).optional(),
  booking_notice_hours: z.coerce.number().int().min(0).max(720),
  max_booking_days: z.coerce.number().int().min(1).max(365),
  cancellation_hours: z.coerce.number().int().min(0).max(720),
  require_confirmation: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
  bookings_enabled: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
  deposit_required: z.union([z.literal("on"), z.literal(""), z.undefined()]).optional(),
  deposit_cents: z.coerce.number().int().min(0).max(50000).optional(),
  slot_interval_minutes: z.coerce.number().int().min(5).max(180),
});

export function fdToObject(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}
