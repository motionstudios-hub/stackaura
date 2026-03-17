"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DarkBackground,
  cn,
  darkCompactGhostButtonClass,
  darkGhostButtonClass,
  darkInputClass,
  darkPanelClass,
  darkPillClass,
  darkPrimaryButtonClass,
  darkSubtleSurfaceClass,
  darkSurfaceClass,
} from "../components/stackaura-ui";

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
    <DarkBackground>
      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className={cn(darkSurfaceClass, "flex h-16 w-16 items-center justify-center overflow-hidden rounded-[24px]")}>
              <Image
                src="/stackaura-logo.png"
                alt="Stackaura"
                width={40}
                height={40}
                className="object-contain mix-blend-screen"
                priority
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#A0E9FF] backdrop-blur-xl">
                Payment links
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-tight text-white">
                Create shareable checkout links in the Stackaura console.
              </div>
              <div className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300">
                Generate a hosted checkout link with a merchant API key, then share it across
                WhatsApp, Instagram DM, or email without leaving the Stackaura payments stack.
              </div>
            </div>
          </div>

          <Link href="/dashboard" className={darkGhostButtonClass}>
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <section className={cn(darkSurfaceClass, "p-6")}>
            <div className="text-sm font-semibold text-white">Create payment link</div>
            <div className="mt-2 text-sm text-zinc-400">
              Generate a hosted Stackaura checkout link using a merchant API key.
            </div>

            <form onSubmit={createLink} className="mt-6 grid gap-4">
              <label className="grid gap-1">
                <span className="text-xs uppercase tracking-wide text-zinc-400">Merchant API key</span>
                <input
                  className={cn(darkInputClass, "font-mono text-xs")}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ck_test_..."
                  required
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs uppercase tracking-wide text-zinc-400">Amount</span>
                  <input
                    className={darkInputClass}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25.00"
                    required
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs uppercase tracking-wide text-zinc-400">Currency</span>
                  <select
                    className={darkInputClass}
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
                  <span className="text-xs uppercase tracking-wide text-zinc-400">Customer email</span>
                  <input
                    className={darkInputClass}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs uppercase tracking-wide text-zinc-400">
                    Preferred gateway
                  </span>
                  <select
                    className={darkInputClass}
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
                <span className="text-xs uppercase tracking-wide text-zinc-400">Description</span>
                <input
                  className={darkInputClass}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product / invoice description"
                />
              </label>

              <button
                type="submit"
                disabled={loading || !apiKey || amountCents <= 0}
                className={cn(darkPrimaryButtonClass, "w-full")}
              >
                {loading ? "Creating link..." : "Create payment link"}
              </button>
            </form>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                {error}
              </div>
            ) : null}
          </section>

          <section className={cn(darkSurfaceClass, "p-6")}>
            <div className="text-sm font-semibold text-white">Share payment link</div>
            <div className="mt-2 text-sm text-zinc-400">
              Create one checkout link, then distribute it everywhere the merchant sells.
            </div>

            {!result ? (
              <div className={cn(darkSubtleSurfaceClass, "mt-6 p-5 text-sm text-zinc-400")}>
                Create a payment link to unlock WhatsApp, Instagram DM, and email sharing actions.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className={cn(darkSubtleSurfaceClass, "p-5")}>
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Checkout URL</div>
                  <div className="mt-2 break-all font-mono text-sm text-zinc-100">
                    {result.checkoutUrl}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => copyValue(result.checkoutUrl, "checkout")}
                      className={darkCompactGhostButtonClass}
                    >
                      {copied === "checkout" ? "Copied" : "Copy link"}
                    </button>

                    <a
                      href={result.checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={darkCompactGhostButtonClass}
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
                    className={cn(darkPanelClass, "p-4")}
                  >
                    <div className="font-semibold text-white">WhatsApp</div>
                    <div className="mt-2 text-xs leading-6 text-zinc-400">
                      Open WhatsApp with a ready-to-send payment message.
                    </div>
                  </a>

                  <button
                    onClick={() => copyValue(shareMessage, "instagram")}
                    className={cn(darkPanelClass, "p-4 text-left")}
                  >
                    <div className="font-semibold text-white">Instagram DM</div>
                    <div className="mt-2 text-xs leading-6 text-zinc-400">
                      Copy the share message, then paste it into Instagram DM.
                    </div>
                    <div className="mt-3 text-xs text-[#A0E9FF]">
                      {copied === "instagram" ? "Copied message" : "Copy message"}
                    </div>
                  </button>

                  <a href={emailHref} className={cn(darkPanelClass, "p-4")}>
                    <div className="font-semibold text-white">Email</div>
                    <div className="mt-2 text-xs leading-6 text-zinc-400">
                      Open your email client with a prefilled checkout message.
                    </div>
                  </a>
                </div>

                <div className={cn(darkSubtleSurfaceClass, "p-5")}>
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Payment details</div>

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <div className="text-zinc-500">Reference</div>
                      <div className="mt-1 font-mono text-zinc-100">{result.reference}</div>
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

        <div className="mt-6 flex flex-wrap gap-3">
          {["Hosted checkout", "Shareable links", "Merchant API auth", "Ozow + PayFast ready"].map(
            (item) => (
              <span key={item} className={darkPillClass}>
                {item}
              </span>
            )
          )}
        </div>
      </div>
    </DarkBackground>
  );
}
