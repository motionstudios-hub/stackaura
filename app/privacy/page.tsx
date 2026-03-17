import {
  PublicPageShell,
  cn,
  publicSectionLabelClass,
  publicSubtleSurfaceClass,
  publicSurfaceClass,
} from "../components/stackaura-ui";

const sections = [
  {
    title: "Information we collect",
    body: "We may collect contact information, account information, technical usage data, and service-related information required to operate and secure our platform.",
  },
  {
    title: "How payment data is handled",
    body: "Payment data may be processed through third-party payment gateways and financial service providers. Stackaura does not represent that it is a card scheme or issuing bank.",
  },
  {
    title: "Security measures",
    body: "We use reasonable technical and organisational measures to protect information processed through our systems.",
  },
  {
    title: "Privacy contact",
    body: "For privacy enquiries, contact admin@stackaura.co.za.",
  },
];

export default function PrivacyPage() {
  return (
    <PublicPageShell
      eyebrow="Privacy policy"
      title="Privacy practices for Stackaura infrastructure and merchant services."
      description="Stackaura Technologies (Pty) Ltd provides software and payment infrastructure services for merchants, platforms, and developers. This page summarizes how we think about operational data, account information, and service security."
      aside={
        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Scope</div>
          <div className="mt-4 text-sm leading-7 text-[#425466]">
            This summary covers the software, APIs, dashboards, and merchant-facing services made
            available by Stackaura.
          </div>
        </div>
      }
    >
      <section className={cn(publicSurfaceClass, "p-8 lg:p-10")}>
        <div className={publicSectionLabelClass}>Policy summary</div>
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
