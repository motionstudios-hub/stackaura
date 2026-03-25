import { redirect } from "next/navigation";
import {
  cn,
  lightProductHeroClass,
  lightProductInsetPanelClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
} from "../../components/stackaura-ui";
import {
  getMerchantGatewayConnections,
  getSelectedMerchantWorkspace,
  getWorkspaceAnalytics,
} from "../console-data";
import {
  formatCurrencyFromCents,
  formatDateTime,
  formatNumber,
  formatPercent,
  gatewayBarClass,
  paymentStatusTone,
  timelineStageTone,
} from "../console-utils";

export default async function DashboardRoutingPage() {
  const workspace = await getSelectedMerchantWorkspace();
  if (!workspace) {
    redirect("/login");
  }

  const [analytics, gateways] = await Promise.all([
    getWorkspaceAnalytics(workspace.selectedMerchantId),
    getMerchantGatewayConnections(workspace.selectedMerchantId),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "overflow-hidden p-6 lg:p-8")}>
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
          <div className="max-w-3xl">
            <div className={lightProductSectionEyebrowClass}>Routing</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              Gateway routing history and distribution for this workspace.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-2xl")}>
              Review how Stackaura selected gateways, how often fallback was used, and what the latest
              routing paths looked like in real payment activity.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {gateways.map((gateway) => (
              <div key={gateway.key} className={cn(lightProductInsetPanelClass, "p-4")}>
                <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">{gateway.label}</div>
                <div className="mt-2 text-sm font-semibold text-[#0a2540]">
                  {gateway.connected ? "Connected" : "Needs config"}
                </div>
                <div className="mt-2">
                  <span className={lightProductStatusPillClass(gateway.connected ? "success" : "warning")}>
                    {gateway.testMode ? "Test mode" : "Live mode"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Gateway distribution</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Real payment mix by gateway
          </div>
          <p className={cn(lightProductMutedTextClass, "mt-4")}>
            {analytics.metricDefinitions.gatewayDistribution}
          </p>

          <div className="mt-6 grid gap-4">
            {analytics.gatewayDistribution.map((item) => {
              const share = analytics.totalPayments > 0 ? (item.count / analytics.totalPayments) * 100 : 0;
              return (
                <div key={item.gateway} className={cn(lightProductInsetPanelClass, "p-4")}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#0a2540]">{item.label}</div>
                      <div className="mt-1 text-xs text-[#6b7c93]">
                        {formatNumber(item.count)} payments · {formatCurrencyFromCents(item.volumeCents)}
                      </div>
                    </div>
                    <span className={lightProductStatusPillClass("muted")}>{formatPercent(share)}</span>
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

        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Routing posture</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Workspace routing summary
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Active gateways used</div>
              <div className="mt-2 text-2xl font-semibold text-[#0a2540]">
                {formatNumber(analytics.activeGatewaysUsed)}
              </div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Recovered payments</div>
              <div className="mt-2 text-2xl font-semibold text-[#0a2540]">
                {formatNumber(analytics.recoveredPayments)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={cn(lightProductPanelClass, "mt-8 p-6 lg:p-7")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={lightProductSectionEyebrowClass}>Routing history</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
              Latest routing paths from the database
            </div>
          </div>
          <span className={lightProductStatusPillClass(analytics.recentRoutingHistory.length > 0 ? "success" : "muted")}>
            {analytics.recentRoutingHistory.length > 0 ? "Real attempts recorded" : "No attempts yet"}
          </span>
        </div>

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
                    <div className="mt-2 text-sm font-medium text-[#0a2540]">{item.routeSummary}</div>
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
                      <span className="text-right text-[#0a2540]">{item.selectionMode || "recorded"}</span>
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
                      {index < item.path.length - 1 ? <span className="text-sm text-[#6b7c93]">→</span> : null}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {item.timelineStages.map((stage, index) => (
                    <div key={`${item.reference}-${stage}`} className="flex items-center gap-2">
                      <span className={lightProductStatusPillClass(timelineStageTone(stage))}>{stage}</span>
                      {index < item.timelineStages.length - 1 ? <span className="text-sm text-[#6b7c93]">→</span> : null}
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
                Routing history will populate here once the selected merchant creates payments that
                generate gateway attempts.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
