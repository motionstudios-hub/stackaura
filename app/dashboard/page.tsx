import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  cn,
  lightProductHeroClass,
  lightProductInsetPanelClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
} from "../components/stackaura-ui";
import { getServerMe } from "../lib/auth";
import { getServerMerchantAnalytics, type MerchantAnalyticsResponse } from "../lib/merchant-analytics";
import ApiKeyWelcome from "./api-key-welcome";
import MerchantSwitcher from "./merchant-switcher";

type MerchantPlanSummary = {
  code: string;
  manualGatewaySelection: boolean;
  autoRouting: boolean;
  fallback: boolean;
};

type StatusTone = "success" | "violet" | "muted" | "warning";
type TimelineStage = "CREATED" | "INITIATED" | "FAILED" | "FALLBACK" | "SUCCEEDED";

function resolveMerchantPlanSummary(
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

function emptyAnalytics(merchantId: string | null): MerchantAnalyticsResponse {
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

function formatPlanLabel(code: string) {
  if (!code) return "Growth";
  return code.charAt(0).toUpperCase() + code.slice(1);
}

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-ZA").format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function paymentStatusTone(status: string): StatusTone {
  if (status === "PAID") return "success";
  if (status === "FAILED" || status === "CANCELLED") return "warning";
  if (status === "REFUNDED") return "violet";
  return "muted";
}

function timelineStageTone(stage: TimelineStage): StatusTone {
  if (stage === "SUCCEEDED") return "success";
  if (stage === "FAILED") return "warning";
  if (stage === "FALLBACK" || stage === "INITIATED") return "violet";
  return "muted";
}

function gatewayBarClass(gateway: string) {
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

export default async function DashboardPage() {
  let me: Awaited<ReturnType<typeof getServerMe>> = null;
  let authUnavailable = false;

  try {
    me = await getServerMe();
  } catch {
    authUnavailable = true;
  }

  if (!me) {
    if (authUnavailable) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <section className={cn(lightProductHeroClass, "p-6 lg:p-8")}>
            <div className={lightProductSectionEyebrowClass}>Merchant dashboard</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#0a2540] sm:text-4xl">
              The dashboard is temporarily unavailable.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-4 max-w-2xl")}>
              Stackaura could not reach the authentication service just now, so your merchant
              workspace could not be loaded. Please try again in a moment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className={cn(publicPrimaryButtonClass, "px-5 py-3")}>
                Return to sign in
              </Link>
              <Link href="/" className={cn(publicSecondaryButtonClass, "px-5 py-3")}>
                Back to homepage
              </Link>
            </div>
          </section>
        </div>
      );
    }

    redirect("/login");
  }

  const activeMerchantId = (await cookies()).get("active_merchant_id")?.value;
  const memberships = me.memberships ?? [];
  const fallbackMerchantId = memberships[0]?.merchant?.id;
  const selectedMerchantId = activeMerchantId || fallbackMerchantId || null;
  const selectedMembership = memberships.find(
    (membership) => membership.merchant.id === selectedMerchantId,
  );
  const selectedPlan = resolveMerchantPlanSummary(selectedMembership?.merchant);
  const selectedMerchantName = selectedMembership?.merchant.name || "Choose a merchant";
  const selectedMerchantEmail =
    selectedMembership?.merchant.email || "Select a workspace to view merchant details";
  const isMerchantActive = selectedMembership?.merchant.isActive ?? false;
  let analytics = emptyAnalytics(selectedMerchantId);
  let analyticsUnavailable = false;

  try {
    analytics = (await getServerMerchantAnalytics(selectedMerchantId)) ?? emptyAnalytics(selectedMerchantId);
  } catch {
    analyticsUnavailable = true;
  }

  const hasPayments = analytics.totalPayments > 0;

  const routingFeatureItems = [
    {
      label: "Manual gateway selection",
      enabled: selectedPlan.manualGatewaySelection,
      detail: "Direct checkout volume to a preferred gateway when your plan allows it.",
    },
    {
      label: "Auto routing",
      enabled: selectedPlan.autoRouting,
      detail: "Let Stackaura choose the best-fit gateway path for each payment.",
    },
    {
      label: "Fallback recovery",
      enabled: selectedPlan.fallback,
      detail: "Retry on another gateway when the first attempt fails.",
    },
  ];

  const quickActions = [
    { href: "/dashboard/support", label: "Open support AI", tone: "primary" as const },
    { href: "/dashboard/gateways", label: "Open gateway connections", tone: "primary" as const },
    { href: "/dashboard/api-keys", label: "Open developer keys", tone: "primary" as const },
    { href: "/payment-links", label: "Launch payment links", tone: "secondary" as const },
    { href: "/docs", label: "Read API docs", tone: "secondary" as const },
    { href: "/", label: "View public website", tone: "secondary" as const },
  ];

  const topMetrics = [
    {
      label: "Total volume",
      value: formatCurrencyFromCents(analytics.totalVolumeCents),
      detail: hasPayments
        ? `${formatNumber(analytics.totalPayments)} real payments recorded for this merchant.`
        : "No real merchant payments yet. Volume will update after the first successful payment.",
      tone: "success" as const,
    },
    {
      label: "Success rate",
      value: formatPercent(analytics.successRate),
      detail: analytics.metricDefinitions.successRate,
      tone: "violet" as const,
    },
    {
      label: "Recovered payments",
      value: formatNumber(analytics.recoveredPayments),
      detail: analytics.metricDefinitions.recoveredPayments,
      tone: analytics.recoveredPayments > 0 ? ("success" as const) : ("muted" as const),
    },
    {
      label: "Active gateways",
      value: formatNumber(analytics.activeGatewaysUsed),
      detail: hasPayments
        ? "Distinct gateways used by real payments for the selected merchant."
        : "This count stays at zero until the merchant starts processing payments.",
      tone: "muted" as const,
    },
  ];

  const onboardingSteps = [
    {
      title: "Connect at least one gateway",
      detail: "Add real merchant gateway credentials so Stackaura can create live payment attempts.",
      href: "/dashboard/gateways",
      label: "Open gateways",
    },
    {
      title: "Create your first payment flow",
      detail: "Use hosted checkout or payment links to start collecting real merchant payments.",
      href: "/payment-links",
      label: "Create payment link",
    },
    {
      title: "Watch analytics populate automatically",
      detail: "As soon as a payment succeeds, the metrics, recent payments, and routing history update from the database.",
      href: "/docs",
      label: "View docs",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section
        id="overview"
        className={cn(lightProductHeroClass, "relative overflow-hidden scroll-mt-28 p-6 lg:p-8")}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_16%,rgba(255,255,255,0.34),transparent_22%),radial-gradient(circle_at_86%_18%,rgba(122,115,255,0.14),transparent_24%),radial-gradient(circle_at_76%_74%,rgba(125,211,252,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.16),transparent_18%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <div>
            <div className={lightProductSectionEyebrowClass}>Merchant dashboard</div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              See real payment activity, routing, and recovery for one merchant workspace.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-3xl")}>
              Signed in as <span className="font-medium text-[#0a2540]">{me.user.email}</span>. The
              dashboard now reflects real merchant payment data from the database, not illustrative
              analytics.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className={lightProductStatusPillClass(isMerchantActive ? "success" : "muted")}>
                {isMerchantActive ? "Merchant active" : "Merchant inactive"}
              </span>
              <span className={lightProductStatusPillClass("violet")}>
                {selectedMembership?.role || "Member"}
              </span>
              <span className={lightProductStatusPillClass("warning")}>
                {formatPlanLabel(selectedPlan.code)} plan
              </span>
              <span className={lightProductStatusPillClass(hasPayments ? "success" : "muted")}>
                {hasPayments ? "Live analytics" : "Onboarding state"}
              </span>
              {analyticsUnavailable ? (
                <span className={lightProductStatusPillClass("warning")}>Analytics unavailable</span>
              ) : null}
            </div>

            {analyticsUnavailable ? (
              <div className="mt-5 rounded-[24px] border border-amber-200/80 bg-amber-50/82 px-4 py-3 text-sm text-amber-900">
                Live merchant analytics could not be refreshed right now. The rest of the dashboard
                is still available while the analytics service recovers.
              </div>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/gateways" className={publicPrimaryButtonClass}>
                Open gateway connections
              </Link>
              <Link href="/payment-links" className={publicSecondaryButtonClass}>
                Launch payment links
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <MerchantSwitcher memberships={memberships} selectedMerchantId={selectedMerchantId} />

            <div className={cn(lightProductInsetPanelClass, "p-5")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">
                    Merchant snapshot
                  </div>
                  <div className="mt-2 text-xl font-semibold tracking-tight text-[#0a2540]">
                    {selectedMerchantName}
                  </div>
                </div>
                <span className={lightProductStatusPillClass(hasPayments ? "success" : "muted")}>
                  {formatNumber(analytics.totalPayments)} payments
                </span>
              </div>

              <p className={cn(lightProductMutedTextClass, "mt-4")}>
                Stackaura provides orchestration and routing infrastructure. Licensed providers
                process and settle funds while this merchant view surfaces real payment activity.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[18px] border border-white/42 bg-white/24 px-4 py-3 shadow-[0_8px_18px_rgba(133,156,180,0.08)]">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Successful</div>
                  <div className="mt-2 text-lg font-semibold text-[#0a2540]">
                    {formatNumber(analytics.successfulPayments)}
                  </div>
                </div>
                <div className="rounded-[18px] border border-white/42 bg-white/24 px-4 py-3 shadow-[0_8px_18px_rgba(133,156,180,0.08)]">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Failed</div>
                  <div className="mt-2 text-lg font-semibold text-[#0a2540]">
                    {formatNumber(analytics.failedPayments)}
                  </div>
                </div>
                <div className="rounded-[18px] border border-white/42 bg-white/24 px-4 py-3 shadow-[0_8px_18px_rgba(133,156,180,0.08)]">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Latest state</div>
                  <div className="mt-2 text-lg font-semibold text-[#0a2540]">
                    {hasPayments ? "Live data" : "Waiting for first payment"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ApiKeyWelcome
        merchantId={selectedMerchantId}
        merchantName={selectedMembership?.merchant.name || null}
        merchantIsActive={selectedMembership?.merchant.isActive ?? false}
      />

      <section className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={lightProductSectionEyebrowClass}>Top metrics</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
              Real merchant analytics at a glance
            </div>
            <p className={cn(lightProductMutedTextClass, "mt-3 max-w-3xl")}>
              These cards update from the selected merchant&apos;s real payment and attempt records.
            </p>
          </div>

          <span className={lightProductStatusPillClass(hasPayments ? "success" : "muted")}>
            {hasPayments ? "Live data from payments" : "Waiting for first payment"}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topMetrics.map((item) => (
            <div key={item.label} className={cn(lightProductPanelClass, "p-5")}>
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">{item.label}</div>
                <span className={lightProductStatusPillClass(item.tone)}>
                  {hasPayments ? "Live" : "Zero until activity"}
                </span>
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-tight text-[#0a2540]">
                {item.value}
              </div>
              <div className="mt-3 text-sm leading-6 text-[#425466]">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {!hasPayments ? (
        <>
          <div id="payments" className="scroll-mt-28" />
          <div id="routing" className="scroll-mt-28" />
          <div id="recovery" className="scroll-mt-28" />
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className={lightProductSectionEyebrowClass}>Getting started</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                  This merchant has not processed a real payment yet
                </div>
              </div>
              <span className={lightProductStatusPillClass("muted")}>Truthful empty state</span>
            </div>

            <p className={cn(lightProductMutedTextClass, "mt-4 max-w-3xl")}>
              The dashboard stays empty until a real payment is created and updated in the database.
              Once a payment succeeds, the metrics, recent payments, and routing history will reflect
              that real activity automatically.
            </p>

            <div className="mt-6 grid gap-4">
              {onboardingSteps.map((step) => (
                <div key={step.title} className={cn(lightProductInsetPanelClass, "p-5")}>
                  <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                    {step.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#425466]">{step.detail}</p>
                  <Link href={step.href} className={cn(publicSecondaryButtonClass, "mt-4 inline-flex")}>
                    {step.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
            <div className={lightProductSectionEyebrowClass}>Plan visibility</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
              {formatPlanLabel(selectedPlan.code)} merchant plan
            </div>
            <p className={cn(lightProductMutedTextClass, "mt-4")}>
              Plan visibility stays real and merchant-specific even before payment activity starts.
            </p>

            <div className="mt-5 grid gap-3">
              {routingFeatureItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4 rounded-[18px] border border-white/42 bg-white/22 px-4 py-3 shadow-[0_8px_18px_rgba(133,156,180,0.08)]"
                >
                  <div>
                    <div className="text-sm font-medium text-[#0a2540]">{item.label}</div>
                    <div className="mt-1 text-xs text-[#6b7c93]">{item.detail}</div>
                  </div>
                  <span className={lightProductStatusPillClass(item.enabled ? "success" : "muted")}>
                    {item.enabled ? "Enabled" : "Not enabled"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        </>
      ) : (
        <>
          <section
            id="payments"
            className="mt-8 grid scroll-mt-28 gap-6 lg:grid-cols-[1.12fr_0.88fr]"
          >
            <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className={lightProductSectionEyebrowClass}>Recent payments</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                    Latest real payment outcomes
                  </div>
                </div>
                <span className={lightProductStatusPillClass("success")}>Database-backed</span>
              </div>

              <p className={cn(lightProductMutedTextClass, "mt-4 max-w-3xl")}>
                These are the latest real merchant payments, including status, gateway, and amount.
              </p>

              <div className="mt-6 grid gap-4">
                {analytics.recentPayments.map((payment) => (
                  <div key={payment.reference} className={cn(lightProductInsetPanelClass, "p-5")}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                            {payment.reference}
                          </div>
                          <span className={lightProductStatusPillClass(paymentStatusTone(payment.status))}>
                            {payment.status}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-[#425466]">
                          {payment.gatewayLabel} · {formatDateTime(payment.createdAt)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold text-[#0a2540]">
                          {formatCurrencyFromCents(payment.amountCents)}
                        </div>
                        <div className="mt-1 text-xs text-[#6b7c93]">Real payment amount</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className={lightProductSectionEyebrowClass}>Gateway distribution</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                    Real payment mix by gateway
                  </div>
                </div>
                <span className={lightProductStatusPillClass("violet")}>
                  {formatNumber(analytics.activeGatewaysUsed)} gateways used
                </span>
              </div>

              <p className={cn(lightProductMutedTextClass, "mt-4")}>
                {analytics.metricDefinitions.gatewayDistribution}
              </p>

              <div className="mt-6 grid gap-4">
                {analytics.gatewayDistribution.map((item) => {
                  const share =
                    analytics.totalPayments > 0 ? (item.count / analytics.totalPayments) * 100 : 0;

                  return (
                    <div key={item.gateway} className={cn(lightProductInsetPanelClass, "p-4")}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#0a2540]">{item.label}</div>
                          <div className="mt-1 text-xs text-[#6b7c93]">
                            {formatNumber(item.count)} payments · {formatCurrencyFromCents(item.volumeCents)}
                          </div>
                        </div>
                        <span className={lightProductStatusPillClass("muted")}>
                          {formatPercent(share)}
                        </span>
                      </div>

                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/40">
                        <div
                          className={cn("h-full rounded-full", gatewayBarClass(item.gateway))}
                          style={{ width: `${Math.max(share, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div id="recovery" className="scroll-mt-28" />
          <section
            id="routing"
            className="mt-8 grid scroll-mt-28 gap-6 lg:grid-cols-[1.12fr_0.88fr]"
          >
            <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className={lightProductSectionEyebrowClass}>Routing history</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                    Latest real routing paths
                  </div>
                </div>
                <span className={lightProductStatusPillClass("success")}>Attempts from the database</span>
              </div>

              <p className={cn(lightProductMutedTextClass, "mt-4 max-w-3xl")}>
                Each card below uses real payment attempts and routing metadata when available.
              </p>

              <div className="mt-6 grid gap-4">
                {analytics.recentRoutingHistory.length > 0 ? (
                  analytics.recentRoutingHistory.map((item) => (
                    <div key={item.reference} className={cn(lightProductInsetPanelClass, "p-5")}>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                              {item.reference}
                            </div>
                            <span className={lightProductStatusPillClass(paymentStatusTone(item.status))}>
                              {item.status}
                            </span>
                          </div>
                          <div className="mt-2 text-sm font-medium text-[#0a2540]">
                            {item.routeSummary}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[#425466]">
                            {item.gatewayLabel} · {formatDateTime(item.createdAt)}
                            {item.fallbackCount > 0
                              ? ` · ${formatNumber(item.fallbackCount)} fallback decision${item.fallbackCount > 1 ? "s" : ""}`
                              : ""}
                          </p>
                        </div>

                        <div className="grid min-w-[180px] gap-2 text-sm text-[#425466]">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[#6b7c93]">Amount</span>
                            <span className="font-medium text-[#0a2540]">
                              {formatCurrencyFromCents(item.amountCents)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[#6b7c93]">Selection</span>
                            <span className="text-right text-[#0a2540]">
                              {item.selectionMode || "recorded"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {item.path.map((step, index) => (
                          <div key={`${item.reference}-${step.label}-${index}`} className="flex items-center gap-2">
                            <span
                              className={
                                step.kind === "gateway"
                                  ? "inline-flex items-center rounded-[16px] border border-white/42 bg-white/28 px-3 py-2 text-sm font-medium text-[#0a2540] shadow-[0_8px_18px_rgba(133,156,180,0.08)]"
                                  : lightProductStatusPillClass(paymentStatusTone(step.label))
                              }
                            >
                              {step.label}
                            </span>
                            {index < item.path.length - 1 ? (
                              <span className="text-sm text-[#6b7c93]">→</span>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {item.timelineStages.map((stage, index) => (
                          <div key={`${item.reference}-${stage}`} className="flex items-center gap-2">
                            <span className={lightProductStatusPillClass(timelineStageTone(stage))}>
                              {stage}
                            </span>
                            {index < item.timelineStages.length - 1 ? (
                              <span className="text-sm text-[#6b7c93]">→</span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={cn(lightProductInsetPanelClass, "p-5")}>
                    <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                      No routing attempts recorded yet
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#425466]">
                      Routing history appears here once the selected merchant creates payments that
                      generate gateway attempts.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={lightProductSectionEyebrowClass}>Plan visibility</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                    {formatPlanLabel(selectedPlan.code)} merchant plan
                  </div>
                </div>
                <span className={lightProductStatusPillClass("violet")}>Current plan</span>
              </div>

              <p className={cn(lightProductMutedTextClass, "mt-4")}>
                Plan visibility remains real and merchant-assigned. Analytics above stay separate from
                plan entitlements.
              </p>

              <div className={cn("mt-5 p-4", lightProductInsetPanelClass)}>
                <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Current posture</div>
                <div className="mt-2 text-sm text-[#425466]">
                  {selectedPlan.manualGatewaySelection
                    ? "Merchants can manually choose a gateway when they need direct control."
                    : "Merchants follow the unified orchestration defaults for gateway selection."}
                </div>
                <div className="mt-2 text-sm text-[#425466]">
                  {selectedPlan.fallback
                    ? "Fallback recovery is available when the first eligible rail fails."
                    : "Fallback recovery is not included in the current plan."}
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {routingFeatureItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-4 rounded-[18px] border border-white/42 bg-white/22 px-4 py-3 shadow-[0_8px_18px_rgba(133,156,180,0.08)]"
                  >
                    <div>
                      <div className="text-sm font-medium text-[#0a2540]">{item.label}</div>
                      <div className="mt-1 text-xs text-[#6b7c93]">
                        {item.enabled
                          ? "Included in the current merchant plan."
                          : "Not included in the current merchant plan."}
                      </div>
                    </div>
                    <span className={lightProductStatusPillClass(item.enabled ? "success" : "muted")}>
                      {item.enabled ? "Included" : "Not included"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <section
        id="customers"
        className="mt-8 grid scroll-mt-28 gap-6 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div id="settings" className={cn(lightProductPanelClass, "scroll-mt-28 p-6 lg:p-7")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={lightProductSectionEyebrowClass}>Merchant context</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                Workspace and merchant visibility stay intact
              </div>
            </div>
            <span className={lightProductStatusPillClass(isMerchantActive ? "success" : "muted")}>
              {isMerchantActive ? "Active workspace" : "Inactive workspace"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className={cn(lightProductInsetPanelClass, "p-5")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Merchant profile</div>
              <div className="mt-4 space-y-3 text-sm text-[#425466]">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[#6b7c93]">Name</span>
                  <span className="text-right text-[#0a2540]">{selectedMerchantName}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[#6b7c93]">Email</span>
                  <span className="text-right text-[#0a2540]">{selectedMerchantEmail}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[#6b7c93]">Role</span>
                  <span className="text-right text-[#0a2540]">{selectedMembership?.role || "Member"}</span>
                </div>
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-5")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Workspace scope</div>
              <div className="mt-4 space-y-3 text-sm text-[#425466]">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[#6b7c93]">Selection</span>
                  <span className="text-right text-[#0a2540]">
                    {selectedMerchantId ? "Workspace selected" : "Choose a merchant"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[#6b7c93]">Memberships</span>
                  <span className="text-right text-[#0a2540]">{formatNumber(memberships.length)}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[#6b7c93]">Status</span>
                  <span className="text-right text-[#0a2540]">
                    {isMerchantActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className={cn(lightProductMutedTextClass, "mt-5")}>
            Merchant context remains the source of truth for dashboard actions, payment links,
            gateway configuration, and analytics visibility inside Stackaura.
          </p>
        </div>

        <div id="payouts" className={cn(lightProductPanelClass, "scroll-mt-28 p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Quick actions</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Move into the next payment task fast
          </div>
          <p className={cn(lightProductMutedTextClass, "mt-4")}>
            Jump directly into gateway setup, developer access, payment links, and docs without losing
            the merchant context selected above.
          </p>

          <div className="mt-5 grid gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={action.tone === "primary" ? publicPrimaryButtonClass : publicSecondaryButtonClass}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
