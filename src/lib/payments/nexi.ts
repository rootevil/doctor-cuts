import "server-only";

import { nexiApiBaseUrl, nexiApiKey } from "@/lib/payments/config";

export type NexiHppResult = {
  hostedPage: string;
  securityToken: string;
};

export type NexiOrderSnapshot = {
  orderId: string;
  paid: boolean;
  raw: unknown;
};

const PAID_RESULTS = new Set([
  "AUTHORIZED",
  "EXECUTED",
  "CAPTURED",
  "PAID",
  "SUCCESS",
]);

function correlationId() {
  return crypto.randomUUID();
}

async function nexiFetch(path: string, init: RequestInit): Promise<Response> {
  const key = nexiApiKey();
  if (!key) throw new Error("nexi_not_configured");
  const url = `${nexiApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-KEY": key,
      "Correlation-Id": correlationId(),
      ...(init.headers ?? {}),
    },
  });
}

export async function createNexiHostedPayment(input: {
  orderId: string;
  amountCents: number;
  description: string;
  customField: string;
  customerName: string;
  customerEmail: string;
  language: "ita" | "eng";
  resultUrl: string;
  cancelUrl: string;
  notificationUrl: string;
}): Promise<NexiHppResult> {
  const amount = String(input.amountCents);
  const res = await nexiFetch("/orders/hpp", {
    method: "POST",
    body: JSON.stringify({
      order: {
        orderId: input.orderId,
        amount,
        currency: "EUR",
        description: input.description,
        customField: input.customField,
        customerInfo: {
          cardHolderName: input.customerName.slice(0, 120),
          cardHolderEmail: input.customerEmail.slice(0, 254),
        },
      },
      paymentSession: {
        actionType: "PAY",
        amount,
        recurrence: { action: "NO_RECURRING" },
        captureType: "IMPLICIT",
        language: input.language,
        resultUrl: input.resultUrl,
        cancelUrl: input.cancelUrl,
        notificationUrl: input.notificationUrl,
      },
    }),
  });

  const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!res.ok) {
    const detail =
      (json && JSON.stringify(json).slice(0, 500)) || `http_${res.status}`;
    console.warn("[nexi] hpp create failed:", detail);
    throw new Error("nexi_hpp_failed");
  }

  const hostedPage =
    typeof json?.hostedPage === "string" ? json.hostedPage : "";
  const securityToken =
    typeof json?.securityToken === "string" ? json.securityToken : "";
  if (!hostedPage) throw new Error("nexi_hpp_missing_url");
  return { hostedPage, securityToken };
}

export async function fetchNexiOrder(
  orderId: string,
): Promise<NexiOrderSnapshot | null> {
  const res = await nexiFetch(`/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
  });
  if (res.status === 404) return null;
  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    console.warn("[nexi] get order failed:", res.status);
    return null;
  }
  return { orderId, paid: orderLooksPaid(json), raw: json };
}

export function orderLooksPaid(payload: unknown): boolean {
  const hits: string[] = [];
  walk(payload, (key, value) => {
    if (typeof value !== "string") return;
    const upper = value.toUpperCase();
    if (
      key === "operationResult" ||
      key === "operationType" ||
      key === "status" ||
      key === "state" ||
      key === "paymentResult"
    ) {
      hits.push(upper);
    }
  });
  return hits.some((v) => PAID_RESULTS.has(v));
}

function walk(
  value: unknown,
  visit: (key: string, value: unknown) => void,
  depth = 0,
) {
  if (depth > 8 || value == null) return;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit, depth + 1);
    return;
  }
  if (typeof value !== "object") return;
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    visit(k, v);
    walk(v, visit, depth + 1);
  }
}
