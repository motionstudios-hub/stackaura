import type { JsonValue } from "@/app/lib/types";

const baseUrl =
  process.env.CHECKOUT_API_URL ||
  process.env.CHECKOUT_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL ||
  "http://localhost:3001";

const apiKey =
  process.env.CHECKOUT_API_KEY || "";

export type Payment = {
  id: string;
  reference: string;
  status: string;
  gateway: string | null;
  amountCents: number;
  currency: string;
  customerEmail: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  checkoutUrl: string;
  metadata?: JsonValue | null;
  platformFeeCents?: number;
  merchantNetCents?: number;
  currentAttemptId?: string | null;
  attempts?: Array<{
    id: string;
    gateway: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    redirectUrl?: string | null;
  }>;
};

export type ListPaymentsResponse = {
  data: Payment[];
  nextCursor?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }

  headers.set("Content-Type", "application/json");

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`);
  }

  return (await res.json()) as T;
}

export function listPayments(params?: {
  limit?: number;
  status?: string;
  gateway?: string;
  q?: string;
  cursor?: string;
}): Promise<ListPaymentsResponse> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.status) qs.set("status", params.status);
  if (params?.gateway) qs.set("gateway", params.gateway);
  if (params?.q) qs.set("q", params.q);
  if (params?.cursor) qs.set("cursor", params.cursor);

  const query = qs.toString();
  return request<ListPaymentsResponse>(`/v1/payments${query ? `?${query}` : ""}`);
}

export function getPayment(reference: string): Promise<Payment> {
  return request<Payment>(`/v1/payments/${encodeURIComponent(reference)}`);
}

export function getPaymentAttempts(reference: string) {
  return request<
    Array<{
      id: string;
      gateway: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      redirectUrl: string | null;
    }>
  >(`/v1/payments/${encodeURIComponent(reference)}/attempts`);
}

export function failoverPayment(reference: string) {
  return request<{ gateway: string }>(
    `/v1/payments/${encodeURIComponent(reference)}/failover`,
    { method: "POST" }
  );
}

export function listWebhookEndpoints(merchantId: string) {
  return request<Array<{
    id: string;
    merchantId: string;
    url: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>>(`/v1/webhooks/merchants/${encodeURIComponent(merchantId)}/endpoints`);
}

export function listWebhookDeliveries(endpointId: string, limit = 20) {
  return request<Array<{
    id: string;
    event: string;
    status: string;
    attempts: number;
    lastStatusCode?: number | null;
    lastError?: string | null;
    nextAttemptAt?: string | null;
    payload: JsonValue;
    createdAt: string;
    updatedAt: string;
  }>>(
    `/v1/webhooks/endpoints/${encodeURIComponent(endpointId)}/deliveries?limit=${limit}`
  );
}

export function retryWebhookDelivery(deliveryId: string) {
  return request(
    `/v1/webhooks/deliveries/${encodeURIComponent(deliveryId)}/retry`,
    { method: "POST" }
  );
}

export function savePayfastConfig(merchantId: string, data: {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
}) {
  return request(
    `/v1/merchants/${encodeURIComponent(merchantId)}/gateways/payfast`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function saveOzowConfig(merchantId: string, data: {
  siteCode: string;
  privateKey: string;
  apiKey: string;
}) {
  return request(
    `/v1/merchants/${encodeURIComponent(merchantId)}/gateways/ozow`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}
