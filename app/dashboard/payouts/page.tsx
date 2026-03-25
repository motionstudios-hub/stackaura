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
  publicSecondaryButtonClass,
} from "../../components/stackaura-ui";
import { getMerchantSupportOverview, getSelectedMerchantWorkspace } from "../console-data";
import { formatCurrencyFromCents, formatDateTime, formatNumber } from "../console-utils";

export default async function DashboardPayoutsPage() {
  const workspace = await getSelectedMerchantWorkspace();
  if (!workspace) {
    redirect("/login");
  }

  const supportOverview = await getMerchantSupportOverview(workspace.selectedMerchantId);
  const payouts = supportOverview?.merchantContext.payouts;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "overflow-hidden p-6 lg:p-8")}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className={lightProductSectionEyebrowClass}>Payouts</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              Recent payout activity for the selected merchant.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-2xl")}>
              This is a real read-only payout view built from the merchant support context. Full payout
              operations are not yet exposed inside the dashboard.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Pending payouts</div>
              <div className="mt-2 text-2xl font-semibold text-[#0a2540]">
                {formatNumber(payouts?.pendingCount ?? 0)}
              </div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Failed payouts</div>
              <div className="mt-2 text-2xl font-semibold text-[#0a2540]">
                {formatNumber(payouts?.failedCount ?? 0)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Recent payout records</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Latest payout references
          </div>

          <div className="mt-5 grid gap-4">
            {payouts?.recent?.length ? (
              payouts.recent.map((payout) => (
                <div key={payout.reference} className={cn(lightProductInsetPanelClass, "p-5")}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                          {payout.reference}
                        </div>
                        <span className={lightProductStatusPillClass(payout.status === "FAILED" ? "warning" : "muted")}>
                          {payout.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-[#425466]">
                        {payout.provider || "Provider pending"} · {formatDateTime(payout.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#0a2540]">
                        {formatCurrencyFromCents(payout.amountCents)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={cn(lightProductInsetPanelClass, "p-5")}>
                <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                  No payout records yet
                </div>
                <p className="mt-2 text-sm leading-6 text-[#425466]">
                  Payout activity will appear here once the selected merchant starts receiving payout events.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Operational posture</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Payout operations are still read-only
          </div>
          <p className={cn(lightProductMutedTextClass, "mt-4")}>
            Merchants can review payout posture here today, while hands-on payout actions remain routed
            through support and provider workflows.
          </p>

          <div className="mt-5 grid gap-3">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Workspace</div>
              <div className="mt-2 text-sm text-[#0a2540]">{workspace.selectedMerchantName}</div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Support flow</div>
              <div className="mt-2 text-sm text-[#0a2540]">
                {supportOverview?.merchantContext.supportInboxEmail || "wesupport@stackaura.co.za"}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <Link href="/dashboard/support" className={publicSecondaryButtonClass}>
              Open support AI
            </Link>
            <Link href="/docs" className={publicSecondaryButtonClass}>
              Read payout docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
