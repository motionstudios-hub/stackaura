import { cookies } from "next/headers";
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
import { getServerMe } from "../../lib/auth";
import MerchantSwitcher from "../merchant-switcher";
import SupportConsole from "./support-console";

export default async function DashboardSupportPage() {
  const me = await getServerMe();
  if (!me) {
    redirect("/login");
  }

  const activeMerchantId = (await cookies()).get("active_merchant_id")?.value;
  const memberships = me.memberships ?? [];
  const fallbackMerchantId = memberships[0]?.merchant?.id ?? null;
  const selectedMerchantId = activeMerchantId || fallbackMerchantId;
  const selectedMembership =
    memberships.find((membership) => membership.merchant.id === selectedMerchantId) ??
    memberships[0] ??
    null;

  const selectedMerchant = selectedMembership?.merchant ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <section className={cn(lightProductHeroClass, "overflow-hidden p-6 sm:p-8")}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className={lightProductSectionEyebrowClass}>Merchant support</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              Merchant-aware AI support inside the Stackaura dashboard.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-2xl text-base sm:text-lg")}>
              Ask setup, integration, gateway, account, payout, and payment troubleshooting
              questions from inside the authenticated workspace. When the AI cannot safely resolve
              the issue, it escalates the conversation to the support team behind
              {" "}
              <strong>wesupport@stackaura.co.za</strong>.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.22em] text-[#6b7c93]">Mode</div>
              <div className="mt-3 flex items-center gap-3">
                <span className={lightProductStatusPillClass("success")}>Read only</span>
                <span className={lightProductStatusPillClass("violet")}>Merchant aware</span>
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.22em] text-[#6b7c93]">Human handoff</div>
              <div className="mt-3 text-sm font-semibold text-[#0a2540]">
                wesupport@stackaura.co.za
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                Support AI and human support converge into one workflow.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className={cn(lightProductPanelClass, "p-5")}>
            <div className="text-xs uppercase tracking-[0.22em] text-[#6b7c93]">Selected workspace</div>
            <div className="mt-3 text-2xl font-semibold text-[#0a2540]">
              {selectedMerchant?.name || "Choose a merchant"}
            </div>
            <div className="mt-2 text-sm text-[#425466]">
              {selectedMerchant?.email || "Select a workspace to begin support conversations."}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={lightProductStatusPillClass(selectedMerchant?.isActive ? "success" : "warning")}>
                {selectedMerchant?.isActive ? "Active merchant" : "Pending merchant"}
              </span>
              {selectedMerchant?.plan?.code ? (
                <span className={lightProductStatusPillClass("muted")}>
                  {selectedMerchant.plan.code} plan
                </span>
              ) : null}
            </div>
          </div>

          <MerchantSwitcher
            memberships={memberships}
            selectedMerchantId={selectedMerchant?.id ?? null}
          />
        </div>
      </section>

      <SupportConsole
        merchant={
          selectedMerchant
            ? {
                id: selectedMerchant.id,
                name: selectedMerchant.name,
                email: selectedMerchant.email,
                isActive: selectedMerchant.isActive,
                planCode: selectedMerchant.plan?.code ?? selectedMerchant.planCode ?? "growth",
              }
            : null
        }
      />
    </div>
  );
}
