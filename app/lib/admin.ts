import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerMe } from "./auth";
import { fetchServerApi, isBackendUnavailableError } from "./server-api";

export async function requireAdminSession() {
  const me = await getServerMe().catch(() => null);

  if (!me) {
    redirect("/login");
  }

  return me;
}

export type AdminOverviewResponse = {
  generatedAt: string;
  business: {
    totalMerchants: number;
    activeMerchants: number;
    newSignups: {
      today: number;
      last7Days: number;
      last30Days: number;
    };
    signupTrend: Array<{
      date: string;
      count: number;
    }>;
  };
  payments: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    successRate: number;
    failoverCount: number;
    gatewayUsage: Array<{
      gateway: string;
      label: string;
      count: number;
      volumeCents: number;
    }>;
    paymentsOverTime: Array<{
      date: string;
      total: number;
      successful: number;
      failed: number;
    }>;
    recentOutcomes: Array<{
      reference: string;
      merchantId: string;
      merchantName: string;
      amountCents: number;
      status: string;
      gateway: string | null;
      gatewayLabel: string;
      createdAt: string;
    }>;
    recentErrors: Array<{
      reference: string;
      merchantId: string;
      merchantName: string;
      status: string;
      gateway: string | null;
      gatewayLabel: string;
      createdAt: string;
      routeSummary: string;
    }>;
  };
  operations: {
    webhookIssues: {
      totalIssues: number;
      failedDeliveries: number;
      retryingDeliveries: number;
      recent: Array<{
        id: string;
        merchantId: string;
        merchantName: string;
        event: string;
        status: string;
        attempts: number;
        lastError: string | null;
        nextAttemptAt: string | null;
        updatedAt: string;
      }>;
    };
    support: {
      conversationCount: number;
      escalationCount: number;
      recentEscalations: Array<{
        id: string;
        merchantId: string;
        merchantName: string;
        status: string;
        reason: string;
        emailTo: string;
        conversationTitle: string;
        createdAt: string;
      }>;
    };
    recentIssues: Array<{
      kind: "payment_error" | "webhook_issue" | "support_escalation";
      createdAt: string;
      merchantId: string;
      merchantName: string;
      title: string;
      status: string;
      detail: string;
    }>;
  };
  dataNotes: {
    successRate: string;
    failoverCount: string;
    gatewayUsage: string;
  };
};

export async function getAdminOverview() {
  const cookieHeader = (await cookies()).toString();

  let res: Response;
  try {
    res = await fetchServerApi("/v1/admin/overview", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
  } catch (error) {
    if (isBackendUnavailableError(error)) {
      throw new Error("admin analytics unavailable");
    }
    throw error;
  }

  if (res.status === 401) {
    redirect("/login");
  }

  if (res.status === 403) {
    redirect("/dashboard");
  }

  if (!res.ok) {
    throw new Error(`admin overview failed: ${res.status}`);
  }

  return (await res.json()) as AdminOverviewResponse;
}
