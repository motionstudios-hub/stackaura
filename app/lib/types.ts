export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue | undefined }
  | JsonValue[];

export type Merchant = {
  id: string;
  name?: string | null;
  createdAt?: string;
};

export type PaymentRow = {
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
  currentAttemptId?: string | null;
  platformFeeCents?: number;
  merchantNetCents?: number;
};

export type PaymentsListResponse = {
  data: PaymentRow[];
  nextCursor?: string;
};

export type PaymentAttempt = {
  id: string;
  gateway: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  redirectUrl?: string | null;
};

export type WebhookEndpoint = {
  id: string;
  merchantId: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WebhookDelivery = {
  id: string;
  webhookEndpointId: string;
  event: string;
  payload: JsonValue;
  status: string;
  attempts: number;
  lastStatusCode?: number | null;
  lastError?: string | null;
  nextAttemptAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GatewayConfig = {
  // Keep loose because your backend fields may evolve
  [k: string]: JsonValue | undefined;
};
