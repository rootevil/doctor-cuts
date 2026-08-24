import "server-only";

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM || "Doctor Cuts <bookings@dr-cuts.com>";
const replyToAddress = process.env.EMAIL_REPLY_TO || "bookings@dr-cuts.com";

const resend = apiKey ? new Resend(apiKey) : null;

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

/**
 * Send a transactional email. When `RESEND_API_KEY` isn't set we log a summary
 * to stdout and return { queued: false, delivered: false } — the caller keeps
 * going, so the booking flow still works in local dev without email keys.
 */
export async function sendEmail(
  payload: EmailPayload,
): Promise<{ queued: boolean; delivered: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.info("[email] (dry-run) →", {
      to: payload.to,
      subject: payload.subject,
      preview: payload.text?.slice(0, 160) ?? payload.html.replace(/<[^>]+>/g, " ").slice(0, 160),
    });
    return { queued: false, delivered: false };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo ?? replyToAddress,
    });
    if (error) return { queued: true, delivered: false, error: error.message };
    return { queued: true, delivered: true, id: data?.id };
  } catch (err) {
    return {
      queued: true,
      delivered: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}
