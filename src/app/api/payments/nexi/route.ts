import { NextResponse } from "next/server";
import { notificationLooksPaid, syncAppointmentPayment } from "@/lib/payments/sync";
import { paymentProvider } from "@/lib/payments/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Nexi server-to-server notification. Only active when Nexi is the live
 * provider. Confirms only after Nexi's order API agrees the deposit was paid
 * and the security token matches.
 */
export async function POST(request: Request) {
  if (paymentProvider() !== "nexi") {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const contentType = request.headers.get("content-type") || "";
  let payload: unknown = null;
  if (contentType.includes("json")) {
    payload = await request.json().catch(() => null);
  } else {
    const text = await request.text();
    try {
      payload = JSON.parse(text);
    } catch {
      payload = Object.fromEntries(new URLSearchParams(text));
    }
  }
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const record = payload as Record<string, unknown>;
  const orderObj =
    record.order && typeof record.order === "object"
      ? (record.order as Record<string, unknown>)
      : null;
  const orderId =
    pickString(record.orderId) ||
    pickString(orderObj?.orderId);
  const securityToken =
    pickString(record.securityToken) || pickString(record.security_token);

  if (!orderId) {
    return NextResponse.json({ ok: false, error: "missing_order" }, { status: 400 });
  }
  if (!securityToken) {
    return NextResponse.json({ ok: false, error: "missing_token" }, { status: 400 });
  }

  if (!notificationLooksPaid(payload)) {
    return NextResponse.json({ ok: true, paid: false });
  }

  const applied = await syncAppointmentPayment({ orderId, securityToken });
  return NextResponse.json({ ok: applied.ok, paid: applied.paid });
}

function pickString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
