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

  const quickActions = [
    { href: "/dashboard/api-keys", label: "Open Developer Keys", tone: "primary" as const },
    { href: "/payment-links", label: "Launch Payment Links", tone: "secondary" as const },
    { href: "/docs", label: "Read API docs", tone: "secondary" as const },
    { href: "/", label: "View public website", tone: "secondary" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "relative overflow-hidden p-6 lg:p-8")}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_16%,rgba(255,255,255,0.34),transparent_22%),radial-gradient(circle_at_86%_18%,rgba(122,115,255,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.16),transparent_18%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <div>
            <div className={lightProductSectionEyebrowClass}>Merchant dashboard</div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              Operate payments, onboarding, and developer access inside the same Stackaura system.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-3xl")}>
              Signed in as <span className="font-medium text-[#0a2540]">{me.user.email}</span>. Use
              the authenticated Stackaura experience to manage merchant workspaces, issue API keys,
              launch payment links, and prepare live gateway operations from one place.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className={lightProductStatusPillClass(selectedMembership?.merchant.isActive ? "success" : "muted")}>
                {selectedMembership?.merchant.isActive ? "Merchant active" : "Merchant inactive"}
              </span>
              <span className={lightProductStatusPillClass("violet")}>
                {selectedMembership?.role || "Member"}
              </span>
              <span className={lightProductStatusPillClass("muted")}>Ozow + PayFast ready</span>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/api-keys" className={publicPrimaryButtonClass}>
                Open developer keys
              </Link>
              <Link href="/payment-links" className={publicSecondaryButtonClass}>
                Launch payment links
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <MerchantSwitcher memberships={memberships} selectedMerchantId={selectedMerchantId} />

            <div className={cn(lightProductInsetPanelClass, "p-5")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Console focus</div>
              <div className="mt-4 grid gap-3 text-sm text-[#425466]">
                <div className="rounded-[20px] border border-white/42 bg-white/22 px-4 py-3 shadow-[0_8px_18px_rgba(133,156,180,0.08)]">
                  Issue and manage merchant API credentials across test and live environments.
                </div>
                <div className="rounded-[20px] border border-white/42 bg-white/22 px-4 py-3 shadow-[0_8px_18px_rgba(133,156,180,0.08)]">
                  Guide merchants from paid onboarding into active infrastructure and integrations.
                </div>
                <div className="rounded-[20px] border border-white/42 bg-white/22 px-4 py-3 shadow-[0_8px_18px_rgba(133,156,180,0.08)]">
                  Launch hosted checkout and payment links from the same Stackaura control plane.
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

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Active merchant",
                value: selectedMembership?.merchant.name || "No merchant",
                detail: selectedMerchantId || "No merchant selected",
              },
              {
                label: "Role",
                value: selectedMembership?.role || "Member",
                detail: "Merchant-scoped dashboard permissions",
              },
              {
                label: "Gateway rails",
                value: "PayFast + Ozow",
                detail: "Live South African infrastructure",
              },
              {
                label: "Platform status",
                value: "Ready",
                detail: "Onboarding, payments, and developer tooling live",
              },
            ].map((item) => (
              <div key={item.label} className={cn(lightProductPanelClass, "p-5")}>
                <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">{item.label}</div>
                <div className="mt-4 text-xl font-semibold tracking-tight text-[#0a2540]">{item.value}</div>
                <div className="mt-3 break-all text-xs text-[#6b7c93]">{item.detail}</div>
              </div>
            ))}
          </div>

          <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className={lightProductSectionEyebrowClass}>Workspace overview</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                  Your authenticated Stackaura workspace
                </div>
              </div>
              <span className={lightProductStatusPillClass("muted")}>Merchant operations</span>
            </div>

            <p className={cn(lightProductMutedTextClass, "mt-4 max-w-3xl")}>
              This dashboard is the logged-in extension of the public Stackaura experience. It is
              where merchant state, developer credentials, checkout tooling, and gateway operations
              come together in one consistent environment.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={cn(lightProductInsetPanelClass, "p-5")}>
                <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Merchant profile</div>
                <div className="mt-4 space-y-3 text-sm text-[#425466]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[#6b7c93]">Name</span>
                    <span className="text-right text-[#0a2540]">{selectedMembership?.merchant.name || "—"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[#6b7c93]">Email</span>
                    <span className="text-right text-[#0a2540]">{selectedMembership?.merchant.email || "—"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[#6b7c93]">Status</span>
                    <span className="text-right text-[#0a2540]">
                      {selectedMembership?.merchant.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={cn(lightProductInsetPanelClass, "p-5")}>
                <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">What’s live now</div>
                <div className="mt-4 grid gap-3 text-sm text-[#425466]">
                  {[
                    "Merchant onboarding and login",
                    "API keys and dashboard access",
                    "Payment intents, subscriptions, and ledger foundation",
                    "Ozow + PayFast orchestration readiness",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[18px] border border-white/42 bg-white/22 px-4 py-3 shadow-[0_8px_18px_rgba(133,156,180,0.08)]">
                      <span className="mt-0.5 text-[#635bff]">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className={cn(lightProductPanelClass, "p-6")}>
            <div className={lightProductSectionEyebrowClass}>Quick actions</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
              Move into the next product task fast
            </div>
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

          <div className={cn(lightProductPanelClass, "p-6")}>
            <div className={lightProductSectionEyebrowClass}>Next build targets</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
              Product areas to extend from here
            </div>
            <div className="mt-5 grid gap-3 text-sm text-[#425466]">
              {[
                "Payment links directly inside the dashboard workspace",
                "Live gateway connection UX for Ozow and PayFast",
                "Merchant-facing payments, subscriptions, and ledger views",
              ].map((item) => (
                <div key={item} className={cn(lightProductInsetPanelClass, "p-4")}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
