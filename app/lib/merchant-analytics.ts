import "server-only";

import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:3001";

export type MerchantAnalyticsResponse = {
  merchantId: string;
  totalPayments: number;
  totalVolumeCents: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  recoveredPayments: number;
  activeGatewaysUsed: number;
  gatewayDistribution: Array<{
    gateway: string;
    label: string;
    count: number;
    volumeCents: number;
  }>;
  recentPayments: Array<{
    reference: string;
    amountCents: number;
    status: string;
    gateway: string | null;
    gatewayLabel: string;
    createdAt: string;
  }>;
  recentRoutingHistory: Array<{
    reference: string;
    amountCents: number;
    status: string;
    gateway: string | null;
    gatewayLabel: string;
    createdAt: string;
    selectionMode: string | null;
    requestedGateway: string | null;
    fallbackCount: number;
    routeSummary: string;
    path: Array<{
      label: string;
      kind: "gateway" | "event";
    }>;
    timelineStages: Array<"CREATED" | "INITIATED" | "FAILED" | "FALLBACK" | "SUCCEEDED">;
    attempts: Array<{
      gateway: string;
      gatewayLabel: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
  metricDefinitions: {
    successRate: string;
    recoveredPayments: string;
    gatewayDistribution: string;
  };
};

export async function getServerMerchantAnalytics(merchantId: string | null | undefined) {
  if (!merchantId) {
    return null;
  }

  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${API_BASE}/v1/merchants/${merchantId}/analytics`, {
    method: "GET",
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`merchant analytics failed: ${res.status}`);
  }

  return (await res.json()) as MerchantAnalyticsResponse;
}
