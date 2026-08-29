import { NextResponse } from "next/server";
import { expireStalePaymentHolds } from "@/lib/payments/expire";
import { completePastAppointments } from "@/lib/payments/complete";
import { cronAuthorized } from "@/lib/security/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  return cronAuthorized(request);
}

async function handle(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const expired = await expireStalePaymentHolds();
  const completed = await completePastAppointments();
  return NextResponse.json({ ok: true, expired, completed });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
