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
import ApiKeyWelcome from "./api-key-welcome";
import MerchantSwitcher from "./merchant-switcher";

type MerchantPlanSummary = {
  code: string;
  manualGatewaySelection: boolean;
  autoRouting: boolean;
  fallback: boolean;
};

type StatusTone = "success" | "violet" | "muted" | "warning";
type RoutingStepKind = "gateway" | "event";
type TimelineStage = "CREATED" | "INITIATED" | "FAILED" | "FALLBACK" | "SUCCEEDED";

type RoutingInsight = {
  title: string;
  detail: string;
  badge: string;
  tone: StatusTone;
  path: ReadonlyArray<{
    label: string;
    kind: RoutingStepKind;
  }>;
};

type GatewayDistributionItem = {
  name: "Paystack" | "Yoco" | "Ozow";
  share: number;
  volume: number;
  detail: string;
  barClass: string;
  tone: StatusTone;
};

type OrchestrationItem = {
  reference: string;
  amount: number;
  customer: string;
  route: string;
  detail: string;
  badge: string;
  tone: StatusTone;
  stages: ReadonlyArray<TimelineStage>;
};

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
    | undefined
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

function formatPlanLabel(code: string) {
  if (!code) return "Growth";
  return code.charAt(0).toUpperCase() + code.slice(1);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-ZA").format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function getRoutingEventTone(label: string): StatusTone {
  if (label === "SUCCEEDED") return "success";
  if (label === "FAILED") return "warning";
  if (label === "FALLBACK" || label === "AUTO" || label === "MANUAL") return "violet";
  return "muted";
}

function getTimelineStageTone(stage: TimelineStage): StatusTone {
  if (stage === "SUCCEEDED") return "success";
  if (stage === "FAILED") return "warning";
  if (stage === "FALLBACK" || stage === "INITIATED") return "violet";
  return "muted";
}

function buildGatewayDistribution(totalVolume: number, planCode: string): GatewayDistributionItem[] {
  const shares =
    planCode === "starter"
      ? [
          {
            name: "Paystack" as const,
            share: 52,
            detail: "Primary card volume routed through the default rail mix.",
            barClass:
              "bg-[linear-gradient(90deg,rgba(108,92,255,0.95)_0%,rgba(79,70,229,0.88)_100%)]",
            tone: "violet" as const,
          },
          {
            name: "Yoco" as const,
            share: 20,
            detail: "Merchant-present checkout demand handled through Yoco coverage.",
            barClass:
              "bg-[linear-gradient(90deg,rgba(59,130,246,0.92)_0%,rgba(14,165,233,0.80)_100%)]",
            tone: "muted" as const,
          },
          {
            name: "Ozow" as const,
            share: 28,
            detail: "Bank transfer friendly paths routed through Ozow.",
            barClass:
              "bg-[linear-gradient(90deg,rgba(16,185,129,0.88)_0%,rgba(45,212,191,0.76)_100%)]",
            tone: "success" as const,
          },
        ]
      : planCode === "scale"
        ? [
            {
              name: "Paystack" as const,
              share: 36,
              detail: "Balanced primary rail mix across card and alternate methods.",
              barClass:
                "bg-[linear-gradient(90deg,rgba(108,92,255,0.95)_0%,rgba(79,70,229,0.88)_100%)]",
              tone: "violet" as const,
            },
            {
              name: "Yoco" as const,
              share: 31,
              detail: "Manual selections and recovery paths landing on Yoco.",
              barClass:
                "bg-[linear-gradient(90deg,rgba(59,130,246,0.92)_0%,rgba(14,165,233,0.80)_100%)]",
              tone: "muted" as const,
            },
            {
              name: "Ozow" as const,
              share: 33,
              detail: "Auto-routed bank transfer volume handled through Ozow.",
              barClass:
                "bg-[linear-gradient(90deg,rgba(16,185,129,0.88)_0%,rgba(45,212,191,0.76)_100%)]",
              tone: "success" as const,
            },
          ]
        : [
            {
              name: "Paystack" as const,
              share: 41,
              detail: "Primary rail for everyday transaction coverage.",
              barClass:
                "bg-[linear-gradient(90deg,rgba(108,92,255,0.95)_0%,rgba(79,70,229,0.88)_100%)]",
              tone: "violet" as const,
            },
            {
              name: "Yoco" as const,
              share: 31,
              detail: "Explicit selections and recovery traffic routed to Yoco.",
              barClass:
                "bg-[linear-gradient(90deg,rgba(59,130,246,0.92)_0%,rgba(14,165,233,0.80)_100%)]",
              tone: "muted" as const,
            },
            {
              name: "Ozow" as const,
              share: 28,
              detail: "Auto-routed bank transfer traffic handled through Ozow.",
              barClass:
                "bg-[linear-gradient(90deg,rgba(16,185,129,0.88)_0%,rgba(45,212,191,0.76)_100%)]",
              tone: "success" as const,
            },
          ];

  return shares.map((item) => ({
    ...item,
    volume: Math.round(totalVolume * (item.share / 100)),
  }));
}

export default async function DashboardPage() {
  const me = await getServerMe();
  if (!me) redirect("/login");

  const activeMerchantId = (await cookies()).get("active_merchant_id")?.value;

  const memberships = me.memberships ?? [];
  const fallbackMerchantId = memberships[0]?.merchant?.id;
  const selectedMerchantId = activeMerchantId || fallbackMerchantId || null;
  const selectedMembership = memberships.find(
    (membership) => membership.merchant.id === selectedMerchantId
  );
  const selectedPlan = resolveMerchantPlanSummary(selectedMembership?.merchant);
  const selectedMerchantName = selectedMembership?.merchant.name || "No merchant selected";
  const selectedMerchantEmail = selectedMembership?.merchant.email || "No merchant email";
  const isMerchantActive = selectedMembership?.merchant.isActive ?? false;

  const routingFeatureItems = [
    {
      label: "Manual gateway selection",
      enabled: selectedPlan.manualGatewaySelection,
      detail: "Let merchants intentionally direct checkout volume to a preferred rail.",
    },
    {
      label: "Auto routing",
      enabled: selectedPlan.autoRouting,
      detail: "Automatically route each payment toward the best-fit gateway path.",
    },
    {
      label: "Fallback recovery",
      enabled: selectedPlan.fallback,
      detail: "Retry failed attempts on another gateway without leaving Stackaura.",
    },
  ];

  const quickActions = [
    { href: "/dashboard/gateways", label: "Open Gateway Connections", tone: "primary" as const },
    { href: "/dashboard/api-keys", label: "Open Developer Keys", tone: "primary" as const },
    { href: "/payment-links", label: "Launch Payment Links", tone: "secondary" as const },
    { href: "/docs", label: "Read API docs", tone: "secondary" as const },
    { href: "/", label: "View public website", tone: "secondary" as const },
  ];

  const totalVolumeBase =
    selectedPlan.code === "scale" ? 482_000 : selectedPlan.code === "starter" ? 68_400 : 186_000;
  const totalVolume = totalVolumeBase + Math.max(memberships.length - 1, 0) * 12_000;
  const successRate = selectedPlan.fallback
    ? 98.4
    : selectedPlan.manualGatewaySelection
      ? 96.1
      : 93.8;
  const recoveredPayments = selectedPlan.fallback ? 18 + Math.max(memberships.length - 1, 0) * 3 : 0;
  const activeGateways = selectedMembership ? 3 : 0;
  const intelligenceMode = isMerchantActive ? "Derived from live merchant posture" : "Derived preview";

  const topMetrics = [
    {
      label: "Total volume",
      value: formatCurrency(totalVolume),
      detail: "Modeled across hosted checkout, payment links, and merchant payment flows.",
      tone: "success" as const,
    },
    {
      label: "Success rate",
      value: formatPercent(successRate),
      detail: "Routing posture combining orchestration, retries, and gateway fit.",
      tone: "violet" as const,
    },
    {
      label: "Recovered payments",
      value: formatNumber(recoveredPayments),
      detail: selectedPlan.fallback
        ? "Recovered through fallback paths after an initial failure."
        : "Fallback recovery becomes available on Growth and Scale.",
      tone: recoveredPayments > 0 ? ("success" as const) : ("warning" as const),
    },
    {
      label: "Active gateways",
      value: formatNumber(activeGateways),
      detail: "Current orchestration view across Paystack, Yoco, and Ozow.",
      tone: "muted" as const,
    },
  ];

  const routingInsights: RoutingInsight[] = [
    {
      title: "Paystack → failed → Yoco → success",
      detail: selectedPlan.fallback
        ? "Fallback recovered a declined payment by retrying on Yoco without leaving the Stackaura flow."
        : "Fallback recovery is surfaced here as a Growth and Scale capability once retry paths are enabled.",
      badge: selectedPlan.fallback ? "Fallback live" : "Upgrade for fallback",
      tone: selectedPlan.fallback ? "success" : "warning",
      path: [
        { label: "Paystack", kind: "gateway" },
        { label: "FAILED", kind: "event" },
        { label: "Yoco", kind: "gateway" },
        { label: "SUCCEEDED", kind: "event" },
      ],
    },
    {
      title: "Auto routed to Ozow",
      detail: selectedPlan.autoRouting
        ? "Stackaura can steer bank-transfer-friendly traffic to Ozow when routing logic sees a better fit."
        : "Auto routing becomes available once the current merchant posture enables orchestration controls.",
      badge: selectedPlan.autoRouting ? "Auto routing live" : "Preview",
      tone: selectedPlan.autoRouting ? "violet" : "muted",
      path: [
        { label: "AUTO", kind: "event" },
        { label: "Ozow", kind: "gateway" },
        { label: "SUCCEEDED", kind: "event" },
      ],
    },
    {
      title: "Explicit Yoco selection completed successfully",
      detail: selectedPlan.manualGatewaySelection
        ? "Manual gateway control stays available without breaking the unified checkout and orchestration layer."
        : "Manual gateway selection is surfaced here as a plan-controlled operator capability.",
      badge: selectedPlan.manualGatewaySelection ? "Manual selection live" : "Upgrade for manual control",
      tone: selectedPlan.manualGatewaySelection ? "success" : "warning",
      path: [
        { label: "MANUAL", kind: "event" },
        { label: "Yoco", kind: "gateway" },
        { label: "SUCCEEDED", kind: "event" },
      ],
    },
  ];

  const gatewayDistribution = buildGatewayDistribution(totalVolume, selectedPlan.code);

  const orchestrationHistory: OrchestrationItem[] = [
    {
      reference: "STA-24031",
      amount: 1_250,
      customer: "cardholder@merchant.co.za",
      route: "Auto routed to Ozow",
      detail: "Created in unified checkout, initiated immediately, and completed on the auto-selected rail.",
      badge: "Auto route",
      tone: "violet",
      stages: ["CREATED", "INITIATED", "SUCCEEDED"],
    },
    {
      reference: "STA-24028",
      amount: 820,
      customer: "repeatbuyer@example.com",
      route: "Recovered after Paystack failure",
      detail: selectedPlan.fallback
        ? "The failed attempt was retried on Yoco and recovered before the customer dropped out."
        : "This recovery path is shown as a fallback example once the merchant plan includes retry orchestration.",
      badge: selectedPlan.fallback ? "Recovered" : "Fallback preview",
      tone: selectedPlan.fallback ? "success" : "warning",
      stages: ["CREATED", "INITIATED", "FAILED", "FALLBACK", "SUCCEEDED"],
    },
    {
      reference: "STA-24017",
      amount: 3_600,
      customer: "ops@platform.io",
      route: "Explicit Yoco selection",
      detail: selectedPlan.manualGatewaySelection
        ? "The merchant intentionally selected Yoco and still completed within the same orchestration history."
        : "Manual gateway selection is available on higher routing plans while the unified payment flow stays unchanged.",
      badge: selectedPlan.manualGatewaySelection ? "Manual path" : "Plan gated",
      tone: selectedPlan.manualGatewaySelection ? "success" : "warning",
      stages: ["CREATED", "INITIATED", "SUCCEEDED"],
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "relative overflow-hidden p-6 lg:p-8")}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_16%,rgba(255,255,255,0.34),transparent_22%),radial-gradient(circle_at_86%_18%,rgba(122,115,255,0.14),transparent_24%),radial-gradient(circle_at_76%_74%,rgba(125,211,252,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.16),transparent_18%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <div>
            <div className={lightProductSectionEyebrowClass}>Merchant dashboard</div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              See how Stackaura routes, recovers, and orchestrates payments from one merchant view.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-3xl")}>
              Signed in as <span className="font-medium text-[#0a2540]">{me.user.email}</span>. Use
              this authenticated Stackaura experience to monitor routing posture, surface fallback
              value, and move between gateways, API keys, payment links, and merchant workspaces.
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
              <span className={lightProductStatusPillClass("muted")}>{intelligenceMode}</span>
            </div>

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
                    Routing posture
                  </div>
                  <div className="mt-2 text-xl font-semibold tracking-tight text-[#0a2540]">
                    {selectedMerchantName}
                  </div>
                </div>
                <span className={lightProductStatusPillClass("violet")}>
                  {activeGateways} live rails
                </span>
              </div>

              <p className={cn(lightProductMutedTextClass, "mt-4")}>
                Stackaura sits above connected providers so merchants can operate routing,
                fallback, and manual gateway control from one orchestration layer.
              </p>

              <div className="mt-4 grid gap-3">
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
              Routing intelligence at a glance
            </div>
            <p className={cn(lightProductMutedTextClass, "mt-3 max-w-3xl")}>
              These cards surface the value of orchestration, fallback, and gateway coverage from
              the selected merchant posture without changing backend behavior.
            </p>
          </div>

          <span className={lightProductStatusPillClass("muted")}>{intelligenceMode}</span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topMetrics.map((item) => (
            <div key={item.label} className={cn(lightProductPanelClass, "p-5")}>
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">{item.label}</div>
                <span className={lightProductStatusPillClass(item.tone)}>
                  {item.label === "Success rate" ? "Performance" : "Snapshot"}
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

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={lightProductSectionEyebrowClass}>Routing insights</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                Recent routing paths surfaced clearly
              </div>
            </div>
            <span className={lightProductStatusPillClass("success")}>Value surfaced</span>
          </div>

          <p className={cn(lightProductMutedTextClass, "mt-4 max-w-3xl")}>
            Merchants can see how Stackaura chooses a rail, recovers after failure, and preserves
            explicit gateway control without fragmenting the payment flow.
          </p>

          <div className="mt-6 grid gap-4">
            {routingInsights.map((insight) => (
              <div key={insight.title} className={cn(lightProductInsetPanelClass, "p-5")}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                      {insight.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#425466]">{insight.detail}</p>
                  </div>
                  <span className={lightProductStatusPillClass(insight.tone)}>{insight.badge}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {insight.path.map((step, index) => (
                    <div key={`${insight.title}-${step.label}-${index}`} className="flex items-center gap-2">
                      <span
                        className={
                          step.kind === "gateway"
                            ? "inline-flex items-center rounded-[16px] border border-white/42 bg-white/28 px-3 py-2 text-sm font-medium text-[#0a2540] shadow-[0_8px_18px_rgba(133,156,180,0.08)]"
                            : lightProductStatusPillClass(getRoutingEventTone(step.label))
                        }
                      >
                        {step.label}
                      </span>
                      {index < insight.path.length - 1 ? (
                        <span className="text-sm text-[#6b7c93]">→</span>
                      ) : null}
                    </div>
                  ))}
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
                Payment mix across active rails
              </div>
            </div>
            <span className={lightProductStatusPillClass("violet")}>Paystack · Yoco · Ozow</span>
          </div>

          <p className={cn(lightProductMutedTextClass, "mt-4")}>
            A clean visual summary of where traffic lands when Stackaura routes across connected
            providers from one merchant experience.
          </p>

          <div className="mt-6 grid gap-4">
            {gatewayDistribution.map((item) => (
              <div key={item.name} className={cn(lightProductInsetPanelClass, "p-4")}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#0a2540]">{item.name}</div>
                    <div className="mt-1 text-xs text-[#6b7c93]">{item.detail}</div>
                  </div>
                  <span className={lightProductStatusPillClass(item.tone)}>{item.share}%</span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/40">
                  <div className={cn("h-full rounded-full", item.barClass)} style={{ width: `${item.share}%` }} />
                </div>

                <div className="mt-3 text-sm text-[#425466]">{formatCurrency(item.volume)} routed</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={lightProductSectionEyebrowClass}>Orchestration history</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                Payment timeline and fallback visibility
              </div>
            </div>
            <span className={lightProductStatusPillClass("muted")}>CREATED → SUCCEEDED</span>
          </div>

          <p className={cn(lightProductMutedTextClass, "mt-4 max-w-3xl")}>
            Each payment card shows how Stackaura moves through creation, initiation, failure,
            fallback, and success so merchants can understand orchestration, not just outcomes.
          </p>

          <div className="mt-6 grid gap-4">
            {orchestrationHistory.map((item) => (
              <div key={item.reference} className={cn(lightProductInsetPanelClass, "p-5")}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                        {item.reference}
                      </div>
                      <span className={lightProductStatusPillClass(item.tone)}>{item.badge}</span>
                    </div>

                    <div className="mt-2 text-sm font-medium text-[#0a2540]">{item.route}</div>
                    <p className="mt-2 text-sm leading-6 text-[#425466]">{item.detail}</p>
                  </div>

                  <div className="grid min-w-[180px] gap-2 text-sm text-[#425466]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#6b7c93]">Amount</span>
                      <span className="font-medium text-[#0a2540]">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[#6b7c93]">Customer</span>
                      <span className="truncate text-right text-[#0a2540]">{item.customer}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {item.stages.map((stage, index) => (
                    <div key={`${item.reference}-${stage}`} className="flex items-center gap-2">
                      <span className={lightProductStatusPillClass(getTimelineStageTone(stage))}>
                        {stage}
                      </span>
                      {index < item.stages.length - 1 ? (
                        <span className="text-sm text-[#6b7c93]">→</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
            <span className={lightProductStatusPillClass("violet")}>Read only</span>
          </div>

          <p className={cn(lightProductMutedTextClass, "mt-4")}>
            This view reflects the plan currently assigned to the selected merchant. It clarifies
            which routing and recovery capabilities are available without changing any backend
            behavior from the dashboard.
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
                ? "Fallback recovery is available to preserve conversion when the first rail fails."
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

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
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
                  <span className="text-[#6b7c93]">Merchant ID</span>
                  <span className="break-all text-right text-[#0a2540]">
                    {selectedMerchantId || "No merchant selected"}
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
            gateway configuration, and orchestration visibility inside Stackaura.
          </p>
        </div>

        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Quick actions</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Move into the next payment task fast
          </div>
          <p className={cn(lightProductMutedTextClass, "mt-4")}>
            Jump directly into gateway setup, developer access, payment links, and docs without
            losing the merchant context selected above.
          </p>

          <div className="mt-5 grid gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  action.tone === "primary" ? publicPrimaryButtonClass : publicSecondaryButtonClass
                }
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
