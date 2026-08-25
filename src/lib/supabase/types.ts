/**
 * Minimal, hand-written database types for Phase 3.
 * When Phase 6 lands, replace with generated types via
 * `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`.
 */

export type UserRole = "customer" | "admin";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "arrived"
  | "completed"
  | "cancelled"
  | "no_show";
export type ReviewStatus = "pending" | "approved" | "rejected";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AppointmentRow = {
  id: string;
  customer_id: string | null;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  customer_notes: string | null;
  admin_notes: string | null;
  reference_code: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  manage_token: string | null;
  locale: "it" | "en";
  reminder_sent_at: string | null;
  payment_status: "none" | "awaiting" | "paid" | "failed" | "expired";
  deposit_cents: number;
  nexi_order_id: string | null;
  payment_token: string | null;
  payment_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SettingsRow = {
  id: string;
  singleton: boolean;
  business_name: string;
  address: string;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  facebook: string | null;
  whatsapp: string | null;
  booking_notice_hours: number;
  max_booking_days: number;
  cancellation_hours: number;
  require_confirmation: boolean;
  /** When false, online booking is paused for customers. */
  bookings_enabled: boolean;
  slot_interval_minutes: number;
  deposit_required: boolean;
  deposit_cents: number;
  updated_at: string;
};
