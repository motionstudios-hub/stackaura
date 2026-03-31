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
  secretKeyMasked: string | null;
  testMode: boolean;
  mode: "test" | "live";
  lastSuccessfulPayment: {
    reference: string;
    amountCents: number;
    currency: string;
    paidAt: string;
  } | null;
  lastWebhookReceived: {
    reference: string | null;
    eventType: string | null;
    providerStatus: string | null;
    receivedAt: string;
  } | null;
  updatedAt: string | null;
};

type PaystackFormState = {
  secretKey: string;
  testMode: boolean;
};

type PaystackValidationState = {
  status: "idle" | "loading" | "success" | "error";
  message: string | null;
  verifiedAt: string | null;
  paymentSessionTimeout: number | null;
};

type PaystackErrorAction = "load" | "save" | "test";

type PaystackPanelIntent = "connect" | "manage" | "rotate";

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
  secretKeyMasked: null,
  testMode: false,
  mode: "live",
  lastSuccessfulPayment: null,
  lastWebhookReceived: null,
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

function extractResponseErrorMessage(rawText: string) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (isRecord(parsed)) {
      return (
        pickString(parsed, ["message", "error"]) ??
        (isRecord(parsed.data) ? pickString(parsed.data, ["message", "error"]) : null) ??
        trimmed
      );
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function mapPaystackUiError(args: {
  status?: number;
  rawMessage?: string | null;
  fallback: string;
}) {
  const normalized = (args.rawMessage ?? "").trim().toLowerCase();

  if (args.status === 404) {
    return "Connection test failed. Try again.";
  }

  if (normalized.includes("invalid key") || normalized.includes("invalid paystack configuration")) {
    return "Invalid secret key";
  }

  if (
    normalized.includes("secret key does not match") ||
    normalized.includes("secretkey is required") ||
    normalized.includes("secret key is required")
  ) {
    return "Invalid secret key";
  }

  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("networkerror") ||
    normalized.includes("load failed") ||
    normalized.includes("fetch")
  ) {
    return "Unable to reach provider";
  }

  if (normalized.includes("merchant access denied")) {
    return "You don’t have access to manage this merchant’s Paystack connection.";
  }

  if (normalized.includes("session") && normalized.includes("expired")) {
    return "Your session expired. Sign in again and retry.";
  }

  return args.fallback;
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

function pickNumber(data: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
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
  const lastSuccessfulPayment = isRecord(record.lastSuccessfulPayment)
    ? {
        reference: pickString(record.lastSuccessfulPayment, ["reference"]) ?? "Unknown reference",
        amountCents: pickNumber(record.lastSuccessfulPayment, ["amountCents"]) ?? 0,
        currency: pickString(record.lastSuccessfulPayment, ["currency"]) ?? "ZAR",
        paidAt: pickString(record.lastSuccessfulPayment, ["paidAt"]) ?? "",
      }
    : null;
  const lastWebhookReceived = isRecord(record.lastWebhookReceived)
    ? {
        reference: pickString(record.lastWebhookReceived, ["reference"]),
        eventType: pickString(record.lastWebhookReceived, ["eventType"]),
        providerStatus: pickString(record.lastWebhookReceived, ["providerStatus"]),
        receivedAt:
          pickString(record.lastWebhookReceived, ["receivedAt"]) ??
          pickString(record.lastWebhookReceived, ["checkedAt"]) ??
          "",
      }
    : null;

  const hasSecretKey = pickBoolean(record, ["hasSecretKey"]) ?? false;
  const connected =
    pickBoolean(record, ["connected", "configured", "paystackConfigured"]) ??
    hasSecretKey;
  const testMode = pickBoolean(record, ["testMode"]) ?? false;

  return {
    connected,
    hasSecretKey,
    secretKeyMasked: pickString(record, ["secretKeyMasked", "maskedSecretKey"]),
    testMode,
    mode:
      (pickString(record, ["mode"])?.toLowerCase() === "test" ? "test" : null) ??
      (testMode ? "test" : "live"),
    lastSuccessfulPayment:
      lastSuccessfulPayment && lastSuccessfulPayment.paidAt ? lastSuccessfulPayment : null,
    lastWebhookReceived:
      lastWebhookReceived && lastWebhookReceived.receivedAt ? lastWebhookReceived : null,
    updatedAt: pickString(record, ["updatedAt", "lastUpdatedAt"]),
  };
}

function detectPaystackModeFromSecretKey(secretKey: string) {
  const normalized = secretKey.trim();
  if (!normalized) return null;
  if (normalized.startsWith("sk_test_")) return true;
  if (normalized.startsWith("sk_live_")) return false;
  return null;
}

function formatCurrencyAmount(amountCents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amountCents / 100);
  } catch {
    return `${currency} ${(amountCents / 100).toFixed(2)}`;
  }
}

function formatRelativeVerificationTimestamp(value: string | null) {
  if (!value) {
    return "Not verified yet";
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const deltaSeconds = Math.round((date.getTime() - Date.now()) / 1000);
    const absoluteSeconds = Math.abs(deltaSeconds);

    if (absoluteSeconds < 90) {
      return "Just now";
    }

    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (absoluteSeconds < 3600) {
      return formatter.format(Math.round(deltaSeconds / 60), "minute");
    }

    if (absoluteSeconds < 86400) {
      return formatter.format(Math.round(deltaSeconds / 3600), "hour");
    }

    if (absoluteSeconds < 604800) {
      return formatter.format(Math.round(deltaSeconds / 86400), "day");
    }
  } catch {
    return value;
  }

  return formatTimestamp(value);
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

function OperationalDetail({
  label,
  title,
  detail,
  tone = "muted",
}: {
  label: string;
  title: string;
  detail: string;
  tone?: PresenceTone;
}) {
  return (
    <div className={cn(lightProductInsetPanelClass, "p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">{label}</div>
          <div className="mt-2 text-sm font-semibold text-[#0a2540]">{title}</div>
          <div className="mt-2 text-sm text-[#425466]">{detail}</div>
        </div>
        <span className={lightProductStatusPillClass(tone)}>
          {tone === "success"
            ? "Available"
            : tone === "warning"
              ? "Attention"
              : tone === "violet"
                ? "Test"
                : "Waiting"}
        </span>
      </div>
    </div>
  );
}

function PaystackErrorState({
  message,
  onRetry,
  retryLabel = "Try again",
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="rounded-[24px] border border-rose-300/70 bg-rose-50/90 p-4 text-sm text-rose-700">
      <div className="font-medium">Action needed</div>
      <div className="mt-2">{message}</div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center rounded-xl border border-rose-300/70 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 animate-spin motion-reduce:animate-none"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M10 3a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
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
  const [paystackTesting, setPaystackTesting] = useState(false);
  const [paystackPanelIntent, setPaystackPanelIntent] = useState<PaystackPanelIntent | null>(null);
  const [paystackValidation, setPaystackValidation] = useState<PaystackValidationState>({
    status: "idle",
    message: null,
    verifiedAt: null,
    paymentSessionTimeout: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [yocoError, setYocoError] = useState<string | null>(null);
  const [yocoSuccess, setYocoSuccess] = useState<string | null>(null);
  const [paystackError, setPaystackError] = useState<string | null>(null);
  const [paystackSuccess, setPaystackSuccess] = useState<string | null>(null);
  const [paystackSuccessVisible, setPaystackSuccessVisible] = useState(false);
  const [paystackErrorAction, setPaystackErrorAction] = useState<PaystackErrorAction | null>(null);

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
  const paystackDetectedMode = detectPaystackModeFromSecretKey(paystackForm.secretKey);
  const paystackModeMismatch =
    paystackDetectedMode !== null && paystackDetectedMode !== paystackForm.testMode;
  const paystackCanSave =
    Boolean(merchantId) && Boolean(paystackForm.secretKey.trim()) && !paystackModeMismatch;
  const paystackPanelOpen = paystackPanelIntent !== null;
  const paystackValidationStorageKey = merchantId
    ? `stackaura:paystack-validation:${merchantId}`
    : null;
  const paystackConnectionStateLabel =
    paystackValidation.status === "loading"
      ? "Testing"
      : paystackValidation.status === "error"
        ? "Retry needed"
        : paystackValidation.status === "success" || paystackConnection.connected
          ? "Connected"
          : "Not connected";
  const paystackConnectionTone: PresenceTone =
    paystackValidation.status === "loading"
      ? "violet"
      : paystackValidation.status === "error"
        ? "warning"
        : paystackValidation.status === "success" || paystackConnection.connected
          ? "success"
          : "muted";

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
    setPaystackErrorAction(null);

    try {
      const res = await fetch(`/api/proxy/v1/merchants/${resolvedMerchantId}/gateways/paystack`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const rawMessage = extractResponseErrorMessage(text);
        const userMessage = mapPaystackUiError({
          status: res.status,
          rawMessage,
          fallback: "We couldn’t load the Paystack connection right now.",
        });
        console.error("Paystack load connection failed", {
          status: res.status,
          rawMessage,
          merchantId: resolvedMerchantId,
        });
        throw new Error(userMessage);
      }

      const payload: unknown = await res.json();
      const parsed = parsePaystackConnectionPayload(payload);
      setPaystackConnection(parsed);
      setPaystackReadbackStatus("available");
      setPaystackForm((current) => ({ ...current, testMode: parsed.testMode }));
      if (!parsed.connected) {
        setPaystackValidation({
          status: "idle",
          message: null,
          verifiedAt: null,
          paymentSessionTimeout: null,
        });
      }
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
      console.error("Paystack refresh connection failed", loadError);
      setPaystackError(
        getErrorMessage(loadError, "We couldn’t load the Paystack connection right now.")
      );
      setPaystackErrorAction("load");
    }
  }

  function openPaystackPanel(intent: PaystackPanelIntent) {
    setPaystackPanelIntent(intent);
    setPaystackError(null);
    setPaystackSuccess(null);
    setPaystackErrorAction(null);
    setPaystackForm((current) => ({
      ...current,
      secretKey: "",
      testMode: paystackConnection.connected ? paystackConnection.testMode : current.testMode,
    }));
  }

  function closePaystackPanel() {
    setPaystackPanelIntent(null);
  }

  async function testPaystackConnection(options?: { silentSuccess?: boolean }) {
    if (!merchantId) return false;

    setPaystackTesting(true);
    setPaystackError(null);
    setPaystackErrorAction(null);
    setPaystackSuccess(null);
    setPaystackValidation({
      status: "loading",
      message: "Testing connection…",
      verifiedAt: null,
      paymentSessionTimeout: null,
    });

    try {
      const res = await fetch(
        `/api/proxy/v1/merchants/${merchantId}/gateways/paystack/test-connection`,
        {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const rawMessage = extractResponseErrorMessage(text);
        const userMessage = mapPaystackUiError({
          status: res.status,
          rawMessage,
          fallback: "Connection test failed. Try again.",
        });
        console.error("Paystack test connection failed", {
          status: res.status,
          rawMessage,
          merchantId,
        });
        throw new Error(userMessage);
      }

      const payload: unknown = await res.json();
      const record = isRecord(payload) ? (isRecord(payload.data) ? payload.data : payload) : {};
      const verifiedAt = pickString(record, ["verifiedAt"]) ?? new Date().toISOString();
      const message = "Connection verified successfully";
      const paymentSessionTimeout =
        pickNumber(record, ["paymentSessionTimeout", "payment_session_timeout"]) ?? null;

      setPaystackValidation({
        status: "success",
        message,
        verifiedAt,
        paymentSessionTimeout,
      });
      if (options?.silentSuccess) {
        setPaystackSuccess("Connection verified successfully");
      }
      return true;
    } catch (testError: unknown) {
      console.error("Paystack test connection error", testError);
      const message = getErrorMessage(testError, "Connection test failed. Try again.");
      setPaystackValidation({
        status: "error",
        message,
        verifiedAt: null,
        paymentSessionTimeout: null,
      });
      setPaystackError(message);
      setPaystackErrorAction("test");
      return false;
    } finally {
      setPaystackTesting(false);
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
      setPaystackErrorAction("save");
      return;
    }

    if (paystackModeMismatch) {
      setPaystackError("The Paystack key prefix does not match the selected mode.");
      setPaystackErrorAction("save");
      return;
    }

    setPaystackSaving(true);
    setPaystackError(null);
    setPaystackSuccess(null);
    setPaystackErrorAction(null);
    setPaystackValidation({
      status: "idle",
      message: null,
      verifiedAt: null,
      paymentSessionTimeout: null,
    });

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
        const rawMessage = extractResponseErrorMessage(text);
        const userMessage = mapPaystackUiError({
          status: res.status,
          rawMessage,
          fallback: "We couldn’t save the Paystack connection right now.",
        });
        console.error("Paystack save connection failed", {
          status: res.status,
          rawMessage,
          merchantId,
        });
        throw new Error(userMessage);
      }

      setPaystackForm((current) => ({
        secretKey: "",
        testMode: current.testMode,
      }));

      let refreshedConnection: PaystackConnectionState | null = null;
      try {
        const refreshed = await loadPaystackConnection(merchantId);
        refreshedConnection = refreshed;
        setPaystackForm({
          secretKey: "",
          testMode: refreshed.testMode,
        });
      } catch (refreshError: unknown) {
        console.error("Paystack refresh after save failed", refreshError);
        setPaystackError(
          getErrorMessage(refreshError, "We couldn’t refresh the Paystack connection right now.")
        );
        setPaystackErrorAction("load");
      }

      const verified = await testPaystackConnection({ silentSuccess: true });
      if (verified) {
        setPaystackSuccess(
          `Paystack connected. ${refreshedConnection?.testMode ? "Test" : "Live"} credentials verified just now.`
        );
        setPaystackPanelIntent("manage");
      }
    } catch (saveError: unknown) {
      console.error("Paystack save connection error", saveError);
      setPaystackError(
        getErrorMessage(saveError, "We couldn’t save the Paystack connection right now.")
      );
      setPaystackErrorAction("save");
    } finally {
      setPaystackSaving(false);
    }
  }

  useEffect(() => {
    const detectedMode = detectPaystackModeFromSecretKey(paystackForm.secretKey);
    if (detectedMode === null) {
      return;
    }

    setPaystackForm((current) =>
      current.testMode === detectedMode ? current : { ...current, testMode: detectedMode }
    );
  }, [paystackForm.secretKey]);

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

  useEffect(() => {
    if (!paystackValidationStorageKey) return;
    if (!paystackConnection.connected) {
      try {
        window.localStorage.removeItem(paystackValidationStorageKey);
      } catch {
        // ignore localStorage failures
      }
      return;
    }

    if (paystackValidation.status !== "idle" || paystackValidation.verifiedAt) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(paystackValidationStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { verifiedAt?: string };
      if (typeof parsed.verifiedAt !== "string" || !parsed.verifiedAt.trim()) return;
      setPaystackValidation((current) =>
        current.status !== "idle" || current.verifiedAt
          ? current
          : {
              status: "success",
              message: "Connection verified successfully",
              verifiedAt: parsed.verifiedAt,
              paymentSessionTimeout: null,
            }
      );
    } catch {
      // ignore localStorage failures
    }
  }, [
    paystackConnection.connected,
    paystackValidation.status,
    paystackValidation.verifiedAt,
    paystackValidationStorageKey,
  ]);

  useEffect(() => {
    if (!paystackValidationStorageKey) return;

    if (paystackValidation.status === "success" && paystackValidation.verifiedAt) {
      try {
        window.localStorage.setItem(
          paystackValidationStorageKey,
          JSON.stringify({ verifiedAt: paystackValidation.verifiedAt })
        );
      } catch {
        // ignore localStorage failures
      }
    }
  }, [
    paystackValidation.status,
    paystackValidation.verifiedAt,
    paystackValidationStorageKey,
  ]);

  useEffect(() => {
    if (!paystackSuccess) return;

    setPaystackSuccessVisible(true);
    const fadeTimer = window.setTimeout(() => {
      setPaystackSuccessVisible(false);
    }, 2000);
    const clearTimer = window.setTimeout(() => {
      setPaystackSuccess(null);
    }, 2250);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(clearTimer);
    };
  }, [paystackSuccess]);

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

      <section id="ozow" className="scroll-mt-28 mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
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

      <section id="yoco" className="scroll-mt-28 mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
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

      {paystackSuccess ? (
        <div
          className={cn(
            "mt-6 rounded-[24px] border border-emerald-300/70 bg-emerald-50/85 p-4 text-sm text-emerald-700 transition-all duration-200 ease-out motion-reduce:transition-none",
            paystackSuccessVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-1 opacity-0"
          )}
        >
          <div className="font-medium">{paystackSuccess}</div>
          <div className="mt-2 opacity-80">
            Last verified: {formatRelativeVerificationTimestamp(paystackValidation.verifiedAt)}
          </div>
        </div>
      ) : null}

      {paystackError ? (
        <div className="mt-6">
          <PaystackErrorState
            message={paystackError}
            onRetry={
              paystackErrorAction === "test"
                ? () => void testPaystackConnection()
                : paystackErrorAction === "load"
                  ? () => void refreshPaystackConnection()
                  : paystackErrorAction === "save"
                    ? () => void savePaystackConnection()
                    : undefined
            }
            retryLabel={
              paystackErrorAction === "test"
                ? "Retry connection test"
                : paystackErrorAction === "save"
                  ? "Retry save"
                  : "Retry"
            }
          />
        </div>
      ) : null}

      <section id="paystack" className="scroll-mt-28 mt-6 grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <div className={cn(lightProductPanelClass, "overflow-hidden")}>
          <div className="border-b border-white/42 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-[#0a2540]">Paystack connection state</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                  Operational merchant view
                </div>
              </div>
              <span
                className={cn(
                  lightProductStatusPillClass(paystackConnectionTone),
                  "transition-all duration-200 ease-out motion-reduce:transition-none"
                )}
              >
                {paystackValidation.status === "error"
                  ? "Action needed"
                  : paystackConnectionStateLabel}
              </span>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Connection state</div>
              <div className="mt-3 text-lg font-semibold tracking-tight text-[#0a2540]">
                {!paystackConnection.connected
                  ? "Connect Paystack"
                  : paystackValidation.status === "loading"
                    ? "Testing connection"
                    : paystackValidation.status === "error"
                    ? "Validation failed"
                    : "Paystack connected"}
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                {!paystackConnection.connected
                  ? "Accept card payments via Paystack through Stackaura."
                  : paystackValidation.status === "loading"
                    ? "We’re verifying the saved Paystack credential right now."
                  : paystackValidation.status === "error"
                    ? "The saved secret needs attention before you rely on Paystack in production."
                    : paystackConnection.testMode
                      ? "Test transactions enabled."
                      : "Live transactions enabled."}
              </div>
            </div>

            <div className="grid gap-3">
              <PresenceBadge
                label="Secret stored"
                value={
                  paystackConnection.hasSecretKey
                    ? paystackConnection.secretKeyMasked ?? "Secret stored and masked"
                    : "No Paystack secret saved yet"
                }
                tone={paystackConnection.hasSecretKey ? "success" : "muted"}
                statusLabel={paystackConnection.hasSecretKey ? "Masked" : "Missing"}
              />
              <PresenceBadge
                label="Mode"
                value={
                  !paystackConnection.connected
                    ? "Select test or live mode while connecting"
                    : paystackConnection.testMode
                      ? "Test transactions enabled"
                      : "Live transactions enabled"
                }
                tone={!paystackConnection.connected ? "muted" : paystackConnection.testMode ? "violet" : "success"}
                statusLabel={!paystackConnection.connected ? "Setup" : paystackConnection.testMode ? "Test" : "Live"}
              />
            </div>

            <OperationalDetail
              label="Last verified"
              title={
                paystackValidation.status === "loading"
                  ? "Testing connection…"
                  : paystackValidation.status === "success"
                  ? formatRelativeVerificationTimestamp(paystackValidation.verifiedAt)
                  : "Run test connection"
              }
              detail={
                paystackValidation.status === "loading"
                  ? "We’re verifying the saved credential now."
                  : paystackValidation.status === "success"
                  ? paystackValidation.message ??
                    (paystackValidation.paymentSessionTimeout
                      ? `Payment session timeout: ${paystackValidation.paymentSessionTimeout} minutes.`
                      : "Saved credentials verified successfully.")
                  : paystackValidation.status === "error"
                    ? paystackValidation.message ?? "The saved credentials need attention."
                    : "Use Test connection after saving to verify the stored secret."
              }
              tone={
                paystackValidation.status === "loading"
                  ? "violet"
                  : paystackValidation.status === "success"
                  ? "success"
                  : paystackValidation.status === "error"
                    ? "warning"
                    : "muted"
              }
            />

            <OperationalDetail
              label="Last successful payment"
              title={
                paystackConnection.lastSuccessfulPayment
                  ? `${paystackConnection.lastSuccessfulPayment.reference} · ${formatCurrencyAmount(
                      paystackConnection.lastSuccessfulPayment.amountCents,
                      paystackConnection.lastSuccessfulPayment.currency
                    )}`
                  : "No successful Paystack payment yet"
              }
              detail={
                paystackConnection.lastSuccessfulPayment
                  ? `Paid ${formatTimestamp(paystackConnection.lastSuccessfulPayment.paidAt)}`
                  : "This will appear after the first successful Paystack transaction."
              }
              tone={paystackConnection.lastSuccessfulPayment ? "success" : "muted"}
            />

            <OperationalDetail
              label="Last webhook received"
              title={
                paystackConnection.lastWebhookReceived
                  ? `${paystackConnection.lastWebhookReceived.eventType ?? "Webhook event"}${paystackConnection.lastWebhookReceived.reference ? ` · ${paystackConnection.lastWebhookReceived.reference}` : ""}`
                  : "No Paystack webhook received yet"
              }
              detail={
                paystackConnection.lastWebhookReceived
                  ? `${paystackConnection.lastWebhookReceived.providerStatus ?? "Processed"} · ${formatTimestamp(
                      paystackConnection.lastWebhookReceived.receivedAt
                    )}`
                  : "Webhook activity appears here once Stackaura receives a Paystack event."
              }
              tone={paystackConnection.lastWebhookReceived ? "success" : "muted"}
            />

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Last updated</div>
              <div className="mt-2 text-sm font-medium text-[#0a2540]">
                {formatTimestamp(paystackConnection.updatedAt)}
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                Stackaura keeps the Paystack secret masked after save. Use Rotate secret any time
                you need to replace the stored credential.
              </div>
            </div>
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "overflow-hidden")}>
          <div className="border-b border-white/42 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-[#0a2540]">
                  {paystackConnection.connected ? "Manage Paystack" : "Connect Paystack"}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                  Merchant gateway onboarding
                </div>
              </div>
              <span className={lightProductStatusPillClass("violet")}>Paystack</span>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-medium text-[#0a2540]">
                {paystackConnection.connected ? "Connected and ready to manage" : "Connect card payments"}
              </div>
              <div className={cn(lightProductMutedTextClass, "mt-2")}>
                {paystackConnection.connected
                  ? "Manage the stored secret, re-verify the connection, or rotate the Paystack credential without exposing the current value."
                  : "Paste the merchant's Paystack secret key to enable card payments through Stackaura."}
              </div>
            </div>

            {paystackValidation.status === "loading" || paystackValidation.status === "success" ? (
              <div
                className={cn(
                  "rounded-[24px] border p-4 text-sm transition-all duration-200 ease-out motion-reduce:transition-none",
                  paystackValidation.status === "loading"
                    ? "border-[#d7d2ff] bg-[#f4f2ff] text-[#5146df]"
                    : "",
                  paystackValidation.status === "success"
                    ? "border-emerald-300/70 bg-emerald-50/85 text-emerald-700"
                    : ""
                )}
              >
                <div className="font-medium">
                  {paystackValidation.status === "loading" ? (
                    <span className="inline-flex items-center gap-2">
                      <SpinnerIcon />
                      Testing connection…
                    </span>
                  ) : (
                    "Connection verified successfully"
                  )}
                </div>
                <div className="mt-2">
                  {paystackValidation.status === "loading"
                    ? "We’re verifying the stored Paystack secret now."
                    : paystackValidation.message}
                </div>
                {paystackValidation.status === "success" ? (
                  <div className="mt-2 opacity-80">
                    Last verified: {formatRelativeVerificationTimestamp(paystackValidation.verifiedAt)}
                  </div>
                ) : null}
              </div>
            ) : null}

            {!paystackConnection.connected ? (
              <div className={cn(lightProductInsetPanelClass, "p-4 transition-all duration-200 ease-out motion-reduce:transition-none")}>
                <div className="text-sm font-medium text-[#0a2540]">
                  Connect your Paystack account to start accepting payments
                </div>
                <div className={cn(lightProductMutedTextClass, "mt-2 max-w-md")}>
                  Add the merchant&apos;s Paystack secret key once, then verify it through Stackaura
                  before sending live card traffic.
                </div>
                <div className="mt-4">
                  <button
                    className={cn(lightProductCompactPrimaryButtonClass, "disabled:opacity-60")}
                    onClick={() => openPaystackPanel("connect")}
                    disabled={!hasActiveMerchant}
                  >
                    Connect Paystack
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "flex flex-col gap-3 transition-opacity duration-200 ease-out motion-reduce:transition-none sm:flex-row sm:flex-wrap sm:items-center",
                  paystackTesting && "opacity-90"
                )}
              >
                <button
                  className={cn(lightProductCompactPrimaryButtonClass, "disabled:opacity-60")}
                  onClick={() => openPaystackPanel("manage")}
                  disabled={!hasActiveMerchant}
                >
                  Manage connection
                </button>
                <button
                  className={cn(lightProductCompactGhostButtonClass, "disabled:opacity-60")}
                  onClick={() => void testPaystackConnection()}
                  disabled={!hasActiveMerchant || paystackTesting || paystackSaving}
                >
                  <span className="inline-flex items-center gap-2">
                    {paystackTesting ? <SpinnerIcon /> : null}
                    {paystackTesting ? "Testing connection…" : "Test connection"}
                  </span>
                </button>
                <button
                  className={cn(lightProductCompactGhostButtonClass, "disabled:opacity-60")}
                  onClick={() => openPaystackPanel("rotate")}
                  disabled={!hasActiveMerchant}
                >
                  Rotate secret
                </button>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className={cn(lightProductInsetPanelClass, "p-4")}>
                <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Step 1</div>
                <div className="mt-2 text-sm font-semibold text-[#0a2540]">Paste secret key</div>
                <div className="mt-2 text-sm text-[#425466]">
                  Use the merchant&apos;s Paystack secret key only. Stackaura keeps it masked after
                  save.
                </div>
              </div>
              <div className={cn(lightProductInsetPanelClass, "p-4")}>
                <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Step 2</div>
                <div className="mt-2 text-sm font-semibold text-[#0a2540]">Confirm mode</div>
                <div className="mt-2 text-sm text-[#425466]">
                  Stackaura detects test or live mode from the key prefix and keeps the backend
                  validation unchanged.
                </div>
              </div>
              <div className={cn(lightProductInsetPanelClass, "p-4")}>
                <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Step 3</div>
                <div className="mt-2 text-sm font-semibold text-[#0a2540]">Verify connection</div>
                <div className="mt-2 text-sm text-[#425466]">
                  Run Test connection to verify the saved credential without creating a real
                  payment.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {paystackPanelOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#0a2540]/26 backdrop-blur-[2px]">
          <div className="flex h-full w-full max-w-[560px] flex-col border-l border-white/45 bg-[#eef5fb] shadow-[0_20px_60px_rgba(10,37,64,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/42 px-6 py-5">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">
                  {paystackPanelIntent === "connect"
                    ? "Step 1 of 3"
                    : paystackPanelIntent === "rotate"
                      ? "Rotate secret"
                      : "Manage connection"}
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                  {paystackPanelIntent === "connect"
                    ? "Connect Paystack"
                    : paystackPanelIntent === "rotate"
                      ? "Rotate Paystack secret"
                      : "Manage Paystack connection"}
                </div>
                <div className={cn(lightProductMutedTextClass, "mt-2 max-w-md")}>
                  {paystackPanelIntent === "connect"
                    ? "Paste your Paystack secret key to enable transactions through Stackaura."
                    : paystackPanelIntent === "rotate"
                      ? "Paste a new Paystack secret key to replace the currently stored one."
                      : "Review the mode, re-verify the connection, or paste a new secret to update the saved Paystack credentials."}
                </div>
              </div>

              <button
                type="button"
                onClick={closePaystackPanel}
                className={cn(lightProductCompactGhostButtonClass, "min-h-[40px] px-3")}
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 p-6">
              <div className={cn(lightProductInsetPanelClass, "p-4")}>
                <div className="text-sm font-medium text-[#0a2540]">Current connection</div>
                <div className="mt-2 text-sm text-[#425466]">
                  {paystackConnection.connected
                    ? `${paystackConnection.testMode ? "Test" : "Live"} mode is active. ${
                        paystackConnection.secretKeyMasked ?? "Secret stored and masked."
                      }`
                    : "No Paystack secret has been saved for this merchant yet."}
                </div>
              </div>

              <div className={cn(lightProductInsetPanelClass, "p-4")}>
                <div className="text-sm font-medium text-[#0a2540]">Step 1 · Secret key</div>
                <div className={cn(lightProductMutedTextClass, "mt-2")}>
                  Test keys start with <span className="font-semibold text-[#0a2540]">sk_test_</span>.
                  Live keys start with <span className="font-semibold text-[#0a2540]">sk_live_</span>.
                </div>

                <label className="mt-4 block">
                  <div className="mb-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                    Paystack secret key
                  </div>
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

                {paystackDetectedMode !== null ? (
                  <div className="mt-3 rounded-2xl border border-[#7a73ff]/18 bg-white/45 px-3 py-2 text-sm text-[#425466]">
                    Detected{" "}
                    <span className="font-semibold text-[#0a2540]">
                      {paystackDetectedMode ? "test" : "live"}
                    </span>{" "}
                    key from prefix.
                  </div>
                ) : null}
              </div>

              <div className={cn(lightProductInsetPanelClass, "p-4")}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium text-[#0a2540]">Step 2 · Mode</div>
                    <div className={cn(lightProductMutedTextClass, "mt-2 max-w-md")}>
                      Stackaura keeps the mode aligned with the Paystack key prefix. Change it only
                      if you are pasting a different key.
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

                <div className="mt-4 rounded-2xl border border-white/45 bg-white/34 px-4 py-3 text-sm text-[#425466]">
                  Mode selected:{" "}
                  <span className="font-semibold text-[#0a2540]">
                    {paystackForm.testMode ? "Test" : "Live"}
                  </span>
                </div>

                {paystackModeMismatch ? (
                  <div className="mt-3 rounded-2xl border border-rose-300/70 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
                    The Paystack key prefix does not match the selected mode. Update the key or the
                    toggle before you continue.
                  </div>
                ) : null}
              </div>

              <div className={cn(lightProductInsetPanelClass, "p-4")}>
                <div className="text-sm font-medium text-[#0a2540]">Step 3 · Save and verify</div>
                <div className={cn(lightProductMutedTextClass, "mt-2")}>
                  Saving updates the merchant-scoped Paystack secret. Stackaura then verifies the
                  saved credential without initiating a real payment.
                </div>
                <div className="mt-3 text-sm text-[#425466]">
                  {paystackConnection.connected
                    ? "The current secret remains masked after save. Paste a new key only when you need to update or rotate it."
                    : "Once verified, Paystack becomes available immediately in the hosted checkout and routing flow."}
                </div>
              </div>

              {paystackError ? (
                <PaystackErrorState
                  message={paystackError}
                  onRetry={
                    paystackErrorAction === "test"
                      ? () => void testPaystackConnection()
                      : paystackErrorAction === "load"
                        ? () => void refreshPaystackConnection()
                        : paystackErrorAction === "save"
                          ? () => void savePaystackConnection()
                          : undefined
                  }
                  retryLabel={
                    paystackErrorAction === "test"
                      ? "Retry connection test"
                      : paystackErrorAction === "save"
                        ? "Retry save"
                        : "Retry"
                  }
                />
              ) : null}

              {paystackSuccess ? (
                <div
                  className={cn(
                    "rounded-[24px] border border-emerald-300/70 bg-emerald-50/85 p-4 text-sm text-emerald-700 transition-all duration-200 ease-out motion-reduce:transition-none",
                    paystackSuccessVisible
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-1 opacity-0"
                  )}
                >
                  <div className="font-medium">{paystackSuccess}</div>
                  <div className="mt-2 opacity-80">
                    Last verified: {formatRelativeVerificationTimestamp(paystackValidation.verifiedAt)}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-white/42 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className={cn(lightProductMutedTextClass, "max-w-sm")}>
                {paystackPanelIntent === "rotate"
                  ? "Rotate secret stores the new key and keeps the previous value hidden."
                  : "The secret key stays backend-only and masked after save."}
              </div>

              <div
                className={cn(
                  "flex flex-col gap-3 transition-opacity duration-200 ease-out motion-reduce:transition-none sm:flex-row",
                  paystackTesting && "opacity-90"
                )}
              >
                <button
                  className={cn(lightProductCompactGhostButtonClass, "disabled:opacity-60")}
                  onClick={closePaystackPanel}
                  disabled={paystackSaving}
                >
                  Cancel
                </button>
                <button
                  className={cn(lightProductCompactPrimaryButtonClass, "disabled:opacity-60")}
                  onClick={savePaystackConnection}
                  disabled={!paystackCanSave || paystackSaving || !hasActiveMerchant}
                >
                  <span className="inline-flex items-center gap-2">
                    {paystackSaving ? <SpinnerIcon /> : null}
                    {paystackSaving
                      ? "Verifying connection..."
                      : paystackPanelIntent === "rotate"
                        ? "Rotate secret"
                        : paystackConnection.connected
                          ? "Save connection"
                          : "Connect Paystack"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
