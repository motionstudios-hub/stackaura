import type { MerchantAnalyticsResponse } from "../lib/merchant-analytics";

export type StatusTone = "success" | "violet" | "muted" | "warning";
export type TimelineStage = "CREATED" | "INITIATED" | "FAILED" | "FALLBACK" | "SUCCEEDED";

export type MerchantPlanSummary = {
  code: string;
  manualGatewaySelection: boolean;
  autoRouting: boolean;
  fallback: boolean;
};

export function resolveMerchantPlanSummary(
  merchant:
    | {
        planCode?: string;
        plan?: {
          code: string;
          manualGatewaySelection: boolean;
          autoRouting: boolean;
          fallback: boolean;
        };
      }
    | null
    | undefined,
): MerchantPlanSummary {
  const normalizedPlanCode =
    typeof merchant?.plan?.code === "string" && merchant.plan.code.trim()
      ? merchant.plan.code.trim().toLowerCase()
      : typeof merchant?.planCode === "string" && merchant.planCode.trim()
        ? merchant.planCode.trim().toLowerCase()
        : "growth";

  if (merchant?.plan) {
    return {
      code: normalizedPlanCode,
      manualGatewaySelection: merchant.plan.manualGatewaySelection,
      autoRouting: merchant.plan.autoRouting,
      fallback: merchant.plan.fallback,
    };
  }

  if (normalizedPlanCode === "starter") {
    return {
      code: "starter",
      manualGatewaySelection: false,
      autoRouting: true,
      fallback: false,
    };
  }

  if (normalizedPlanCode === "scale") {
    return {
      code: "scale",
      manualGatewaySelection: true,
      autoRouting: true,
      fallback: true,
    };
  }

  return {
    code: "growth",
    manualGatewaySelection: true,
    autoRouting: true,
    fallback: true,
  };
}

export function emptyAnalytics(merchantId: string | null): MerchantAnalyticsResponse {
  return {
    merchantId: merchantId || "",
    totalPayments: 0,
    totalVolumeCents: 0,
    successfulPayments: 0,
    failedPayments: 0,
    successRate: 0,
    recoveredPayments: 0,
    activeGatewaysUsed: 0,
    gatewayDistribution: [],
    recentPayments: [],
    recentRoutingHistory: [],
    metricDefinitions: {
      successRate:
        "Calculated as successful payments divided by terminal payments with a final PAID, FAILED, or CANCELLED outcome.",
      recoveredPayments:
        "Counts paid payments that first recorded a failed or cancelled attempt before succeeding.",
      gatewayDistribution:
        "Grouped by the gateway that handled the latest attempt for each real merchant payment.",
    },
  };
}

export function formatPlanLabel(code: string) {
  if (!code) return "Growth";
  return code.charAt(0).toUpperCase() + code.slice(1);
}

export function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-ZA").format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function paymentStatusTone(status: string): StatusTone {
  if (status === "PAID") return "success";
  if (status === "FAILED" || status === "CANCELLED") return "warning";
  if (status === "REFUNDED") return "violet";
  return "muted";
}

export function timelineStageTone(stage: TimelineStage): StatusTone {
  if (stage === "SUCCEEDED") return "success";
  if (stage === "FAILED") return "warning";
  if (stage === "FALLBACK" || stage === "INITIATED") return "violet";
  return "muted";
}

export function gatewayBarClass(gateway: string) {
  if (gateway === "PAYSTACK") {
    return "bg-[linear-gradient(90deg,rgba(108,92,255,0.95)_0%,rgba(79,70,229,0.88)_100%)]";
  }

  if (gateway === "YOCO") {
    return "bg-[linear-gradient(90deg,rgba(59,130,246,0.92)_0%,rgba(14,165,233,0.80)_100%)]";
  }

  if (gateway === "OZOW") {
    return "bg-[linear-gradient(90deg,rgba(16,185,129,0.88)_0%,rgba(45,212,191,0.76)_100%)]";
  }

  return "bg-[linear-gradient(90deg,rgba(148,163,184,0.92)_0%,rgba(100,116,139,0.80)_100%)]";
}
