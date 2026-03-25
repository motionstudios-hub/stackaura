import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  cn,
  darkCompactGhostButtonClass,
  darkInsetPanelClass,
  darkMutedTextClass,
  darkRichPanelClass,
  darkSectionEyebrowClass,
  darkStatusPillClass,
} from "../components/stackaura-ui";
import { getServerMe } from "../lib/auth";
import {
  getServerMerchantAnalytics,
  type MerchantAnalyticsResponse,
} from "../lib/merchant-analytics";
import ActivityTable from "./ActivityTable";
import ApiKeyWelcome from "./api-key-welcome";
import MerchantSwitcher from "./merchant-switcher";
import StatCard from "./StatCard";
import VolumeTrendCard from "./VolumeTrendCard";

type MerchantPlanSummary = {
  code: string;
  manualGatewaySelection: boolean;
  autoRouting: boolean;
  fallback: boolean;
};

type RailCode = "PAYSTACK" | "OZOW" | "YOCO";

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

function railLabel(code: RailCode) {
  if (code === "PAYSTACK") return "Paystack";
  if (code === "OZOW") return "Ozow";
  return "Yoco";
}

function railRole(code: RailCode) {
  if (code === "PAYSTACK") return "Primary";
  if (code === "OZOW") return "Recovery";
  return "Fallback";
}

function railCardTone(code: RailCode) {
  if (code === "PAYSTACK") return "border-[#8dd8ff]/18 bg-[linear-gradient(180deg,rgba(141,216,255,0.10),rgba(255,255,255,0.03))]";
  if (code === "OZOW") return "border-[#9388ff]/18 bg-[linear-gradient(180deg,rgba(123,114,255,0.10),rgba(255,255,255,0.03))]";
  return "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]";
}

function railIcon(code: RailCode) {
  if (code === "PAYSTACK") return "≡";
  if (code === "OZOW") return "C";
  return "✓";
}

export default async function DashboardPage() {
  const me = await getServerMe();
  if (!me) redirect("/login");

  const activeMerchantId = (await cookies()).get("active_merchant_id")?.value;
  const memberships = me.memberships ?? [];
  const fallbackMerchantId = memberships[0]?.merchant?.id;
  const selectedMerchantId = activeMerchantId || fallbackMerchantId || null;
  const selectedMembership = memberships.find(
    (membership) => membership.merchant.id === selectedMerchantId,
  );
  const selectedPlan = resolveMerchantPlanSummary(selectedMembership?.merchant);
  const selectedMerchantName = selectedMembership?.merchant.name || "Merchant workspace";
  const selectedMerchantEmail =
    selectedMembership?.merchant.email || "Select a workspace to continue";
  const isMerchantActive = selectedMembership?.merchant.isActive ?? false;

  let analytics = emptyAnalytics(selectedMerchantId);
  let analyticsUnavailable = false;

  try {
    analytics =
      (await getServerMerchantAnalytics(selectedMerchantId)) ?? emptyAnalytics(selectedMerchantId);
  } catch {
    analyticsUnavailable = true;
  }

  const hasPayments = analytics.totalPayments > 0;
  const terminalPayments = analytics.successfulPayments + analytics.failedPayments;
  const recoveryRate =
    analytics.failedPayments + analytics.recoveredPayments > 0
      ? (analytics.recoveredPayments /
          (analytics.failedPayments + analytics.recoveredPayments)) *
        100
      : 0;
  const failureShare = terminalPayments > 0 ? (analytics.failedPayments / terminalPayments) * 100 : 0;

  const rails: Array<{
    code: RailCode;
    label: string;
    role: string;
    count: number;
    volumeCents: number;
    share: number;
    status: string;
  }> = (["PAYSTACK", "OZOW", "YOCO"] as RailCode[]).map((code) => {
    const item = analytics.gatewayDistribution.find((gateway) => gateway.gateway === code);
    const count = item?.count ?? 0;
    const volumeCents = item?.volumeCents ?? 0;
    return {
      code,
      label: railLabel(code),
      role: railRole(code),
      count,
      volumeCents,
      share: analytics.totalPayments > 0 ? (count / analytics.totalPayments) * 100 : 0,
      status: count > 0 ? "Online" : "Waiting",
    };
  });

  const routingHighlights = analytics.recentRoutingHistory.slice(0, 3);

  const quickActions = [
    {
      label: "Create Payment",
      href: "/payment-links",
      enabled: true,
      detail: "Open hosted checkout or payment links",
    },
    {
      label: "Send Payout",
      href: "/dashboard#payouts",
      enabled: false,
      detail: "Payout flow not wired yet",
    },
    {
      label: "View Transactions",
      href: "/dashboard#payments",
      enabled: true,
      detail: "Jump to recent payment activity",
    },
    {
      label: "Add Customer",
      href: "/dashboard#customers",
      enabled: false,
      detail: "Customer records not wired yet",
    },
  ];

  const settingsLinks = [
    { href: "/dashboard/gateways", label: "Gateway connections" },
    { href: "/dashboard/api-keys", label: "API keys" },
    { href: "/dashboard/support", label: "Support assistant" },
    { href: "/docs", label: "Developer docs" },
  ];

  const topMetrics = [
    {
      label: "Total Volume",
      value: formatCurrencyFromCents(analytics.totalVolumeCents),
      indicator: hasPayments ? `${formatNumber(analytics.totalPayments)} payments` : "Awaiting volume",
      detail: hasPayments
        ? "Gross processed value for the selected merchant workspace."
        : "Volume appears here after the first real payment succeeds.",
      tone: "cyan" as const,
    },
    {
      label: "Successful Payments",
      value: formatNumber(analytics.successfulPayments),
      indicator: `${formatPercent(analytics.successRate)} success`,
      detail: "Successful outcomes recorded from the live merchant payment feed.",
      tone: "violet" as const,
    },
    {
      label: "Failed Payments",
      value: formatNumber(analytics.failedPayments),
      indicator: terminalPayments > 0 ? `${formatPercent(failureShare)} terminal share` : "No failures yet",
      detail: "Failed or cancelled attempts that ended without recovery.",
      tone: analytics.failedPayments > 0 ? ("amber" as const) : ("slate" as const),
    },
    {
      label: "Recovery Rate",
      value: formatPercent(recoveryRate),
      indicator:
        analytics.recoveredPayments > 0
          ? `${formatNumber(analytics.recoveredPayments)} recovered`
          : "No recovery yet",
      detail: "Recovered payments as a share of interrupted checkout attempts.",
      tone: analytics.recoveredPayments > 0 ? ("cyan" as const) : ("slate" as const),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section id="overview" className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
        <div className={cn(darkRichPanelClass, "p-6 lg:p-7")}>
          <div className={darkSectionEyebrowClass}>Overview</div>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            A structured workspace for payments, routing, recovery, and merchant analytics.
          </h1>
          <p className={cn(darkMutedTextClass, "mt-4 max-w-3xl")}>
            The selected merchant view shows live payment activity from the database, surfaces
            routing behavior across available rails, and keeps core actions within one or two clicks.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className={darkStatusPillClass(isMerchantActive ? "success" : "muted")}>
              {isMerchantActive ? "Merchant online" : "Merchant inactive"}
            </span>
            <span className={darkStatusPillClass("violet")}>
              {selectedMembership?.role || "Member"}
            </span>
            <span className={darkStatusPillClass("default")}>
              {formatPlanLabel(selectedPlan.code)} plan
            </span>
            <span className={darkStatusPillClass(hasPayments ? "success" : "muted")}>
              {hasPayments ? "Live analytics" : "Onboarding state"}
            </span>
          </div>

          {analyticsUnavailable ? (
            <div className="mt-5 rounded-[22px] border border-[#ffc68a]/20 bg-[#ffb364]/10 px-4 py-3 text-sm text-[#ffd9b2]">
              The analytics service is temporarily unavailable. Merchant context and navigation stay
              available while the summary data recovers.
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className={cn(darkInsetPanelClass, "p-4")}>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#7ea4c7]">Workspace</div>
              <div className="mt-3 text-lg font-semibold text-white">{selectedMerchantName}</div>
              <div className="mt-1 text-sm text-[#9fb4c9]">{selectedMerchantEmail}</div>
            </div>
            <div className={cn(darkInsetPanelClass, "p-4")}>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#7ea4c7]">Success rate</div>
              <div className="mt-3 text-lg font-semibold text-white">{formatPercent(analytics.successRate)}</div>
              <div className="mt-1 text-sm text-[#9fb4c9]">{analytics.metricDefinitions.successRate}</div>
            </div>
            <div className={cn(darkInsetPanelClass, "p-4")}>
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#7ea4c7]">Recovery model</div>
              <div className="mt-3 text-lg font-semibold text-white">
                {selectedPlan.fallback ? "Fallback enabled" : "Fallback unavailable"}
              </div>
              <div className="mt-1 text-sm text-[#9fb4c9]">
                {selectedPlan.autoRouting
                  ? "Stackaura can auto-route live payment attempts."
                  : "Manual orchestration only for this plan."}
              </div>
            </div>
          </div>
        </div>

        <div className={cn(darkRichPanelClass, "p-6 lg:p-7")}>
          <div className="flex flex-col gap-4">
            <MerchantSwitcher
              memberships={memberships}
              selectedMerchantId={selectedMerchantId}
              theme="dark"
            />

            <div className={cn(darkInsetPanelClass, "p-5")}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#7ea4c7]">
                    Merchant snapshot
                  </div>
                  <div className="mt-3 text-xl font-semibold tracking-tight text-white">
                    {selectedMerchantName}
                  </div>
                </div>
                <span className={darkStatusPillClass(hasPayments ? "success" : "muted")}>
                  {formatNumber(analytics.totalPayments)} payments
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#7ea4c7]">Gateways</div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {formatNumber(analytics.activeGatewaysUsed)}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#7ea4c7]">Recovered</div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {formatNumber(analytics.recoveredPayments)}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#7ea4c7]">Memberships</div>
                  <div className="mt-2 text-lg font-semibold text-white">{formatNumber(memberships.length)}</div>
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

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {topMetrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            indicator={metric.indicator}
            detail={metric.detail}
            tone={metric.tone}
          />
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.4fr_0.92fr]">
        <section id="routing" className={cn(darkRichPanelClass, "p-6 lg:p-7")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={darkSectionEyebrowClass}>Payment Routing</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Merchant → Stackaura → connected rails
              </h2>
            </div>
            <span className={darkStatusPillClass(hasPayments ? "success" : "muted")}>Live</span>
          </div>

          <p className={cn(darkMutedTextClass, "mt-4 max-w-3xl")}>
            Keep routing, fallback, and recovery visible in one place. The engine card highlights the
            current merchant workspace and the live rail mix underneath.
          </p>

          <div className="mt-8 xl:hidden">
            <div className="grid gap-4">
              <div className={cn(darkInsetPanelClass, "p-4")}>
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#7ea4c7]">Merchant</div>
                <div className="mt-3 text-lg font-semibold text-white">{selectedMerchantName}</div>
                <div className="mt-1 text-sm text-[#9fb4c9]">
                  {isMerchantActive ? "Online workspace" : "Inactive workspace"}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(22,50,92,0.92),rgba(11,28,54,0.92))] p-5 text-center shadow-[0_24px_48px_rgba(0,0,0,0.24)]">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#8dd8ff]/24 bg-[#8dd8ff]/10 text-2xl font-semibold text-white">
                  S
                </div>
                <div className="mt-4 text-xl font-semibold text-white">Stackaura Engine</div>
                <div className="mt-2 text-sm text-[#9fb4c9]">Live routing and recovery orchestration</div>
              </div>

              {rails.map((rail) => (
                <div key={rail.code} className={cn("rounded-[24px] border p-4", railCardTone(rail.code))}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-white">{rail.label}</div>
                      <div className="mt-1 text-sm text-[#9fb4c9]">{rail.role} rail</div>
                    </div>
                    <span className={darkStatusPillClass(rail.count > 0 ? "success" : "muted")}>
                      {rail.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-[#d3e5f5]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#7ea4c7]">Volume</span>
                      <span>{formatCurrencyFromCents(rail.volumeCents)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#7ea4c7]">Payment share</span>
                      <span>{formatPercent(rail.share)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 hidden min-h-[390px] xl:block">
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 860 390" fill="none">
              <path d="M184 196H356" stroke="url(#routingLine)" strokeWidth="3" strokeLinecap="round" />
              <path d="M502 155C574 112 622 92 716 92" stroke="url(#routingLine)" strokeWidth="3" strokeLinecap="round" />
              <path d="M520 196H728" stroke="url(#routingLine)" strokeWidth="3" strokeLinecap="round" />
              <path d="M504 237C578 280 626 300 722 300" stroke="url(#routingLine)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="224" cy="196" r="6" fill="#c4edff" />
              <circle cx="258" cy="196" r="5" fill="#8ed7ff" />
              <circle cx="625" cy="116" r="5" fill="#8ed7ff" />
              <circle cx="665" cy="100" r="6" fill="#c4edff" />
              <circle cx="638" cy="196" r="5" fill="#8ed7ff" />
              <circle cx="681" cy="196" r="6" fill="#c4edff" />
              <circle cx="628" cy="282" r="5" fill="#8ed7ff" />
              <circle cx="670" cy="299" r="6" fill="#c4edff" />
              <defs>
                <linearGradient id="routingLine" x1="184" y1="140" x2="728" y2="240" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#235c99" stopOpacity="0.52" />
                  <stop offset="0.52" stopColor="#7ddbff" />
                  <stop offset="1" stopColor="#2c6fb1" stopOpacity="0.52" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute left-0 top-1/2 w-[190px] -translate-y-1/2 rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(13,32,60,0.96)_0%,rgba(8,21,47,0.92)_100%)] p-5 shadow-[0_20px_44px_rgba(0,0,0,0.26)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                <svg viewBox="0 0 20 20" className="h-7 w-7" fill="none">
                  <path d="M3 10H17" stroke="#9fd8ff" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M5 8L10 4L15 8" stroke="#9fd8ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 8V14" stroke="#9fd8ff" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M14 8V14" stroke="#9fd8ff" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M10 10V14" stroke="#9fd8ff" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div className="mt-5 text-center text-lg font-semibold text-white">Merchant Workspace</div>
              <div className="mt-2 text-center text-sm text-[#d4e6f6]">{selectedMerchantName}</div>
              <div className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#8dd8ff]/18 bg-[#8dd8ff]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#dff6ff]">
                <span className="h-2 w-2 rounded-full bg-[#8dd8ff]" />
                {isMerchantActive ? "Online" : "Inactive"}
              </div>
            </div>

            <div className="absolute left-1/2 top-1/2 w-[228px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8dd8ff]/20 bg-[radial-gradient(circle_at_50%_40%,rgba(46,114,255,0.18),transparent_58%),linear-gradient(180deg,rgba(22,50,92,0.96),rgba(11,28,54,0.94))] px-6 py-16 text-center shadow-[0_0_80px_rgba(46,114,255,0.18)]">
              <div className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full border border-[#8dd8ff]/20 bg-[#8dd8ff]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#dff6ff]">
                <span className="h-2 w-2 rounded-full bg-[#8dd8ff]" />
                Live
              </div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#8dd8ff]/20 bg-[#8dd8ff]/10 text-2xl font-semibold text-white">
                S
              </div>
              <div className="mt-5 text-[28px] font-semibold tracking-tight text-white">Stackaura Engine</div>
              <div className="mt-2 text-sm text-[#9fb4c9]">Route. Recover. Visibility.</div>
            </div>

            {rails.map((rail, index) => {
              const positions = [
                "top-3 right-0",
                "top-[138px] right-8",
                "bottom-0 right-0",
              ];

              return (
                <div
                  key={rail.code}
                  className={cn(
                    "absolute w-[222px] rounded-[28px] border p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]",
                    railCardTone(rail.code),
                    positions[index],
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-lg font-semibold text-white">
                        {railIcon(rail.code)}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">{rail.label}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#7ea4c7]">
                          {rail.role}
                        </div>
                      </div>
                    </div>
                    <span className={darkStatusPillClass(rail.count > 0 ? "success" : "muted")}>
                      {rail.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-[#d8e8f7]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#7ea4c7]">Volume</span>
                      <span>{formatCurrencyFromCents(rail.volumeCents)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#7ea4c7]">Payment share</span>
                      <span>{formatPercent(rail.share)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6">
          <section id="payouts" className={cn(darkRichPanelClass, "p-6")}>
            <div className={darkSectionEyebrowClass}>Quick Actions</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Move fast from the dashboard</h2>
            <p className={cn(darkMutedTextClass, "mt-3")}>
              Use the actions below to create payments, review transactions, and stage the next
              merchant task without leaving the workspace.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) =>
                action.enabled ? (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="rounded-[22px] border border-[#8dd8ff]/16 bg-[linear-gradient(180deg,rgba(141,216,255,0.14),rgba(255,255,255,0.03))] px-4 py-4 transition hover:border-[#8dd8ff]/26 hover:bg-[linear-gradient(180deg,rgba(141,216,255,0.18),rgba(255,255,255,0.05))]"
                  >
                    <div className="text-sm font-semibold text-white">{action.label}</div>
                    <div className="mt-2 text-sm text-[#9fb4c9]">{action.detail}</div>
                  </Link>
                ) : (
                  <div
                    key={action.label}
                    className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">{action.label}</div>
                      <span className={darkStatusPillClass("muted")}>Not wired yet</span>
                    </div>
                    <div className="mt-2 text-sm text-[#9fb4c9]">{action.detail}</div>
                  </div>
                ),
              )}
            </div>
          </section>

          <section id="customers" className={cn(darkRichPanelClass, "p-6")}>
            <div className={darkSectionEyebrowClass}>Customer Access</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Recent customers</h2>
            <p className={cn(darkMutedTextClass, "mt-3")}>
              Customer quick access will appear here once customer records are wired into the merchant
              workspace. The layout is ready for fast repeat actions.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`customer-placeholder-${index}`}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] text-sm font-semibold text-[#a7bfd8]"
                >
                  ••
                </div>
              ))}
              <div className="flex h-14 items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 text-sm text-[#9fb4c9]">
                Recent customers not wired yet
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <div id="reports">
          <VolumeTrendCard payments={analytics.recentPayments} />
        </div>

        <section id="recovery" className={cn(darkRichPanelClass, "p-6 lg:p-7")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={darkSectionEyebrowClass}>Recovery & Gateway Health</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Routing confidence across active rails
              </h2>
            </div>
            <span className={darkStatusPillClass(hasPayments ? "success" : "muted")}>
              {hasPayments ? "Real activity" : "No live payments yet"}
            </span>
          </div>

          <div className="mt-6 grid gap-3">
            {rails.map((rail) => (
              <div key={rail.code} className={cn(darkInsetPanelClass, "p-4")}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{rail.label}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#7ea4c7]">
                      {rail.role}
                    </div>
                  </div>
                  <span className={darkStatusPillClass(rail.count > 0 ? "success" : "muted")}>
                    {rail.status}
                  </span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(141,216,255,0.96)_0%,rgba(91,146,255,0.82)_100%)]"
                    style={{ width: `${Math.max(rail.share, rail.count > 0 ? 14 : 8)}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-4 text-sm text-[#d8e8f7]">
                  <span>{formatCurrencyFromCents(rail.volumeCents)}</span>
                  <span>{formatPercent(rail.share)} of real payments</span>
                </div>
              </div>
            ))}
          </div>

          <div className={cn(darkInsetPanelClass, "mt-6 p-5")}>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#7ea4c7]">Recovery summary</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-2xl font-semibold text-white">{formatNumber(analytics.recoveredPayments)}</div>
                <div className="mt-1 text-sm text-[#9fb4c9]">Recovered payments</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">{formatPercent(recoveryRate)}</div>
                <div className="mt-1 text-sm text-[#9fb4c9]">Recovery rate</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">{formatNumber(analytics.activeGatewaysUsed)}</div>
                <div className="mt-1 text-sm text-[#9fb4c9]">Active rails used</div>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section id="payments" className={cn(darkRichPanelClass, "p-6 lg:p-7")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={darkSectionEyebrowClass}>Transactions</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Recent payment activity
            </h2>
          </div>
          <span className={darkStatusPillClass(hasPayments ? "success" : "muted")}>
            {hasPayments ? "Live transaction feed" : "Waiting for first payment"}
          </span>
        </div>

        <p className={cn(darkMutedTextClass, "mt-4")}>
          Reference, amount, status, gateway, and time stay visible in one structured table.
        </p>

        <div className="mt-6">
          <ActivityTable rows={analytics.recentPayments} />
        </div>
      </section>

      <section id="settings" className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className={cn(darkRichPanelClass, "p-6 lg:p-7")}>
          <div className={darkSectionEyebrowClass}>Settings & Access</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Keep critical workspace tools one click away
          </h2>
          <p className={cn(darkMutedTextClass, "mt-3")}>
            Configure gateway credentials, API keys, support, and merchant-facing docs from the same
            dashboard shell.
          </p>

          <div className="mt-6 grid gap-3">
            {settingsLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  darkCompactGhostButtonClass,
                  "justify-start rounded-[18px] border-white/12 bg-white/[0.04] px-4 py-3 text-[#d3e5f5] hover:border-[#8dd8ff]/24 hover:bg-white/[0.08]",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className={cn(darkInsetPanelClass, "mt-6 p-5")}>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#7ea4c7]">Current plan</div>
            <div className="mt-3 text-xl font-semibold text-white">{formatPlanLabel(selectedPlan.code)}</div>
            <div className="mt-4 grid gap-3 text-sm text-[#d8e8f7]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#7ea4c7]">Auto routing</span>
                <span>{selectedPlan.autoRouting ? "Enabled" : "Not enabled"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#7ea4c7]">Manual gateway selection</span>
                <span>{selectedPlan.manualGatewaySelection ? "Enabled" : "Not enabled"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#7ea4c7]">Fallback recovery</span>
                <span>{selectedPlan.fallback ? "Enabled" : "Not enabled"}</span>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(darkRichPanelClass, "p-6 lg:p-7")}>
          <div className={darkSectionEyebrowClass}>Routing Insights</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Latest routing and recovery outcomes
          </h2>
          <p className={cn(darkMutedTextClass, "mt-3")}>
            Recent payment attempt paths stay readable, with fallback behavior surfaced directly from
            the merchant&apos;s live attempt records.
          </p>

          <div className="mt-6 grid gap-4">
            {routingHighlights.length > 0 ? (
              routingHighlights.map((item) => (
                <div key={item.reference} className={cn(darkInsetPanelClass, "p-5")}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold text-white">{item.reference}</div>
                        <span className={darkStatusPillClass(item.status === "PAID" ? "success" : "muted")}>
                          {item.status === "PAID" ? "Success" : item.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-medium text-[#d8e8f7]">{item.routeSummary}</div>
                      <p className="mt-2 text-sm text-[#9fb4c9]">
                        {item.gatewayLabel}
                        {item.fallbackCount > 0
                          ? ` · ${formatNumber(item.fallbackCount)} fallback decision${item.fallbackCount > 1 ? "s" : ""}`
                          : ""}
                      </p>
                    </div>

                    <div className="text-sm text-[#9fb4c9]">
                      {formatCurrencyFromCents(item.amountCents)}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    {item.path.map((step, index) => (
                      <div key={`${item.reference}-${step.label}-${index}`} className="flex items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[#d8e8f7]">
                          {step.label}
                        </span>
                        {index < item.path.length - 1 ? <span className="text-[#7ea4c7]">→</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] px-5 py-10 text-sm text-[#9fb4c9]">
                No routing insights yet. Live routing paths appear here after the first real payment
                generates gateway attempts.
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
