"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BrandLockup,
  SoftProductBackground,
  cn,
  lightProductCompactGhostButtonClass,
  lightProductHeroClass,
  lightProductInsetPanelClass,
  lightProductInputClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
  publicPillClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
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
  const [apiKey, setApiKey] = useState("");
  const [amount, setAmount] = useState("25.00");
  const [currency, setCurrency] = useState("ZAR");
  const [customerEmail, setCustomerEmail] = useState("");
  const [description, setDescription] = useState("Stackaura payment link");
  const [gateway, setGateway] = useState("PAYFAST");
  const [activeMerchantId, setActiveMerchantId] = useState<string | null>(null);
  const [loadingMerchantContext, setLoadingMerchantContext] = useState(true);

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

  const usingMerchantApiKey = Boolean(apiKey.trim());
  const canCreate = loading ? false : amountCents > 0 && (usingMerchantApiKey || Boolean(activeMerchantId));

  useEffect(() => {
    let cancelled = false;

    async function loadActiveMerchant() {
      try {
        const response = await fetch("/api/active-merchant", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("We couldn't load your selected merchant workspace.");
        }

        const data: unknown = await response.json();
        const merchantId =
          typeof data === "object" &&
          data !== null &&
          "merchantId" in data &&
          typeof data.merchantId === "string" &&
          data.merchantId.trim()
            ? data.merchantId.trim()
            : null;

        if (!cancelled) {
          setActiveMerchantId(merchantId);
        }
      } catch {
        if (!cancelled) {
          setActiveMerchantId(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingMerchantContext(false);
        }
      }
    }

    void loadActiveMerchant();

    return () => {
      cancelled = true;
    };
  }, []);

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
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (usingMerchantApiKey) {
        headers.Authorization = `Bearer ${apiKey.trim()}`;
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({
          amountCents,
          currency,
          customerEmail: customerEmail || undefined,
          description,
          gateway,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof data.message === "string"
            ? data.message
            : "We couldn't create the payment link."
        );
      }

      setResult(data as CreatePaymentResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't create the payment link.");
    } finally {
      setLoading(false);
    }
  }

  const resolutionSummary = usingMerchantApiKey
    ? "This payment link will use the API key you entered, so that merchant account remains the source of truth for routing and gateway settings."
    : loadingMerchantContext
      ? "Checking the merchant workspace selected in your dashboard..."
      : activeMerchantId
        ? "No API key was added, so Stackaura will use the merchant workspace selected in your dashboard and its saved gateway configuration."
        : "Add an API key or select a merchant workspace before creating a payment link.";

  const resolutionTone = usingMerchantApiKey
    ? "violet"
    : loadingMerchantContext
      ? "muted"
      : activeMerchantId
        ? "success"
        : "warning";

  const resolutionLabel = usingMerchantApiKey
    ? "Direct API access"
    : loadingMerchantContext
      ? "Checking workspace"
      : activeMerchantId
        ? "Workspace ready"
        : "Setup needed";

  const resolutionSource = usingMerchantApiKey
    ? "Provided API key"
    : activeMerchantId
      ? "Selected merchant workspace"
      : "Unavailable";

  return (
    <SoftProductBackground>
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-5 pb-10 sm:px-6 sm:pt-6 lg:px-10">
        <section className={cn(lightProductHeroClass, "relative overflow-hidden p-6 lg:p-8")}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.40),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(122,115,255,0.16),transparent_24%),radial-gradient(circle_at_76%_72%,rgba(125,211,252,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.16),transparent_22%)]" />

          <div className="relative grid gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
            <div className="min-w-0">
              <div className={lightProductSectionEyebrowClass}>Payment links</div>
              <div className="mt-4">
                <BrandLockup />
              </div>

              <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                Create hosted checkout links with the right merchant setup.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#425466] sm:text-lg">
                Generate a shareable Stackaura checkout link with either the selected merchant
                workspace or a supplied API key, then send it across the channels where your
                customers already buy.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/dashboard" className={publicPrimaryButtonClass}>
                  Back to dashboard
                </Link>
                <Link href="/docs" className={publicSecondaryButtonClass}>
                  View docs
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Hosted checkout",
                  "Merchant-aware routing",
                  "Shareable links",
                  "One integration, multiple gateways",
                ].map((item) => (
                  <span key={item} className={publicPillClass}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-5 sm:p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold tracking-tight text-[#0a2540]">
                    Payment setup
                  </div>
                  <p className={cn(lightProductMutedTextClass, "mt-2 max-w-xl")}>
                    Payment links inherit the merchant setup used to create the payment, so routing
                    and saved gateway configuration stay consistent.
                  </p>
                </div>

                <span className={lightProductStatusPillClass(resolutionTone)}>
                  {resolutionLabel}
                </span>
              </div>

              <div className={cn("mt-5 p-4", lightProductPanelClass)}>
                <p className={lightProductMutedTextClass}>{resolutionSummary}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className={cn("p-4", lightProductInsetPanelClass)}>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">
                      Resolution source
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[#0a2540]">
                      {resolutionSource}
                    </div>
                  </div>

                  <div className={cn("p-4", lightProductInsetPanelClass)}>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">
                      Workspace status
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[#0a2540]">
                      {loadingMerchantContext
                        ? "Checking workspace..."
                        : activeMerchantId
                          ? "Workspace selected"
                          : "No workspace selected"}
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn("mt-4 p-4", lightProductPanelClass)}>
                <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">
                  Compliance clarity
                </div>
                <p className={cn(lightProductMutedTextClass, "mt-3")}>
                  Stackaura provides payment orchestration and infrastructure software. Licensed
                  payment providers process and settle payments after checkout.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <section className={cn(lightProductPanelClass, "overflow-hidden p-6 lg:p-7")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className={lightProductSectionEyebrowClass}>Create payment link</div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0a2540]">
                  Build a hosted payment link
                </h2>
                <p className={cn(lightProductMutedTextClass, "mt-3 max-w-2xl")}>
                  Create a shareable checkout experience tied to the right merchant setup.
                </p>
              </div>

              <span className={lightProductStatusPillClass(canCreate ? "success" : "muted")}>
                {canCreate ? "Ready to create" : "Setup needed"}
              </span>
            </div>

            <form onSubmit={createLink} className="mt-8 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
                  API key
                </span>
                <input
                  className={cn(lightProductInputClass, "font-mono text-xs")}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Optional when an active merchant is selected"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
                    Amount
                  </span>
                  <input
                    className={lightProductInputClass}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25.00"
                    required
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
                    Currency
                  </span>
                  <select
                    className={lightProductInputClass}
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
                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
                    Customer email
                  </span>
                  <input
                    className={lightProductInputClass}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
                    Preferred gateway
                  </span>
                  <select
                    className={lightProductInputClass}
                    value={gateway}
                    onChange={(e) => setGateway(e.target.value)}
                  >
                    <option value="PAYFAST">PayFast</option>
                    <option value="OZOW">Ozow</option>
                    <option value="PAYGATE">PayGate</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
                  Description
                </span>
                <input
                  className={lightProductInputClass}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product / invoice description"
                />
              </label>

              <button
                type="submit"
                disabled={!canCreate}
                className={cn(
                  publicPrimaryButtonClass,
                  "w-full disabled:cursor-not-allowed disabled:opacity-70"
                )}
              >
                {loading ? "Creating link..." : "Create payment link"}
              </button>
            </form>

            {error ? (
              <div className="mt-4 rounded-[22px] border border-rose-300/70 bg-rose-50/84 p-4 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </section>

          <div className="space-y-6">
            <section className={cn(lightProductPanelClass, "overflow-hidden p-6 lg:p-7")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className={lightProductSectionEyebrowClass}>Sharing panel</div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0a2540]">
                    Share one link everywhere
                  </h2>
                  <p className={cn(lightProductMutedTextClass, "mt-3")}>
                    Create one checkout link, then distribute it across the channels where the
                    merchant sells.
                  </p>
                </div>

                <span className={lightProductStatusPillClass(result ? "success" : "muted")}>
                  {result ? "Link ready" : "Awaiting payment link"}
                </span>
              </div>

              {!result ? (
                <div className={cn("mt-6 p-5", lightProductInsetPanelClass)}>
                  <p className={lightProductMutedTextClass}>
                    Create a payment link to unlock sharing across WhatsApp, Instagram, and email
                    without leaving Stackaura.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className={cn("p-5", lightProductInsetPanelClass)}>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">
                      Checkout URL
                    </div>
                    <div className="mt-3 break-all rounded-[20px] border border-white/42 bg-white/34 px-4 py-3 font-mono text-sm text-[#0a2540]">
                      {result.checkoutUrl}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => copyValue(result.checkoutUrl, "checkout")}
                        className={lightProductCompactGhostButtonClass}
                      >
                        {copied === "checkout" ? "Copied" : "Copy link"}
                      </button>

                      <a
                        href={result.checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(publicPrimaryButtonClass, "px-5 py-3")}
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
                      className={cn(lightProductInsetPanelClass, "p-4 transition hover:border-white/55")}
                    >
                      <div className="font-semibold text-[#0a2540]">WhatsApp</div>
                      <div className="mt-2 text-sm leading-6 text-[#425466]">
                        Open WhatsApp with a ready-to-send payment message.
                      </div>
                    </a>

                    <button
                      type="button"
                      onClick={() => copyValue(shareMessage, "instagram")}
                      className={cn(
                        lightProductInsetPanelClass,
                        "p-4 text-left transition hover:border-white/55"
                      )}
                    >
                      <div className="font-semibold text-[#0a2540]">Instagram DM</div>
                      <div className="mt-2 text-sm leading-6 text-[#425466]">
                        Copy the share message, then paste it into Instagram DM.
                      </div>
                      <div className="mt-3 text-xs uppercase tracking-[0.16em] text-[#5146df]">
                        {copied === "instagram" ? "Copied message" : "Copy message"}
                      </div>
                    </button>

                    <a
                      href={emailHref}
                      className={cn(lightProductInsetPanelClass, "p-4 transition hover:border-white/55")}
                    >
                      <div className="font-semibold text-[#0a2540]">Email</div>
                      <div className="mt-2 text-sm leading-6 text-[#425466]">
                        Open your email client with a ready-to-send checkout message.
                      </div>
                    </a>
                  </div>

                  <div className={cn("p-5", lightProductInsetPanelClass)}>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">
                      Payment details
                    </div>

                    <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                      <div>
                        <div className="text-[#6b7c93]">Status</div>
                        <div className="mt-1 text-[#0a2540]">{result.status}</div>
                      </div>

                      <div>
                        <div className="text-[#6b7c93]">Amount</div>
                        <div className="mt-1 text-[#0a2540]">
                          {result.currency} {centsToAmountString(result.amountCents)}
                        </div>
                      </div>

                      <div>
                        <div className="text-[#6b7c93]">Customer</div>
                        <div className="mt-1 text-[#0a2540]">
                          {result.customerEmail || "Not provided"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[#6b7c93]">Description</div>
                        <div className="mt-1 text-[#0a2540]">
                          {result.description || "Stackaura payment link"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </SoftProductBackground>
  );
}
