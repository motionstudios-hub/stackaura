import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import ApiKeyWelcome from "./api-key-welcome";
import MerchantSwitcher from "./merchant-switcher";
import { getServerMe } from "../lib/auth";

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(32,188,237,0.22),transparent_26%),radial-gradient(circle_at_top_right,rgba(17,106,248,0.22),transparent_30%),linear-gradient(135deg,#061229_0%,#020817_45%,#04174a_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_18%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-[#08152f]/60 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-[#A0E9FF]">
              Merchant dashboard
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Stackaura Internal Console
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
              Signed in as <span className="font-medium text-white">{me.user.email}</span>. Manage
              your merchant workspace, API access, payment operations, and gateway setup from one place.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:min-w-[320px] lg:items-end">
            <MerchantSwitcher
              memberships={memberships}
              selectedMerchantId={selectedMerchantId}
            />
            <div className="grid w-full gap-3 sm:flex sm:flex-wrap lg:justify-end">
              <Link
                href="/dashboard/api-keys"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10"
              >
                Developer Keys
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#A0E9FF] px-4 py-2 text-sm font-medium text-[#02142b] transition hover:brightness-105"
              >
                Public Homepage
              </Link>
            </div>
          </div>
        </header>

        <ApiKeyWelcome
          merchantId={selectedMerchantId}
          merchantName={selectedMembership?.merchant.name || null}
          merchantIsActive={selectedMembership?.merchant.isActive ?? false}
        />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Active merchant</div>
                <div className="mt-3 text-xl font-semibold tracking-tight text-white">
                  {selectedMembership?.merchant.name || "No merchant"}
                </div>
                <div className="mt-2 text-xs text-zinc-400 font-mono break-all">
                  {selectedMerchantId || "No merchant selected"}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Role</div>
                <div className="mt-3 text-xl font-semibold tracking-tight text-white">
                  {selectedMembership?.role || "Member"}
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  Merchant-scoped dashboard permissions
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Gateway rails</div>
                <div className="mt-3 text-xl font-semibold tracking-tight text-white">
                  PayFast + Ozow
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  Live South African payment infrastructure
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Platform status</div>
                <div className="mt-3 text-xl font-semibold tracking-tight text-white">
                  Ready
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  Self-serve onboarding, payments, and developer tooling live
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#08152f]/55 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="text-sm font-semibold text-white">Workspace Overview</div>
              <div className="mt-3 text-sm leading-6 text-zinc-300">
                This is your authenticated merchant console. From here, Stackaura can branch into
                payment operations, API key management, hosted checkout, subscriptions, payment links,
                gateway orchestration, and merchant settings.
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Merchant profile</div>
                  <div className="mt-3 space-y-2 text-sm text-zinc-300">
                    <div>
                      <span className="text-zinc-500">Name:</span>{" "}
                      <span className="text-white">{selectedMembership?.merchant.name || "—"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Email:</span>{" "}
                      <span className="text-white">{selectedMembership?.merchant.email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Status:</span>{" "}
                      <span className="text-white">
                        {selectedMembership?.merchant.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">What’s live now</div>
                  <div className="mt-3 grid gap-2 text-sm text-zinc-300">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[#A0E9FF]">•</span>
                      <span>Merchant onboarding and login</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[#A0E9FF]">•</span>
                      <span>API keys and dashboard access</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[#A0E9FF]">•</span>
                      <span>Payment intents, subscriptions, and ledger foundation</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[#A0E9FF]">•</span>
                      <span>Ozow + PayFast orchestration readiness</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[28px] border border-white/10 bg-[#08152f]/55 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="text-sm font-semibold text-white">Quick Actions</div>
              <div className="mt-5 grid gap-3">
                <Link
                  href="/dashboard/api-keys"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-xl transition hover:bg-white/10"
                >
                  Open Developer Keys
                </Link>
                <Link
                  href="/signup"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-xl transition hover:bg-white/10"
                >
                  View signup flow
                </Link>
                <Link
                  href="/login"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-xl transition hover:bg-white/10"
                >
                  View login flow
                </Link>
                <Link
                  href="/"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-xl transition hover:bg-white/10"
                >
                  Open public website
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#08152f]/55 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="text-sm font-semibold text-white">Next build targets</div>
              <div className="mt-4 grid gap-3 text-sm text-zinc-300">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                  Payment links inside dashboard
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                  Live gateway connection UX for Ozow + PayFast
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
                  Merchant-facing payments, subscriptions, and ledger views
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
