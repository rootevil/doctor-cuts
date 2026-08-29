import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AppointmentPaymentState = {
  status: string;
  payment_status: string;
};

export async function fetchAppointmentPaymentState(
  appointmentId: string,
): Promise<AppointmentPaymentState | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("appointments")
    .select("status, payment_status")
    .eq("id", appointmentId)
    .maybeSingle();
  return data ?? null;
}

export function isConfirmedPaid(row: AppointmentPaymentState | null | undefined) {
  return row?.payment_status === "paid" && row?.status === "confirmed";
}

/** Hold was released — a late Stripe charge should be refunded, not confirmed. */
export function isHoldGone(row: AppointmentPaymentState | null | undefined) {
  if (!row) return true;
  return (
    row.status === "cancelled" ||
    row.payment_status === "expired" ||
    row.payment_status === "failed"
  );
}
