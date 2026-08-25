import { NextResponse } from "next/server";
import { sendTomorrowReminders } from "@/lib/email/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Day-before booking reminders.
 * Vercel Cron calls this once daily (see vercel.json).
 * Protect with CRON_SECRET — Authorization: Bearer <secret>
 * or ?secret=<secret> for manual runs.
 */
function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  if (url.searchParams.get("secret") === secret) return true;

  return false;
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
