import Link from "next/link";
import {
  PublicPageShell,
  cn,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
  publicSectionLabelClass,
  publicSubtleSurfaceClass,
  publicSurfaceClass,
} from "../components/stackaura-ui";

const paymentProviderIntegrations = [
  {
    name: "Paystack",
    status: "Current rail",
    description:
      "A live rail in the current Stackaura orchestration layer for unified checkout, routing, and payment recovery.",
  },
  {
    name: "Yoco",
    status: "Current rail",
    description:
      "A live rail in the same merchant infrastructure layer for hosted checkout, routing, and operational visibility.",
  },
  {
    name: "Ozow",
    status: "Current rail",
    description:
      "A live bank-payment rail connected through the same orchestration path for recovery-aware payment flows.",
  },
  {
    name: "Additional rails",
    status: "Roadmap",
    description:
      "Additional provider coverage, including PayFast and Stripe, is introduced carefully as Stackaura expands its multi-rail orchestration layer.",
  },
] as const;

const commerceIntegrations = [
  {
    name: "Shopify",
    status: "Planned connector",
    description:
      "A planned storefront connector for merchants that want Stackaura routing and fallback behind commerce workflows.",
  },
  {
    name: "WooCommerce",
    status: "Planned connector",
    description:
      "A planned plugin path for WooCommerce merchants that want one orchestration layer across multiple gateways.",
  },
  {
    name: "Custom API",
    status: "Current model",
    description:
      "Merchant and platform backends can integrate directly with Stackaura today for checkout, routing, and payment recovery flows.",
  },
  {
    name: "SaaS platforms",
    status: "Current model",
    description:
      "Built to sit behind SaaS products and internal merchant platforms that need one payment orchestration layer.",
  },
] as const;

function statusClass(status: string) {
  if (status.includes("Current")) {
    return "border-emerald-300/70 bg-emerald-50/82 text-emerald-700";
  }

  if (status.includes("Planned") || status.includes("Roadmap")) {
    return "border-[#b8b2ff]/70 bg-[#eeedff]/82 text-[#5146df]";
  }

  return "border-white/45 bg-white/22 text-[#425466]";
}

export default function IntegrationsPage() {
  return (
    <PublicPageShell
      eyebrow="Integrations and orchestration"
      title="One integration for routing, fallback, and payment infrastructure across multiple gateways."
      description="Stackaura Payments (Pty) Ltd is a payment orchestration and infrastructure layer for merchants, platforms, and developers. Stackaura sits between merchant systems and licensed payment providers so teams can route, optimize, and recover payments across multiple rails through one integration."
      actions={
        <>
          <Link href="/docs" className={publicPrimaryButtonClass}>
            View docs
          </Link>
          <Link href="/contact" className={publicSecondaryButtonClass}>
            Contact sales
          </Link>
          <Link href="/signup" className={publicSecondaryButtonClass}>
            Start building
          </Link>
        </>
      }
      aside={
        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Role in the stack</div>
          <div className="mt-4 text-3xl font-semibold tracking-tight text-[#0a2540]">
            Stackaura Payments (Pty) Ltd
          </div>
          <p className="mt-4 text-sm leading-7 text-[#425466]">
            Stackaura is a software infrastructure and orchestration layer. Stackaura does not
            directly process, hold, or settle customer funds; licensed payment providers process
            and settle payments.
          </p>
        </div>
      }
    >
      <section className={cn(publicSurfaceClass, "overflow-hidden p-8 lg:p-10")}>
        <div className={publicSectionLabelClass}>How Stackaura works</div>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium text-[#425466]">
          {["Merchant / Platform", "Stackaura", "Licensed Payment Providers"].map((item, index) => (
            <div key={item} className="flex items-center gap-3">
              <span className="rounded-full border border-white/42 bg-white/22 px-4 py-2 shadow-[0_8px_22px_rgba(122,146,168,0.08)] backdrop-blur-2xl">
                {item}
              </span>
              {index < 2 ? <span className="text-[#635bff]">→</span> : null}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "1. Connect once",
              body: "Merchant systems, commerce platforms, and product teams integrate with Stackaura once instead of rebuilding gateway logic provider by provider.",
            },
            {
              title: "2. Route, optimize, and recover",
              body: "Stackaura handles checkout orchestration, routing logic, fallback, payment recovery, and the operational visibility around those flows.",
            },
            {
              title: "3. Providers process and settle",
              body: "Licensed payment providers remain responsible for payment execution, regulated processing, and settlement within their own environments.",
            },
          ].map((item) => (
            <div key={item.title} className={cn(publicSubtleSurfaceClass, "p-6")}>
              <div className="text-lg font-semibold tracking-tight text-[#0a2540]">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-[#425466]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={cn(publicSurfaceClass, "p-8 lg:p-10")}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className={publicSectionLabelClass}>Payment provider integrations</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a2540] sm:text-4xl">
              Current rails and expansion path.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[#425466]">
            These listings describe Stackaura product coverage and roadmap direction. They do not
            imply endorsement, exclusivity, or a formal commercial partnership unless explicitly
            stated separately.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {paymentProviderIntegrations.map((item) => (
            <div key={item.name} className={cn(publicSubtleSurfaceClass, "p-6")}>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]",
                  statusClass(item.status)
                )}
              >
                {item.status}
              </span>
              <div className="mt-4 text-2xl font-semibold tracking-tight text-[#0a2540]">
                {item.name}
              </div>
              <p className="mt-3 text-sm leading-7 text-[#425466]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={cn(publicSurfaceClass, "p-8 lg:p-10")}>
        <div className={publicSectionLabelClass}>Commerce and platform integrations</div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a2540] sm:text-4xl">
          Integrations for merchant systems and product teams.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {commerceIntegrations.map((item) => (
            <div key={item.name} className={cn(publicSubtleSurfaceClass, "p-6")}>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]",
                  statusClass(item.status)
                )}
              >
                {item.status}
              </span>
              <div className="mt-4 text-2xl font-semibold tracking-tight text-[#0a2540]">
                {item.name}
              </div>
              <p className="mt-3 text-sm leading-7 text-[#425466]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={cn(publicSurfaceClass, "p-8 lg:p-10")}>
        <div className={publicSectionLabelClass}>Trust and compliance clarification</div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={cn(publicSubtleSurfaceClass, "p-6")}>
            <div className="text-2xl font-semibold tracking-tight text-[#0a2540]">
              Stackaura is the orchestration and infrastructure layer.
            </div>
            <p className="mt-4 text-base leading-8 text-[#425466]">
              Stackaura is a software infrastructure and orchestration layer. Stackaura does not
              directly process, hold, or settle customer funds; licensed payment providers process
              and settle payments.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              "Stackaura coordinates merchant onboarding, checkout tooling, routing logic, fallback, and operational visibility.",
              "Licensed payment providers remain responsible for payment execution, regulated processing, and settlement.",
              "This separation gives merchants and platforms one infrastructure layer without implying that Stackaura is the regulated payment processor.",
            ].map((item) => (
              <div key={item} className={cn(publicSubtleSurfaceClass, "p-5 text-sm leading-7 text-[#425466]")}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.38)_0%,rgba(240,247,250,0.24)_42%,rgba(232,238,255,0.24)_100%)] p-8 shadow-[0_16px_36px_rgba(122,146,168,0.10)] backdrop-blur-2xl lg:p-10">
        <div className={publicSectionLabelClass}>Next step</div>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
          Explore the integration model, review the API surface, and plan the right rollout path.
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#425466]">
          Stackaura is built for merchants and platforms that want one operational layer across
          checkout, routing, fallback, and provider integrations.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/docs" className={publicPrimaryButtonClass}>
            View docs
          </Link>
          <Link href="/contact" className={publicSecondaryButtonClass}>
            Contact sales
          </Link>
          <Link href="/signup" className={publicSecondaryButtonClass}>
            Start building
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
