import Link from "next/link";
import {
  PublicPageShell,
  cn,
  publicCodePanelClass,
  publicPrimaryButtonClass,
  publicSectionLabelClass,
  publicSecondaryButtonClass,
  publicSubtleSurfaceClass,
  publicSurfaceClass,
} from "../components/stackaura-ui";

export default function DocsPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL || "http://localhost:3001";

  return (
    <PublicPageShell
      eyebrow="Developer infrastructure"
      title="Build on Stackaura with one integration for multiple gateways."
      description="Use Stackaura APIs to create payments, route and recover transactions, activate merchants, issue API keys, and track webhook deliveries from one orchestration layer."
      actions={
        <>
          <a
            href={`${baseUrl}/docs`}
            target="_blank"
            rel="noreferrer"
            className={publicPrimaryButtonClass}
          >
            Open Swagger
          </a>
          <Link href="/contact" className={publicSecondaryButtonClass}>
            Contact sales
          </Link>
        </>
      }
      aside={
        <div className={publicCodePanelClass}>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7dd3fc]">
            Quick start
          </div>
          <pre className="mt-4 overflow-x-auto text-sm leading-7 text-[#d6e3f0]">
{`curl -X POST https://api.stackaura.co.za/v1/payments \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amountCents": 9900,
    "currency": "ZAR",
    "reference": "ORDER-123"
  }'`}
          </pre>
        </div>
      }
    >
      <section className="grid gap-6 xl:grid-cols-3">
        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Payments</div>
          <pre className="mt-4 overflow-auto text-sm leading-7 text-[#425466]">
{`POST /v1/payments/intents
POST /v1/payments
GET  /v1/payments/:reference
POST /v1/payments/:reference/failover`}
          </pre>
        </div>

        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Webhooks & Billing</div>
          <pre className="mt-4 overflow-auto text-sm leading-7 text-[#425466]">
{`GET  /v1/webhooks/endpoints/:id/deliveries
POST /v1/webhooks/deliveries/:id/retry
GET  /v1/payments/subscriptions`}
          </pre>
        </div>

        <div className={cn(publicSurfaceClass, "p-7")}>
          <div className={publicSectionLabelClass}>Developer operations</div>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-[#425466]">
            <li>Issue merchant API keys for test and live environments.</li>
            <li>Launch hosted checkout and payment link flows from one backend.</li>
            <li>Track fallback, delivery retries, and routing visibility across payment rails.</li>
          </ul>
        </div>
      </section>

      <section className={cn(publicSurfaceClass, "p-8 lg:p-10")}>
        <div className={publicSectionLabelClass}>What Stackaura offers</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            "Payment creation, routing, and recovery",
            "Gateway fallback and routing visibility",
            "Webhook delivery infrastructure",
            "Merchant operations and dashboard tooling",
            "Recurring billing foundations",
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
