"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { normalizeRedirectPayload, submitRedirect } from "../../lib/payment-redirect";
import { trackMetaEvent } from "../../lib/meta-pixel";
import {
  BrandLockup,
  SoftProductBackground,
  cn,
  lightProductHeroClass,
  lightProductInsetPanelClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
  publicPillClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
} from "../../components/stackaura-ui";

type CheckoutPayload = {
  merchantName: string;
  reference: string;
  baseAmountCents: number;
  amountCents: number;
  chargeAmountCents?: number;
  platformFeeCents: number;
  providerFeeCents?: number | null;
  merchantNetCents?: number;
  currency: string;
  status: string;
  description: string | null;
  customerEmail: string | null;
  expiresAt: string;
  gateway?: string | null;
  currentGateway?: string | null;
  redirectUrl: string | null;
  redirectForm?: {
    action?: string;
    url?: string;
    method?: "GET" | "POST";
    fields?: Record<string, string>;
  } | null;
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
  if (value === "PAYSTACK") return "Paystack";
  if (value === "YOCO") return "Yoco";
  if (value === "OZOW") return "Ozow";
  if (value === "PAYGATE") return "PayGate";
  return value;
}

function formatStatusLabel(status: string | null | undefined) {
  if (!status) return "Pending";

  return status
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusTone(
  status: string | null | undefined
): "success" | "violet" | "warning" | "muted" {
  const value = (status || "").toUpperCase();

  if (value === "SUCCEEDED" || value === "SUCCESS" || value === "COMPLETED") return "success";
  if (value === "FAILED" || value === "ERROR" || value === "CANCELLED" || value === "EXPIRED") {
    return "warning";
  }
  if (value === "CREATED" || value === "INITIATED" || value === "PENDING") return "violet";
  return "muted";
}

export default function HostedCheckoutPage({ params }: PageProps) {
  const { token } = use(params);
  const [payment, setPayment] = useState<CheckoutPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;

    async function loadCheckout() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/checkout/${token}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Checkout session not found or expired.");
        }

        const data = (await response.json()) as CheckoutPayload;

        if (!cancelled) {
          setPayment(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load checkout.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCheckout();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!payment) return;

    trackMetaEvent("ViewContent", {
      value: (payment.chargeAmountCents ?? payment.amountCents) / 100,
      currency: payment.currency || "ZAR",
    });
  }, [payment]);

  const amount = useMemo(() => {
    if (!payment) return null;
    return formatMoney(payment.chargeAmountCents ?? payment.amountCents, payment.currency);
  }, [payment]);

  const baseAmount = useMemo(() => {
    if (!payment) return null;
    return formatMoney(payment.baseAmountCents ?? payment.amountCents, payment.currency);
  }, [payment]);

  const platformFee = useMemo(() => {
    if (!payment) return null;
    return formatMoney(payment.platformFeeCents ?? 0, payment.currency);
  }, [payment]);

  const gateway = useMemo(
    () => gatewayLabel(payment?.currentGateway ?? payment?.gateway),
    [payment?.currentGateway, payment?.gateway]
  );

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

  const description = payment?.description ?? "Secure payment powered by Stackaura.";
  const redirect = useMemo(() => normalizeRedirectPayload(payment), [payment]);
  const statusLabel = formatStatusLabel(payment?.status);
  const primaryActionLabel = expired ? "Checkout expired" : "Checkout unavailable";

  return (
    <SoftProductBackground>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <section className={cn(lightProductHeroClass, "relative overflow-hidden p-6 sm:p-8 lg:p-9")}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(255,255,255,0.42),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(122,115,255,0.14),transparent_24%),radial-gradient(circle_at_78%_74%,rgba(125,211,252,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.12),transparent_24%)]" />

            <div className="relative">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className={lightProductSectionEyebrowClass}>Hosted checkout</div>
                  <div className="mt-4">
                    <BrandLockup compact showTagline={false} />
                  </div>
                </div>

                <Link href="/" className={cn(publicSecondaryButtonClass, "px-5 py-3")}>
                  Back to Stackaura
                </Link>
              </div>

              <div className="mt-8">
                <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                  {payment ? `Complete your payment for ${payment.merchantName}.` : "Complete your payment securely."}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-[#425466] sm:text-lg">
                  Stackaura routes you to the selected payment provider while preserving merchant
                  routing and recovery controls behind the scenes.
                </p>
              </div>

              <div className="mt-8">
                {loading ? (
                  <div className={cn(lightProductInsetPanelClass, "p-5 text-sm text-[#425466]")}>
                    Loading your checkout details...
                  </div>
                ) : error ? (
                  <div className="rounded-[24px] border border-rose-300/70 bg-rose-50/84 p-5 text-sm text-rose-700">
                    {error}
                  </div>
                ) : payment ? (
                  <>
                    <div className="flex flex-wrap gap-3">
                      <span className={publicPillClass}>{payment.merchantName}</span>
                      <span className={publicPillClass}>{gateway}</span>
                      <span className={lightProductStatusPillClass(statusTone(payment.status))}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
                      Total charge
                    </div>
                    <div className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-[#0a2540]">
                      {amount}
                    </div>

                    <div className={cn(lightProductInsetPanelClass, "mt-6 p-5 sm:p-6")}>
                      <p className="text-sm leading-7 text-[#425466]">{description}</p>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">
                            Payment reference
                          </div>
                          <div className="mt-2 break-all font-mono text-sm text-[#0a2540]">
                            {payment.reference}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">
                            Customer
                          </div>
                          <div className="mt-2 text-sm text-[#0a2540]">
                            {payment.customerEmail ?? "Not provided"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[20px] border border-white/48 bg-white/52 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">
                          Amount breakdown
                        </div>
                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[#6b7c93]">Base amount</span>
                            <span className="text-right text-[#0a2540]">{baseAmount ?? "—"}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[#6b7c93]">Stackaura fee</span>
                            <span className="text-right text-[#0a2540]">{platformFee ?? "—"}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3 border-t border-white/48 pt-3">
                            <span className="font-medium text-[#425466]">Total charged</span>
                            <span className="text-right font-semibold text-[#0a2540]">{amount ?? "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      {redirect && !expired ? (
                        <button
                          type="button"
                          className={cn(publicPrimaryButtonClass, "px-5 py-3")}
                          onClick={() => submitRedirect(redirect)}
                        >
                          Continue to {gateway}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className={cn(
                            publicSecondaryButtonClass,
                            "cursor-not-allowed border-white/38 bg-white/18 px-5 py-3 text-[#6b7c93] opacity-70"
                          )}
                        >
                          {primaryActionLabel}
                        </button>
                      )}

                      <Link href="/checkout/cancel" className={cn(publicSecondaryButtonClass, "px-5 py-3")}>
                        Cancel
                      </Link>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className={cn(lightProductPanelClass, "p-6 sm:p-7")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={lightProductSectionEyebrowClass}>Checkout window</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-[#0a2540]">
                    Expires in
                  </div>
                </div>
                <span
                  className={lightProductStatusPillClass(
                    loading ? "muted" : expired ? "warning" : "success"
                  )}
                >
                  {loading ? "Loading" : expired ? "Expired" : "Live"}
                </span>
              </div>

              <div className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-[#0a2540]">
                {expiresIn}
              </div>
              <p className={cn(lightProductMutedTextClass, "mt-3")}>
                {payment
                  ? `This checkout session expires at ${new Date(payment.expiresAt).toLocaleString()}.`
                  : "Waiting for your checkout session details."}
              </p>
            </section>

            <section className={cn(lightProductPanelClass, "p-6 sm:p-7")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={lightProductSectionEyebrowClass}>Payment summary</div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-[#0a2540]">
                    Review before you continue
                  </div>
                </div>
                <span className={lightProductStatusPillClass(statusTone(payment?.status))}>
                  {statusLabel}
                </span>
              </div>

              <div className={cn(lightProductInsetPanelClass, "mt-5 p-5")}>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[#6b7c93]">Merchant</span>
                    <span className="text-right text-[#0a2540]">{payment?.merchantName ?? "—"}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[#6b7c93]">Gateway</span>
                    <span className="text-right text-[#0a2540]">{gateway}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[#6b7c93]">Status</span>
                    <span className="text-right text-[#0a2540]">{statusLabel}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[#6b7c93]">Base amount</span>
                    <span className="text-right text-[#0a2540]">{baseAmount ?? "—"}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[#6b7c93]">Stackaura fee</span>
                    <span className="text-right text-[#0a2540]">{platformFee ?? "—"}</span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[#6b7c93]">Total charged</span>
                    <span className="text-right font-medium text-[#0a2540]">{amount ?? "—"}</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[#6b7c93]">
                Gateway fees are charged separately through the connected payment rail when
                applicable.
              </p>
            </section>

            <section className={cn(lightProductInsetPanelClass, "p-5 sm:p-6")}>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
                Trust and compliance
              </div>
              <p className={cn(lightProductMutedTextClass, "mt-3")}>
                Stackaura provides payment orchestration and infrastructure software. Licensed
                payment providers process and settle payments.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </SoftProductBackground>
  );
}
