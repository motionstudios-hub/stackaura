

"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";

type CheckoutPayload = {
  merchantName: string;
  reference: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  customerEmail: string | null;
  expiresAt: string;
  gateway: string | null;
  redirectUrl: string | null;
};

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amountCents / 100);
}

function gatewayLabel(gateway: string | null | undefined) {
  const value = (gateway || "STACKAURA").toUpperCase();
  if (value === "PAYFAST") return "PayFast";
  if (value === "OZOW") return "Ozow";
  if (value === "PAYGATE") return "PayGate";
  return value;
}

export default function HostedCheckoutPage({ params }: PageProps) {
  const { token } = use(params);
  const [payment, setPayment] = useState<CheckoutPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const backendBaseUrl =
    process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL || "http://localhost:3001";

  useEffect(() => {
    let cancelled = false;

    async function loadCheckout() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${backendBaseUrl}/v1/checkout/${token}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Checkout session not found or expired.");
        }

        const data = (await response.json()) as CheckoutPayload;

        if (!cancelled) {
          setPayment(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load checkout."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCheckout();

    return () => {
      cancelled = true;
    };
  }, [backendBaseUrl, token]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const amount = useMemo(() => {
    if (!payment) return null;
    return formatMoney(payment.amountCents, payment.currency);
  }, [payment]);

  const gateway = useMemo(() => {
    return gatewayLabel(payment?.gateway);
  }, [payment?.gateway]);

  const expiresIn = useMemo(() => {
    if (!payment) return "--:--";
    const remaining = Math.max(0, new Date(payment.expiresAt).getTime() - now);
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [now, payment]);

  const expired = useMemo(() => {
    if (!payment) return false;
    return new Date(payment.expiresAt).getTime() <= now;
  }, [now, payment]);

  const description =
    payment?.description ?? "Secure payment powered by Stackaura.";

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_16px_48px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-transparent">
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
                <div className="text-xl font-semibold tracking-tight text-white">
                  Stackaura Checkout
                </div>
                <div className="text-sm text-zinc-400">
                  Hosted payment orchestration
                </div>
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-300/85 backdrop-blur-xl">
                  Loading checkout…
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-900/40 bg-rose-950/30 p-5 text-sm text-rose-200">
                  {error}
                </div>
              ) : payment ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300">
                      {payment.merchantName}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300">
                      {gateway}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300">
                      {payment.status}
                    </span>
                  </div>

                  <div className="mt-6 text-sm text-zinc-400">Payment for</div>
                  <div className="mt-2 text-4xl font-semibold tracking-tight">
                    {amount}
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <div className="text-sm text-zinc-300">{description}</div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-zinc-500">
                          Reference
                        </div>
                        <div className="mt-1 font-mono text-sm text-zinc-100">
                          {payment.reference}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-wide text-zinc-500">
                          Customer
                        </div>
                        <div className="mt-1 text-sm text-zinc-100">
                          {payment.customerEmail ?? "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {payment.redirectUrl && !expired ? (
                      <a
                        href={payment.redirectUrl}
                        className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
                      >
                        Continue to {gateway}
                      </a>
                    ) : (
                      <button
                        disabled
                        className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-500"
                      >
                        Checkout unavailable
                      </button>
                    )}

                    <Link
                      href="/checkout/cancel"
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900"
                    >
                      Cancel
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </section>

          <aside className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_16px_48px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Checkout expires in
              </div>
              <div className="mt-3 text-4xl font-semibold tracking-tight">
                {expiresIn}
              </div>
              <div className="mt-2 text-sm text-zinc-400">
                {payment
                  ? `Expires at ${new Date(payment.expiresAt).toLocaleString()}`
                  : "Waiting for checkout session"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Payment summary
              </div>

              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-400">Merchant</span>
                  <span className="text-right text-zinc-100">
                    {payment?.merchantName ?? "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-400">Gateway</span>
                  <span className="text-right text-zinc-100">{gateway}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-400">Status</span>
                  <span className="text-right text-zinc-100">
                    {payment?.status ?? "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-zinc-400">Amount</span>
                  <span className="text-right font-medium text-zinc-100">
                    {amount ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-300/85 backdrop-blur-xl">
              Stackaura securely routes shoppers to the selected payment gateway while preserving merchant-level orchestration and failover controls.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
