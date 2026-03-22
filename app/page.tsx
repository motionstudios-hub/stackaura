import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import {
  cn,
  lightProductHeroClass,
  lightProductInsetPanelClass,
  lightProductPanelClass,
  PublicBackground,
  PublicFooter,
  PublicHeader,
  publicCodePanelClass,
  publicPillClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
  publicSectionLabelClass,
  publicSubtleSurfaceClass,
} from "./components/stackaura-ui";
import PricingSection from "./components/pricing-section";

const valueProps = [
  {
    title: "Smart routing",
    description:
      "Automatically send each payment to the best-performing gateway.",
    accent:
      "bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.26),transparent_68%)]",
  },
  {
    title: "Built-in fallback",
    description:
      "If one provider fails, Stackaura retries with another.",
    accent:
      "bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.24),transparent_68%)]",
  },
  {
    title: "Unified API",
    description: "One integration for checkout, routing, and multiple gateways.",
    accent:
      "bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_70%)]",
  },
] as const;

const gatewayRails = [
  {
    name: "Paystack",
    mark: "paystack",
    status: "Current rail",
    description:
      "A live rail in the Stackaura orchestration layer for unified checkout and payment recovery.",
  },
  {
    name: "Yoco",
    mark: "YOCO",
    status: "Current rail",
    description:
      "A live rail in the same unified infrastructure layer for merchant checkout and routing control.",
  },
  {
    name: "Ozow",
    mark: "OZOW",
    status: "Current rail",
    description:
      "A live bank-payment rail connected through the same orchestration and recovery path.",
  },
] as const;

const howItWorks = [
  {
    step: "01",
    title: "Integrate once",
    description:
      "Connect your product to Stackaura through one API or hosted checkout layer.",
  },
  {
    step: "02",
    title: "Route intelligently",
    description:
      "Stackaura selects the right gateway path for the transaction and merchant context.",
  },
  {
    step: "03",
    title: "Recover failed payments",
    description:
      "Fallback logic helps recover checkout attempts before they become lost revenue.",
  },
] as const;

const infrastructureFeatures = [
  "Hosted checkout",
  "Webhooks",
  "Unified API",
  "Reconciliation",
] as const;

const merchantBenefits = [
  {
    title: "Higher success rates",
    description:
      "Route around provider interruptions before they turn into lost orders.",
  },
  {
    title: "Fewer failed checkouts",
    description:
      "Keep customers moving even when a payment rail slows down or times out.",
  },
  {
    title: "Simpler operations",
    description:
      "Manage routing, gateway visibility, and finance workflows through one control layer.",
  },
] as const;

const pricingTiers = [
  {
    name: "Starter",
    audience: "For merchants launching with unified checkout and auto routing.",
    price: "1.5%",
    priceSuffix: "per transaction",
    bullets: ["Auto routing", "Hosted checkout", "Unified API access"],
    featured: false,
    badge: null,
    ctaHref: "/signup",
    ctaLabel: "Start accepting payments",
  },
  {
    name: "Growth",
    audience: "For growing teams that need fallback and manual gateway control.",
    price: "2.5% + R1",
    priceSuffix: "per transaction",
    bullets: ["Manual gateway selection", "Fallback routing", "Multi-gateway orchestration"],
    featured: true,
    badge: "Most popular",
    ctaHref: "/signup",
    ctaLabel: "Choose Growth",
  },
  {
    name: "Scale",
    audience: "For larger merchants that need custom routing and optimization support.",
    price: "Custom",
    priceSuffix: "pricing",
    bullets: ["Custom routing support", "Custom optimization", "Priority support"],
    featured: false,
    badge: "Enterprise",
    ctaHref: "/contact",
    ctaLabel: "Talk to sales",
  },
] as const;

function GatewayMark({ name, mark }: { name: string; mark: string }) {
  return (
    <span
      className={cn(
        "text-center font-semibold tracking-[-0.04em] text-[#0a2540]",
        name === "Paystack" && "text-[22px] lowercase",
        name === "Yoco" && "text-[24px] tracking-[0.18em]",
        name === "Ozow" && "text-[22px] tracking-[0.22em]"
      )}
    >
      {mark}
    </span>
  );
}

export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Stackaura Payments (Pty) Ltd",
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

  const sectionClass = "mx-auto max-w-[1440px] px-5 sm:px-6 lg:px-10";

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

      <PublicBackground>
        <PublicHeader />

        <div className="relative pb-20">
          <section className={cn(sectionClass, "pt-6 sm:pt-8 lg:pt-10")}>
            <div
              className={cn(
                "relative isolate overflow-hidden px-5 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 lg:px-10 lg:py-10",
                lightProductHeroClass
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.52),transparent_26%),radial-gradient(circle_at_74%_18%,rgba(125,211,252,0.28),transparent_24%),radial-gradient(circle_at_84%_70%,rgba(168,85,247,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(219,232,238,0.02))]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px] bg-[radial-gradient(circle_at_84%_18%,rgba(125,211,252,0.20),transparent_26%),radial-gradient(circle_at_72%_14%,rgba(122,115,255,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))] lg:hidden" />
              <AuroraBackground
                showRadialGradient={false}
                className="pointer-events-none absolute inset-0 h-auto min-h-0 justify-start bg-transparent text-inherit [--transparent:transparent] [&>div]:bg-transparent [&>div]:text-inherit"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(255,255,255,0.42),transparent_30%),radial-gradient(circle_at_78%_14%,rgba(125,211,252,0.24),transparent_28%),radial-gradient(circle_at_58%_72%,rgba(122,115,255,0.14),transparent_38%)] opacity-100 sm:opacity-84 lg:opacity-62" />
              </AuroraBackground>

              <div className="relative grid gap-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-center">
                <div className="relative z-10 max-w-3xl pr-0">
                  <div className={cn(publicPillClass, "max-w-max px-3 py-1.5 text-xs sm:text-sm")}>
                    Payment orchestration and infrastructure for African commerce
                  </div>

                  <h1 className="mt-5 max-w-4xl text-[42px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#0a2540] sm:text-6xl lg:text-[78px]">
                    Payments that never fail.
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-[#425466] sm:text-[21px] sm:leading-8">
                    Route every transaction across multiple gateways
                    automatically. Increase success rates, reduce downtime, and
                    scale faster with Stackaura.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link href="/signup" className={publicPrimaryButtonClass}>
                      Start accepting payments
                    </Link>
                    <Link href="/docs" className={publicSecondaryButtonClass}>
                      View docs
                    </Link>
                  </div>

                  <div className="mt-6 inline-flex max-w-full rounded-full border border-white/48 bg-white/32 px-4 py-2 text-sm font-medium text-[#425466] shadow-[0_10px_24px_rgba(133,156,180,0.10)] backdrop-blur-2xl">
                    One integration. Multiple gateways. Smart routing and fallback.
                  </div>

                  <div className="mt-8 grid gap-3 sm:mt-8 sm:grid-cols-3">
                    <div className={cn("p-4", publicSubtleSurfaceClass)}>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">
                        Routing layer
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#425466]">
                        A single infrastructure layer for intelligent gateway
                        selection.
                      </p>
                    </div>
                    <div className={cn("p-4", publicSubtleSurfaceClass)}>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">
                        Fallback ready
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#425466]">
                        Recovery flows designed to rescue payments before
                        checkout fails.
                      </p>
                    </div>
                    <div className={cn("p-4", publicSubtleSurfaceClass)}>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">
                        Unified ops
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#425466]">
                        One API for checkout, routing, events, and gateway
                        visibility.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden pointer-events-none absolute inset-x-0 top-0 z-0 h-[540px] overflow-hidden lg:pointer-events-auto lg:relative lg:block lg:min-h-[560px] lg:h-auto lg:overflow-visible">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(204,227,242,0.34),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0))]" />

                  <div className="absolute right-[-54px] top-[34px] h-[360px] w-[360px] scale-[0.74] opacity-95 sm:right-[-18px] sm:top-[54px] sm:scale-[0.84] lg:right-[-10px] lg:top-[-12px] lg:h-[620px] lg:w-[620px] lg:scale-100 lg:opacity-100">
                    <div className="absolute left-[128px] top-[98px] h-[338px] w-[352px] rotate-[-10deg] rounded-[34px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.46)_0%,rgba(234,244,248,0.30)_100%)] p-5 shadow-[0_28px_80px_rgba(122,146,168,0.18)] backdrop-blur-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93]">
                            Routing engine
                          </div>
                          <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#0a2540]">
                            Intelligent path selection
                          </div>
                        </div>
                        <div className="rounded-full border border-emerald-300/70 bg-emerald-50/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                          Live routing
                        </div>
                      </div>

                      <div className="mt-5 rounded-[26px] border border-white/65 bg-white/46 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">
                              Transaction
                            </div>
                            <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#0a2540]">
                              INV-2048
                            </div>
                            <p className="mt-1 text-sm text-[#425466]">
                              Checkout request received and evaluated in real
                              time.
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/60 bg-white/54 px-3 py-2 text-right shadow-[0_12px_24px_rgba(133,156,180,0.10)]">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">
                              Amount
                            </div>
                            <div className="mt-1 text-lg font-semibold text-[#0a2540]">
                              R1 250.00
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div className="flex items-center justify-between rounded-[22px] border border-white/55 bg-[linear-gradient(180deg,rgba(122,115,255,0.16),rgba(160,233,255,0.14))] px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-[#0a2540]">
                              Paystack
                            </div>
                            <div className="text-xs text-[#425466]">
                              Primary route selected
                            </div>
                          </div>
                          <div className="rounded-full border border-emerald-300/70 bg-emerald-50/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                            Healthy
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-[22px] border border-white/55 bg-white/38 px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-[#0a2540]">
                              Yoco
                            </div>
                            <div className="text-xs text-[#425466]">
                              Ready as fallback
                            </div>
                          </div>
                          <div className="rounded-full border border-white/55 bg-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#425466]">
                            Standby
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-[22px] border border-white/55 bg-white/38 px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-[#0a2540]">
                              Ozow
                            </div>
                            <div className="text-xs text-[#425466]">
                              Available for bank-driven flows
                            </div>
                          </div>
                          <div className="rounded-full border border-sky-300/70 bg-sky-50/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                            Ready
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute left-[24px] top-[212px] w-[228px] rotate-[-7deg] rounded-[26px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(235,244,248,0.28))] p-4 shadow-[0_20px_48px_rgba(122,146,168,0.14)] backdrop-blur-2xl">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93]">
                        Fallback logic
                      </div>
                      <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#0a2540]">
                        Recover failed attempts
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#425466]">
                        If the primary provider times out, Stackaura shifts the
                        payment to the next eligible rail.
                      </p>
                    </div>

                    <div className="absolute left-[336px] top-[24px] w-[232px] rotate-[8deg] rounded-[26px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.54),rgba(238,246,250,0.30))] p-4 shadow-[0_20px_48px_rgba(122,146,168,0.14)] backdrop-blur-2xl">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93]">
                        Gateway health
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm text-[#425466]">
                          <span>Paystack</span>
                          <span className="font-semibold text-emerald-700">
                            Stable
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-[#425466]">
                          <span>Yoco</span>
                          <span className="font-semibold text-[#0a2540]">
                            Warm standby
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-[#425466]">
                          <span>Ozow</span>
                          <span className="font-semibold text-sky-700">
                            Bank rail ready
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute left-[286px] top-[454px] w-[248px] rotate-[6deg] rounded-[24px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(238,246,250,0.30))] p-4 shadow-[0_18px_44px_rgba(122,146,168,0.13)] backdrop-blur-2xl">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">
                        Trust layer
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#425466]">
                        Licensed payment providers handle processing and
                        settlement while Stackaura handles orchestration.
                      </p>
                    </div>

                    <div className="absolute left-[214px] top-[180px] h-[2px] w-[172px] rotate-[6deg] bg-[linear-gradient(90deg,rgba(122,115,255,0.16),rgba(125,211,252,0.70),rgba(255,255,255,0))]" />
                    <div className="absolute left-[162px] top-[420px] h-[2px] w-[182px] rotate-[-8deg] bg-[linear-gradient(90deg,rgba(122,115,255,0.10),rgba(168,85,247,0.58),rgba(255,255,255,0))]" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={cn(sectionClass, "py-6 sm:py-8 lg:py-10")}>
            <div className="max-w-3xl">
              <div className={publicSectionLabelClass}>Value proposition</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                Orchestration that protects every checkout.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {valueProps.map((item) => (
                <div
                  key={item.title}
                  className={cn(
                    "relative overflow-hidden p-6 sm:p-7",
                    lightProductPanelClass
                  )}
                >
                  <div className={cn("absolute inset-x-0 top-0 h-28", item.accent)} />
                  <div className="relative">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/55 bg-white/50 text-sm font-semibold text-[#635bff] shadow-[0_12px_24px_rgba(133,156,180,0.12)]">
                      {item.title.split(" ")[0]}
                    </div>
                    <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#0a2540]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[#425466]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={cn(sectionClass, "py-6 sm:py-8 lg:py-10")}>
            <div className={cn("overflow-hidden p-6 sm:p-8 lg:p-10", lightProductPanelClass)}>
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <div className="max-w-xl">
                  <div className={publicSectionLabelClass}>
                    Gateway infrastructure
                  </div>
                  <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                    Connect Africa&apos;s leading payment rails
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-[#425466]">
                    Stackaura sits above licensed payment providers, routing,
                    optimizing, and recovering payments through one integration.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {gatewayRails.map((gateway) => (
                    <div key={gateway.name} className={cn("p-5", lightProductInsetPanelClass)}>
                      <div className="flex items-center justify-between gap-3">
                        <GatewayMark name={gateway.name} mark={gateway.mark} />
                        <span className="rounded-full border border-white/52 bg-white/54 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#425466]">
                          {gateway.status}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-[#425466]">
                        {gateway.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className={cn("p-5 sm:p-6", lightProductInsetPanelClass)}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93]">
                    How Stackaura fits
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
                    <div className="rounded-2xl border border-white/52 bg-white/54 px-4 py-4 text-center text-sm font-semibold text-[#0a2540] shadow-[0_12px_24px_rgba(133,156,180,0.10)]">
                      Merchant / Platform
                    </div>
                    <div className="hidden text-center text-xl text-[#635bff] sm:block">
                      →
                    </div>
                    <div className="rounded-2xl border border-white/52 bg-[linear-gradient(180deg,rgba(122,115,255,0.18),rgba(160,233,255,0.14))] px-4 py-4 text-center text-sm font-semibold text-[#0a2540] shadow-[0_12px_24px_rgba(133,156,180,0.10)]">
                      Stackaura
                    </div>
                    <div className="hidden text-center text-xl text-[#635bff] sm:block">
                      →
                    </div>
                    <div className="rounded-2xl border border-white/52 bg-white/54 px-4 py-4 text-center text-sm font-semibold text-[#0a2540] shadow-[0_12px_24px_rgba(133,156,180,0.10)]">
                      Licensed Payment Providers
                    </div>
                  </div>
                </div>

                <div className={cn("p-5 sm:p-6", publicSubtleSurfaceClass)}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93]">
                    Trust clarification
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#425466]">
                    Stackaura is a software infrastructure and orchestration
                    layer. Stackaura does not directly process, hold, or settle
                    customer funds; licensed payment providers process and
                    settle payments.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className={cn(sectionClass, "py-6 sm:py-8 lg:py-10")}>
            <div className="max-w-3xl">
              <div className={publicSectionLabelClass}>How it works</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                Built for reliable checkout flows
              </h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {howItWorks.map((item) => (
                <div key={item.step} className={cn("p-6 sm:p-7", lightProductPanelClass)}>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/55 bg-white/52 text-sm font-semibold text-[#635bff] shadow-[0_10px_24px_rgba(133,156,180,0.10)]">
                      {item.step}
                    </div>
                    <div className="text-lg font-semibold tracking-[-0.02em] text-[#0a2540]">
                      {item.title}
                    </div>
                  </div>
                  <p className="mt-4 text-base leading-7 text-[#425466]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={cn(sectionClass, "py-6 sm:py-8 lg:py-10")}>
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
              <div className={cn("p-6 sm:p-8", lightProductPanelClass)}>
                <div className={publicSectionLabelClass}>
                  Developer infrastructure
                </div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                  API-first payments infrastructure for shipping teams
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#425466]">
                  Build on hosted checkout or your own flows while keeping
                  routing, event delivery, and payment operations aligned in one
                  layer.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {infrastructureFeatures.map((item) => (
                    <div key={item} className={cn("px-4 py-4", lightProductInsetPanelClass)}>
                      <div className="text-sm font-semibold text-[#0a2540]">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <Link href="/docs" className={publicSecondaryButtonClass}>
                    Explore developer docs
                  </Link>
                </div>
              </div>

              <div className={cn("p-6 sm:p-8", publicCodePanelClass)}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8dd8ff]">
                      Unified API
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                      One payment request. Smarter routing underneath.
                    </h3>
                  </div>
                  <div className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d7dcff]">
                    API-first
                  </div>
                </div>

                <pre className="mt-6 overflow-x-auto rounded-[24px] border border-white/10 bg-[#06152f]/72 p-5 text-sm leading-7 text-[#d7dcff] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <code>{`const payment = await stackaura.payments.create({
  amountCents: 125000,
  currency: "ZAR",
  reference: "INV-2048",
  routing: {
    mode: "smart",
    fallback: true,
  },
});`}</code>
                </pre>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8dd8ff]">
                      Events
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      Webhooks keep checkout, payment, and merchant state in
                      sync.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8dd8ff]">
                      Finance ops
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      Reconciliation-ready records make downstream operations
                      cleaner.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={cn(sectionClass, "py-6 sm:py-8 lg:py-10")}>
            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className={cn("p-6 sm:p-8", lightProductPanelClass)}>
                <div className={publicSectionLabelClass}>Merchant outcomes</div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                  Better payment performance without operational sprawl
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#425466]">
                  Stackaura is designed for merchants, platforms, and SaaS teams
                  that want stronger conversion without managing every payment
                  edge case gateway by gateway.
                </p>
                <div className="mt-6 rounded-[26px] border border-white/52 bg-[linear-gradient(180deg,rgba(122,115,255,0.14),rgba(255,255,255,0.28))] p-5 shadow-[0_16px_30px_rgba(133,156,180,0.10)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93]">
                    Business impact
                  </div>
                  <p className="mt-3 text-base leading-7 text-[#425466]">
                    Higher payment success, fewer failed checkouts, and a much
                    simpler operating model for growth teams.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {merchantBenefits.map((item) => (
                  <div key={item.title} className={cn("p-5 sm:p-6", lightProductInsetPanelClass)}>
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#0a2540]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[#425466]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <PricingSection tiers={pricingTiers} className={cn(sectionClass, "py-6 sm:py-8 lg:py-10")} />

          <section className={cn(sectionClass, "pt-6 sm:pt-8 lg:pt-10")}>
            <div
              className={cn(
                "relative overflow-hidden p-6 sm:p-8 lg:p-10",
                lightProductPanelClass
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.32),transparent_24%),radial-gradient(circle_at_80%_24%,rgba(125,211,252,0.24),transparent_24%),linear-gradient(180deg,rgba(122,115,255,0.06),rgba(255,255,255,0.02))]" />
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <div className={publicSectionLabelClass}>Start building</div>
                  <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                    Ready to route payments intelligently?
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-[#425466]">
                    Launch with one integration, add multiple gateways, and
                    build a more resilient payment stack with Stackaura.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/signup" className={publicPrimaryButtonClass}>
                    Start accepting payments
                  </Link>
                  <Link href="/contact" className={publicSecondaryButtonClass}>
                    Contact sales
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <PublicFooter />
      </PublicBackground>
    </>
  );
}
