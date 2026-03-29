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
import ApiKeyWelcome from "./api-key-welcome";
import {
  getSelectedMerchantWorkspace,
  getWorkspaceAnalytics,
} from "./console-data";
import {
  formatCurrencyFromCents,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatPlanLabel,
  paymentStatusTone,
  resolveMerchantPlanSummary,
  timelineStageTone,
} from "./console-utils";
import MerchantSwitcher from "./merchant-switcher";

export default async function DashboardOverviewPage() {
  const workspace = await getSelectedMerchantWorkspace();
  if (!workspace) {
    redirect("/login");
  }

  const analytics = await getWorkspaceAnalytics(workspace.selectedMerchantId);
  const hasPayments = analytics.totalPayments > 0;
  const selectedPlan = resolveMerchantPlanSummary(workspace.selectedMembership?.merchant);
  const recoveryRate =
    analytics.totalPayments > 0 ? analytics.recoveredPayments / analytics.totalPayments : 0;

  const quickActions = [
    { href: "/dashboard/payments", label: "Open payments", tone: "primary" as const },
    { href: "/dashboard/gateways", label: "Open gateway connections", tone: "primary" as const },
    { href: "/dashboard/api-keys", label: "Open developer keys", tone: "secondary" as const },
    { href: "/dashboard/settings", label: "Review workspace settings", tone: "secondary" as const },
  ];

  const topMetrics = [
    {
      label: "Total volume",
      value: formatCurrencyFromCents(analytics.totalVolumeCents),
      detail: `${formatNumber(analytics.totalPayments)} real payments recorded`,
      tone: "success" as const,
    },
    {
      label: "Successful payments",
      value: formatNumber(analytics.successfulPayments),
      detail: formatPercent(analytics.successRate),
      tone: "violet" as const,
    },
    {
      label: "Failed payments",
      value: formatNumber(analytics.failedPayments),
      detail: "Terminal failed or cancelled payments",
      tone: analytics.failedPayments > 0 ? ("warning" as const) : ("muted" as const),
    },
    {
      label: "Recovery rate",
      value: formatPercent(recoveryRate),
      detail: `${formatNumber(analytics.recoveredPayments)} recovered payments from real volume`,
      tone: analytics.recoveredPayments > 0 ? ("success" as const) : ("muted" as const),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "relative overflow-hidden p-6 lg:p-8")}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_16%,rgba(255,255,255,0.34),transparent_22%),radial-gradient(circle_at_86%_18%,rgba(122,115,255,0.14),transparent_24%),radial-gradient(circle_at_76%_74%,rgba(125,211,252,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.16),transparent_18%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <div>
            <div className={lightProductSectionEyebrowClass}>Overview</div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              See real payment activity, routing, and recovery for one merchant workspace.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-3xl")}>
              Signed in as <span className="font-medium text-[#0a2540]">{workspace.me.user.email}</span>.
              This overview focuses on the selected workspace, its latest payment activity, and the
              fastest operational next steps.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className={lightProductStatusPillClass(workspace.isMerchantActive ? "success" : "muted")}>
                {workspace.isMerchantActive ? "Merchant active" : "Merchant inactive"}
              </span>
              <span className={lightProductStatusPillClass("violet")}>
                {workspace.selectedMembership?.role || "Member"}
              </span>
              <span className={lightProductStatusPillClass("warning")}>
                {formatPlanLabel(selectedPlan.code)} plan
              </span>
              <span className={lightProductStatusPillClass(hasPayments ? "success" : "muted")}>
                {hasPayments ? "Live overview" : "Onboarding state"}
              </span>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/payments" className={publicPrimaryButtonClass}>
                Open payments
              </Link>
              <Link href="/dashboard/routing" className={publicSecondaryButtonClass}>
                Review routing
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <MerchantSwitcher
              memberships={workspace.memberships}
              selectedMerchantId={workspace.selectedMerchantId}
            />

            <div className={cn(lightProductInsetPanelClass, "p-5")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">
                    Merchant snapshot
                  </div>
                  <div className="mt-2 text-xl font-semibold tracking-tight text-[#0a2540]">
                    {workspace.selectedMerchantName}
                  </div>
                </div>
                <span className={lightProductStatusPillClass(hasPayments ? "success" : "muted")}>
                  {formatNumber(analytics.totalPayments)} payments
                </span>
              </div>

              <p className={cn(lightProductMutedTextClass, "mt-4")}>
                Stackaura provides orchestration and routing infrastructure. Licensed providers
                process and settle funds while this overview surfaces real merchant activity.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className={cn(lightProductInsetPanelClass, "px-4 py-3")}>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Workspace</div>
                  <div className="mt-2 text-lg font-semibold text-[#0a2540]">
                    {workspace.selectedMerchantId ? "Selected" : "Missing"}
                  </div>
                </div>
                <div className={cn(lightProductInsetPanelClass, "px-4 py-3")}>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Email</div>
                  <div className="mt-2 truncate text-lg font-semibold text-[#0a2540]">
                    {workspace.selectedMerchantEmail}
                  </div>
                </div>
                <div className={cn(lightProductInsetPanelClass, "px-4 py-3")}>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Gateways</div>
                  <div className="mt-2 text-lg font-semibold text-[#0a2540]">
                    {formatNumber(analytics.activeGatewaysUsed)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ApiKeyWelcome
        merchantId={workspace.selectedMerchantId}
        merchantName={workspace.selectedMembership?.merchant.name || null}
        merchantIsActive={workspace.selectedMembership?.merchant.isActive ?? false}
      />

      <section className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={lightProductSectionEyebrowClass}>Top metrics</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
              Real merchant analytics at a glance
            </div>
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

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={lightProductSectionEyebrowClass}>Recent payments</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                Compact payment activity
              </div>
            </div>
            <Link href="/dashboard/payments" className={publicSecondaryButtonClass}>
              View all payments
            </Link>
          </div>

          <div className="mt-5 grid gap-4">
            {analytics.recentPayments.length > 0 ? (
              analytics.recentPayments.slice(0, 4).map((payment) => (
                <div key={payment.reference} className={cn(lightProductInsetPanelClass, "p-5")}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={cn(lightProductInsetPanelClass, "p-5")}>
                <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                  No payments yet
                </div>
                <p className="mt-2 text-sm leading-6 text-[#425466]">
                  Once this merchant processes a payment, the overview will show live payment activity here.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className={lightProductSectionEyebrowClass}>Routing summary</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                Compact routing and recovery view
              </div>
            </div>
            <Link href="/dashboard/routing" className={publicSecondaryButtonClass}>
              Open routing
            </Link>
          </div>

          <div className="mt-5 grid gap-4">
            {analytics.recentRoutingHistory.length > 0 ? (
              analytics.recentRoutingHistory.slice(0, 3).map((item) => (
                <div key={item.reference} className={cn(lightProductInsetPanelClass, "p-5")}>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                        {item.reference}
                      </div>
                      <span className={lightProductStatusPillClass(paymentStatusTone(item.status))}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-[#0a2540]">{item.routeSummary}</div>
                    <div className="flex flex-wrap items-center gap-2">
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
                </div>
              ))
            ) : (
              <div className={cn(lightProductInsetPanelClass, "p-5")}>
                <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                  No routing attempts recorded yet
                </div>
                <p className="mt-2 text-sm leading-6 text-[#425466]">
                  Routing history will populate here once the selected merchant creates payments that
                  generate gateway attempts.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Quick actions</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Move into the next payment task fast
          </div>
          <p className={cn(lightProductMutedTextClass, "mt-4")}>
            Jump into the dedicated payments, routing, gateway, and developer pages without losing
            the selected merchant context.
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

        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Workspace posture</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            {formatPlanLabel(selectedPlan.code)} merchant plan
          </div>
          <p className={cn(lightProductMutedTextClass, "mt-4")}>
            Plan entitlements stay real and merchant-specific across the console.
          </p>

          <div className="mt-5 grid gap-3">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Manual gateway selection</div>
              <div className="mt-2 text-sm text-[#0a2540]">
                {selectedPlan.manualGatewaySelection ? "Enabled" : "Not enabled"}
              </div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Auto routing</div>
              <div className="mt-2 text-sm text-[#0a2540]">
                {selectedPlan.autoRouting ? "Enabled" : "Not enabled"}
              </div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Fallback recovery</div>
              <div className="mt-2 text-sm text-[#0a2540]">
                {selectedPlan.fallback ? "Enabled" : "Not enabled"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
