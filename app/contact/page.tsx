import {
  PublicPageShell,
  cn,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
  publicSectionLabelClass,
  publicSubtleSurfaceClass,
  publicSurfaceClass,
} from "../components/stackaura-ui";

export default function ContactPage() {
  return (
    <PublicPageShell
      eyebrow="Contact Stackaura"
      title="Talk to the team building your payments infrastructure layer."
      description="For business, partnership, developer, merchant activation, and compliance enquiries, reach Stackaura directly and we’ll route you to the right team."
      actions={
        <>
          <a href="mailto:admin@stackaura.co.za" className={publicPrimaryButtonClass}>
            Email Stackaura
          </a>
          <a href="https://stackaura.co.za" className={publicSecondaryButtonClass}>
            Visit website
          </a>
        </>
      }
      aside={
        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Primary contact</div>
          <div className="mt-4 text-3xl font-semibold tracking-tight text-[#0a2540]">
            admin@stackaura.co.za
          </div>
          <p className="mt-4 text-sm leading-6 text-[#425466]">
            Use email for commercial, developer, and operational enquiries. We’ll respond from the
            correct Stackaura function.
          </p>
        </div>
      }
    >
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Business name</div>
          <div className="mt-3 text-xl font-semibold tracking-tight text-[#0a2540]">
            Stackaura Payments (Pty) Ltd
          </div>
        </div>

        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Website</div>
          <div className="mt-3 text-xl font-semibold tracking-tight text-[#0a2540]">
            stackaura.co.za
          </div>
        </div>

        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Country</div>
          <div className="mt-3 text-xl font-semibold tracking-tight text-[#0a2540]">
            South Africa
          </div>
        </div>

        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Use cases</div>
          <div className="mt-3 text-sm leading-6 text-[#425466]">
            Merchant onboarding, orchestration, API access, hosted checkout, and platform
            partnerships.
          </div>
        </div>
      </section>

      <section className={cn(publicSurfaceClass, "p-8 lg:p-10")}>
        <div className={publicSectionLabelClass}>Infrastructure role</div>
        <div className="mt-4 max-w-4xl text-2xl font-semibold tracking-tight text-[#0a2540]">
          Stackaura provides software infrastructure and orchestration tools. Stackaura does not
          directly process, hold, or settle customer funds; payments are handled by licensed
          payment providers.
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#425466]">
          This distinction is central to how Stackaura explains its role to merchants, platforms,
          payment providers, and compliance teams reviewing the product.
        </p>
      </section>

      <section className={cn(publicSurfaceClass, "p-8 lg:p-10")}>
        <div className={publicSectionLabelClass}>How we can help</div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Commercial onboarding",
              body: "Discuss merchant activation, volumes, pricing structure, and rollout planning.",
            },
            {
              title: "Developer support",
              body: "Review API docs, sandbox flows, payment links, and hosted checkout setup.",
            },
            {
              title: "Compliance and operations",
              body: "Route governance, security, and payment-operations conversations with the right team.",
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
