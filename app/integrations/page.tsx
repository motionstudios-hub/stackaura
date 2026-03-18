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
    name: "Ozow",
    status: "Current support",
    description:
      "Available in the current Stackaura gateway configuration and orchestration path for merchant payment flows.",
  },
  {
    name: "PayFast",
    status: "Current support",
    description:
      "Part of the current Stackaura gateway stack for merchant payment operations and hosted checkout coverage.",
  },
  {
    name: "Paystack",
    status: "Roadmap",
    description:
      "Planned for broader regional payment coverage as Stackaura expands orchestration options for merchants and platforms.",
  },
  {
    name: "Stripe",
    status: "Roadmap",
    description:
      "Planned as part of the longer-term cross-border and platform expansion roadmap where merchants need additional payment rails.",
  },
];

const commerceIntegrations = [
  {
    name: "Shopify",
    status: "Planned connector",
    description:
      "A planned commerce integration path for merchants that need orchestration between storefront workflows and licensed payment providers.",
  },
  {
    name: "WooCommerce",
    status: "Planned connector",
    description:
      "A planned plugin and integration path for WooCommerce merchants that want Stackaura as an orchestration layer.",
  },
  {
    name: "Custom API",
    status: "Current model",
    description:
      "Custom merchant and platform APIs can integrate directly with Stackaura today for checkout, onboarding, and orchestration flows.",
  },
  {
    name: "SaaS platforms",
    status: "Current model",
    description:
      "Stackaura is designed to sit behind SaaS products and internal merchant platforms that need one payments infrastructure layer.",
  },
];

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
      title="How Stackaura fits between merchant systems and licensed payment providers."
      description="Stackaura Payments (Pty) Ltd provides payment infrastructure and orchestration software for merchants, platforms, and developers. Stackaura sits in the operational layer between merchant systems and licensed payment providers so teams can manage routing, onboarding, checkout tooling, and integrations through one environment."
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
            Stackaura provides software infrastructure and orchestration tools. Stackaura does not
            directly process, hold, or settle customer funds; payments are handled by licensed
            payment providers.
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
              title: "1. Merchant or platform connects",
              body: "Merchant systems, commerce platforms, and product workflows connect to Stackaura once instead of rebuilding the same gateway logic repeatedly.",
            },
            {
              title: "2. Stackaura orchestrates",
              body: "Stackaura handles infrastructure concerns such as checkout orchestration, merchant onboarding, routing logic, operational tooling, and integration workflows.",
            },
            {
              title: "3. Licensed providers process",
              body: "Licensed payment providers handle payment processing, fund flows, and settlement within their own regulated and contractual environments.",
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
              Current rails and roadmap direction.
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
              Stackaura is an orchestration and infrastructure layer.
            </div>
            <p className="mt-4 text-base leading-8 text-[#425466]">
              Stackaura provides software infrastructure and orchestration tools. Stackaura does
              not directly process, hold, or settle customer funds; payments are handled by
              licensed payment providers.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              "Stackaura coordinates merchant onboarding, checkout tooling, routing logic, and operational visibility.",
              "Licensed payment providers remain responsible for payment execution, regulated processing, and settlement.",
              "This separation helps merchants and platforms keep infrastructure control without confusing Stackaura’s role with that of a regulated payment processor.",
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
          Stackaura is built for merchants and platforms that want a clearer operational layer
          across checkout, onboarding, routing, and provider integrations.
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
