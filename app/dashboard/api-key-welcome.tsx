"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  cn,
  darkGhostButtonClass,
  darkInsetPanelClass,
  darkMutedTextClass,
  darkPrimaryButtonClass,
  darkRichPanelClass,
  darkSectionEyebrowClass,
  darkStatusPillClass,
  darkSubtleSurfaceClass,
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
          throw new Error(text || `Failed to load keys (${res.status})`);
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
    <section className={cn(darkRichPanelClass, "relative mt-8 overflow-hidden p-6 lg:p-7")}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(160,233,255,0.10),transparent_20%),radial-gradient(circle_at_88%_20%,rgba(122,115,255,0.10),transparent_24%)]" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className={darkSectionEyebrowClass}>Welcome to Stackaura</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Your merchant workspace is active and ready for developer setup
          </h2>
          <p className={cn(darkMutedTextClass, "mt-4 max-w-2xl text-zinc-300")}>
            {merchantName
              ? `${merchantName} is now in the live Stackaura product flow.`
              : "Your merchant account is now in the live Stackaura product flow."}{" "}
            We fetched the initial API-key state so you can move straight into integration.
          </p>
        </div>

        <span className={darkStatusPillClass("success")}>Merchant active</span>
      </div>

      <div className="relative mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={cn(darkInsetPanelClass, "p-5")}>
          {loading ? (
            <div className="text-sm text-zinc-300">Loading your developer access...</div>
          ) : error ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/api-keys" className={darkGhostButtonClass}>
                  Open Developer Keys
                </Link>
                <button onClick={dismiss} className={darkPrimaryButtonClass}>
                  Continue to dashboard
                </button>
              </div>
            </div>
          ) : !initialKey ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Your merchant is active, but no API key was returned yet.
              </div>
              <p className={darkMutedTextClass}>
                Open developer keys to confirm whether the initial key has been provisioned or to
                create a new one for your first integration.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/api-keys" className={darkGhostButtonClass}>
                  Open Developer Keys
                </Link>
                <button onClick={dismiss} className={darkPrimaryButtonClass}>
                  Continue to dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={darkStatusPillClass("violet")}>
                  {resolveEnv(initialKey).toUpperCase()}
                </span>
                <span className={darkStatusPillClass("muted")}>{initialKey.label}</span>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Initial API key</div>
                <div className={cn(darkSubtleSurfaceClass, "mt-3 p-4")}>
                  <code className="break-all text-sm text-zinc-100">{keyDisplay}</code>
                </div>
              </div>

              {hasRevealableSecret ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  This secret may only be shown once. Copy it now and store it in a password manager.
                </div>
              ) : (
                <div className={cn(darkSubtleSurfaceClass, "px-4 py-3 text-sm text-zinc-300")}>
                  The backend returned a masked key only. If the full secret was shown once during
                  activation, use your saved copy or create a new key in Developer Keys.
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                {hasRevealableSecret ? (
                  <>
                    <button onClick={copyKey} className={darkPrimaryButtonClass}>
                      {copied ? "Copied API key" : "Copy API key"}
                    </button>
                    <button
                      onClick={() => setShowSecret((value) => !value)}
                      className={darkGhostButtonClass}
                    >
                      {showSecret ? "Hide key" : "Reveal key"}
                    </button>
                  </>
                ) : (
                  <Link href="/dashboard/api-keys" className={darkGhostButtonClass}>
                    Open Developer Keys
                  </Link>
                )}

                <button onClick={dismiss} className={darkGhostButtonClass}>
                  Continue to dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={cn(darkInsetPanelClass, "p-5")}>
          <div className={darkSectionEyebrowClass}>Quick start</div>
          <div className="mt-2 text-xl font-semibold tracking-tight text-white">
            Start calling Stackaura from your backend
          </div>
          <p className={cn(darkMutedTextClass, "mt-3")}>
            Use your merchant API key in the `Authorization` header when calling Stackaura from
            your server, CLI tools, or local development environment.
          </p>

          <div className={cn(darkSubtleSurfaceClass, "mt-4 p-4")}>
            <code className="break-all text-sm text-zinc-100">{authorizationExample}</code>
          </div>

          <div className="mt-4 rounded-[20px] border border-white/10 bg-black/18 px-4 py-3 text-sm leading-6 text-zinc-400">
            For production, keep live keys on your server only and store them outside the browser.
          </div>
        </div>
      </div>
    </section>
  );
}
