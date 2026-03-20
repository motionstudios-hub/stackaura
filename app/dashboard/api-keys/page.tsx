"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  cn,
  lightProductCompactGhostButtonClass,
  lightProductCompactPrimaryButtonClass,
  lightProductHeroClass,
  lightProductInsetPanelClass,
  lightProductInputClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
} from "../../components/stackaura-ui";
import {
  type ApiEnv,
  type ApiKeyRow,
  extractApiKeySecret,
  getErrorMessage,
  isRecord,
  parseApiKeys,
  resolveEnv,
} from "../../lib/api-keys";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function MaskedKey({ prefix, last4 }: { prefix?: string | null; last4?: string | null }) {
  const p = prefix ?? "ck_";
  const l4 = last4 ?? "????";
  return (
    <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
      {p}
      {"_"}
      {"•".repeat(20)}_{l4}
    </code>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "green" | "blue" | "gray" | "red";
}) {
  const styles: Record<typeof tone, string> = {
    green: "border-emerald-300/70 bg-emerald-50/82 text-emerald-700",
    blue: "border-sky-300/70 bg-sky-50/82 text-sky-700",
    gray: "border-white/45 bg-white/22 text-[#425466]",
    red: "border-rose-300/70 bg-rose-50/82 text-rose-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em]",
        styles[tone]
      )}
    >
      {children}
    </span>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#dbe8ee]/70 p-4 backdrop-blur-md" onMouseDown={onClose}>
      <div className={cn(lightProductHeroClass, "w-full max-w-xl")} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/42 px-5 py-4">
          <h2 className="text-lg font-semibold text-[#0a2540]">{title}</h2>
          <button className={lightProductCompactGhostButtonClass} onClick={onClose}>
            Close
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-white/42 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export default function ApiKeysPage() {
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [env, setEnv] = useState<ApiEnv>("test");
  const [rows, setRows] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("primary-backend");
  const [creating, setCreating] = useState(false);

  const [revealOpen, setRevealOpen] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const filteredRows = useMemo(() => rows.filter((r) => resolveEnv(r) === env), [rows, env]);

  async function loadActiveMerchant() {
    const res = await fetch("/api/active-merchant", { credentials: "include" });
    if (!res.ok) throw new Error("We couldn't load your selected merchant workspace.");
    const data: unknown = await res.json();

    if (!isRecord(data) || typeof data.merchantId !== "string" || !data.merchantId) {
      throw new Error("Select a merchant workspace to manage developer keys.");
    }

    setMerchantId(data.merchantId);
    return data.merchantId;
  }

  async function loadKeys(mid?: string) {
    setErr(null);
    setLoading(true);

    try {
      const m = mid ?? merchantId ?? (await loadActiveMerchant());
      const res = await fetch(`/api/proxy/v1/merchants/${m}/api-keys`, {
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "We couldn't load your developer keys.");
      }

      const data: unknown = await res.json();
      setRows(parseApiKeys(data).items);
    } catch (e: unknown) {
      setErr(getErrorMessage(e, "We couldn't load your developer keys."));
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!merchantId) return;
    setCreating(true);
    setErr(null);

    try {
      const res = await fetch(`/api/proxy/v1/merchants/${merchantId}/api-keys`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim(), environment: env }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "We couldn't create the developer key.");
      }

      const created: unknown = await res.json();
      const keyPlain = extractApiKeySecret(created);
      const createdEnv: ApiEnv = env;

      if (keyPlain) {
        setCreatedSecret(keyPlain);
        setRevealOpen(true);
      } else {
        setCreatedSecret(null);
      }

      setCreateOpen(false);
      await loadKeys(merchantId);
      setEnv(createdEnv);
    } catch (e: unknown) {
      setErr(getErrorMessage(e, "We couldn't create the developer key."));
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    if (!merchantId) return;
    if (!confirm("Revoke this API key? This cannot be undone.")) return;

    setErr(null);
    try {
      const res = await fetch(`/api/proxy/v1/merchants/${merchantId}/api-keys/${id}/revoke`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "We couldn't revoke the developer key.");
      }
      await loadKeys(merchantId);
    } catch (e: unknown) {
      setErr(getErrorMessage(e, "We couldn't revoke the developer key."));
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  useEffect(() => {
    (async () => {
      try {
        const mid = await loadActiveMerchant();
        await loadKeys(mid);
      } catch (e: unknown) {
        setErr(getErrorMessage(e, "We couldn't load your merchant workspace."));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "relative overflow-hidden p-6 lg:p-7")}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(255,255,255,0.34),transparent_20%),radial-gradient(circle_at_88%_18%,rgba(122,115,255,0.10),transparent_24%)]" />

        <div className="relative">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className={lightProductSectionEyebrowClass}>Developer keys</div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
                Manage merchant credentials from the same Stackaura visual system.
              </h1>
              <p className={cn(lightProductMutedTextClass, "mt-4 max-w-3xl")}>
                Create, reveal once, copy, and revoke merchant secret keys across test and live
                environments without leaving the authenticated Stackaura product experience.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={lightProductStatusPillClass(env === "test" ? "violet" : "success")}>
                {env === "test" ? "Test mode" : "Live mode"}
              </span>
              <span className={lightProductStatusPillClass("muted")}>
                {filteredRows.length} key{filteredRows.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_auto]">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Selected merchant</div>
              <div className="mt-3 break-all font-mono text-sm text-[#0a2540]">{merchantId ?? "—"}</div>
              <div className="mt-2 text-sm text-[#425466]">
                Keys below are filtered by the active environment and can only be fully revealed at
                creation time if the backend returns the secret.
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "flex flex-col gap-3 p-3 sm:flex-row sm:items-center")}>
              <div className="inline-flex rounded-2xl border border-white/44 bg-white/20 p-1.5 shadow-[0_8px_18px_rgba(133,156,180,0.08)] backdrop-blur-2xl">
                <button
                  className={cn(
                    "min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold transition",
                    env === "test"
                      ? "bg-[linear-gradient(180deg,rgba(122,115,255,0.22)_0%,rgba(160,233,255,0.20)_100%)] text-[#0a2540]"
                      : "text-[#425466] hover:bg-white/24"
                  )}
                  onClick={() => setEnv("test")}
                >
                  Test mode
                </button>
                <button
                  className={cn(
                    "min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold transition",
                    env === "live"
                      ? "bg-[linear-gradient(180deg,rgba(184,255,216,0.54)_0%,rgba(221,249,238,0.68)_100%)] text-[#0a2540]"
                      : "text-[#425466] hover:bg-white/24"
                  )}
                  onClick={() => setEnv("live")}
                >
                  Live mode
                </button>
              </div>

              <button className={publicSecondaryButtonClass} onClick={() => loadKeys()} disabled={loading} title="Refresh">
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <button className={publicPrimaryButtonClass} onClick={() => setCreateOpen(true)} disabled={!merchantId}>
                Create secret key
              </button>
            </div>
          </div>
        </div>
      </section>

      {err ? (
        <div className="mt-6 rounded-2xl border border-rose-300/70 bg-rose-50/85 p-4 text-sm text-rose-700">
          {err}
        </div>
      ) : null}

      <section className={cn(lightProductPanelClass, "mt-6 overflow-hidden")}>
        <div className="flex items-center justify-between border-b border-white/42 px-5 py-4">
          <div>
            <div className="text-base font-semibold text-[#0a2540]">Secret keys</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
              {env.toUpperCase()} environment
            </div>
          </div>
          <Badge tone={env === "test" ? "blue" : "green"}>{env === "test" ? "TEST" : "LIVE"}</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-white/22 text-[#6b7c93]">
              <tr>
                <th className="px-5 py-3">Label</th>
                <th className="px-5 py-3">Key</th>
                <th className="px-5 py-3">Mode</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-5 py-8 text-[#6b7c93]" colSpan={6}>
                    Loading keys...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-12 text-center text-[#6b7c93]" colSpan={6}>
                    No keys yet for <span className="font-medium text-[#0a2540]">{env}</span>. Create one to
                    start your integration.
                  </td>
                </tr>
              ) : (
                filteredRows.map((k) => {
                  const revoked = !!k.revokedAt;

                  return (
                    <tr key={k.id} className="border-t border-white/40 transition hover:bg-white/18">
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#0a2540]">{k.label}</div>
                      </td>

                      <td className="px-5 py-4 text-[#0a2540]">
                        <MaskedKey prefix={k.prefix} last4={k.last4} />
                      </td>

                      <td className="px-5 py-4">
                        <Badge tone={resolveEnv(k) === "test" ? "blue" : "green"}>
                          {resolveEnv(k).toUpperCase()}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        {revoked ? <Badge tone="red">REVOKED</Badge> : <Badge tone="gray">ACTIVE</Badge>}
                      </td>

                      <td className="px-5 py-4 text-[#425466]">{formatDate(k.createdAt)}</td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className={cn(lightProductCompactGhostButtonClass, "px-3 py-1.5 text-xs")}
                            onClick={() => copy(`${k.prefix ?? "ck"}_${k.last4 ?? ""}`)}
                            title="Copies the masked key value shown in this table"
                          >
                            Copy masked key
                          </button>
                          <button
                            className={cn(lightProductCompactGhostButtonClass, "px-3 py-1.5 text-xs disabled:opacity-50")}
                            disabled={revoked}
                            onClick={() => revokeKey(k.id)}
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-white/42 px-5 py-4 text-xs text-[#6b7c93]">
          Tip: Store secrets in a password manager. You won’t be able to reveal them again later.
        </div>
      </section>

      <Modal
        open={createOpen}
        title="Create secret key"
        onClose={() => (creating ? null : setCreateOpen(false))}
        footer={
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6b7c93]">
              Mode: <span className="font-medium text-[#0a2540]">{env.toUpperCase()}</span>
            </span>
            <div className="flex gap-2">
              <button className={lightProductCompactGhostButtonClass} onClick={() => setCreateOpen(false)} disabled={creating}>
                Cancel
              </button>
              <button
                className={cn(lightProductCompactPrimaryButtonClass, "disabled:opacity-60")}
                onClick={createKey}
                disabled={creating || !newLabel.trim()}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <div className={lightProductMutedTextClass}>
            This will generate a new secret key for your current merchant and selected environment.
          </div>

          <label className="block">
            <div className="mb-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Label</div>
            <input
              className={cn(lightProductInputClass, "min-h-[44px] rounded-xl px-3 py-2")}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. checkout-backend, production-server"
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={revealOpen}
        title="Copy your secret key"
        onClose={() => setRevealOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button className={lightProductCompactGhostButtonClass} onClick={() => setRevealOpen(false)}>
              Done
            </button>
            <button
              className={cn(lightProductCompactPrimaryButtonClass, "disabled:opacity-60")}
              onClick={() => createdSecret && copy(createdSecret)}
              disabled={!createdSecret}
            >
              Copy secret
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-300/70 bg-amber-50/85 p-3 text-sm text-amber-700">
            This is the only time you’ll be able to see this secret key.
          </div>

          <div className={cn(lightProductInsetPanelClass, "p-3")}>
            <code className="break-all text-sm text-[#0a2540]" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {createdSecret ?? "Your secret key is not available to display again. Create a new key if you need another copy."}
            </code>
          </div>
        </div>
      </Modal>
    </div>
  );
}
