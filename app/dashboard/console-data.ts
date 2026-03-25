import "server-only";

import { cookies } from "next/headers";
import { parseApiKeys, type ApiKeyRow } from "../lib/api-keys";
import { getServerMe, type AuthMeResponse } from "../lib/auth";
import {
  getServerMerchantAnalytics,
  type MerchantAnalyticsResponse,
} from "../lib/merchant-analytics";
import { fetchServerApi, isBackendUnavailableError } from "../lib/server-api";
import { emptyAnalytics, resolveMerchantPlanSummary, type MerchantPlanSummary } from "./console-utils";

type GatewayKey = "ozow" | "yoco" | "paystack";

export type SelectedMerchantWorkspace = {
  me: AuthMeResponse;
  memberships: AuthMeResponse["memberships"];
  selectedMerchantId: string | null;
  selectedMembership: AuthMeResponse["memberships"][number] | null;
  selectedMerchantName: string;
  selectedMerchantEmail: string;
  isMerchantActive: boolean;
  selectedPlan: MerchantPlanSummary;
};

export type MerchantGatewayConnection = {
  key: GatewayKey;
  label: string;
  connected: boolean;
  testMode: boolean;
  updatedAt: string | null;
  details: Record<string, string | boolean | null>;
};

export type MerchantSupportOverview = {
  merchantId: string;
  merchantContext: {
    merchant: {
      id: string;
      name: string;
      email: string;
      accountStatus: string;
      planCode: string;
      currentEnvironment: string;
    };
    gateways: {
      connectedCount: number;
      ozow: { connected: boolean; updatedAt?: string | null; testMode?: boolean };
      yoco: { connected: boolean; updatedAt?: string | null; testMode?: boolean };
      paystack: { connected: boolean; updatedAt?: string | null; testMode?: boolean };
    };
    apiKeys: {
      activeCount: number;
      testKeyCount: number;
      liveKeyCount: number;
      latestCreatedAt: string | null;
      latestLastUsedAt: string | null;
    };
    onboarding: {
      completed: boolean;
      status: string;
      detail: string;
    };
    payments: {
      totalPayments: number;
      totalVolumeCents: number;
      successRate: number;
      recoveredPayments: number;
      activeGatewaysUsed: number;
      recentFailures: Array<{
        reference: string;
        status: string;
        gateway: string | null;
        updatedAt: string;
        lastAttemptGateway: string | null;
        lastAttemptStatus: string | null;
      }>;
      recentRoutingIssues: Array<{
        reference: string;
        status: string;
        routeSummary: string;
        fallbackCount: number;
        createdAt: string;
      }>;
    };
    payouts: {
      pendingCount: number;
      failedCount: number;
      recent: Array<{
        reference: string;
        status: string;
        amountCents: number;
        currency: string;
        provider: string | null;
        createdAt: string;
        updatedAt: string;
      }>;
    };
    kyc: {
      tracked: boolean;
      status: string;
      detail: string;
    };
    supportInboxEmail: string;
    generatedAt: string;
  };
  conversations: Array<{
    id: string;
    title: string;
    status: string;
    lastMessageAt: string;
    preview: string;
    lastMessageRole: string | null;
    escalation: {
      id: string;
      status: string;
      emailTo: string;
      sentAt: string | null;
    } | null;
  }>;
};

export type DashboardPaymentRow = {
  id: string;
  reference: string;
  status: string;
  gateway: string | null;
  amountCents: number;
  chargeAmountCents?: number;
  currency: string;
  customerEmail: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  platformFeeCents?: number;
  providerFeeCents?: number | null;
  merchantNetCents?: number;
  routingMode?: string | null;
  requestedGateway?: string | null;
  selectedGateway?: string | null;
  fallbackCount?: number;
};

export type DashboardPaymentsResponse = {
  data: DashboardPaymentRow[];
  nextCursor?: string;
};

export type DashboardSearchResult = {
  id: string;
  label: string;
  description: string;
  href: string;
  kind: "payment" | "customer" | "gateway" | "api_key";
};

export type DashboardNotificationItem = {
  id: string;
  kind: "failed_payment" | "recovered_payment" | "support_escalation" | "gateway_issue";
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

async function getCookieHeader() {
  return (await cookies()).toString();
}

function normalizeBaseRecord(value: unknown) {
  if (!value || typeof value !== "object") {
    return {};
  }

  const record = value as Record<string, unknown>;
  if (record.data && typeof record.data === "object" && record.data !== null) {
    return record.data as Record<string, unknown>;
  }

  return record;
}

function pickString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function pickBoolean(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "test", "sandbox"].includes(normalized)) return true;
      if (["false", "0", "no", "live", "production"].includes(normalized)) return false;
    }
  }

  return false;
}

function parseGatewayConnection(
  key: GatewayKey,
  label: string,
  payload: unknown,
): MerchantGatewayConnection {
  const record = normalizeBaseRecord(payload);

  if (key === "ozow") {
    const siteCodeMasked = pickString(record, ["siteCodeMasked", "siteCode", "ozowSiteCode"]);
    const hasApiKey = pickBoolean(record, ["hasApiKey", "ozowApiKeyConfigured"]);
    const hasPrivateKey = pickBoolean(record, ["hasPrivateKey", "ozowPrivateKeyConfigured"]);
    return {
      key,
      label,
      connected:
        pickBoolean(record, ["connected", "configured", "ozowConfigured"]) ||
        Boolean(siteCodeMasked && hasApiKey && hasPrivateKey),
      testMode: pickBoolean(record, ["testMode", "ozowTestMode"]),
      updatedAt: pickString(record, ["updatedAt", "lastUpdatedAt"]),
      details: {
        siteCodeMasked,
        hasApiKey,
        hasPrivateKey,
      },
    };
  }

  if (key === "yoco") {
    const hasPublicKey = pickBoolean(record, ["hasPublicKey"]);
    const hasSecretKey = pickBoolean(record, ["hasSecretKey"]);
    return {
      key,
      label,
      connected:
        pickBoolean(record, ["connected", "configured", "yocoConfigured"]) ||
        (hasPublicKey && hasSecretKey),
      testMode: pickBoolean(record, ["testMode"]),
      updatedAt: pickString(record, ["updatedAt", "lastUpdatedAt"]),
      details: {
        hasPublicKey,
        hasSecretKey,
      },
    };
  }

  const hasSecretKey = pickBoolean(record, ["hasSecretKey"]);
  return {
    key,
    label,
    connected:
      pickBoolean(record, ["connected", "configured", "paystackConfigured"]) || hasSecretKey,
    testMode: pickBoolean(record, ["testMode"]),
    updatedAt: pickString(record, ["updatedAt", "lastUpdatedAt"]),
    details: {
      hasSecretKey,
    },
  };
}

async function fetchMerchantScoped(path: string, merchantId: string, init?: RequestInit) {
  const cookieHeader = await getCookieHeader();
  return fetchServerApi(path, {
    ...init,
    headers: {
      Cookie: cookieHeader,
      "x-stackaura-merchant-id": merchantId,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

async function fetchSessionScoped(path: string, init?: RequestInit) {
  const cookieHeader = await getCookieHeader();
  return fetchServerApi(path, {
    ...init,
    headers: {
      Cookie: cookieHeader,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function getSelectedMerchantWorkspace(): Promise<SelectedMerchantWorkspace | null> {
  const me = await getServerMe();
  if (!me) return null;

  const memberships = me.memberships ?? [];
  const activeMerchantId = (await cookies()).get("active_merchant_id")?.value;
  const fallbackMerchantId = memberships[0]?.merchant?.id ?? null;
  const selectedMerchantId = activeMerchantId || fallbackMerchantId || null;
  const selectedMembership =
    memberships.find((membership) => membership.merchant.id === selectedMerchantId) ??
    memberships[0] ??
    null;

  return {
    me,
    memberships,
    selectedMerchantId,
    selectedMembership,
    selectedMerchantName: selectedMembership?.merchant.name || "Choose a merchant",
    selectedMerchantEmail:
      selectedMembership?.merchant.email || "Select a workspace to view merchant details",
    isMerchantActive: selectedMembership?.merchant.isActive ?? false,
    selectedPlan: resolveMerchantPlanSummary(selectedMembership?.merchant),
  };
}

export async function getWorkspaceAnalytics(merchantId: string | null | undefined) {
  if (!merchantId) {
    return emptyAnalytics(null);
  }

  const analytics = await getServerMerchantAnalytics(merchantId);
  return analytics ?? emptyAnalytics(merchantId);
}

export async function getMerchantApiKeys(merchantId: string | null | undefined) {
  if (!merchantId) return [] as ApiKeyRow[];

  const res = await fetchSessionScoped(`/v1/merchants/${merchantId}/api-keys`);
  if (res.status === 401 || res.status === 404) return [] as ApiKeyRow[];
  if (!res.ok) throw new Error(`merchant api keys failed: ${res.status}`);

  const payload = (await res.json()) as unknown;
  return parseApiKeys(payload).items;
}

export async function getMerchantGatewayConnections(merchantId: string | null | undefined) {
  if (!merchantId) {
    return [] as MerchantGatewayConnection[];
  }

  const [ozowRes, yocoRes, paystackRes] = await Promise.all([
    fetchSessionScoped(`/v1/merchants/${merchantId}/gateways/ozow`),
    fetchSessionScoped(`/v1/merchants/${merchantId}/gateways/yoco`),
    fetchSessionScoped(`/v1/merchants/${merchantId}/gateways/paystack`),
  ]);

  const [ozowPayload, yocoPayload, paystackPayload] = await Promise.all([
    ozowRes.ok ? ozowRes.json() : Promise.resolve(null),
    yocoRes.ok ? yocoRes.json() : Promise.resolve(null),
    paystackRes.ok ? paystackRes.json() : Promise.resolve(null),
  ]);

  return [
    parseGatewayConnection("ozow", "Ozow", ozowPayload),
    parseGatewayConnection("yoco", "Yoco", yocoPayload),
    parseGatewayConnection("paystack", "Paystack", paystackPayload),
  ];
}

export async function getMerchantSupportOverview(merchantId: string | null | undefined) {
  if (!merchantId) return null;

  let res: Response;
  try {
    res = await fetchSessionScoped(
      `/v1/support/conversations?merchantId=${encodeURIComponent(merchantId)}`,
    );
  } catch (error) {
    if (isBackendUnavailableError(error)) {
      throw new Error("merchant support overview unavailable");
    }

    throw error;
  }

  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) throw new Error(`merchant support overview failed: ${res.status}`);

  return (await res.json()) as MerchantSupportOverview;
}

export async function getDashboardPayments(
  merchantId: string | null | undefined,
  query: {
    limit?: number;
    status?: string;
    gateway?: string;
    q?: string;
    cursor?: string;
  } = {},
) {
  if (!merchantId) {
    return { data: [] } as DashboardPaymentsResponse;
  }

  const params = new URLSearchParams();
  if (query.limit) params.set("limit", String(query.limit));
  if (query.status) params.set("status", query.status);
  if (query.gateway) params.set("gateway", query.gateway);
  if (query.q) params.set("q", query.q);
  if (query.cursor) params.set("cursor", query.cursor);

  let res: Response;
  try {
    res = await fetchMerchantScoped(
      `/v1/payments/dashboard${params.toString() ? `?${params.toString()}` : ""}`,
      merchantId,
    );
  } catch (error) {
    if (isBackendUnavailableError(error)) {
      throw new Error("dashboard payments unavailable");
    }

    throw error;
  }

  if (res.status === 401 || res.status === 404) {
    return { data: [] } as DashboardPaymentsResponse;
  }

  if (!res.ok) {
    throw new Error(`dashboard payments failed: ${res.status}`);
  }

  return (await res.json()) as DashboardPaymentsResponse;
}

export async function buildDashboardSearchResults(
  merchantId: string | null | undefined,
  query: string,
) {
  const trimmed = query.trim();
  if (!merchantId || !trimmed) return [] as DashboardSearchResult[];

  const [payments, apiKeys, gateways] = await Promise.all([
    getDashboardPayments(merchantId, { q: trimmed, limit: 8 }),
    getMerchantApiKeys(merchantId),
    getMerchantGatewayConnections(merchantId),
  ]);

  const customerMap = new Map<string, DashboardSearchResult>();
  for (const payment of payments.data) {
    if (!payment.customerEmail) continue;
    if (customerMap.has(payment.customerEmail)) continue;

    customerMap.set(payment.customerEmail, {
      id: `customer:${payment.customerEmail}`,
      kind: "customer",
      label: payment.customerEmail,
      description: "Customer activity from payment history",
      href: `/dashboard/customers?q=${encodeURIComponent(payment.customerEmail)}`,
    });
  }

  const apiKeyResults = apiKeys
    .filter((item) => item.label.toLowerCase().includes(trimmed.toLowerCase()))
    .slice(0, 4)
    .map<DashboardSearchResult>((item) => ({
      id: `api:${item.id}`,
      kind: "api_key",
      label: item.label,
      description: `${item.environment?.toUpperCase() ?? "TEST"} API key`,
      href: `/dashboard/api-keys?q=${encodeURIComponent(item.label)}`,
    }));

  const gatewayResults = gateways
    .filter((item) => item.label.toLowerCase().includes(trimmed.toLowerCase()))
    .map<DashboardSearchResult>((item) => ({
      id: `gateway:${item.key}`,
      kind: "gateway",
      label: item.label,
      description: item.connected ? "Gateway connected" : "Gateway not connected",
      href: `/dashboard/gateways#${item.key}`,
    }));

  const paymentResults = payments.data.slice(0, 6).map<DashboardSearchResult>((payment) => ({
    id: `payment:${payment.id}`,
    kind: "payment",
    label: payment.reference,
    description: payment.customerEmail || payment.description || "Payment reference",
    href: `/dashboard/payments?q=${encodeURIComponent(payment.reference)}`,
  }));

  return [...paymentResults, ...customerMap.values(), ...gatewayResults, ...apiKeyResults].slice(
    0,
    12,
  );
}

export async function buildDashboardNotifications(
  merchantId: string | null | undefined,
  analytics?: MerchantAnalyticsResponse | null,
) {
  if (!merchantId) return [] as DashboardNotificationItem[];

  const [supportOverview, gateways, merchantAnalytics] = await Promise.all([
    getMerchantSupportOverview(merchantId),
    getMerchantGatewayConnections(merchantId),
    analytics ? Promise.resolve(analytics) : getWorkspaceAnalytics(merchantId),
  ]);

  const items: DashboardNotificationItem[] = [];

  for (const failure of supportOverview?.merchantContext.payments.recentFailures ?? []) {
    items.push({
      id: `failed:${failure.reference}:${failure.updatedAt}`,
      kind: "failed_payment",
      title: `Payment failed: ${failure.reference}`,
      description: `${failure.gateway || failure.lastAttemptGateway || "Unknown gateway"} reported ${failure.status.toLowerCase()}.`,
      href: `/dashboard/payments?q=${encodeURIComponent(failure.reference)}`,
      createdAt: failure.updatedAt,
    });
  }

  for (const routingItem of merchantAnalytics.recentRoutingHistory
    .filter((item) => item.fallbackCount > 0 && item.status === "PAID")
    .slice(0, 4)) {
    items.push({
      id: `recovered:${routingItem.reference}:${routingItem.createdAt}`,
      kind: "recovered_payment",
      title: `Recovered payment: ${routingItem.reference}`,
      description: `${routingItem.fallbackCount} fallback decision${routingItem.fallbackCount > 1 ? "s" : ""} before success.`,
      href: `/dashboard/recovery`,
      createdAt: routingItem.createdAt,
    });
  }

  for (const conversation of supportOverview?.conversations ?? []) {
    if (!conversation.escalation) continue;

    items.push({
      id: `support:${conversation.escalation.id}`,
      kind: "support_escalation",
      title: conversation.title,
      description: `Support escalation ${conversation.escalation.status.toLowerCase()} for ${conversation.escalation.emailTo}.`,
      href: "/dashboard/support",
      createdAt: conversation.escalation.sentAt ?? conversation.lastMessageAt,
    });
  }

  for (const gateway of gateways.filter((item) => !item.connected)) {
    items.push({
      id: `gateway:${gateway.key}:${gateway.updatedAt ?? supportOverview?.merchantContext.generatedAt ?? "pending"}`,
      kind: "gateway_issue",
      title: `${gateway.label} needs attention`,
      description: "Gateway connection is not fully configured for the selected workspace.",
      href: `/dashboard/gateways#${gateway.key}`,
      createdAt: gateway.updatedAt ?? supportOverview?.merchantContext.generatedAt ?? new Date().toISOString(),
    });
  }

  return items
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 12);
}
