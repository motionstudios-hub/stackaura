"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type CreatePaymentResponse = {
  id: string;
  reference: string;
  amountCents: number;
  currency: string;
  status: string;
  checkoutUrl: string;
  redirectUrl?: string | null;
  customerEmail?: string | null;
  description?: string | null;
};

function centsToAmountString(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}

export default function PaymentLinksPage() {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL || "http://localhost:3001";

  const [apiKey, setApiKey] = useState("");
  const [amount, setAmount] = useState("25.00");
  const [currency, setCurrency] = useState("ZAR");
  const [customerEmail, setCustomerEmail] = useState("");
  const [description, setDescription] = useState("Stackaura payment link");
  const [gateway, setGateway] = useState("PAYFAST");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatePaymentResponse | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const amountCents = useMemo(() => {
    const numeric = Number(amount);
    if (Number.isNaN(numeric) || numeric <= 0) return 0;
    return Math.round(numeric * 100);
  }, [amount]);

  const shareMessage = useMemo(() => {
    if (!result?.checkoutUrl) return "";
    return `Pay ${currency} ${centsToAmountString(result.amountCents)} via Stackaura: ${result.checkoutUrl}`;
  }, [currency, result]);

  const whatsappHref = useMemo(() => {
    if (!shareMessage) return "#";
    return `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  }, [shareMessage]);

  const emailHref = useMemo(() => {
    if (!result?.checkoutUrl) return "#";
    const subject = encodeURIComponent("Complete your payment");
    const body = encodeURIComponent(
      `${description || "Please complete your payment"}\n\n${shareMessage}`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  }, [description, result, shareMessage]);

  async function copyValue(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${backendBaseUrl}/v1/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountCents,
          currency,
          customerEmail: customerEmail || undefined,
          description,
          gateway,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create payment link.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payment link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020D33] text-white">
      <div className="relative mx-auto max-w-7xl px-8 py-10">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 -top-8 h-80 w-80 rounded-full bg-[#A0E9FF]/20 blur-3xl" />
          <div className="absolute right-[-80px] top-0 h-[28rem] w-[28rem] rounded-full bg-[#116AF8]/30 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/3 h-[24rem] w-[24rem] rounded-full bg-[#20BCED]/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_18%)]" />
        </div>

        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <Image
                src="/stackaura-logo.png"
                alt="Stackaura"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>

            <div>
              <div className="text-2xl font-semibold tracking-tight">
                Payment Links
              </div>
              <div className="text-sm text-zinc-300/80">
                Create and share checkout links for WhatsApp, Instagram DM, and email.
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <section className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-sm font-semibold">Create payment link</div>
            <div className="mt-2 text-sm text-zinc-400">
              Generate a hosted Stackaura checkout link using a merchant API key.
            </div>

            <form onSubmit={createLink} className="mt-6 grid gap-4">
              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Merchant API key</span>
                <input
                  className="rounded-xl border border-white/10 bg-[#07142f]/80 px-3 py-3 font-mono text-xs text-zinc-100 backdrop-blur-xl"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ck_test_..."
                  required
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs text-zinc-400">Amount</span>
                  <input
                    className="rounded-xl border border-white/10 bg-[#07142f]/80 px-3 py-3 text-sm text-zinc-100 backdrop-blur-xl"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25.00"
                    required
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-zinc-400">Currency</span>
                  <select
                    className="rounded-xl border border-white/10 bg-[#07142f]/80 px-3 py-3 text-sm text-zinc-100 backdrop-blur-xl"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="ZAR">ZAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs text-zinc-400">Customer email</span>
                  <input
                    className="rounded-xl border border-white/10 bg-[#07142f]/80 px-3 py-3 text-sm text-zinc-100 backdrop-blur-xl"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-zinc-400">Preferred gateway</span>
                  <select
                    className="rounded-xl border border-white/10 bg-[#07142f]/80 px-3 py-3 text-sm text-zinc-100 backdrop-blur-xl"
                    value={gateway}
                    onChange={(e) => setGateway(e.target.value)}
                  >
                    <option value="PAYFAST">PayFast</option>
                    <option value="OZOW">Ozow</option>
                    <option value="PAYGATE">PayGate</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs text-zinc-400">Description</span>
                <input
                  className="rounded-xl border border-white/10 bg-[#07142f]/80 px-3 py-3 text-sm text-zinc-100 backdrop-blur-xl"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product / invoice description"
                />
              </label>

              <button
                type="submit"
                disabled={loading || !apiKey || amountCents <= 0}
                className="rounded-xl bg-gradient-to-r from-[#20BCED] to-[#116AF8] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(17,106,248,0.30)] transition hover:opacity-95 disabled:opacity-50"
              >
                {loading ? "Creating link..." : "Create Payment Link"}
              </button>
            </form>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-900/40 bg-rose-950/30 p-4 text-sm text-rose-200">
                {error}
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-sm font-semibold">Share payment link</div>
            <div className="mt-2 text-sm text-zinc-400">
              Generate a checkout link once, then share it anywhere merchants sell.
            </div>

            {!result ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-400 backdrop-blur-xl">
                Create a payment link to unlock WhatsApp, Instagram DM, and email sharing actions.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">
                    Checkout URL
                  </div>
                  <div className="mt-2 break-all font-mono text-sm text-zinc-100">
                    {result.checkoutUrl}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => copyValue(result.checkoutUrl, "checkout")}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10"
                    >
                      {copied === "checkout" ? "Copied" : "Copy link"}
                    </button>

                    <a
                      href={result.checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10"
                    >
                      Open checkout
                    </a>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-100 backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10"
                  >
                    <div className="font-semibold">WhatsApp</div>
                    <div className="mt-2 text-xs text-zinc-400">
                      Open WhatsApp with a ready-to-send payment message.
                    </div>
                  </a>

                  <button
                    onClick={() => copyValue(shareMessage, "instagram")}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-zinc-100 backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10"
                  >
                    <div className="font-semibold">Instagram DM</div>
                    <div className="mt-2 text-xs text-zinc-400">
                      Copy the share message, then paste it into Instagram DM.
                    </div>
                    <div className="mt-3 text-xs text-[#A0E9FF]">
                      {copied === "instagram" ? "Copied message" : "Copy message"}
                    </div>
                  </button>

                  <a
                    href={emailHref}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-100 backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10"
                  >
                    <div className="font-semibold">Email</div>
                    <div className="mt-2 text-xs text-zinc-400">
                      Open your email client with a prefilled checkout message.
                    </div>
                  </a>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">
                    Payment details
                  </div>

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <div className="text-zinc-500">Reference</div>
                      <div className="mt-1 font-mono text-zinc-100">
                        {result.reference}
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500">Status</div>
                      <div className="mt-1 text-zinc-100">{result.status}</div>
                    </div>

                    <div>
                      <div className="text-zinc-500">Amount</div>
                      <div className="mt-1 text-zinc-100">
                        {result.currency} {centsToAmountString(result.amountCents)}
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500">Customer</div>
                      <div className="mt-1 text-zinc-100">
                        {result.customerEmail || "Not provided"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}