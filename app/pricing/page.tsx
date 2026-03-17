import Link from "next/link";
import {
  PublicPageShell,
  cn,
  publicPrimaryButtonClass,
  publicSectionLabelClass,
  publicSecondaryButtonClass,
  publicSubtleSurfaceClass,
  publicSurfaceClass,
} from "../components/stackaura-ui";

export default function PricingPage() {
  return (
    <PublicPageShell
      eyebrow="Pricing"
      title="Infrastructure pricing shaped around merchant activation and payment scale."
      description="Stackaura pricing is designed for merchants, platforms, and infrastructure teams that need orchestration, checkout tooling, API access, and operational control without stitching together multiple products."
      actions={
        <>
          <Link href="/contact" className={publicPrimaryButtonClass}>
            Contact sales
          </Link>
          <Link href="/signup" className={publicSecondaryButtonClass}>
            Start building
          </Link>
        </>
      }
      aside={
        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Commercial model</div>
          <div className="mt-4 text-3xl font-semibold tracking-tight text-[#0a2540]">
            Tailored to volume
          </div>
          <p className="mt-4 text-sm leading-6 text-[#425466]">
            Pricing can reflect payment volumes, orchestration complexity, merchant onboarding
            requirements, and any developer or infrastructure support needs.
          </p>
        </div>
      }
    >
      <section className="grid gap-6 xl:grid-cols-3">
        {[
          {
            label: "Growth merchants",
            title: "Launch and activate faster",
            body: "For teams that need merchant onboarding, dashboard access, API keys, and payment links without a fragmented operational stack.",
          },
          {
            label: "Platforms",
            title: "Orchestrate across providers",
            body: "For products that need gateway routing, failover strategy, hosted checkout, and clean payment-state operations.",
          },
          {
            label: "Infrastructure partners",
            title: "Design for scale",
            body: "For teams that need deeper integration planning, rollout support, and merchant-level operational control across payment rails.",
          },
        ].map((item) => (
          <div key={item.title} className={cn(publicSurfaceClass, "p-7")}>
            <div className={publicSectionLabelClass}>{item.label}</div>
            <div className="mt-4 text-3xl font-semibold tracking-tight text-[#0a2540]">
              {item.title}
            </div>
            <p className="mt-4 text-sm leading-7 text-[#425466]">{item.body}</p>
          </div>
        ))}
      </section>

      <section className={cn(publicSurfaceClass, "p-8 lg:p-10")}>
        <div className={publicSectionLabelClass}>Typical scope areas</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Merchant signup, activation, and workspace management",
            "Developer API keys, hosted checkout, and payment links",
            "Gateway orchestration, failover, and routing visibility",
            "Webhook delivery infrastructure and operational tooling",
          ].map((item) => (
            <div key={item} className={cn(publicSubtleSurfaceClass, "p-5 text-sm leading-6 text-[#425466]")}>
              {item}
            </div>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
