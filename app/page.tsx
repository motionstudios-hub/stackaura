import Image from "next/image";
import Link from "next/link";
import {
  cn,
  PublicBackground,
  publicBadgeClass,
  publicBorderSubtleClass,
  PublicFooter,
  PublicHeader,
  publicCodePanelClass,
  publicInsetSurfaceClass,
  publicMinimalSecondaryButtonClass,
  publicPrimaryButtonClass,
  publicSectionLabelClass,
  publicSecondaryButtonClass,
  publicSubtleSurfaceClass,
  publicSurfaceClass,
  publicTextMutedClass,
  publicTextPrimaryClass,
  publicTextSecondaryClass,
} from "./components/stackaura-ui";
import PricingSection from "./components/pricing-section";
import { buildHomepagePricingTiers, getServerPricing } from "./lib/pricing";

const valueProps = [
  {
    title: "Smart routing",
    description:
      "Automatically send each payment to the best-performing gateway.",
  },
  {
    title: "Built-in fallback",
    description:
      "If one provider fails, Stackaura retries with another.",
  },
  {
    title: "Unified API",
    description: "One integration for checkout, routing, and multiple gateways.",
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

const heroRails = [
  {
    name: "Paystack",
    lightSrc: "/providers/paystack-wordmark-light.svg",
    darkSrc: "/providers/paystack-wordmark-dark.svg",
    width: 156,
    height: 32,
    className: "h-[18px] w-auto sm:h-[20px]",
    itemClassName: "min-w-[142px] sm:min-w-[156px]",
  },
  {
    name: "Ozow",
    lightSrc: "/providers/ozow.png",
    darkSrc: "/providers/ozow-wordmark-dark.svg",
    width: 150,
    height: 49,
    className: "h-[17px] w-auto sm:h-[19px]",
    itemClassName: "min-w-[126px] sm:min-w-[142px]",
  },
  {
    name: "Yoco",
    lightSrc: "/providers/yoco.svg",
    darkSrc: "/providers/yoco-wordmark-dark.svg",
    width: 110,
    height: 42,
    className: "h-[15px] w-auto sm:h-[17px]",
    itemClassName: "min-w-[118px] sm:min-w-[132px]",
  },
] as const;

function HomepageProductPreview() {
  return (
    <div
      className="relative mx-auto w-full max-w-[620px] overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_18px_40px_rgba(148,163,184,0.14)] sm:p-4"
    >
      <div className="rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(148,163,184,0.10)]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Live orchestration
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-5">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93]">
                  Unified API
                </div>
                <div className="mt-2 text-base font-semibold text-[#0a2540]">
                  POST /v1/payments
                </div>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                One request
              </div>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-[18px] bg-[#eef4f7] px-4 py-3 text-[12px] leading-6 text-[#425466]">
              <code>{`{
  "amountCents": 550,
  "currency": "ZAR",
  "gateway": "AUTO",
  "reference": "INV-08c39cca4e22"
}`}</code>
            </pre>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93]">
                    Routing decision
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[#0a2540]">
                    Paystack selected
                  </div>
                </div>
                <div className="rounded-full border border-[#d9d5ff] bg-[#f4f2ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5146df]">
                  Auto
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image src="/providers/paystack.svg" alt="Paystack" width={20} height={20} className="h-5 w-auto" />
                    <span className="text-sm font-semibold text-[#0a2540]">Paystack</span>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/76 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image src="/providers/ozow.png" alt="Ozow" width={58} height={20} className="h-5 w-auto object-contain" />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Fallback ready
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/76 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image src="/providers/yoco.svg" alt="Yoco" width={52} height={18} className="h-4.5 w-auto" />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Available
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93]">
                  Merchant view
                </div>
                <div className="mt-3 text-lg font-semibold text-[#0a2540]">
                  Stackaura Payments
                </div>
                <div className="mt-4 space-y-3 text-sm text-[#425466]">
                  <div className="flex items-center justify-between">
                    <span>Current rail</span>
                    <span className="font-semibold text-[#0a2540]">Paystack</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className="font-semibold text-[#0a2540]">PAID</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Webhooks</span>
                    <span className="font-semibold text-[#0a2540]">Healthy</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-[#0f2745] px-5 py-4 text-white shadow-[0_16px_34px_rgba(15,39,69,0.14)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b9cdf5]">
                  Infrastructure result
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  One integration. Multiple payment rails.
                </div>
                <div className="mt-2 text-sm leading-6 text-[#d5e2f0]">
                  Route, recover, and reconcile payments through a single Stackaura layer.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const pricing = await getServerPricing();
  const pricingTiers = buildHomepagePricingTiers(pricing);
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
  const heroPrimaryButtonClass =
    "inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-[#4f46e5] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#4338ca] dark:bg-[#4f46e5] dark:text-white dark:hover:bg-[#5b54ee]";

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
          <section className={cn(sectionClass, "pt-16 sm:pt-20")}>
            <div className="mx-auto max-w-4xl text-center">
              <div className={publicBadgeClass}>
                Stackaura payments infrastructure
              </div>

              <h1 className={cn("mx-auto mt-8 max-w-4xl text-[40px] font-semibold leading-[0.96] tracking-[-0.065em] sm:text-6xl lg:text-[78px]", publicTextPrimaryClass)}>
                One integration. Multiple payment rails.
              </h1>

              <p className={cn("mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-[21px] sm:leading-8", publicTextSecondaryClass)}>
                Orchestrate payments across Paystack, Ozow, and Yoco through a single unified API.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup" className={heroPrimaryButtonClass}>
                  Start integrating
                </Link>
                <Link href="/docs" className={publicMinimalSecondaryButtonClass}>
                  View documentation
                </Link>
              </div>

              <div className={cn("mt-10 text-sm font-medium sm:text-[15px]", publicTextMutedClass)}>
                Built for modern African payment infrastructure
              </div>

              <div className="mt-8 flex justify-center">
                <div className="flex flex-wrap items-center justify-center gap-y-4 border-y border-slate-200/80 py-4 dark:border-white/12">
                  {heroRails.map((rail, index) => (
                    <div
                      key={rail.name}
                      className={cn(
                        "flex h-9 items-center justify-center px-5 opacity-85 transition duration-200 hover:opacity-100 sm:px-7",
                        rail.itemClassName,
                        index < heroRails.length - 1 && "md:border-r md:border-slate-200/80 md:dark:border-white/12",
                      )}
                    >
                      <Image
                        src={rail.lightSrc}
                        alt={rail.name}
                        width={rail.width}
                        height={rail.height}
                        className={cn("w-auto dark:hidden", rail.className)}
                      />
                      <Image
                        src={rail.darkSrc}
                        alt={rail.name}
                        width={rail.width}
                        height={rail.height}
                        className={cn("hidden w-auto dark:block", rail.className)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={cn(sectionClass, "py-16 sm:py-20")}>
            <div className={cn("mx-auto grid max-w-6xl gap-10 border-t pt-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-start lg:pt-12", publicBorderSubtleClass)}>
              <div className="max-w-xl">
                <div className={publicSectionLabelClass}>Product preview</div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                  One control layer for every transaction
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#425466]">
                  Stackaura gives teams one place to initialize payments, route across rails, and keep merchant operations aligned as volume grows.
                </p>

                <div className="mt-6 grid gap-3">
                  {valueProps.map((item) => (
                    <div key={item.title} className={cn("px-4 py-4", publicInsetSurfaceClass)}>
                      <div className="text-sm font-semibold text-[#0a2540]">{item.title}</div>
                      <p className="mt-1 text-sm leading-6 text-[#425466]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <HomepageProductPreview />
              </div>
            </div>
          </section>

          <section className={cn(sectionClass, "py-16 sm:py-20")}>
            <div className="max-w-3xl">
              <div className={publicSectionLabelClass}>How it works</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                Built for reliable checkout flows
              </h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {howItWorks.map((item) => (
                <div key={item.step} className={cn("p-6 sm:p-7", publicSubtleSurfaceClass)}>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-[#635bff] shadow-[0_10px_18px_rgba(148,163,184,0.08)] dark:border-white/10 dark:bg-[#101b2d] dark:shadow-none">
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

          <section className={cn(sectionClass, "py-16 sm:py-20")}>
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
              <div className={cn("p-6 sm:p-8", publicSurfaceClass)}>
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
                    <div key={item} className={cn("px-4 py-4", publicInsetSurfaceClass)}>
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

          <section className={cn(sectionClass, "py-16 sm:py-20")}>
            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className={cn("p-6 sm:p-8", publicSurfaceClass)}>
                <div className={publicSectionLabelClass}>Merchant outcomes</div>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                  Better payment performance without operational sprawl
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#425466]">
                  Stackaura is designed for merchants, platforms, and SaaS teams
                  that want stronger conversion without managing every payment
                  edge case gateway by gateway.
                </p>
                <div className={cn("mt-6 p-5", publicSubtleSurfaceClass)}>
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
                  <div key={item.title} className={cn("p-5 sm:p-6", publicSubtleSurfaceClass)}>
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

          <PricingSection tiers={pricingTiers} className={cn(sectionClass, "py-16 sm:py-20")} />

          <section className={cn(sectionClass, "pt-16 sm:pt-20")}>
            <div className={cn("p-6 sm:p-8 lg:p-10", publicSurfaceClass)}>
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
