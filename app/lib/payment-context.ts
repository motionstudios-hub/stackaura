export const ACTIVE_MERCHANT_COOKIE_NAME = "active_merchant_id";
export const ACTIVE_MERCHANT_HEADER_NAME = "x-stackaura-merchant-id";

export type PaymentProxyContext =
  | {
      ok: true;
      mode: "merchant-api-key";
      authorization: string;
      merchantId: null;
    }
  | {
      ok: true;
      mode: "dashboard-merchant";
      authorization: null;
      merchantId: string;
    }
  | {
      ok: false;
      status: 400 | 500;
      message: string;
    };

function trimToNull(value: string | null | undefined) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function resolvePaymentProxyContext({
  activeMerchantId,
  incomingAuthorization,
  dashboardApiKey: _dashboardApiKey,
}: {
  activeMerchantId?: string | null;
  incomingAuthorization?: string | null;
  dashboardApiKey?: string | null;
}): PaymentProxyContext {
  const merchantId = trimToNull(activeMerchantId);
  if (merchantId) {
    return {
      ok: true,
      mode: "dashboard-merchant",
      authorization: null,
      merchantId,
    };
  }

  const authorization = trimToNull(incomingAuthorization);
  if (authorization) {
    return {
      ok: true,
      mode: "merchant-api-key",
      authorization,
      merchantId: null,
    };
  }

  return {
    ok: false,
    status: 400,
    message:
      "Provide a merchant API key or select an active merchant before creating a payment.",
  };
}

export function injectMerchantIdIntoPaymentBody(rawBody: string, merchantId: string | null) {
  if (!merchantId) return rawBody;

  const source = rawBody.trim();
  const parsed: unknown = source ? JSON.parse(source) : {};
  if (!isRecord(parsed)) {
    throw new Error("Payment creation expects a JSON object body.");
  }

  return JSON.stringify({
    ...parsed,
    merchantId,
  });
}
