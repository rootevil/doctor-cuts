import { NextResponse } from "next/server";
import { sendTomorrowReminders } from "@/lib/email/reminders";
import { cronAuthorized } from "@/lib/security/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Day-before booking reminders.
 * Vercel Cron calls this once daily (see vercel.json).
 * Protect with CRON_SECRET via Authorization: Bearer <secret>.
 */
function authorized(request: Request) {
  return cronAuthorized(request);
}

async function handle(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await sendTomorrowReminders();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
