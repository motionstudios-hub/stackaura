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
import {
  getMerchantApiKeys,
  getMerchantGatewayConnections,
  getMerchantSupportOverview,
  getSelectedMerchantWorkspace,
} from "../console-data";
import { formatNumber, formatPlanLabel } from "../console-utils";

export default async function DashboardSettingsPage() {
  const workspace = await getSelectedMerchantWorkspace();
  if (!workspace) {
    redirect("/login");
  }

  const [apiKeys, gateways, supportOverview] = await Promise.all([
    getMerchantApiKeys(workspace.selectedMerchantId),
    getMerchantGatewayConnections(workspace.selectedMerchantId),
    getMerchantSupportOverview(workspace.selectedMerchantId),
  ]);

  const connectedGateways = gateways.filter((gateway) => gateway.connected).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "overflow-hidden p-6 lg:p-8")}>
        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
          <div className="max-w-3xl">
            <div className={lightProductSectionEyebrowClass}>Settings</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              Workspace, profile, security, and notification posture.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-2xl")}>
              This page surfaces the real operational settings state for the selected merchant workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Workspace</div>
              <div className="mt-2 text-sm font-semibold text-[#0a2540]">
                {workspace.selectedMerchantName}
              </div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Plan</div>
              <div className="mt-2 text-sm font-semibold text-[#0a2540]">
                {formatPlanLabel(workspace.selectedPlan.code)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Workspace</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Merchant profile
          </div>

          <div className="mt-5 grid gap-3">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Name</div>
              <div className="mt-2 text-sm text-[#0a2540]">{workspace.selectedMerchantName}</div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Email</div>
              <div className="mt-2 text-sm text-[#0a2540]">{workspace.selectedMerchantEmail}</div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Membership role</div>
              <div className="mt-2 text-sm text-[#0a2540]">
                {workspace.selectedMembership?.role || "Member"}
              </div>
            </div>
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Profile</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Signed-in operator
          </div>

          <div className="mt-5 grid gap-3">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">User email</div>
              <div className="mt-2 text-sm text-[#0a2540]">{workspace.me.user.email}</div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Merchant status</div>
              <div className="mt-2">
                <span className={lightProductStatusPillClass(workspace.isMerchantActive ? "success" : "warning")}>
                  {workspace.isMerchantActive ? "Active" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Security</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Access and credential posture
          </div>

          <div className="mt-5 grid gap-3">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Active API keys</div>
              <div className="mt-2 text-sm text-[#0a2540]">{formatNumber(apiKeys.filter((item) => !item.revokedAt).length)}</div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Connected gateways</div>
              <div className="mt-2 text-sm text-[#0a2540]">{formatNumber(connectedGateways)}</div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Onboarding status</div>
              <div className="mt-2 text-sm text-[#0a2540]">
                {supportOverview?.merchantContext.onboarding.status || "Unknown"}
              </div>
            </div>
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Notifications</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Operational communication channels
          </div>
          <p className={cn(lightProductMutedTextClass, "mt-4")}>
            The dashboard header surfaces failed payments, recovered payments, support escalations,
            and gateway issues from real app events. Human escalation routes through the support inbox below.
          </p>

          <div className="mt-5 grid gap-3">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Support inbox</div>
              <div className="mt-2 text-sm text-[#0a2540]">
                {supportOverview?.merchantContext.supportInboxEmail || "wesupport@stackaura.co.za"}
              </div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Conversation count</div>
              <div className="mt-2 text-sm text-[#0a2540]">
                {formatNumber(supportOverview?.conversations.length ?? 0)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <Link href="/dashboard/api-keys" className={publicSecondaryButtonClass}>
              Review developer keys
            </Link>
            <Link href="/dashboard/gateways" className={publicSecondaryButtonClass}>
              Review gateway connections
            </Link>
            <Link href="/dashboard/support" className={publicSecondaryButtonClass}>
              Open support AI
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
