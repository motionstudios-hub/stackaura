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
import { getMerchantSupportOverview, getSelectedMerchantWorkspace, getWorkspaceAnalytics } from "../console-data";
import {
  formatCurrencyFromCents,
  formatDateTime,
  formatNumber,
  paymentStatusTone,
  resolveMerchantPlanSummary,
} from "../console-utils";

export default async function DashboardRecoveryPage() {
  const workspace = await getSelectedMerchantWorkspace();
  if (!workspace) {
    redirect("/login");
  }

  const [analytics, supportOverview] = await Promise.all([
    getWorkspaceAnalytics(workspace.selectedMerchantId),
    getMerchantSupportOverview(workspace.selectedMerchantId),
  ]);

  const selectedPlan = resolveMerchantPlanSummary(workspace.selectedMembership?.merchant);
  const recoveredRoutes = analytics.recentRoutingHistory.filter((item) => item.fallbackCount > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "overflow-hidden p-6 lg:p-8")}>
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
          <div className="max-w-3xl">
            <div className={lightProductSectionEyebrowClass}>Recovery</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              Fallback and recovery performance for this merchant.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-2xl")}>
              Review recovered payments, recent payment failures, and the current plan posture for
              fallback handling.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Recovered payments</div>
              <div className="mt-2 text-2xl font-semibold text-[#0a2540]">
                {formatNumber(analytics.recoveredPayments)}
              </div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Fallback entitlement</div>
              <div className="mt-2 text-sm font-semibold text-[#0a2540]">
                {selectedPlan.fallback ? "Enabled on current plan" : "Not enabled on current plan"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Recovered routes</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Payments that recovered after fallback
          </div>

          <div className="mt-6 grid gap-4">
            {recoveredRoutes.length > 0 ? (
              recoveredRoutes.map((item) => (
                <div key={item.reference} className={cn(lightProductInsetPanelClass, "p-5")}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                          {item.reference}
                        </div>
                        <span className={lightProductStatusPillClass(paymentStatusTone(item.status))}>
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-medium text-[#0a2540]">{item.routeSummary}</div>
                      <div className="mt-2 text-sm text-[#425466]">
                        {item.fallbackCount} fallback decision{item.fallbackCount > 1 ? "s" : ""} ·{" "}
                        {formatDateTime(item.createdAt)}
                      </div>
                    </div>
                    <div className="font-semibold text-[#0a2540]">
                      {formatCurrencyFromCents(item.amountCents)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={cn(lightProductInsetPanelClass, "p-5")}>
                <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                  No recovered payments yet
                </div>
                <p className="mt-2 text-sm leading-6 text-[#425466]">
                  Recovered payment flows will appear here once a primary rail fails and a later attempt succeeds.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Recent failures</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Payments that may need investigation
          </div>

          <div className="mt-6 grid gap-4">
            {supportOverview?.merchantContext.payments.recentFailures.length ? (
              supportOverview.merchantContext.payments.recentFailures.map((failure) => (
                <div key={failure.reference} className={cn(lightProductInsetPanelClass, "p-5")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                      {failure.reference}
                    </div>
                    <span className={lightProductStatusPillClass("warning")}>{failure.status}</span>
                  </div>
                  <div className="mt-2 text-sm text-[#425466]">
                    {failure.gateway || failure.lastAttemptGateway || "Unknown gateway"} ·{" "}
                    {formatDateTime(failure.updatedAt)}
                  </div>
                </div>
              ))
            ) : (
              <div className={cn(lightProductInsetPanelClass, "p-5")}>
                <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                  No recent failures
                </div>
                <p className="mt-2 text-sm leading-6 text-[#425466]">
                  The recent payment error list is clear for the selected merchant.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
