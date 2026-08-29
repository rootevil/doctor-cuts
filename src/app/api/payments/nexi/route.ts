import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Nexi webhook is disabled. Stripe is the only payment provider.
 * POST /api/payments/stripe is the live confirm path.
 */
export async function POST() {
  return NextResponse.json({ ok: false, error: "nexi_disabled" }, { status: 410 });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "nexi_disabled" }, { status: 410 });
}

// --- Original Nexi notification handler (disabled) ---
// import { notificationLooksPaid, syncAppointmentPayment } from "@/lib/payments/sync";
// import { paymentProvider } from "@/lib/payments/config";
//
// export async function POST(request: Request) {
//   if (paymentProvider() !== "nexi") {
//     return NextResponse.json({ ok: false }, { status: 503 });
//   }
//   // parse JSON / form body → orderId + securityToken
//   // if (!notificationLooksPaid(payload)) return { ok: true, paid: false };
//   // return syncAppointmentPayment({ orderId, securityToken });
// }
