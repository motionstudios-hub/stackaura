"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  cn,
  lightProductInsetPanelClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
  publicSubtleSurfaceClass,
} from "../components/stackaura-ui";
import {
  type ApiKeyRow,
  getErrorMessage,
  parseApiKeys,
  resolveEnv,
} from "../lib/api-keys";

type ApiKeyWelcomeProps = {
  merchantId: string | null;
  merchantName: string | null;
  merchantIsActive: boolean;
};

function maskSecret(secret: string) {
  if (secret.length <= 14) return `${secret.slice(0, 6)}••••`;
  return `${secret.slice(0, 10)}${"•".repeat(12)}${secret.slice(-4)}`;
}

function maskedKeyFromRow(row: Pick<ApiKeyRow, "prefix" | "last4">) {
  const prefix = row.prefix ?? "ck_";
  const last4 = row.last4 ?? "????";
  return `${prefix}_${"•".repeat(20)}_${last4}`;
}

function pickInitialKey(rows: ApiKeyRow[]) {
  const activeRows = rows.filter((row) => !row.revokedAt);
  if (activeRows.length === 0) return null;

  return [...activeRows].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return aTime - bTime;
  })[0];
}

export default function ApiKeyWelcome({
  merchantId,
  merchantName,
  merchantIsActive,
}: ApiKeyWelcomeProps) {
  const [visible, setVisible] = useState(false);
  const [visibilityReady, setVisibilityReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ApiKeyRow[]>([]);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!merchantId || !merchantIsActive) {
      setVisibilityReady(true);
      setVisible(false);
      return;
    }

    const storageKey = `stackaura_api_key_welcome_seen:${merchantId}`;
    const hasSeen = window.localStorage.getItem(storageKey) === "1";
    setVisible(!hasSeen);
    setVisibilityReady(true);
    setShowSecret(false);
    setCopied(false);
  }, [merchantId, merchantIsActive]);

  useEffect(() => {
    if (!merchantId || !merchantIsActive || !visibilityReady || !visible) return;

    let cancelled = false;

    async function loadKeys() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/proxy/v1/merchants/${merchantId}/api-keys`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "We couldn't load your API keys right now.");
        }

        const payload: unknown = await res.json();
        const parsed = parseApiKeys(payload);

        if (!cancelled) {
          setItems(parsed.items);
          setRevealedSecret(parsed.revealedSecret);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Unable to load your API keys right now."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadKeys();

    return () => {
      cancelled = true;
    };
  }, [merchantId, merchantIsActive, visibilityReady, visible]);

  const initialKey = useMemo(() => pickInitialKey(items), [items]);
  const fullSecret = initialKey?.secret ?? revealedSecret;
  const hasRevealableSecret = !!fullSecret;
  const keyDisplay = hasRevealableSecret
    ? showSecret && fullSecret
      ? fullSecret
      : maskSecret(fullSecret ?? "")
    : initialKey
      ? maskedKeyFromRow(initialKey)
      : null;
  const authorizationExample = hasRevealableSecret && fullSecret
    ? `Authorization: Bearer ${showSecret ? fullSecret : maskSecret(fullSecret)}`
    : initialKey
      ? `Authorization: Bearer <your_saved_${resolveEnv(initialKey)}_key>`
      : "Authorization: Bearer <your_stackaura_key>";

  async function copyKey() {
    if (!fullSecret) return;

    await navigator.clipboard.writeText(fullSecret);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function dismiss() {
    if (!merchantId) return;
    window.localStorage.setItem(`stackaura_api_key_welcome_seen:${merchantId}`, "1");
    setVisible(false);
  }

  if (!merchantIsActive || !merchantId || !visibilityReady || !visible) {
    return null;
  }

  return (
    <section className={cn(lightProductPanelClass, "relative mt-8 overflow-hidden p-6 lg:p-7")}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(255,255,255,0.32),transparent_20%),radial-gradient(circle_at_88%_20%,rgba(122,115,255,0.10),transparent_24%)]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className={lightProductSectionEyebrowClass}>Welcome to Stackaura</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a2540]">
            Your merchant workspace is active and ready for developer setup
          </h2>
          <p className={cn(lightProductMutedTextClass, "mt-4 max-w-2xl")}>
            {merchantName
              ? `${merchantName} is ready to start building on Stackaura.`
              : "Your merchant account is ready to start building on Stackaura."}{" "}
            Your developer access is ready for the next step.
          </p>
        </div>

        <span className={lightProductStatusPillClass("success")}>Merchant active</span>
      </div>

      <div className="relative mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={cn(lightProductInsetPanelClass, "p-5")}>
          {loading ? (
            <div className="text-sm text-[#425466]">Checking your developer access...</div>
          ) : error ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-300/70 bg-rose-50/85 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/api-keys" className={publicSecondaryButtonClass}>
                  Open developer keys
                </Link>
                <button onClick={dismiss} className={publicPrimaryButtonClass}>
                  Continue to dashboard
                </button>
              </div>
            </div>
          ) : !initialKey ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-300/70 bg-amber-50/85 px-4 py-3 text-sm text-amber-700">
                Your workspace is active, but your first API key is not available yet.
              </div>
              <p className={lightProductMutedTextClass}>
                Open developer keys to confirm whether the initial key has been provisioned or to
                create a new one for your first integration.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/api-keys" className={publicSecondaryButtonClass}>
                  Open developer keys
                </Link>
                <button onClick={dismiss} className={publicPrimaryButtonClass}>
                  Continue to dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={lightProductStatusPillClass("violet")}>
                  {resolveEnv(initialKey).toUpperCase()}
                </span>
                <span className={lightProductStatusPillClass("muted")}>{initialKey.label}</span>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Initial API key</div>
                <div className={cn(publicSubtleSurfaceClass, "mt-3 p-4")}>
                  <code className="break-all text-sm text-[#0a2540]">{keyDisplay}</code>
                </div>
              </div>

              {hasRevealableSecret ? (
                <div className="rounded-2xl border border-amber-300/70 bg-amber-50/85 px-4 py-3 text-sm text-amber-700">
                  This secret may only be shown once. Copy it now and store it in a password manager.
                </div>
              ) : (
                <div className={cn(publicSubtleSurfaceClass, "px-4 py-3 text-sm text-[#425466]")}>
                  The backend returned a masked key only. If the full secret was shown once during
                  activation, use your saved copy or create a new key in Developer Keys.
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                {hasRevealableSecret ? (
                  <>
                    <button onClick={copyKey} className={publicPrimaryButtonClass}>
                      {copied ? "Copied API key" : "Copy API key"}
                    </button>
                    <button onClick={() => setShowSecret((value) => !value)} className={publicSecondaryButtonClass}>
                      {showSecret ? "Hide key" : "Reveal key"}
                    </button>
                  </>
                ) : (
                  <Link href="/dashboard/api-keys" className={publicSecondaryButtonClass}>
                    Open developer keys
                  </Link>
                )}

                <button onClick={dismiss} className={publicSecondaryButtonClass}>
                  Continue to dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={cn(lightProductInsetPanelClass, "p-5")}>
          <div className={lightProductSectionEyebrowClass}>Quick start</div>
          <div className="mt-2 text-xl font-semibold tracking-tight text-[#0a2540]">
            Start calling Stackaura from your backend
          </div>
          <p className={cn(lightProductMutedTextClass, "mt-3")}>
            Use your merchant API key in the `Authorization` header when calling Stackaura from
            your backend services and server-side tooling.
          </p>

          <div className={cn(publicSubtleSurfaceClass, "mt-4 p-4")}>
            <code className="break-all text-sm text-[#0a2540]">{authorizationExample}</code>
          </div>

          <div className={cn(publicSubtleSurfaceClass, "mt-4 px-4 py-3 text-sm leading-6 text-[#425466]")}>
            For production, keep live keys on your server only and store them outside the browser.
          </div>
        </div>
      </div>
    </section>
  );
}
