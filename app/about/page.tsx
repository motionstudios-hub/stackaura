import {
  PublicPageShell,
  cn,
  publicSectionLabelClass,
  publicSubtleSurfaceClass,
  publicSurfaceClass,
} from "../components/stackaura-ui";

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="About Stackaura"
      title="Financial infrastructure designed for modern merchants and platforms."
      description="Stackaura is a South African fintech infrastructure company building payment orchestration software for merchants, platforms, and developers that need one operational layer across multiple payment rails."
      aside={
        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Legal entity</div>
          <div className="mt-4 text-3xl font-semibold tracking-tight text-[#0a2540]">
            Stackaura Payments (Pty) Ltd
          </div>
          <div className="mt-5 text-sm leading-6 text-[#425466]">
            Operating from South Africa with an infrastructure-first product focus on orchestration,
            developer tooling, and merchant activation.
          </div>
        </div>
      }
    >
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className={cn(publicSurfaceClass, "p-8 lg:p-10")}>
          <div className={publicSectionLabelClass}>What we build</div>
          <p className="mt-5 text-base leading-8 text-[#425466]">
            Our platform helps businesses manage payment routing, gateway failover, webhooks,
            subscriptions, merchant onboarding, and payment operations through one modern API layer.
          </p>
          <p className="mt-4 text-base leading-8 text-[#425466]">
            The goal is infrastructure-grade control: fewer fragmented integrations, clearer payment
            operations, and a cleaner developer experience for teams scaling across providers.
          </p>
        </div>

        <div className="grid gap-4">
          {[
            {
              title: "Merchant activation",
              body: "Move from signup to an active workspace with API keys, dashboard access, and paid onboarding paths.",
            },
            {
              title: "Gateway orchestration",
              body: "Route and fail over across providers without rebuilding your payment stack each time you add a rail.",
            },
            {
              title: "Developer tooling",
              body: "Give engineering teams one place for hosted checkout, webhooks, payment links, and API operations.",
            },
          ].map((item) => (
            <div key={item.title} className={cn(publicSubtleSurfaceClass, "p-6")}>
              <div className="text-lg font-semibold tracking-tight text-[#0a2540]">{item.title}</div>
              <p className="mt-3 text-sm leading-6 text-[#425466]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
