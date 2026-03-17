import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  cn,
  darkGhostButtonClass,
  darkHeroSurfaceClass,
  darkInsetPanelClass,
  darkMutedTextClass,
  darkPrimaryButtonClass,
  darkRichPanelClass,
  darkSectionEyebrowClass,
  darkSecondaryButtonClass,
  darkStatusPillClass,
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
    { href: "/docs", label: "Read API docs", tone: "ghost" as const },
    { href: "/", label: "View public website", tone: "ghost" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(darkHeroSurfaceClass, "relative overflow-hidden p-6 lg:p-8")}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_16%,rgba(160,233,255,0.12),transparent_22%),radial-gradient(circle_at_86%_18%,rgba(122,115,255,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_18%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <div>
            <div className={darkSectionEyebrowClass}>Merchant dashboard</div>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Operate payments, onboarding, and developer access from one refined console.
            </h1>
            <p className={cn(darkMutedTextClass, "mt-5 max-w-3xl text-zinc-300")}>
              Signed in as <span className="font-medium text-white">{me.user.email}</span>. Use the
              Stackaura product side to manage merchant workspaces, issue API keys, ship payment
              links, and prepare live gateway operations with infrastructure-grade control.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className={darkStatusPillClass(selectedMembership?.merchant.isActive ? "success" : "muted")}>
                {selectedMembership?.merchant.isActive ? "Merchant active" : "Merchant inactive"}
              </span>
              <span className={darkStatusPillClass("violet")}>
                {selectedMembership?.role || "Member"}
              </span>
              <span className={darkStatusPillClass("muted")}>Ozow + PayFast ready</span>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/api-keys" className={darkPrimaryButtonClass}>
                Open developer keys
              </Link>
              <Link href="/payment-links" className={darkSecondaryButtonClass}>
                Launch payment links
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <MerchantSwitcher
              memberships={memberships}
              selectedMerchantId={selectedMerchantId}
            />

            <div className={cn(darkInsetPanelClass, "p-5")}>
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Console focus</div>
              <div className="mt-4 grid gap-3 text-sm text-zinc-300">
                <div className="rounded-[20px] border border-white/10 bg-black/18 px-4 py-3">
                  Issue and manage merchant API credentials across test and live environments.
                </div>
                <div className="rounded-[20px] border border-white/10 bg-black/18 px-4 py-3">
                  Guide merchants from paid onboarding into active infrastructure and integrations.
                </div>
                <div className="rounded-[20px] border border-white/10 bg-black/18 px-4 py-3">
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
              <div key={item.label} className={cn(darkRichPanelClass, "p-5")}>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.label}</div>
                <div className="mt-4 text-xl font-semibold tracking-tight text-white">{item.value}</div>
                <div className="mt-3 text-xs text-zinc-400 break-all">{item.detail}</div>
              </div>
            ))}
          </div>

          <div className={cn(darkRichPanelClass, "p-6 lg:p-7")}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className={darkSectionEyebrowClass}>Workspace overview</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Your authenticated Stackaura workspace
                </div>
              </div>
              <span className={darkStatusPillClass("muted")}>Merchant operations</span>
            </div>

            <p className={cn(darkMutedTextClass, "mt-4 max-w-3xl text-zinc-300")}>
              This console is the product-side counterpart to the public Stackaura experience. It
              is where merchant state, developer credentials, checkout tooling, and gateway
              operations come together in one environment.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={cn(darkInsetPanelClass, "p-5")}>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Merchant profile</div>
                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-zinc-500">Name</span>
                    <span className="text-right text-white">{selectedMembership?.merchant.name || "—"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-zinc-500">Email</span>
                    <span className="text-right text-white">{selectedMembership?.merchant.email || "—"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-zinc-500">Status</span>
                    <span className="text-right text-white">
                      {selectedMembership?.merchant.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className={cn(darkInsetPanelClass, "p-5")}>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">What’s live now</div>
                <div className="mt-4 grid gap-3 text-sm text-zinc-300">
                  {[
                    "Merchant onboarding and login",
                    "API keys and dashboard access",
                    "Payment intents, subscriptions, and ledger foundation",
                    "Ozow + PayFast orchestration readiness",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[18px] border border-white/8 bg-black/14 px-4 py-3">
                      <span className="mt-0.5 text-[#A0E9FF]">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className={cn(darkRichPanelClass, "p-6")}>
            <div className={darkSectionEyebrowClass}>Quick actions</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Move into the next product task fast
            </div>
            <div className="mt-5 grid gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={
                    action.tone === "primary"
                      ? darkPrimaryButtonClass
                      : action.tone === "secondary"
                        ? darkSecondaryButtonClass
                        : darkGhostButtonClass
                  }
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className={cn(darkRichPanelClass, "p-6")}>
            <div className={darkSectionEyebrowClass}>Next build targets</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Product areas to extend from here
            </div>
            <div className="mt-5 grid gap-3 text-sm text-zinc-300">
              {[
                "Payment links directly inside the dashboard workspace",
                "Live gateway connection UX for Ozow and PayFast",
                "Merchant-facing payments, subscriptions, and ledger views",
              ].map((item) => (
                <div key={item} className={cn(darkInsetPanelClass, "p-4")}>
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
