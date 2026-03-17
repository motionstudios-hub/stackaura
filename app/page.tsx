import Image from "next/image";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "./components/stackaura-ui";

export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Stackaura Technologies (Pty) Ltd",
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

      <main className="min-h-screen bg-[#dbe8ee] text-[#0a2540]">
        <div className="relative overflow-hidden border-b border-white/35 bg-[#dbe8ee]">
          <div className="absolute inset-x-0 top-0 h-[6px] bg-[linear-gradient(90deg,#7a73ff_0%,#4f46e5_22%,#7dd3fc_46%,#fb7185_72%,#f59e0b_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(255,255,255,0.30),transparent_24%),radial-gradient(circle_at_34%_40%,rgba(186,214,227,0.26),transparent_26%),radial-gradient(circle_at_78%_28%,rgba(241,248,251,0.28),transparent_30%)]" />
          <div className="absolute left-0 top-[88px] h-[560px] w-[60%] bg-[linear-gradient(135deg,rgba(231,240,245,0.36)_0%,rgba(196,220,233,0.12)_30%,rgba(255,255,255,0)_76%)]" />

          <PublicHeader />

          <section className="relative mx-auto grid max-w-[1440px] gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/24 px-4 py-2 text-sm font-medium text-[#0a2540] shadow-[0_8px_24px_rgba(133,156,180,0.10)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/18">
                <span className="font-semibold text-[#0a2540]">African payments infrastructure</span>
                <span className="text-[#6b7c93]">for modern merchants and platforms</span>
              </div>

              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#0a2540] sm:text-6xl lg:text-[72px]">
                Financial infrastructure to launch, route, and scale payments.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#425466] sm:text-[21px]">
                Accept payments, orchestrate multiple gateways, and activate merchants through one API layer. Stackaura helps businesses unify checkout, onboarding, routing, and developer operations across Africa.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-[linear-gradient(180deg,rgba(108,92,255,0.92),rgba(87,76,240,0.92))] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(99,91,255,0.22)] backdrop-blur-xl transition hover:brightness-105"
                >
                  Start building
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/45 bg-white/22 px-6 py-3.5 text-sm font-semibold text-[#4f46e5] shadow-[0_10px_24px_rgba(133,156,180,0.12)] backdrop-blur-2xl transition hover:bg-white/30 hover:border-white/55"
                >
                  View docs
                </Link>
              </div>
            </div>

            <div className="relative hidden min-h-[560px] lg:block">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_35%,rgba(176,206,233,0.30),transparent_28%),radial-gradient(circle_at_82%_52%,rgba(204,227,242,0.38),transparent_26%),linear-gradient(180deg,rgba(215,232,240,0.18),rgba(255,255,255,0))]" />

              <div className="absolute right-[-8%] top-[-2%] h-[620px] w-[620px] rotate-[28deg]">
                <div className="absolute left-[-38px] top-[286px] h-[184px] w-[300px] rounded-[18px] border border-[#a977ff]/38 bg-[linear-gradient(180deg,rgba(209,186,255,0.42)_0%,rgba(88,118,255,0.84)_58%,rgba(82,233,240,0.54)_100%)] shadow-[0_22px_44px_rgba(98,132,196,0.10),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-md" />
                <div className="absolute left-[54px] top-[198px] h-[212px] w-[334px] rounded-[20px] border border-[#9d7cff]/42 bg-[linear-gradient(180deg,rgba(214,194,255,0.44)_0%,rgba(104,130,255,0.76)_56%,rgba(95,229,237,0.44)_100%)] shadow-[0_24px_52px_rgba(98,132,196,0.12),inset_0_1px_0_rgba(255,255,255,0.46)] backdrop-blur-md" />
                <div className="absolute left-[154px] top-[104px] h-[244px] w-[370px] rounded-[24px] border border-[#916fff]/46 bg-[linear-gradient(180deg,rgba(218,200,255,0.50)_0%,rgba(126,151,255,0.60)_52%,rgba(130,231,236,0.34)_100%)] shadow-[0_26px_60px_rgba(98,132,196,0.14),inset_0_1px_0_rgba(255,255,255,0.50)] backdrop-blur-md" />
                <div className="absolute left-[276px] top-[16px] h-[282px] w-[408px] rounded-[28px] border border-[#8666ff]/50 bg-[linear-gradient(180deg,rgba(223,208,255,0.54)_0%,rgba(163,189,255,0.42)_48%,rgba(161,235,240,0.20)_100%)] shadow-[0_30px_70px_rgba(98,132,196,0.16),inset_0_1px_0_rgba(255,255,255,0.56)] backdrop-blur-md" />

                <div className="absolute left-[392px] top-[-48px] h-[388px] w-[16px] rounded-full bg-[linear-gradient(180deg,rgba(102,82,255,0.94)_0%,rgba(89,140,255,0.82)_58%,rgba(48,225,236,0.78)_100%)] shadow-[0_10px_20px_rgba(112,139,210,0.16)]" />
                <div className="absolute left-[458px] top-[-86px] h-[430px] w-[16px] rounded-full bg-[linear-gradient(180deg,rgba(108,88,255,0.94)_0%,rgba(95,147,255,0.82)_58%,rgba(53,226,236,0.78)_100%)] shadow-[0_10px_20px_rgba(112,139,210,0.16)]" />
                <div className="absolute left-[522px] top-[-122px] h-[470px] w-[16px] rounded-full bg-[linear-gradient(180deg,rgba(113,92,255,0.94)_0%,rgba(101,153,255,0.82)_58%,rgba(58,227,236,0.78)_100%)] shadow-[0_10px_20px_rgba(112,139,210,0.16)]" />
                <div className="absolute left-[586px] top-[-154px] h-[500px] w-[16px] rounded-full bg-[linear-gradient(180deg,rgba(118,96,255,0.94)_0%,rgba(106,158,255,0.82)_58%,rgba(61,228,236,0.78)_100%)] shadow-[0_10px_20px_rgba(112,139,210,0.16)]" />
                <div className="absolute left-[652px] top-[-182px] h-[522px] w-[16px] rounded-full bg-[linear-gradient(180deg,rgba(122,100,255,0.94)_0%,rgba(112,164,255,0.82)_58%,rgba(66,229,236,0.78)_100%)] shadow-[0_10px_20px_rgba(112,139,210,0.16)]" />
                <div className="absolute left-[720px] top-[-198px] h-[518px] w-[12px] rounded-full bg-[linear-gradient(180deg,rgba(114,168,255,0.72)_0%,rgba(61,228,236,0.72)_100%)] opacity-92 shadow-[0_8px_18px_rgba(112,139,210,0.12)]" />
              </div>
            </div>
          </section>

          <section className="relative border-t border-[#e3e8ee] bg-white/90">
            <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10">
              <div className="grid gap-8 lg:grid-cols-[220px_1fr_1fr] lg:items-center">
                <div className="text-sm font-semibold text-[#0a2540]">
                  Integrates with payment providers and commerce platforms.
                </div>

                <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
                  <Image src="https://cdn.simpleicons.org/ozow/0A2540" alt="Ozow" width={96} height={32} className="h-8 w-auto opacity-85" unoptimized />
                  <Image src="https://cdn.simpleicons.org/paystack/0A2540" alt="Paystack" width={96} height={32} className="h-8 w-auto opacity-85" unoptimized />
                  <Image src="https://cdn.simpleicons.org/stripe/0A2540" alt="Stripe" width={96} height={32} className="h-8 w-auto opacity-85" unoptimized />
                  <Image src="https://cdn.simpleicons.org/shopify/0A2540" alt="Shopify" width={96} height={32} className="h-8 w-auto opacity-85" unoptimized />
                </div>

                <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
                  <Image src="https://cdn.simpleicons.org/woocommerce/0A2540" alt="WooCommerce" width={96} height={32} className="h-8 w-auto opacity-85" unoptimized />
                  <Image src="https://cdn.simpleicons.org/yoco/0A2540" alt="Yoco" width={96} height={32} className="h-8 w-auto opacity-85" unoptimized />
                  <div className="text-lg font-semibold tracking-tight text-[#0a2540] opacity-80">Custom API</div>
                  <div className="text-lg font-semibold tracking-tight text-[#0a2540] opacity-80">SaaS Platforms</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10">
          <div className="grid gap-6 xl:grid-cols-4">
            <div className="rounded-[28px] border border-white/45 bg-white/24 p-7 shadow-[0_16px_34px_rgba(122,146,168,0.10)] backdrop-blur-2xl">
              <div className="text-sm font-semibold text-[#6b7c93]">Unified API</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a2540]">Connect once</h2>
              <p className="mt-4 text-base leading-7 text-[#425466]">
                Manage multiple payment providers, merchant onboarding, and checkout flows through one infrastructure layer.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/45 bg-white/24 p-7 shadow-[0_16px_34px_rgba(122,146,168,0.10)] backdrop-blur-2xl">
              <div className="text-sm font-semibold text-[#6b7c93]">Smart routing</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a2540]">Improve reliability</h2>
              <p className="mt-4 text-base leading-7 text-[#425466]">
                Route transactions across gateways for stronger resilience, operational control, and better checkout performance.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/45 bg-white/24 p-7 shadow-[0_16px_34px_rgba(122,146,168,0.10)] backdrop-blur-2xl">
              <div className="text-sm font-semibold text-[#6b7c93]">Merchant activation</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a2540]">Onboard faster</h2>
              <p className="mt-4 text-base leading-7 text-[#425466]">
                Move merchants from signup to active infrastructure with payment-linked activation, API keys, and clean automation.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/45 bg-white/24 p-7 shadow-[0_16px_34px_rgba(122,146,168,0.10)] backdrop-blur-2xl">
              <div className="text-sm font-semibold text-[#6b7c93]">Commerce-ready</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a2540]">Build for growth</h2>
              <p className="mt-4 text-base leading-7 text-[#425466]">
                Designed for SaaS products, online stores, marketplaces, and custom payment experiences across web and mobile.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-4 lg:px-10">
          <div className="overflow-hidden rounded-[32px] border border-white/45 bg-white/24 shadow-[0_16px_36px_rgba(122,146,168,0.10)] backdrop-blur-2xl">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-8 lg:p-10">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">
                  Infrastructure layer
                </div>
                <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
                  One layer between your business and multiple payment providers.
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#425466]">
                  Commerce apps and storefronts connect to Stackaura. Stackaura connects to multiple payment rails. Your business gets one integration instead of many.
                </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-white/40 bg-white/20 p-5 shadow-[0_12px_28px_rgba(122,146,168,0.08)] backdrop-blur-2xl">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">Commerce apps</div>
                    <div className="mt-3 text-2xl font-semibold tracking-tight text-[#0a2540]">Store / App / Platform</div>
                    <div className="mt-3 text-sm leading-6 text-[#425466]">
                      Connect storefronts, products, and merchant platforms through one backend layer.
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/42 bg-[linear-gradient(180deg,rgba(238,242,255,0.56)_0%,rgba(234,248,255,0.32)_100%)] p-5 shadow-[0_12px_28px_rgba(122,146,168,0.08)] backdrop-blur-2xl">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">Core orchestration</div>
                    <div className="mt-3 text-2xl font-semibold tracking-tight text-[#0a2540]">Stackaura</div>
                    <div className="mt-3 text-sm leading-6 text-[#425466]">
                      Unify checkout, merchant onboarding, API access, routing, and gateway failover.
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/40 bg-white/20 p-5 shadow-[0_12px_28px_rgba(122,146,168,0.08)] backdrop-blur-2xl">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">Payment providers</div>
                    <div className="mt-3 text-2xl font-semibold tracking-tight text-[#0a2540]">Ozow / Paystack / Stripe</div>
                    <div className="mt-3 text-sm leading-6 text-[#425466]">
                      Connect once and orchestrate across multiple providers instead of managing each integration separately.
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l border-white/30 bg-white/10 p-8 backdrop-blur-xl lg:p-10">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">
                  What Stackaura handles
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    {
                      title: 'Merchant onboarding and API key issuance',
                      body: 'Move businesses from signup to active infrastructure with payment-linked activation, API keys, and secure access patterns.',
                    },
                    {
                      title: 'Gateway routing, failover, and transaction state tracking',
                      body: 'Route payments intelligently, reduce single-provider dependency, and keep payment state consistent across flows.',
                    },
                    {
                      title: 'Checkout sessions, subscriptions, webhooks, and developer operations',
                      body: 'Support hosted checkout, webhook delivery, subscriptions, and the operational tooling developers need to ship faster.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[24px] border border-white/42 bg-white/22 p-5 shadow-[0_12px_28px_rgba(122,146,168,0.08)] backdrop-blur-2xl">
                      <div className="text-lg font-semibold tracking-tight text-[#0a2540]">{item.title}</div>
                      <p className="mt-2 text-sm leading-6 text-[#425466]">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[32px] border border-white/45 bg-white/24 p-8 shadow-[0_16px_34px_rgba(122,146,168,0.10)] backdrop-blur-2xl lg:p-10">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">Built for developers</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
                Ship faster with developer-first infrastructure.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#425466]">
                Build faster with merchant onboarding, checkout sessions, API keys, webhooks, and infrastructure designed for real payment operations.
              </p>

              <div className="mt-8 rounded-[28px] border border-white/25 bg-[linear-gradient(180deg,rgba(10,37,64,0.84),rgba(28,53,94,0.80))] p-6 text-white shadow-[0_16px_36px_rgba(10,37,64,0.16)] backdrop-blur-2xl">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7dd3fc]">Quick start</div>
                <pre className="mt-4 overflow-x-auto text-sm leading-7 text-[#d6e3f0]">
{`curl -X POST https://api.stackaura.co.za/v1/payments \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "amountCents": 9900,
    "currency": "ZAR",
    "reference": "ORDER-123",
    "customerEmail": "buyer@example.com"
  }'`}
                </pre>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {['API keys', 'Checkout sessions', 'Webhooks', 'Merchant onboarding', 'Gateway orchestration'].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/42 bg-white/22 px-4 py-2 text-sm font-medium text-[#425466] shadow-[0_8px_22px_rgba(122,146,168,0.08)] backdrop-blur-2xl"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center rounded-xl bg-[#635bff] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(99,91,255,0.22)] transition hover:brightness-105"
                >
                  Read the docs
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/45 bg-white/24 p-8 shadow-[0_16px_34px_rgba(122,146,168,0.10)] backdrop-blur-2xl lg:p-10">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b7c93]">Built for modern commerce across Africa</div>
              <div className="mt-6 space-y-4">
                {[
                  {
                    title: 'African-first infrastructure',
                    body: 'Designed for businesses operating across local payment environments and regional growth paths.',
                  },
                  {
                    title: 'Multi-gateway architecture',
                    body: 'Reduce dependency on a single provider and build more resilient checkout experiences.',
                  },
                  {
                    title: 'Fast merchant onboarding',
                    body: 'Move merchants from signup to active payment infrastructure with less operational friction.',
                  },
                  {
                    title: 'Developer-first foundation',
                    body: 'Clear APIs, backend automation, and extensible flows for product and engineering teams.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-white/40 bg-white/20 p-5 shadow-[0_12px_28px_rgba(122,146,168,0.08)] backdrop-blur-2xl">
                    <div className="text-lg font-semibold tracking-tight text-[#0a2540]">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-[#425466]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 pb-20 pt-4 lg:px-10">
          <div className="rounded-[36px] border border-white/30 bg-[linear-gradient(135deg,rgba(10,37,64,0.88)_0%,rgba(28,53,94,0.82)_52%,rgba(99,91,255,0.76)_100%)] p-8 text-white shadow-[0_20px_48px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-10 lg:p-12">
            <div className="max-w-3xl">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a3bffa]">
                Connect once. Orchestrate across multiple providers.
              </div>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Stackaura gives businesses and platforms a cleaner way to manage payments, onboarding, and checkout infrastructure through one modern API layer.
              </h2>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl border border-white/45 bg-white/24 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(133,156,180,0.12)] backdrop-blur-2xl transition hover:bg-white/30"
              >
                Start building
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl border border-white/35 bg-white/12 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-2xl transition hover:bg-white/18"
              >
                Contact sales
              </Link>
            </div>
          </div>
        </section>

        <PublicFooter />
      </main>
    </>
  );
}
