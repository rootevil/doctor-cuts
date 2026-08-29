import { NextResponse } from "next/server";
import { expireStalePaymentHolds } from "@/lib/payments/expire";
import { completePastAppointments } from "@/lib/payments/complete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
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
