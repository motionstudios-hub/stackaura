import Link from "next/link";

export default function DocsPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL || "http://localhost:3001";

  return (
    <main className="min-h-screen bg-[#020D33] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight">
            Stackaura Developer Docs
          </h1>
          <p className="mt-6 text-zinc-300">
            Stackaura provides payment orchestration infrastructure for merchants,
            platforms, and developers. Use our APIs to create payment intents,
            manage subscriptions, route payments, and receive webhook events.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`${baseUrl}/docs`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
          >
            Open Swagger
          </a>

          <Link
            href="/contact"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
          >
            Contact sales
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-zinc-400">Payments</div>
            <pre className="mt-4 overflow-auto text-sm text-zinc-200">
{`POST /v1/payments/intents
POST /v1/payments
GET  /v1/payments/:reference
POST /v1/payments/:reference/failover`}
            </pre>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-zinc-400">Webhooks & Billing</div>
            <pre className="mt-4 overflow-auto text-sm text-zinc-200">
{`GET  /v1/webhooks/endpoints/:id/deliveries
POST /v1/webhooks/deliveries/:id/retry
GET  /v1/payments/subscriptions`}
            </pre>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-medium">What Stackaura offers</div>
          <ul className="mt-4 space-y-2 text-zinc-300">
            <li>Payment intents and gateway orchestration</li>
            <li>Gateway failover and routing visibility</li>
            <li>Webhook delivery infrastructure</li>
            <li>Merchant operations and dashboard tooling</li>
            <li>Recurring billing foundations</li>
          </ul>
        </div>
      </div>
    </main>
  );
}