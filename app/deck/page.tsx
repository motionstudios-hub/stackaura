import { Card, CardContent } from "../components/stackaura-ui";
import { buildDeckPricingSummary, getServerPricing } from "../lib/pricing";

export default async function Deck() {
  const pricing = await getServerPricing();
  const slides: Array<{
    title: string;
    subtitle?: string;
    body: string;
  }> = [
    {
      title: "Stackaura",
      subtitle: "Payments that never fail",
      body: "One integration. Multiple gateways. Intelligent routing.",
    },
    {
      title: "The Problem",
      body: "Payments fail. Merchants lose revenue. Single gateways create risk.",
    },
    {
      title: "The Reality",
      body: "Africa is multi-gateway: Paystack, Yoco, Ozow — fragmented and inconsistent.",
    },
    {
      title: "The Gap",
      body: "No orchestration layer. No fallback. No intelligent routing.",
    },
    {
      title: "The Solution",
      body: "Stackaura routes, retries, and unifies payments across providers.",
    },
    {
      title: "How It Works",
      body: "Merchant → Stackaura → Multiple Gateways",
    },
    {
      title: "Product",
      body: "Checkout, API, routing engine, fallback recovery, dashboard insights.",
    },
    {
      title: "Why It Wins",
      body: "Higher success rates. Recovered payments. One integration.",
    },
    {
      title: "Business Model",
      body: buildDeckPricingSummary(pricing),
    },
    {
      title: "Proof",
      body: "Live rails. Working payments. Routing + fallback deployed.",
    },
    {
      title: "Vision",
      body: "Stripe for Africa’s multi-gateway reality.",
    },
    {
      title: "Closing",
      body: "Payments shouldn’t fail. Stackaura ensures they don’t.",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 p-8 space-y-12">
      {slides.map((slide, index) => (
        <div
          key={index}
          className="translate-y-0 opacity-100 transition-all duration-500"
        >
          <Card className="rounded-2xl shadow-xl p-10 max-w-4xl mx-auto">
            <CardContent>
              <h1 className="text-4xl font-bold mb-4">{slide.title}</h1>
              {slide.subtitle && (
                <h2 className="text-xl text-gray-600 mb-4">{slide.subtitle}</h2>
              )}
              <p className="text-lg text-gray-700">{slide.body}</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
