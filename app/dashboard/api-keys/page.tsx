"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cn,
  darkCompactGhostButtonClass,
  darkCompactPrimaryButtonClass,
  darkGhostButtonClass,
  darkInputClass,
  darkPrimaryButtonClass,
  darkSubtleSurfaceClass,
  darkSurfaceClass,
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

function Badge({ children, tone }: { children: React.ReactNode; tone: "green" | "blue" | "gray" | "red" }) {
  const styles: Record<typeof tone, string> = {
    green: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
    blue: "bg-sky-500/15 text-sky-200 border-sky-500/30",
    gray: "bg-white/5 text-white/70 border-white/10",
    red: "bg-rose-500/15 text-rose-200 border-rose-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
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
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={onClose}
    >
      <div
        className={cn(darkSurfaceClass, "w-full max-w-xl rounded-[28px]")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className={cn(darkCompactGhostButtonClass, "text-white/80 shadow-none")}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-white/10 px-5 py-4">{footer}</div> : null}
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

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("local-dev");
  const [creating, setCreating] = useState(false);

  // Reveal secret (only shown once after create)
  const [revealOpen, setRevealOpen] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const filteredRows = useMemo(() => rows.filter((r) => resolveEnv(r) === env), [rows, env]);

  async function loadActiveMerchant() {
    // If you already have a helper endpoint, use it.
    // Common pattern: GET /api/active-merchant => { merchantId }
    const res = await fetch("/api/active-merchant", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load active merchant");
    const data: unknown = await res.json();

    if (!isRecord(data) || typeof data.merchantId !== "string" || !data.merchantId) {
      throw new Error("No active merchant selected");
    }

    setMerchantId(data.merchantId);
    return data.merchantId;
  }

  async function loadKeys(mid?: string) {
    setErr(null);
    setLoading(true);
    try {
      const m = mid ?? merchantId ?? (await loadActiveMerchant());
      // Assumed endpoint: GET /v1/merchants/:merchantId/api-keys
      const res = await fetch(`/api/proxy/v1/merchants/${m}/api-keys`, {
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Failed to load keys (${res.status})`);
      }
      const data: unknown = await res.json();
      setRows(parseApiKeys(data).items);
    } catch (e: unknown) {
      setErr(getErrorMessage(e, "Failed to load keys"));
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!merchantId) return;
    setCreating(true);
    setErr(null);
    try {
      // Assumed endpoint: POST /v1/merchants/:merchantId/api-keys
      // Returns: { id, label, environment, prefix, last4, createdAt, keyPlain }
      const res = await fetch(`/api/proxy/v1/merchants/${merchantId}/api-keys`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim(), environment: env }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Failed to create key (${res.status})`);
      }
      const created: unknown = await res.json();
      const keyPlain = extractApiKeySecret(created);
      const createdEnv: ApiEnv = env;
      if (keyPlain) {
        setCreatedSecret(keyPlain);
        setRevealOpen(true);
      } else {
        // If your backend doesn't return the secret, you can still show a toast
        setCreatedSecret(null);
      }

      setCreateOpen(false);
      await loadKeys(merchantId);
      setEnv(createdEnv);
    } catch (e: unknown) {
      setErr(getErrorMessage(e, "Failed to create key"));
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    if (!merchantId) return;
    if (!confirm("Revoke this API key? This cannot be undone.")) return;

    setErr(null);
    try {
      // Assumed endpoint: POST /v1/merchants/:merchantId/api-keys/:apiKeyId/revoke
      const res = await fetch(`/api/proxy/v1/merchants/${merchantId}/api-keys/${id}/revoke`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Failed to revoke key (${res.status})`);
      }
      await loadKeys(merchantId);
    } catch (e: unknown) {
      setErr(getErrorMessage(e, "Failed to revoke key"));
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
        setErr(getErrorMessage(e, "Failed to load merchant"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API keys</h1>
          <p className="mt-1 text-sm text-white/60">
            Create and manage secret keys for your merchants. Secrets are only shown once.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex w-full rounded-xl border border-white/10 bg-white/5 p-1 sm:w-auto">
            <button
              className={cn(
                "min-h-[44px] flex-1 rounded-lg px-3 py-1.5 text-sm sm:flex-none",
                env === "test" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
              )}
              onClick={() => setEnv("test")}
            >
              Test mode
            </button>
            <button
              className={cn(
                "min-h-[44px] flex-1 rounded-lg px-3 py-1.5 text-sm sm:flex-none",
                env === "live" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
              )}
              onClick={() => setEnv("live")}
            >
              Live mode
            </button>
          </div>

          <button
            className={cn(darkGhostButtonClass, "min-h-[44px] rounded-xl px-4 py-2 text-sm")}
            onClick={() => loadKeys()}
            disabled={loading}
            title="Refresh"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>

          <button
            className={cn(darkPrimaryButtonClass, "min-h-[44px] rounded-xl px-4 py-2 text-sm")}
            onClick={() => setCreateOpen(true)}
            disabled={!merchantId}
          >
            + Create secret key
          </button>
        </div>
      </div>

      {/* Top strip */}
      <div className={cn(darkSubtleSurfaceClass, "mb-6 p-4")}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-white/70">
            Merchant:{" "}
            <span className="font-mono text-white/90">{merchantId ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={env === "test" ? "blue" : "green"}>
              {env === "test" ? "TEST" : "LIVE"}
            </Badge>
            <span className="text-xs text-white/50">Keys below are filtered by environment.</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {err ? (
        <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {err}
        </div>
      ) : null}

      {/* Table */}
      <div className={cn(darkSurfaceClass, "overflow-hidden rounded-[28px]")}>
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Secret keys</h2>
            <span className="text-xs text-white/50">{filteredRows.length} keys</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-white/60">
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
                  <td className="px-5 py-4 text-white/60" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-white/60" colSpan={6}>
                    No keys yet for <span className="font-medium">{env}</span>. Create one to start.
                  </td>
                </tr>
              ) : (
                filteredRows.map((k) => {
                  const revoked = !!k.revokedAt;
                  return (
                    <tr key={k.id} className="border-t border-white/10">
                      <td className="px-5 py-4">
                        <div className="font-medium">{k.label}</div>
                        <div className="text-xs text-white/50">{k.id}</div>
                      </td>

                      <td className="px-5 py-4">
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

                      <td className="px-5 py-4 text-white/70">{formatDate(k.createdAt)}</td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            className={cn(darkCompactGhostButtonClass, "px-3 py-1.5 text-xs shadow-none")}
                            onClick={() => copy(`${k.prefix ?? "ck"}_${k.last4 ?? ""}`)}
                            title="Copies a masked identifier (full secret is not retrievable)"
                          >
                            Copy ID
                          </button>
                          <button
                            className={cn(
                              darkCompactGhostButtonClass,
                              "px-3 py-1.5 text-xs shadow-none disabled:opacity-50"
                            )}
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

        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/50">
          Tip: Store secrets in a password manager. You won’t be able to reveal them again later.
        </div>
      </div>

      {/* Create modal */}
      <Modal
        open={createOpen}
        title="Create secret key"
        onClose={() => (creating ? null : setCreateOpen(false))}
        footer={
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">
              Mode:{" "}
              <span className="font-medium text-white/80">{env.toUpperCase()}</span>
            </span>
            <div className="flex gap-2">
              <button
                className={cn(darkCompactGhostButtonClass, "text-white/80 shadow-none")}
                onClick={() => setCreateOpen(false)}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                className={cn(darkCompactPrimaryButtonClass, "disabled:opacity-60")}
                onClick={createKey}
                disabled={creating || !newLabel.trim()}
              >
                {creating ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-white/70">
            This will generate a new secret key for your current merchant.
          </div>

          <label className="block">
            <div className="mb-1 text-xs text-white/60">Label</div>
            <input
              className={cn(darkInputClass, "min-h-[44px] rounded-xl px-3 py-2")}
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. local-dev, staging, production-backend"
            />
          </label>
        </div>
      </Modal>

      {/* Reveal secret modal */}
      <Modal
        open={revealOpen}
        title="Copy your secret key"
        onClose={() => setRevealOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              className={cn(darkCompactGhostButtonClass, "text-white/80 shadow-none")}
              onClick={() => setRevealOpen(false)}
            >
              Done
            </button>
            <button
              className={cn(darkCompactPrimaryButtonClass, "disabled:opacity-60")}
              onClick={() => createdSecret && copy(createdSecret)}
              disabled={!createdSecret}
            >
              Copy secret
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            This is the only time you’ll be able to see this secret key.
          </div>

          <div className={cn(darkSubtleSurfaceClass, "p-3")}>
            <code className="break-all text-sm" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {createdSecret ?? "Your backend did not return a secret. Update the create response to include keyPlain."}
            </code>
          </div>
        </div>
      </Modal>
    </div>
  );
}
