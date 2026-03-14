import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Stackaura Technologies (Pty) Ltd",
    alternateName: "Stackaura",
    url: "https://stackaura.co.za",
    logo: "https://stackaura.co.za/stackaura-logo.png",
    email: "admin@stackaura.co.za",
    sameAs: ["https://www.linkedin.com/company/stackaura"],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Stackaura",
    url: "https://stackaura.co.za",
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Stackaura",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description:
      "Payment orchestration infrastructure for merchants and developers.",
    url: "https://stackaura.co.za",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />

      <main className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(32,188,237,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(17,106,248,0.24),transparent_30%),radial-gradient(circle_at_bottom_center,rgba(160,233,255,0.12),transparent_24%),linear-gradient(135deg,#061229_0%,#020817_48%,#04174a_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent_18%)]" />

        <header className="relative z-20 border-b border-white/10 bg-[#020D33]/45 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-transparent shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <Image
                  src="/stackaura-logo.png"
                  alt="Stackaura"
                  width={40}
                  height={40}
                  className="object-contain mix-blend-screen"
                  priority
                />
              </div>
              <div>
                <div className="text-xl font-semibold tracking-tight text-white">
                  Stackaura
                </div>
                <div className="text-sm text-zinc-300/80">
                  Payments Infrastructure
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-[#A0E9FF] px-4 py-2 text-sm font-medium text-[#02142b] transition hover:brightness-105"
              >
                Start accepting payments
              </Link>
            </div>
          </div>
        </header>

        <section className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#A0E9FF] backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-[#A0E9FF]" />
              Orchestration platform
            </div>

            <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              One API for checkout, routing, failover, and recurring payments.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
              Stackaura helps African merchants and developers accept payments through a
              unified orchestration layer with payment intents, subscriptions, webhook
              delivery, ledger-backed money tracking, and gateway failover built in.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-[#A0E9FF] px-6 py-3 text-sm font-medium text-[#02142b] transition hover:brightness-105"
              >
                Create merchant account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/10"
              >
                Sign in to dashboard
              </Link>
            </div>

            <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Rails</div>
                <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  PayFast + Ozow
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Connect real South African payment rails from one platform.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Reliability</div>
                <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  Failover ready
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Route payments across gateways with attempt tracking and safe retries.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Developer UX</div>
                <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
                  API first
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Payment intents, subscriptions, webhooks, and idempotent APIs included.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 -top-10 h-32 w-32 rounded-full bg-[#20BCED]/20 blur-3xl" />
            <div className="absolute -bottom-8 right-0 h-36 w-36 rounded-full bg-[#116AF8]/25 blur-3xl" />

            <div className="relative rounded-[32px] border border-white/10 bg-[#08152f]/60 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Merchant Console</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Self-serve onboarding and payments operations
                  </div>
                </div>
                <div className="rounded-full border border-emerald-900/40 bg-emerald-950/30 px-3 py-1 text-[11px] text-emerald-300">
                  Live rails enabled
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Payment intents</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-white">Enabled</div>
                  <div className="mt-2 text-xs text-zinc-400">
                    Logical payment objects with gateway attempt tracking
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Subscriptions</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-white">Recurring</div>
                  <div className="mt-2 text-xs text-zinc-400">
                    Scheduler-backed recurring billing flows
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Ledger</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-white">Double-entry</div>
                  <div className="mt-2 text-xs text-zinc-400">
                    Money truth layer for fees, balances, and events
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">API reliability</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-white">Protected</div>
                  <div className="mt-2 text-xs text-zinc-400">
                    Idempotency and safe retry protection active
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wide text-zinc-500">What merchants get instantly</div>
                <div className="mt-4 grid gap-3 text-sm text-zinc-300">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[#A0E9FF]">•</span>
                    <span>Dashboard access right after signup</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[#A0E9FF]">•</span>
                    <span>API keys ready for developer integration</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[#A0E9FF]">•</span>
                    <span>Payment links, checkout, and gateway configuration from one place</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Unified stack</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                One integration for many payment flows
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Use Stackaura for hosted checkout, payment links, subscriptions, webhooks,
                payment intents, and gateway orchestration without stitching separate systems together.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Built for Africa</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Local rails, modern platform design
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Start with South African rails like PayFast and Ozow, then expand into a broader multi-gateway infrastructure layer for merchants across the region.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <div className="text-xs uppercase tracking-wide text-zinc-500">Merchant product</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Self-serve from signup to live payments
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Businesses can create an account, enter the dashboard, connect gateways, generate payment links, and go live without waiting for manual provisioning.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
