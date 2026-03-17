"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
    <section className="mt-8 rounded-[28px] border border-white/10 bg-[#08152f]/60 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.24em] text-[#A0E9FF]">
            Welcome to Stackaura
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Your merchant workspace is active
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {merchantName
              ? `${merchantName} is ready for developer setup.`
              : "Your merchant account is ready for developer setup."}{" "}
            We fetched the initial API-key state so you can move straight into integration.
          </p>
        </div>

        <div className="rounded-full border border-emerald-900/40 bg-emerald-950/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-300">
          Merchant active
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
          {loading ? (
            <div className="text-sm text-zinc-300">
              Loading your developer access…
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard/api-keys"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                >
                  Open Developer Keys
                </Link>
                <button
                  onClick={dismiss}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-[#A0E9FF] px-4 py-3 text-sm font-medium text-[#02142b] transition hover:brightness-105"
                >
                  Continue to dashboard
                </button>
              </div>
            </div>
          ) : !initialKey ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Your merchant is active, but no API key was returned yet.
              </div>
              <p className="text-sm leading-6 text-zinc-300">
                Open developer keys to confirm whether the initial key has been provisioned or to
                create a new one for your first integration.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard/api-keys"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                >
                  Open Developer Keys
                </Link>
                <button
                  onClick={dismiss}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-[#A0E9FF] px-4 py-3 text-sm font-medium text-[#02142b] transition hover:brightness-105"
                >
                  Continue to dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
                  {resolveEnv(initialKey).toUpperCase()}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                  {initialKey.label}
                </span>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">Initial API key</div>
                <div className="mt-2 rounded-2xl border border-white/10 bg-[#07142f]/80 p-4">
                  <code className="break-all text-sm text-zinc-100">{keyDisplay}</code>
                </div>
              </div>

              {hasRevealableSecret ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  This secret may only be shown once. Copy it now and store it in a password manager.
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  The backend returned a masked key only. If the full secret was shown once during
                  activation, use your saved copy or create a new key in Developer Keys.
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                {hasRevealableSecret ? (
                  <>
                    <button
                      onClick={copyKey}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-[#A0E9FF] px-4 py-3 text-sm font-medium text-[#02142b] transition hover:brightness-105"
                    >
                      {copied ? "Copied API key" : "Copy API key"}
                    </button>
                    <button
                      onClick={() => setShowSecret((value) => !value)}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                    >
                      {showSecret ? "Hide key" : "Reveal key"}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/dashboard/api-keys"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                  >
                    Open Developer Keys
                  </Link>
                )}

                <button
                  onClick={dismiss}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                >
                  Continue to dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
          <div className="text-sm font-semibold text-white">Quick start</div>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Use your merchant API key in the `Authorization` header when calling Stackaura from
            your backend or local development tools.
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#07142f]/80 p-4">
            <code className="break-all text-sm text-zinc-100">{authorizationExample}</code>
          </div>

          <div className="mt-4 text-sm leading-6 text-zinc-400">
            For production, keep live keys on your server only and store them outside the browser.
          </div>
        </div>
      </div>
    </section>
  );
}
