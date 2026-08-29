import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigured, supabaseServiceRoleKey } from "@/lib/supabase/env";
import { tokensEqual } from "@/lib/booking/token";
import { expireStalePaymentHolds } from "@/lib/payments/expire";
import { completePastAppointments } from "@/lib/payments/complete";
import { syncAppointmentPayment } from "@/lib/payments/sync";
import type { AppointmentStatus } from "@/lib/supabase/types";

export type PaymentReturnAppointment = {
  id: string;
  reference_code: string;
  status: AppointmentStatus;
  payment_status: string;
  starts_at: string;
  deposit_cents: number;
  service_name: string;
  service_slug: string;
  service_price: number;
  manage_token: string | null;
  customer_id: string | null;
};

export async function loadPaymentReturn(opts: {
  referenceCode: string;
  paymentToken: string;
}): Promise<PaymentReturnAppointment | null> {
  if (!supabaseConfigured || !supabaseServiceRoleKey) return null;
  await expireStalePaymentHolds();
  await completePastAppointments();

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("appointments")
    .select(
      `
      id, reference_code, status, payment_status, starts_at, deposit_cents,
      payment_token, nexi_order_id, manage_token, customer_id,
      service:services ( name, slug, price )
    `,
    )
    .eq("reference_code", opts.referenceCode.toUpperCase())
    .maybeSingle();

  if (!data?.payment_token) return null;
  if (!tokensEqual(data.payment_token, opts.paymentToken)) return null;

  if (data.payment_status === "awaiting" && data.nexi_order_id) {
    await syncAppointmentPayment({ appointmentId: data.id });
    const { data: fresh } = await admin
      .from("appointments")
      .select(
        `
        id, reference_code, status, payment_status, starts_at, deposit_cents,
        manage_token, customer_id,
        service:services ( name, slug, price )
      `,
      )
      .eq("id", data.id)
      .maybeSingle();
    if (fresh) return mapRow(fresh);
  }

  return mapRow(data);
}

function mapRow(row: Record<string, unknown>): PaymentReturnAppointment | null {
  const serviceRaw = row.service as
    | { name: string; slug: string; price: number }
    | { name: string; slug: string; price: number }[]
    | null;
  const service = Array.isArray(serviceRaw) ? serviceRaw[0] : serviceRaw;
  if (!service) return null;
  return {
    id: row.id as string,
    reference_code: row.reference_code as string,
    status: row.status as AppointmentStatus,
    payment_status: row.payment_status as string,
    starts_at: row.starts_at as string,
    deposit_cents: Number(row.deposit_cents ?? 0),
    service_name: service.name,
    service_slug: service.slug,
    service_price: Number(service.price),
    manage_token: (row.manage_token as string | null) ?? null,
    customer_id: (row.customer_id as string | null) ?? null,
  };
}
