import {
  PublicPageShell,
  cn,
  publicSectionLabelClass,
  publicSubtleSurfaceClass,
  publicSurfaceClass,
} from "../components/stackaura-ui";

const sections = [
  {
    title: "Service scope",
    body: "These Terms govern access to and use of software, APIs, dashboards, and related services made available by Stackaura Payments (Pty) Ltd.",
  },
  {
    title: "Platform dependencies",
    body: "Stackaura provides payment orchestration and merchant infrastructure software. Service availability may depend on third-party providers, payment gateways, and integrations.",
  },
  {
    title: "Payment provider responsibility",
    body: "Stackaura provides software infrastructure and orchestration tools. Stackaura does not directly process, hold, or settle customer funds; payments are handled by licensed payment providers operating within their own regulatory and contractual frameworks.",
  },
  {
    title: "User responsibilities",
    body: "Users are responsible for lawful use of the platform and for ensuring that submitted business, payment, and customer information is accurate.",
  },
  {
    title: "Access controls",
    body: "Stackaura may suspend or limit access where necessary for security, fraud prevention, abuse prevention, or legal compliance.",
  },
];

export default function TermsPage() {
  return (
    <PublicPageShell
      eyebrow="Terms of service"
      title="Operational terms for Stackaura dashboards, APIs, and payment tooling."
      description="These terms summarize the baseline rules that govern access to Stackaura software, orchestration infrastructure, dashboards, and related developer services."
      aside={
        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Contact</div>
          <div className="mt-4 text-2xl font-semibold tracking-tight text-[#0a2540]">
            admin@stackaura.co.za
          </div>
          <p className="mt-4 text-sm leading-6 text-[#425466]">
            Use this address for questions about service access, legal terms, or commercial use.
          </p>
        </div>
      }
    >
      <section className={cn(publicSurfaceClass, "p-8 lg:p-10")}>
        <div className={publicSectionLabelClass}>Terms summary</div>
        <div className="mt-6 grid gap-4">
          {sections.map((section) => (
            <div key={section.title} className={cn(publicSubtleSurfaceClass, "p-6")}>
              <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                {section.title}
              </div>
              <p className="mt-3 text-sm leading-7 text-[#425466]">{section.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
