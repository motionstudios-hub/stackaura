"use client";

import { useEffect, useState } from "react";
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
} from "../../components/stackaura-ui";

type ReadbackStatus = "loading" | "available" | "error";

type OzowConnectionState = {
  connected: boolean;
  siteCodeMasked: string | null;
  hasApiKey: boolean;
  hasPrivateKey: boolean;
  testMode: boolean;
  updatedAt: string | null;
};

type OzowFormState = {
  siteCode: string;
  apiKey: string;
  privateKey: string;
  testMode: boolean;
};

type YocoConnectionState = {
  connected: boolean;
  hasPublicKey: boolean;
  hasSecretKey: boolean;
  testMode: boolean;
  updatedAt: string | null;
};

type YocoFormState = {
  publicKey: string;
  secretKey: string;
  testMode: boolean;
};

type PaystackConnectionState = {
  connected: boolean;
  hasSecretKey: boolean;
  testMode: boolean;
  updatedAt: string | null;
};

type PaystackFormState = {
  secretKey: string;
  testMode: boolean;
};

type PresenceTone = "success" | "warning" | "muted" | "violet";

const emptyConnection: OzowConnectionState = {
  connected: false,
  siteCodeMasked: null,
  hasApiKey: false,
  hasPrivateKey: false,
  testMode: false,
  updatedAt: null,
};

const emptyYocoConnection: YocoConnectionState = {
  connected: false,
  hasPublicKey: false,
  hasSecretKey: false,
  testMode: false,
  updatedAt: null,
};

const emptyPaystackConnection: PaystackConnectionState = {
  connected: false,
  hasSecretKey: false,
  testMode: false,
  updatedAt: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function pickString(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function parseBooleanLike(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "test", "sandbox"].includes(normalized)) return true;
  if (["false", "0", "no", "live", "production"].includes(normalized)) return false;
  return null;
}

function pickBoolean(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const parsed = parseBooleanLike(data[key]);
    if (parsed !== null) return parsed;
  }

  return null;
}

function formatTimestamp(value: string | null) {
  if (!value) return "No backend timestamp yet";

  try {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  } catch {
    return value;
  }

  return value;
}

function parseConnectionPayload(payload: unknown): OzowConnectionState {
  const record = isRecord(payload)
    ? isRecord(payload.data)
      ? payload.data
      : payload
    : {};

  const hasApiKey =
    pickBoolean(record, ["hasApiKey", "ozowApiKeyConfigured"]) ?? false;
  const hasPrivateKey =
    pickBoolean(record, ["hasPrivateKey", "ozowPrivateKeyConfigured"]) ?? false;
  const siteCodeMasked = pickString(record, [
    "siteCodeMasked",
    "siteCode",
    "ozowSiteCode",
  ]);
  const connected =
    pickBoolean(record, ["connected", "configured", "ozowConfigured"]) ??
    Boolean(siteCodeMasked && hasApiKey && hasPrivateKey);

  return {
    connected,
    siteCodeMasked,
    hasApiKey,
    hasPrivateKey,
    testMode: pickBoolean(record, ["testMode", "ozowTestMode"]) ?? false,
    updatedAt: pickString(record, ["updatedAt", "lastUpdatedAt"]),
  };
}

function parseYocoConnectionPayload(payload: unknown): YocoConnectionState {
  const record = isRecord(payload)
    ? isRecord(payload.data)
      ? payload.data
      : payload
    : {};

  const hasPublicKey = pickBoolean(record, ["hasPublicKey"]) ?? false;
  const hasSecretKey = pickBoolean(record, ["hasSecretKey"]) ?? false;
  const connected =
    pickBoolean(record, ["connected", "configured", "yocoConfigured"]) ??
    (hasPublicKey && hasSecretKey);

  return {
    connected,
    hasPublicKey,
    hasSecretKey,
    testMode: pickBoolean(record, ["testMode"]) ?? false,
    updatedAt: pickString(record, ["updatedAt", "lastUpdatedAt"]),
  };
}

function parsePaystackConnectionPayload(payload: unknown): PaystackConnectionState {
  const record = isRecord(payload)
    ? isRecord(payload.data)
      ? payload.data
      : payload
    : {};

  const hasSecretKey = pickBoolean(record, ["hasSecretKey"]) ?? false;
  const connected =
    pickBoolean(record, ["connected", "configured", "paystackConfigured"]) ??
    hasSecretKey;

  return {
    connected,
    hasSecretKey,
    testMode: pickBoolean(record, ["testMode"]) ?? false,
    updatedAt: pickString(record, ["updatedAt", "lastUpdatedAt"]),
  };
}

function PresenceBadge({
  label,
  value,
  tone,
  statusLabel,
}: {
  label: string;
  value: string;
  tone: PresenceTone;
  statusLabel?: string;
}) {
  return (
    <div className={cn(lightProductInsetPanelClass, "p-4")}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">{label}</div>
          <div className="mt-2 text-sm font-medium text-[#0a2540]">{value}</div>
        </div>
        <span className={lightProductStatusPillClass(tone)}>
          {statusLabel ??
            (tone === "success"
              ? "Saved"
              : tone === "warning"
                ? "Pending"
                : tone === "violet"
                  ? "Active"
                  : "Missing")}
        </span>
      </div>
    </div>
  );
}

export default function GatewayConnectionsPage() {
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [form, setForm] = useState<OzowFormState>({
    siteCode: "",
    apiKey: "",
    privateKey: "",
    testMode: true,
  });
  const [yocoForm, setYocoForm] = useState<YocoFormState>({
    publicKey: "",
    secretKey: "",
    testMode: true,
  });
  const [paystackForm, setPaystackForm] = useState<PaystackFormState>({
    secretKey: "",
    testMode: true,
  });
  const [connection, setConnection] = useState<OzowConnectionState>(emptyConnection);
  const [yocoConnection, setYocoConnection] = useState<YocoConnectionState>(emptyYocoConnection);
  const [paystackConnection, setPaystackConnection] =
    useState<PaystackConnectionState>(emptyPaystackConnection);
  const [readbackStatus, setReadbackStatus] = useState<ReadbackStatus>("loading");
  const [yocoReadbackStatus, setYocoReadbackStatus] = useState<ReadbackStatus>("loading");
  const [paystackReadbackStatus, setPaystackReadbackStatus] = useState<ReadbackStatus>("loading");
  const [loadingMerchant, setLoadingMerchant] = useState(true);
  const [saving, setSaving] = useState(false);
  const [yocoSaving, setYocoSaving] = useState(false);
  const [paystackSaving, setPaystackSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [yocoError, setYocoError] = useState<string | null>(null);
  const [yocoSuccess, setYocoSuccess] = useState<string | null>(null);
  const [paystackError, setPaystackError] = useState<string | null>(null);
  const [paystackSuccess, setPaystackSuccess] = useState<string | null>(null);

  const hasActiveMerchant = Boolean(merchantId);
  const canSave =
    Boolean(merchantId) &&
    Boolean(form.siteCode.trim()) &&
    Boolean(form.apiKey.trim()) &&
    Boolean(form.privateKey.trim());
  const yocoCanSave =
    Boolean(merchantId) &&
    Boolean(yocoForm.publicKey.trim()) &&
    Boolean(yocoForm.secretKey.trim());
  const paystackCanSave = Boolean(merchantId) && Boolean(paystackForm.secretKey.trim());

  async function fetchActiveMerchant() {
    const res = await fetch("/api/active-merchant", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("We couldn't load your selected merchant workspace.");

    const data: unknown = await res.json();
    if (!isRecord(data) || typeof data.merchantId !== "string" || !data.merchantId.trim()) {
      throw new Error("Select a merchant workspace to manage gateway connections.");
    }

    const resolvedMerchantId = data.merchantId.trim();
    setMerchantId(resolvedMerchantId);
    return resolvedMerchantId;
  }

  async function loadConnection(mid?: string) {
    const resolvedMerchantId = mid ?? merchantId ?? (await fetchActiveMerchant());

    setReadbackStatus("loading");
    setError(null);

    try {
      const res = await fetch(`/api/proxy/v1/merchants/${resolvedMerchantId}/gateways/ozow`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "We couldn't load the Ozow connection.");
      }

      const payload: unknown = await res.json();
      const parsed = parseConnectionPayload(payload);
      setConnection(parsed);
      setReadbackStatus("available");
      setForm((current) => ({ ...current, testMode: parsed.testMode }));
      return parsed;
    } catch (loadError: unknown) {
      setReadbackStatus("error");
      throw loadError;
    }
  }

  async function refreshConnection() {
    try {
      await loadConnection();
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, "We couldn't load the Ozow connection."));
    }
  }

  async function loadYocoConnection(mid?: string) {
    const resolvedMerchantId = mid ?? merchantId ?? (await fetchActiveMerchant());

    setYocoReadbackStatus("loading");
    setYocoError(null);

    try {
      const res = await fetch(`/api/proxy/v1/merchants/${resolvedMerchantId}/gateways/yoco`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "We couldn't load the Yoco connection.");
      }

      const payload: unknown = await res.json();
      const parsed = parseYocoConnectionPayload(payload);
      setYocoConnection(parsed);
      setYocoReadbackStatus("available");
      setYocoForm((current) => ({ ...current, testMode: parsed.testMode }));
      return parsed;
    } catch (loadError: unknown) {
      setYocoReadbackStatus("error");
      throw loadError;
    }
  }

  async function refreshYocoConnection() {
    try {
      await loadYocoConnection();
    } catch (loadError: unknown) {
      setYocoError(getErrorMessage(loadError, "We couldn't load the Yoco connection."));
    }
  }

  async function loadPaystackConnection(mid?: string) {
    const resolvedMerchantId = mid ?? merchantId ?? (await fetchActiveMerchant());

    setPaystackReadbackStatus("loading");
    setPaystackError(null);

    try {
      const res = await fetch(`/api/proxy/v1/merchants/${resolvedMerchantId}/gateways/paystack`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "We couldn't load the Paystack connection.");
      }

      const payload: unknown = await res.json();
      const parsed = parsePaystackConnectionPayload(payload);
      setPaystackConnection(parsed);
      setPaystackReadbackStatus("available");
      setPaystackForm((current) => ({ ...current, testMode: parsed.testMode }));
      return parsed;
    } catch (loadError: unknown) {
      setPaystackReadbackStatus("error");
      throw loadError;
    }
  }

  async function refreshPaystackConnection() {
    try {
      await loadPaystackConnection();
    } catch (loadError: unknown) {
      setPaystackError(getErrorMessage(loadError, "We couldn't load the Paystack connection."));
    }
  }

  async function refreshAllConnections() {
    await Promise.allSettled([
      refreshConnection(),
      refreshYocoConnection(),
      refreshPaystackConnection(),
    ]);
  }

  async function saveConnection() {
    if (!merchantId) return;

    const siteCode = form.siteCode.trim();
    const apiKey = form.apiKey.trim();
    const privateKey = form.privateKey.trim();

    if (!siteCode || !apiKey || !privateKey) {
      setError("Site code, API key, and private key are required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/proxy/v1/merchants/${merchantId}/gateways/ozow`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteCode,
          apiKey,
          privateKey,
          testMode: form.testMode,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "We couldn't save the Ozow connection.");
      }

      setForm((current) => ({
        siteCode: "",
        apiKey: "",
        privateKey: "",
        testMode: current.testMode,
      }));

      try {
        const refreshed = await loadConnection(merchantId);
        setForm({
          siteCode: "",
          apiKey: "",
          privateKey: "",
          testMode: refreshed.testMode,
        });
        setSuccess("Ozow connection saved and refreshed.");
      } catch (refreshError: unknown) {
        setSuccess("Ozow connection saved. We couldn't refresh the latest saved state right away.");
        setError(getErrorMessage(refreshError, "We couldn't refresh the Ozow connection."));
      }
    } catch (saveError: unknown) {
      setError(getErrorMessage(saveError, "We couldn't save the Ozow connection."));
    } finally {
      setSaving(false);
    }
  }

  async function saveYocoConnection() {
    if (!merchantId) return;

    const publicKey = yocoForm.publicKey.trim();
    const secretKey = yocoForm.secretKey.trim();

    if (!publicKey || !secretKey) {
      setYocoError("Public key and secret key are required.");
      return;
    }

    setYocoSaving(true);
    setYocoError(null);
    setYocoSuccess(null);

    try {
      const res = await fetch(`/api/proxy/v1/merchants/${merchantId}/gateways/yoco`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey,
          secretKey,
          testMode: yocoForm.testMode,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "We couldn't save the Yoco connection.");
      }

      setYocoForm((current) => ({
        publicKey: "",
        secretKey: "",
        testMode: current.testMode,
      }));

      try {
        const refreshed = await loadYocoConnection(merchantId);
        setYocoForm({
          publicKey: "",
          secretKey: "",
          testMode: refreshed.testMode,
        });
        setYocoSuccess("Yoco connection saved and refreshed.");
      } catch (refreshError: unknown) {
        setYocoSuccess("Yoco connection saved. We couldn't refresh the latest saved state right away.");
        setYocoError(getErrorMessage(refreshError, "We couldn't refresh the Yoco connection."));
      }
    } catch (saveError: unknown) {
      setYocoError(getErrorMessage(saveError, "We couldn't save the Yoco connection."));
    } finally {
      setYocoSaving(false);
    }
  }

  async function savePaystackConnection() {
    if (!merchantId) return;

    const secretKey = paystackForm.secretKey.trim();

    if (!secretKey) {
      setPaystackError("Secret key is required.");
      return;
    }

    setPaystackSaving(true);
    setPaystackError(null);
    setPaystackSuccess(null);

    try {
      const res = await fetch(`/api/proxy/v1/merchants/${merchantId}/gateways/paystack`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secretKey,
          testMode: paystackForm.testMode,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "We couldn't save the Paystack connection.");
      }

      setPaystackForm((current) => ({
        secretKey: "",
        testMode: current.testMode,
      }));

      try {
        const refreshed = await loadPaystackConnection(merchantId);
        setPaystackForm({
          secretKey: "",
          testMode: refreshed.testMode,
        });
        setPaystackSuccess("Paystack connection saved and refreshed.");
      } catch (refreshError: unknown) {
        setPaystackSuccess(
          "Paystack connection saved. We couldn't refresh the latest saved state right away."
        );
        setPaystackError(
          getErrorMessage(refreshError, "We couldn't refresh the Paystack connection.")
        );
      }
    } catch (saveError: unknown) {
      setPaystackError(getErrorMessage(saveError, "We couldn't save the Paystack connection."));
    } finally {
      setPaystackSaving(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingMerchant(true);
        const resolvedMerchantId = await fetchActiveMerchant();
        if (cancelled) return;

        await Promise.allSettled([
          loadConnection(resolvedMerchantId),
          loadYocoConnection(resolvedMerchantId),
          loadPaystackConnection(resolvedMerchantId),
        ]);
      } catch (loadError: unknown) {
        if (cancelled) return;

        setReadbackStatus("error");
        setError(getErrorMessage(loadError, "We couldn't load your gateway connections."));
      } finally {
        if (!cancelled) {
          setLoadingMerchant(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectedCount =
    Number(connection.connected) +
    Number(yocoConnection.connected) +
    Number(paystackConnection.connected);
  const readbackLabel =
    readbackStatus === "available" &&
    yocoReadbackStatus === "available" &&
    paystackReadbackStatus === "available"
      ? "All rails synced"
      : readbackStatus === "error" ||
          yocoReadbackStatus === "error" ||
          paystackReadbackStatus === "error"
        ? "Readback issue"
        : "Checking state";

  const connectionLabel =
    connectedCount === 0
      ? "Setup needed"
      : `${connectedCount} rail${connectedCount === 1 ? "" : "s"} connected`;
  const readbackTone =
    readbackStatus === "available" &&
    yocoReadbackStatus === "available" &&
    paystackReadbackStatus === "available"
      ? "success"
      : readbackStatus === "error" ||
          yocoReadbackStatus === "error" ||
          paystackReadbackStatus === "error"
        ? "warning"
        : "muted";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "relative overflow-hidden p-6 lg:p-7")}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(255,255,255,0.34),transparent_20%),radial-gradient(circle_at_88%_18%,rgba(122,115,255,0.10),transparent_24%)]" />

        <div className="relative">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className={lightProductSectionEyebrowClass}>Gateway connections</div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
                Connect each merchant to Ozow, Yoco, and Paystack from the dashboard.
              </h1>
              <p className={cn(lightProductMutedTextClass, "mt-4 max-w-3xl")}>
                Save merchant-scoped gateway credentials inside the Stackaura dashboard, keep
                secrets masked after submission, and surface connection health for every checkout
                rail in the same light glass workspace the rest of the console uses.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={lightProductStatusPillClass(connection.connected ? "success" : "muted")}>
                {connectionLabel}
              </span>
              <span className={lightProductStatusPillClass(readbackTone)}>{readbackLabel}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_auto]">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Active merchant</div>
              <div className="mt-3 text-sm font-semibold text-[#0a2540]">
                {loadingMerchant
                  ? "Checking workspace..."
                  : merchantId
                    ? "Workspace selected"
                    : "Select a merchant workspace"}
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                Gateway credentials are saved against the currently selected merchant workspace.
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "flex flex-col gap-3 p-3 sm:flex-row sm:items-center")}>
              <button
                className={lightProductCompactGhostButtonClass}
                onClick={() => void refreshAllConnections()}
                disabled={
                  !hasActiveMerchant ||
                  loadingMerchant ||
                  saving ||
                  yocoSaving ||
                  paystackSaving ||
                  readbackStatus === "loading" ||
                  yocoReadbackStatus === "loading" ||
                  paystackReadbackStatus === "loading"
                }
              >
                {readbackStatus === "loading" ||
                yocoReadbackStatus === "loading" ||
                paystackReadbackStatus === "loading"
                  ? "Refreshing..."
                  : "Refresh states"}
              </button>
              <span className={cn(lightProductMutedTextClass, "max-w-sm text-xs")}>
                Refresh checks the latest saved Ozow, Yoco, and Paystack connection state for this
                merchant workspace.
              </span>
            </div>
          </div>
        </div>
      </section>

      {success ? (
        <div className="mt-6 rounded-[24px] border border-emerald-300/70 bg-emerald-50/85 p-4 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-[24px] border border-rose-300/70 bg-rose-50/85 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className={cn(lightProductPanelClass, "overflow-hidden")}>
          <div className="border-b border-white/42 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-[#0a2540]">Ozow connection state</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                  Masked merchant view
                </div>
              </div>
              <span className={lightProductStatusPillClass(connection.connected ? "success" : "muted")}>
                {connection.connected ? "Credentials saved" : "Awaiting setup"}
              </span>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Saved site code</div>
              <div className="mt-3 text-lg font-semibold tracking-tight text-[#0a2540]">
                {connection.siteCodeMasked ?? "No site code on record"}
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                This value comes directly from the backend readback response and stays masked in
                the dashboard.
              </div>
            </div>

            <div className="grid gap-3">
              <PresenceBadge
                label="API key"
                value={connection.hasApiKey ? "Stored and masked" : "Not confirmed yet"}
                tone={connection.hasApiKey ? "success" : connection.connected ? "warning" : "muted"}
              />
              <PresenceBadge
                label="Private key"
                value={connection.hasPrivateKey ? "Stored and masked" : "Missing"}
                tone={connection.hasPrivateKey ? "success" : connection.connected ? "warning" : "muted"}
              />
              <PresenceBadge
                label="Test mode"
                value={
                  !connection.connected
                    ? "No persisted mode reported yet"
                    : connection.testMode
                      ? "Test transactions are enabled"
                      : "Live transactions are enabled"
                }
                tone={!connection.connected ? "warning" : connection.testMode ? "violet" : "success"}
                statusLabel={!connection.connected ? "Pending" : connection.testMode ? "Test" : "Live"}
              />
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Last update</div>
              <div className="mt-2 text-sm text-[#0a2540]">{formatTimestamp(connection.updatedAt)}</div>
              <div className="mt-2 text-sm text-[#425466]">
                Raw secrets are intentionally hidden after save. Enter new values below whenever you
                need to rotate or replace the merchant configuration.
              </div>
            </div>
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "overflow-hidden")}>
          <div className="border-b border-white/42 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-[#0a2540]">Configure Ozow</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                  Merchant gateway credentials
                </div>
              </div>
              <span className={lightProductStatusPillClass("violet")}>Ozow</span>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-medium text-[#0a2540]">Connection behavior</div>
              <div className={cn(lightProductMutedTextClass, "mt-2")}>
                Saving posts the site code, API key, private key, and test mode to the merchant
                gateway API. After a successful save, the dashboard refreshes from the persisted
                backend readback and clears the secret inputs again.
              </div>
            </div>

            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Site code</div>
              <input
                className={lightProductInputClass}
                value={form.siteCode}
                onChange={(event) =>
                  setForm((current) => ({ ...current, siteCode: event.target.value }))
                }
                placeholder="K20-K20-164"
                autoComplete="off"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">API key</div>
              <input
                className={lightProductInputClass}
                type="password"
                value={form.apiKey}
                onChange={(event) =>
                  setForm((current) => ({ ...current, apiKey: event.target.value }))
                }
                placeholder="Enter the merchant Ozow API key"
                autoComplete="new-password"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Private key</div>
              <input
                className={lightProductInputClass}
                type="password"
                value={form.privateKey}
                onChange={(event) =>
                  setForm((current) => ({ ...current, privateKey: event.target.value }))
                }
                placeholder="Enter the merchant Ozow private key"
                autoComplete="new-password"
              />
            </label>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Test mode</div>
                  <div className="mt-2 text-sm font-medium text-[#0a2540]">
                    {form.testMode ? "Enabled" : "Disabled"}
                  </div>
                  <div className={cn(lightProductMutedTextClass, "mt-2 max-w-md")}>
                    Toggle the merchant between Ozow test and live mode before saving this
                    connection.
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={form.testMode}
                  aria-label="Toggle Ozow test mode"
                  onClick={() =>
                    setForm((current) => ({ ...current, testMode: !current.testMode }))
                  }
                  className={cn(
                    "relative inline-flex h-12 w-[84px] shrink-0 items-center rounded-full border p-1 transition duration-200",
                    form.testMode
                      ? "border-[#b8b2ff]/70 bg-[linear-gradient(180deg,rgba(122,115,255,0.18)_0%,rgba(160,233,255,0.16)_100%)] shadow-[0_10px_24px_rgba(99,91,255,0.14)]"
                      : "border-white/45 bg-white/24 shadow-[0_10px_24px_rgba(133,156,180,0.10)]"
                  )}
                >
                  <span className="sr-only">Toggle Ozow test mode</span>
                  <span
                    className={cn(
                      "inline-block h-10 w-10 rounded-full border bg-white shadow-[0_10px_20px_rgba(122,146,168,0.18)] transition-transform duration-200",
                      form.testMode
                        ? "translate-x-8 border-[#b8b2ff]/70"
                        : "translate-x-0 border-white/55"
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/42 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className={cn(lightProductMutedTextClass, "max-w-lg")}>
                Required fields: site code, API key, and private key. Saving updates the current
                merchant only.
              </div>

              <button
                className={cn(lightProductCompactPrimaryButtonClass, "disabled:opacity-60")}
                onClick={saveConnection}
                disabled={!canSave || saving || !hasActiveMerchant}
              >
                {saving ? "Saving..." : "Save Ozow connection"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {yocoSuccess ? (
        <div className="mt-6 rounded-[24px] border border-emerald-300/70 bg-emerald-50/85 p-4 text-sm text-emerald-700">
          {yocoSuccess}
        </div>
      ) : null}

      {yocoError ? (
        <div className="mt-6 rounded-[24px] border border-rose-300/70 bg-rose-50/85 p-4 text-sm text-rose-700">
          {yocoError}
        </div>
      ) : null}

      {paystackSuccess ? (
        <div className="mt-6 rounded-[24px] border border-emerald-300/70 bg-emerald-50/85 p-4 text-sm text-emerald-700">
          {paystackSuccess}
        </div>
      ) : null}

      {paystackError ? (
        <div className="mt-6 rounded-[24px] border border-rose-300/70 bg-rose-50/85 p-4 text-sm text-rose-700">
          {paystackError}
        </div>
      ) : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className={cn(lightProductPanelClass, "overflow-hidden")}>
          <div className="border-b border-white/42 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-[#0a2540]">Yoco connection state</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                  Masked merchant view
                </div>
              </div>
              <span className={lightProductStatusPillClass(yocoConnection.connected ? "success" : "muted")}>
                {yocoConnection.connected ? "Credentials saved" : "Awaiting setup"}
              </span>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Connection state</div>
              <div className="mt-3 text-lg font-semibold tracking-tight text-[#0a2540]">
                {yocoConnection.connected ? "Yoco is connected for this merchant" : "Yoco is not configured yet"}
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                The dashboard only shows persisted presence indicators for Yoco keys after save.
              </div>
            </div>

            <div className="grid gap-3">
              <PresenceBadge
                label="Public key"
                value={yocoConnection.hasPublicKey ? "Stored and masked" : "Not confirmed yet"}
                tone={yocoConnection.hasPublicKey ? "success" : yocoConnection.connected ? "warning" : "muted"}
              />
              <PresenceBadge
                label="Secret key"
                value={yocoConnection.hasSecretKey ? "Stored and masked" : "Missing"}
                tone={yocoConnection.hasSecretKey ? "success" : yocoConnection.connected ? "warning" : "muted"}
              />
              <PresenceBadge
                label="Test mode"
                value={
                  !yocoConnection.connected
                    ? "No persisted mode reported yet"
                    : yocoConnection.testMode
                      ? "Test transactions are enabled"
                      : "Live transactions are enabled"
                }
                tone={!yocoConnection.connected ? "warning" : yocoConnection.testMode ? "violet" : "success"}
                statusLabel={!yocoConnection.connected ? "Pending" : yocoConnection.testMode ? "Test" : "Live"}
              />
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Last update</div>
              <div className="mt-2 text-sm text-[#0a2540]">{formatTimestamp(yocoConnection.updatedAt)}</div>
              <div className="mt-2 text-sm text-[#425466]">
                Raw Yoco keys are intentionally hidden after save. Enter new values below whenever
                you need to rotate or replace the merchant configuration.
              </div>
            </div>
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "overflow-hidden")}>
          <div className="border-b border-white/42 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-[#0a2540]">Configure Yoco</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                  Merchant gateway credentials
                </div>
              </div>
              <span className={lightProductStatusPillClass("violet")}>Yoco</span>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-medium text-[#0a2540]">Connection behavior</div>
              <div className={cn(lightProductMutedTextClass, "mt-2")}>
                Saving posts the public key, secret key, and test mode to the merchant gateway
                API. After a successful save, the dashboard refreshes from the persisted backend
                readback and clears the key inputs again.
              </div>
            </div>

            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Public key</div>
              <input
                className={lightProductInputClass}
                value={yocoForm.publicKey}
                onChange={(event) =>
                  setYocoForm((current) => ({ ...current, publicKey: event.target.value }))
                }
                placeholder="pk_test_..."
                autoComplete="off"
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Secret key</div>
              <input
                className={lightProductInputClass}
                type="password"
                value={yocoForm.secretKey}
                onChange={(event) =>
                  setYocoForm((current) => ({ ...current, secretKey: event.target.value }))
                }
                placeholder="sk_test_..."
                autoComplete="new-password"
              />
            </label>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Test mode</div>
                  <div className="mt-2 text-sm font-medium text-[#0a2540]">
                    {yocoForm.testMode ? "Enabled" : "Disabled"}
                  </div>
                  <div className={cn(lightProductMutedTextClass, "mt-2 max-w-md")}>
                    Toggle the merchant between Yoco test and live mode before saving this
                    connection.
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={yocoForm.testMode}
                  aria-label="Toggle Yoco test mode"
                  onClick={() =>
                    setYocoForm((current) => ({ ...current, testMode: !current.testMode }))
                  }
                  className={cn(
                    "relative inline-flex h-12 w-[84px] shrink-0 items-center rounded-full border p-1 transition duration-200",
                    yocoForm.testMode
                      ? "border-[#b8b2ff]/70 bg-[linear-gradient(180deg,rgba(122,115,255,0.18)_0%,rgba(160,233,255,0.16)_100%)] shadow-[0_10px_24px_rgba(99,91,255,0.14)]"
                      : "border-white/45 bg-white/24 shadow-[0_10px_24px_rgba(133,156,180,0.10)]"
                  )}
                >
                  <span className="sr-only">Toggle Yoco test mode</span>
                  <span
                    className={cn(
                      "inline-block h-10 w-10 rounded-full border bg-white shadow-[0_10px_20px_rgba(122,146,168,0.18)] transition-transform duration-200",
                      yocoForm.testMode
                        ? "translate-x-8 border-[#b8b2ff]/70"
                        : "translate-x-0 border-white/55"
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/42 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className={cn(lightProductMutedTextClass, "max-w-lg")}>
                Required fields: public key and secret key. Saving updates the current merchant
                only.
              </div>

              <button
                className={cn(lightProductCompactPrimaryButtonClass, "disabled:opacity-60")}
                onClick={saveYocoConnection}
                disabled={!yocoCanSave || yocoSaving || !hasActiveMerchant}
              >
                {yocoSaving ? "Saving..." : "Save Yoco connection"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className={cn(lightProductPanelClass, "overflow-hidden")}>
          <div className="border-b border-white/42 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-[#0a2540]">Paystack connection state</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                  Masked merchant view
                </div>
              </div>
              <span
                className={lightProductStatusPillClass(
                  paystackConnection.connected ? "success" : "muted"
                )}
              >
                {paystackConnection.connected ? "Credentials saved" : "Awaiting setup"}
              </span>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Connection state</div>
              <div className="mt-3 text-lg font-semibold tracking-tight text-[#0a2540]">
                {paystackConnection.connected
                  ? "Paystack is connected for this merchant"
                  : "Paystack is not configured yet"}
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                The dashboard only shows persisted presence indicators for the Paystack secret key
                after save.
              </div>
            </div>

            <div className="grid gap-3">
              <PresenceBadge
                label="Secret key"
                value={paystackConnection.hasSecretKey ? "Stored and masked" : "Missing"}
                tone={
                  paystackConnection.hasSecretKey
                    ? "success"
                    : paystackConnection.connected
                      ? "warning"
                      : "muted"
                }
              />
              <PresenceBadge
                label="Test mode"
                value={
                  !paystackConnection.connected
                    ? "No persisted mode reported yet"
                    : paystackConnection.testMode
                      ? "Test transactions are enabled"
                      : "Live transactions are enabled"
                }
                tone={
                  !paystackConnection.connected
                    ? "warning"
                    : paystackConnection.testMode
                      ? "violet"
                      : "success"
                }
                statusLabel={
                  !paystackConnection.connected
                    ? "Pending"
                    : paystackConnection.testMode
                      ? "Test"
                      : "Live"
                }
              />
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Last update</div>
              <div className="mt-2 text-sm text-[#0a2540]">
                {formatTimestamp(paystackConnection.updatedAt)}
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                Raw Paystack secrets are intentionally hidden after save. Enter a new value below
                whenever you need to rotate or replace the merchant configuration.
              </div>
            </div>
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "overflow-hidden")}>
          <div className="border-b border-white/42 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-[#0a2540]">Configure Paystack</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                  Merchant gateway credentials
                </div>
              </div>
              <span className={lightProductStatusPillClass("violet")}>Paystack</span>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-medium text-[#0a2540]">Connection behavior</div>
              <div className={cn(lightProductMutedTextClass, "mt-2")}>
                Saving posts the Paystack secret key and test mode to the merchant gateway API.
                After a successful save, the dashboard refreshes from the persisted backend
                readback and clears the secret input again.
              </div>
            </div>

            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Secret key</div>
              <input
                className={lightProductInputClass}
                type="password"
                value={paystackForm.secretKey}
                onChange={(event) =>
                  setPaystackForm((current) => ({ ...current, secretKey: event.target.value }))
                }
                placeholder="sk_test_..."
                autoComplete="new-password"
              />
            </label>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Test mode</div>
                  <div className="mt-2 text-sm font-medium text-[#0a2540]">
                    {paystackForm.testMode ? "Enabled" : "Disabled"}
                  </div>
                  <div className={cn(lightProductMutedTextClass, "mt-2 max-w-md")}>
                    Toggle the merchant between Paystack test and live mode before saving this
                    connection.
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={paystackForm.testMode}
                  aria-label="Toggle Paystack test mode"
                  onClick={() =>
                    setPaystackForm((current) => ({
                      ...current,
                      testMode: !current.testMode,
                    }))
                  }
                  className={cn(
                    "relative inline-flex h-12 w-[84px] shrink-0 items-center rounded-full border p-1 transition duration-200",
                    paystackForm.testMode
                      ? "border-[#b8b2ff]/70 bg-[linear-gradient(180deg,rgba(122,115,255,0.18)_0%,rgba(160,233,255,0.16)_100%)] shadow-[0_10px_24px_rgba(99,91,255,0.14)]"
                      : "border-white/45 bg-white/24 shadow-[0_10px_24px_rgba(133,156,180,0.10)]"
                  )}
                >
                  <span className="sr-only">Toggle Paystack test mode</span>
                  <span
                    className={cn(
                      "inline-block h-10 w-10 rounded-full border bg-white shadow-[0_10px_20px_rgba(122,146,168,0.18)] transition-transform duration-200",
                      paystackForm.testMode
                        ? "translate-x-8 border-[#b8b2ff]/70"
                        : "translate-x-0 border-white/55"
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/42 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className={cn(lightProductMutedTextClass, "max-w-lg")}>
                Required fields: Paystack secret key. Saving updates the current merchant only.
              </div>

              <button
                className={cn(lightProductCompactPrimaryButtonClass, "disabled:opacity-60")}
                onClick={savePaystackConnection}
                disabled={!paystackCanSave || paystackSaving || !hasActiveMerchant}
              >
                {paystackSaving ? "Saving..." : "Save Paystack connection"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
