"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type ShopifyBridge = {
  idToken: () => Promise<string>;
};

type StorefrontActivationState = {
  storefrontActivationObserved: boolean;
  storefrontActive: boolean;
  storefrontActivatedAt: string | null;
  storefrontLastSeenAt: string | null;
  storefrontActivationSource: string | null;
  storefrontLastPageUrl: string | null;
};

type SupportAgentWidgetRuntimeConfig = {
  shopDomain: string;
  enabled: boolean;
  greetingMessage: string;
  supportEmail: string | null;
  escalationEnabled: boolean;
  escalationLabel: string;
  themePreference: "light" | "dark" | "auto";
  positionPreference: "bottom-right" | "bottom-left";
  deploymentStatus:
    | "not_deployed"
    | "ready"
    | "theme_extension_pending"
    | "live_on_storefront";
};

type ShopifyStatusPayload = {
  ok: boolean;
  connection: {
    connected: boolean;
    shopDomain: string;
    installedAt: string | null;
    updatedAt: string | null;
    scopes: string[];
    authMode: string;
    lastSuccessfulRefreshAt: string | null;
    appUrl: string | null;
  };
  store: {
    name: string | null;
    myshopifyDomain: string | null;
    planName: string | null;
  };
  products: {
    count: number;
    items: Array<{
      id: string;
      title: string;
      handle: string;
      status: string;
      updatedAt: string | null;
    }>;
  };
  webhooks: {
    topics: string[];
    callbackUrl: string | null;
    registrationStatus: string | null;
    healthy: boolean;
  };
  supportAgent: {
    enabled: boolean;
    configurationSaved: boolean;
    storefrontStatus:
      | "not_deployed"
      | "configured"
      | "ready"
      | "live_on_storefront";
  } & StorefrontActivationState;
  debug?: {
    stepReached?: string;
    upstreamEndpoint?: string | null;
    upstreamStatus?: number | null;
    upstreamErrorBody?: unknown;
  };
};

type SupportConversationSummary = {
  sessionId: string;
  startedAt: string;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  lastUserMessage: string | null;
  lastAssistantMessage: string | null;
  escalationOffered: boolean;
  supportEmailShown: boolean;
  messageCount: number;
};

type SupportConversationsPayload = {
  ok: boolean;
  shopDomain: string;
  conversations: SupportConversationSummary[];
};

type SupportConversationDetailPayload = {
  ok: boolean;
  shopDomain: string;
  conversation: SupportConversationSummary & {
    messages: Array<{
      id: string;
      role: "user" | "assistant";
      message: string;
      pageUrl: string | null;
      createdAt: string;
    }>;
  };
};

type WebhookRegistrationPayload = {
  ok: boolean;
  callbackUrl: string;
  attemptedAt: string;
  result: string;
  healthy: boolean;
  registrations: Array<{
    topic: string;
    created: boolean;
    address: string;
  }>;
};

type SupportAgentPayload = {
  ok: boolean;
  supportAgent: {
    id: string | null;
    shopDomain: string;
    enabled: boolean;
    widgetStatus: "not_deployed" | "configured" | "ready" | "live_on_storefront";
    widgetStatusLabel: string;
    configurationSaved: boolean;
    greetingMessage: string;
    supportEmail: string;
    escalationEnabled: boolean;
    escalationLabel: string;
    themePreference: "light" | "dark" | "auto";
    positionPreference: "bottom-right" | "bottom-left";
    storefrontActivationObserved: boolean;
    storefrontActive: boolean;
    storefrontActivatedAt: string | null;
    storefrontLastSeenAt: string | null;
    storefrontActivationSource: string | null;
    storefrontLastPageUrl: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    deploymentMessage: string;
  };
};

type SupportAgentDeploymentPayload = {
  ok: boolean;
  ready: boolean;
  missingRequirements: string[];
  widgetStatus:
    | "not_configured"
    | "configured"
    | "ready_for_deployment"
    | "live_on_storefront";
  shopDomain: string;
  activation: StorefrontActivationState;
  widgetConfig: SupportAgentWidgetRuntimeConfig;
};

type SupportAgentWidgetConfigPayload = {
  ok: boolean;
  deploymentMethod: "theme_app_extension";
  extensionHandle: string;
  extensionScaffoldReady: boolean;
  widgetShellReady: boolean;
  conversationRuntimeReady: boolean;
  extensionConnected: boolean;
  storefrontChatUrl: string | null;
  storefrontActivationObserved: boolean;
  storefrontActivatedAt: string | null;
  storefrontLastSeenAt: string | null;
  storefrontActivationSource: string | null;
  storefrontLastPageUrl: string | null;
  storefrontInteractionPathStatus:
    | "not_ready"
    | "ready_pending_theme_activation"
    | "live";
  currentDeploymentPhase:
    | "configuration_incomplete"
    | "theme_activation_required"
    | "live_on_storefront";
  nextRequiredStep: string;
  themeEditorUrl: string | null;
  widgetConfig: SupportAgentWidgetRuntimeConfig;
};

type SupportAgentFormState = {
  enabled: boolean;
  greetingMessage: string;
  supportEmail: string;
  escalationEnabled: boolean;
  escalationLabel: string;
  themePreference: "light" | "dark" | "auto";
  positionPreference: "bottom-right" | "bottom-left";
};

type DebugState = {
  currentUrl: string;
  shopParam: string;
  hostParam: string;
  appBridgeInitStatus: "idle" | "started" | "succeeded" | "failed";
  appBridgeInitSucceeded: boolean;
  sessionTokenStarted: boolean;
  sessionTokenSucceeded: boolean;
  sessionTokenStatus: "idle" | "started" | "succeeded" | "failed";
  backendStatus: "idle" | "started" | "succeeded" | "failed";
  lastTokenFetchResult: string | null;
  lastBackendStatusCode: number | null;
  lastShopifyUpstreamError: string | null;
  snapshotDebugStep: string | null;
  lastUpstreamEndpoint: string | null;
  exactErrorMessage: string | null;
  embeddedFrame: boolean;
  apiKeyPresent: boolean;
};

declare global {
  interface Window {
    shopify?: ShopifyBridge;
    __stackauraShopifyAppBridgePromise__?: Promise<void>;
  }
}

const SHOPIFY_PROXY_ROUTES = {
  status: "/api/shopify/status",
  registerWebhooks: "/api/shopify/register-webhooks",
  supportAgent: "/api/shopify/support-agent",
  supportAgentDeployment: "/api/shopify/support-agent/deployment",
  supportAgentWidgetConfig: "/api/shopify/support-agent/widget-config",
  supportAgentConversations: "/api/shopify/support-agent/conversations",
} as const;

const SHOPIFY_PERSISTED_QUERY_KEYS = ["host", "shop", "id_token", "session"] as const;

function createShopifyEmbeddedQueryString(
  search: string,
  fallback: {
    host?: string;
    shop?: string;
  },
) {
  const currentParams = new URLSearchParams(search);
  const normalizedParams = new URLSearchParams();

  for (const key of SHOPIFY_PERSISTED_QUERY_KEYS) {
    const fallbackValue =
      key === "host" ? fallback.host?.trim() ?? "" : key === "shop" ? fallback.shop?.trim() ?? "" : "";
    const value = currentParams.get(key)?.trim() || fallbackValue;
    if (value) {
      normalizedParams.set(key, value);
    }
  }

  const serialized = normalizedParams.toString();
  return serialized ? `?${serialized}` : "";
}

function extractErrorMessage(raw: string, fallback: string) {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  if (/^\s*<!doctype html/i.test(trimmed) || /^\s*<html/i.test(trimmed)) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(trimmed) as { message?: string; error?: string };
    return parsed.message || parsed.error || fallback;
  } catch {
    return trimmed;
  }
}

function formatTimestamp(value: string | null | undefined) {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function formatBoolean(value: boolean) {
  return value ? "yes" : "no";
}

function formatTitle(value: string) {
  if (!value) return value;
  return value
    .split(/[\s_-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}

function formatConversationRole(role: "user" | "assistant") {
  return role === "assistant" ? "Stackaura Support" : "Customer";
}

function formatDeploymentWidgetStatus(
  value: SupportAgentDeploymentPayload["widgetStatus"] | null | undefined,
) {
  switch (value) {
    case "live_on_storefront":
      return "Live on storefront";
    case "ready_for_deployment":
      return "Ready for deployment";
    case "configured":
      return "Configured";
    case "not_configured":
    default:
      return "Not configured";
  }
}

function formatDeploymentPhase(
  value: SupportAgentWidgetConfigPayload["currentDeploymentPhase"] | null | undefined,
) {
  switch (value) {
    case "live_on_storefront":
      return "Live on storefront";
    case "theme_activation_required":
      return "Theme activation required";
    case "configuration_incomplete":
    default:
      return "Configuration incomplete";
  }
}

function formatStorefrontInteractionPathStatus(
  value:
    | SupportAgentWidgetConfigPayload["storefrontInteractionPathStatus"]
    | null
    | undefined,
) {
  switch (value) {
    case "ready_pending_theme_activation":
      return "Available after theme activation";
    case "live":
      return "Live in storefront";
    case "not_ready":
    default:
      return "Not ready";
  }
}

function createSupportAgentFormState(
  supportAgent?: SupportAgentPayload["supportAgent"] | null,
): SupportAgentFormState {
  return {
    enabled: supportAgent?.enabled ?? false,
    greetingMessage: supportAgent?.greetingMessage ?? "Hi there, how can we help you today?",
    supportEmail: supportAgent?.supportEmail ?? "",
    escalationEnabled: supportAgent?.escalationEnabled ?? true,
    escalationLabel: supportAgent?.escalationLabel ?? "Escalate to human",
    themePreference: supportAgent?.themePreference ?? "auto",
    positionPreference: supportAgent?.positionPreference ?? "bottom-right",
  };
}

function ensureShopifyApiKeyMeta(apiKey: string) {
  if (typeof document === "undefined") return;

  let meta = document.querySelector('meta[name="shopify-api-key"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "shopify-api-key";
    document.head.appendChild(meta);
  }

  meta.content = apiKey;
}

async function ensureShopifyAppBridgeScript() {
  if (typeof window === "undefined") {
    throw new Error("Shopify App Bridge can only initialize in the browser.");
  }

  if (typeof window.shopify?.idToken === "function") {
    return;
  }

  if (window.__stackauraShopifyAppBridgePromise__) {
    return window.__stackauraShopifyAppBridgePromise__;
  }

  window.__stackauraShopifyAppBridgePromise__ = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-stackaura-shopify-app-bridge="true"]',
    ) as HTMLScriptElement | null;

    const onError = () => reject(new Error("Shopify App Bridge script failed to load."));

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.shopify.com/shopifycloud/app-bridge.js";
    script.async = false;
    script.dataset.stackauraShopifyAppBridge = "true";
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", onError, { once: true });
    document.head.appendChild(script);
  });

  return window.__stackauraShopifyAppBridgePromise__;
}

async function waitForShopifyBridge(timeoutMs = 5000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (typeof window !== "undefined" && typeof window.shopify?.idToken === "function") {
      return window.shopify;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 100));
  }

  throw new Error(
    "Shopify App Bridge did not initialize. Confirm the app is opened from Shopify Admin with a host query parameter.",
  );
}

function SectionCard({
  id,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-3xl border border-[#d9e2ec] bg-white px-5 py-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#102a43]">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[#52606d]">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "neutral";
  children: ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "border-[#b8e6d1] bg-[#effaf4] text-[#127153]"
      : "border-[#d9e2ec] bg-[#f8fbfd] text-[#486581]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClass}`}
    >
      {children}
    </span>
  );
}

function ActionLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[#e7edf3] bg-[#fbfcfd] px-4 py-4 transition hover:border-[#c5d2e0] hover:bg-white"
    >
      <p className="text-sm font-semibold text-[#102a43]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#52606d]">{description}</p>
    </Link>
  );
}

function DiagnosticsPanel({ debug }: { debug: DebugState }) {
  return (
    <details className="group rounded-3xl border border-[#d9e2ec] bg-white px-5 py-5 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#102a43]">Developer diagnostics</h2>
          <p className="mt-1 text-sm text-[#52606d]">
            Embedded context and the most recent auth and backend status details.
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b8794] group-open:hidden">
          Expand
        </span>
        <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-[#7b8794] group-open:inline">
          Collapse
        </span>
      </summary>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[#e7edf3] bg-[#fbfcfd] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
            Request context
          </p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm text-[#243b53]">
            <dt className="text-[#52606d]">Current URL</dt>
            <dd className="break-all font-mono text-xs">{debug.currentUrl || "Waiting for client render"}</dd>
            <dt className="text-[#52606d]">shop</dt>
            <dd className="break-all">{debug.shopParam || "(missing)"}</dd>
            <dt className="text-[#52606d]">host</dt>
            <dd className="break-all">{debug.hostParam || "(missing)"}</dd>
            <dt className="text-[#52606d]">embedded</dt>
            <dd>{formatBoolean(debug.embeddedFrame)}</dd>
            <dt className="text-[#52606d]">apiKey</dt>
            <dd>{formatBoolean(debug.apiKeyPresent)}</dd>
          </dl>
        </div>
        <div className="rounded-2xl border border-[#e7edf3] bg-[#fbfcfd] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
            Lifecycle status
          </p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm text-[#243b53]">
            <dt className="text-[#52606d]">App Bridge</dt>
            <dd>{debug.appBridgeInitStatus}</dd>
            <dt className="text-[#52606d]">Token status</dt>
            <dd>{debug.sessionTokenStatus}</dd>
            <dt className="text-[#52606d]">Token result</dt>
            <dd>{debug.lastTokenFetchResult || "n/a"}</dd>
            <dt className="text-[#52606d]">Backend status</dt>
            <dd>{debug.backendStatus}</dd>
            <dt className="text-[#52606d]">Backend code</dt>
            <dd>{debug.lastBackendStatusCode ?? "n/a"}</dd>
            <dt className="text-[#52606d]">Upstream endpoint</dt>
            <dd className="break-all">{debug.lastUpstreamEndpoint || "n/a"}</dd>
            <dt className="text-[#52606d]">Snapshot step</dt>
            <dd>{debug.snapshotDebugStep || "n/a"}</dd>
          </dl>
        </div>
        <div className="rounded-2xl border border-dashed border-[#d9e2ec] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
            Last error
          </p>
          <p className="mt-3 break-words font-mono text-xs text-[#8a2332]">
            {debug.exactErrorMessage || "None"}
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-[#d9e2ec] px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
            Last Shopify upstream error
          </p>
          <p className="mt-3 break-words font-mono text-xs text-[#8a2332]">
            {debug.lastShopifyUpstreamError || "None"}
          </p>
        </div>
      </div>
    </details>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d9e2ec] bg-[#fbfcfd] px-5 py-6 text-sm text-[#52606d]">
      {message}
    </div>
  );
}

export default function ShopifyEmbeddedShell({
  apiKey,
  initialShop,
  initialHost,
  view = "home",
}: {
  apiKey: string;
  initialShop: string;
  initialHost: string;
  view?: "home" | "settings";
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ShopifyStatusPayload | null>(null);
  const [registeringWebhooks, setRegisteringWebhooks] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [registeredWebhookTopics, setRegisteredWebhookTopics] = useState<string[]>([]);
  const [lastWebhookRegistrationAttemptAt, setLastWebhookRegistrationAttemptAt] = useState<string | null>(null);
  const [lastSuccessfulRefreshAt, setLastSuccessfulRefreshAt] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [supportAgent, setSupportAgent] = useState<SupportAgentPayload["supportAgent"] | null>(null);
  const [supportAgentForm, setSupportAgentForm] = useState<SupportAgentFormState>(
    createSupportAgentFormState(null),
  );
  const [supportAgentLoading, setSupportAgentLoading] = useState(view === "settings");
  const [supportAgentSaving, setSupportAgentSaving] = useState(false);
  const [supportAgentNotice, setSupportAgentNotice] = useState<string | null>(null);
  const [supportAgentError, setSupportAgentError] = useState<string | null>(null);
  const [supportAgentDeployment, setSupportAgentDeployment] =
    useState<SupportAgentDeploymentPayload | null>(null);
  const [supportAgentDeploymentLoading, setSupportAgentDeploymentLoading] =
    useState(view === "settings");
  const [supportAgentDeploymentError, setSupportAgentDeploymentError] =
    useState<string | null>(null);
  const [supportAgentDeploymentCopyNotice, setSupportAgentDeploymentCopyNotice] =
    useState<string | null>(null);
  const [supportAgentWidgetConfig, setSupportAgentWidgetConfig] =
    useState<SupportAgentWidgetConfigPayload | null>(null);
  const [supportAgentWidgetConfigLoading, setSupportAgentWidgetConfigLoading] =
    useState(view === "settings");
  const [supportAgentWidgetConfigError, setSupportAgentWidgetConfigError] =
    useState<string | null>(null);
  const [supportConversations, setSupportConversations] = useState<
    SupportConversationSummary[]
  >([]);
  const [supportConversationsLoading, setSupportConversationsLoading] = useState(
    view === "settings",
  );
  const [supportConversationsError, setSupportConversationsError] =
    useState<string | null>(null);
  const [selectedConversationSessionId, setSelectedConversationSessionId] =
    useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<SupportConversationDetailPayload["conversation"] | null>(null);
  const [selectedConversationLoading, setSelectedConversationLoading] =
    useState(false);
  const [selectedConversationError, setSelectedConversationError] =
    useState<string | null>(null);
  const [showDeploymentInstructions, setShowDeploymentInstructions] =
    useState(false);
  const hasAutoLoadedRef = useRef(false);
  const [debug, setDebug] = useState<DebugState>({
    currentUrl: "",
    shopParam: initialShop,
    hostParam: initialHost,
    appBridgeInitStatus: "idle",
    appBridgeInitSucceeded: false,
    sessionTokenStarted: false,
    sessionTokenSucceeded: false,
    sessionTokenStatus: "idle",
    backendStatus: "idle",
    lastTokenFetchResult: null,
    lastBackendStatusCode: null,
    lastShopifyUpstreamError: null,
    snapshotDebugStep: null,
    lastUpstreamEndpoint: null,
    exactErrorMessage: null,
    embeddedFrame: false,
    apiKeyPresent: Boolean(apiKey),
  });

  const embeddedContext = useMemo(() => {
    const shopParam = searchParams.get("shop") ?? initialShop;
    const hostParam = searchParams.get("host") ?? initialHost;

    return { shopParam, hostParam };
  }, [initialHost, initialShop, searchParams]);

  const preservedQueryString = useMemo(() => {
    return createShopifyEmbeddedQueryString(searchParams.toString(), {
      host: initialHost,
      shop: initialShop,
    });
  }, [initialHost, initialShop, searchParams]);

  const homeHref = `/shopify${preservedQueryString}`;
  const settingsHref = `/shopify/settings${preservedQueryString}`;

  const updateDebug = useCallback((partial: Partial<DebugState>) => {
    setDebug((current) => ({ ...current, ...partial }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextDebug = {
      currentUrl: window.location.href,
      shopParam: embeddedContext.shopParam,
      hostParam: embeddedContext.hostParam,
      embeddedFrame: window.top !== window.self,
      apiKeyPresent: Boolean(apiKey),
    };

    console.info("[ShopifyEmbeddedShell] first render", {
      url: nextDebug.currentUrl,
      query: Object.fromEntries(new URL(window.location.href).searchParams.entries()),
      apiKeyPresent: nextDebug.apiKeyPresent,
      embeddedFrame: nextDebug.embeddedFrame,
    });

    updateDebug(nextDebug);
  }, [apiKey, embeddedContext.hostParam, embeddedContext.shopParam, updateDebug]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const normalizedQueryString = createShopifyEmbeddedQueryString(window.location.search, {
      host: initialHost,
      shop: initialShop,
    });
    const normalizedUrl = `${window.location.pathname}${normalizedQueryString}${window.location.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (normalizedUrl === currentUrl) {
      return;
    }

    window.history.replaceState(window.history.state, "", normalizedUrl);
    console.info("[ShopifyEmbeddedShell] normalized embedded route URL", {
      from: currentUrl,
      to: normalizedUrl,
    });
  }, [initialHost, initialShop]);

  const getShopifySessionToken = useCallback(async () => {
    updateDebug({
      appBridgeInitStatus: "started",
      appBridgeInitSucceeded: false,
      sessionTokenStarted: false,
      sessionTokenSucceeded: false,
      sessionTokenStatus: "idle",
      lastTokenFetchResult: null,
      exactErrorMessage: null,
    });

    if (!apiKey) {
      throw new Error("SHOPIFY_API_KEY is missing from the frontend environment.");
    }

    if (!embeddedContext.hostParam) {
      throw new Error("Missing host query parameter. Shopify embedded apps require host in the URL.");
    }

    ensureShopifyApiKeyMeta(apiKey);
    await ensureShopifyAppBridgeScript();
    await waitForShopifyBridge();

    updateDebug({
      appBridgeInitStatus: "succeeded",
      appBridgeInitSucceeded: true,
      sessionTokenStarted: true,
      sessionTokenStatus: "started",
    });

    const token = await window.shopify!.idToken();
    if (!token) {
      throw new Error("Shopify session token retrieval returned an empty token.");
    }

    updateDebug({
      sessionTokenSucceeded: true,
      sessionTokenStatus: "succeeded",
      lastTokenFetchResult: "Fresh Shopify session token retrieved successfully.",
    });

    return token;
  }, [apiKey, embeddedContext.hostParam, updateDebug]);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    updateDebug({
      backendStatus: "started",
      lastBackendStatusCode: null,
      lastShopifyUpstreamError: null,
      snapshotDebugStep: null,
      lastUpstreamEndpoint: null,
      exactErrorMessage: null,
    });

    try {
      const sessionToken = await getShopifySessionToken();
      const res = await fetch(SHOPIFY_PROXY_ROUTES.status, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let parsedDebug:
          | {
              debug?: {
                stepReached?: string;
                upstreamEndpoint?: string | null;
                upstreamErrorBody?: unknown;
              };
            }
          | undefined;

        try {
          parsedDebug = JSON.parse(text) as typeof parsedDebug;
        } catch {
          parsedDebug = undefined;
        }

        updateDebug({
          lastBackendStatusCode: res.status,
          lastShopifyUpstreamError: parsedDebug?.debug?.upstreamErrorBody
            ? JSON.stringify(parsedDebug.debug.upstreamErrorBody)
            : null,
          snapshotDebugStep: parsedDebug?.debug?.stepReached ?? null,
          lastUpstreamEndpoint: parsedDebug?.debug?.upstreamEndpoint ?? null,
        });

        throw new Error(extractErrorMessage(text, "Unable to load Shopify merchant console."));
      }

      const payload = (await res.json()) as ShopifyStatusPayload;
      setStatus(payload);
      setRegisteredWebhookTopics(payload.webhooks.topics);
      setWebhookStatus(payload.webhooks.registrationStatus);
      setLastSuccessfulRefreshAt(payload.connection.lastSuccessfulRefreshAt);
      updateDebug({
        backendStatus: "succeeded",
        lastBackendStatusCode: res.status,
        lastShopifyUpstreamError: payload.debug?.upstreamErrorBody
          ? JSON.stringify(payload.debug.upstreamErrorBody)
          : null,
        snapshotDebugStep: payload.debug?.stepReached ?? null,
        lastUpstreamEndpoint: payload.debug?.upstreamEndpoint ?? null,
        exactErrorMessage: null,
      });
    } catch (caughtError) {
      console.error("Failed to load Shopify merchant console", caughtError);
      const message =
        caughtError instanceof Error && caughtError.message.trim()
          ? caughtError.message
          : "Unable to load the Shopify merchant console.";
      setError(message);
      setStatus(null);
      updateDebug({
        appBridgeInitStatus:
          typeof window !== "undefined" && typeof window.shopify?.idToken === "function"
            ? "succeeded"
            : "failed",
        sessionTokenStatus: "failed",
        backendStatus: "failed",
        lastTokenFetchResult:
          caughtError instanceof Error ? caughtError.message : "Token retrieval failed.",
        exactErrorMessage: message,
      });
    } finally {
      setLoading(false);
    }
  }, [getShopifySessionToken, updateDebug]);

  const loadSupportAgentSettings = useCallback(async () => {
    setSupportAgentLoading(true);
    setSupportAgentError(null);

    try {
      const sessionToken = await getShopifySessionToken();
      const res = await fetch(SHOPIFY_PROXY_ROUTES.supportAgent, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(extractErrorMessage(text, "Unable to load Support Agent settings."));
      }

      const payload = (await res.json()) as SupportAgentPayload;
      setSupportAgent(payload.supportAgent);
      setSupportAgentForm(createSupportAgentFormState(payload.supportAgent));
      setSupportAgentNotice(
        payload.supportAgent.configurationSaved ? "Configuration saved." : null,
      );
      setSupportAgentError(null);
    } catch (caughtError) {
      console.error("Failed to load Support Agent settings", caughtError);
      const message =
        caughtError instanceof Error && caughtError.message.trim()
          ? caughtError.message
          : "Unable to load Support Agent settings.";
      setSupportAgentError(message);
      updateDebug({
        exactErrorMessage: message,
      });
    } finally {
      setSupportAgentLoading(false);
    }
  }, [getShopifySessionToken, updateDebug]);

  const loadSupportAgentDeployment = useCallback(async () => {
    setSupportAgentDeploymentLoading(true);
    setSupportAgentDeploymentError(null);

    try {
      const sessionToken = await getShopifySessionToken();
      const res = await fetch(SHOPIFY_PROXY_ROUTES.supportAgentDeployment, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          extractErrorMessage(text, "Unable to load storefront deployment readiness."),
        );
      }

      const payload = (await res.json()) as SupportAgentDeploymentPayload;
      setSupportAgentDeployment(payload);
      setSupportAgentDeploymentError(null);
    } catch (caughtError) {
      console.error("Failed to load Support Agent deployment readiness", caughtError);
      const message =
        caughtError instanceof Error && caughtError.message.trim()
          ? caughtError.message
          : "Unable to load storefront deployment readiness.";
      setSupportAgentDeploymentError(message);
      updateDebug({
        exactErrorMessage: message,
      });
    } finally {
      setSupportAgentDeploymentLoading(false);
    }
  }, [getShopifySessionToken, updateDebug]);

  const loadSupportAgentWidgetConfig = useCallback(async () => {
    setSupportAgentWidgetConfigLoading(true);
    setSupportAgentWidgetConfigError(null);

    try {
      const sessionToken = await getShopifySessionToken();
      const res = await fetch(SHOPIFY_PROXY_ROUTES.supportAgentWidgetConfig, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          extractErrorMessage(text, "Unable to load storefront widget runtime config."),
        );
      }

      const payload = (await res.json()) as SupportAgentWidgetConfigPayload;
      setSupportAgentWidgetConfig(payload);
      setSupportAgentWidgetConfigError(null);
    } catch (caughtError) {
      console.error("Failed to load Support Agent widget config", caughtError);
      const message =
        caughtError instanceof Error && caughtError.message.trim()
          ? caughtError.message
          : "Unable to load storefront widget runtime config.";
      setSupportAgentWidgetConfigError(message);
      updateDebug({
        exactErrorMessage: message,
      });
    } finally {
      setSupportAgentWidgetConfigLoading(false);
    }
  }, [getShopifySessionToken, updateDebug]);

  const loadSupportConversationDetail = useCallback(
    async (sessionId: string) => {
      setSelectedConversationLoading(true);
      setSelectedConversationError(null);

      try {
        const sessionToken = await getShopifySessionToken();
        const res = await fetch(
          `${SHOPIFY_PROXY_ROUTES.supportAgentConversations}/${encodeURIComponent(sessionId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
            cache: "no-store",
          },
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            extractErrorMessage(text, "Unable to load the selected support conversation."),
          );
        }

        const payload = (await res.json()) as SupportConversationDetailPayload;
        setSelectedConversation(payload.conversation);
        setSelectedConversationSessionId(payload.conversation.sessionId);
        setSelectedConversationError(null);
      } catch (caughtError) {
        console.error("Failed to load support conversation detail", caughtError);
        const message =
          caughtError instanceof Error && caughtError.message.trim()
            ? caughtError.message
            : "Unable to load the selected support conversation.";
        setSelectedConversationError(message);
        updateDebug({
          exactErrorMessage: message,
        });
      } finally {
        setSelectedConversationLoading(false);
      }
    },
    [getShopifySessionToken, updateDebug],
  );

  const loadSupportConversations = useCallback(async () => {
    setSupportConversationsLoading(true);
    setSupportConversationsError(null);

    try {
      const sessionToken = await getShopifySessionToken();
      const res = await fetch(SHOPIFY_PROXY_ROUTES.supportAgentConversations, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          extractErrorMessage(text, "Unable to load Support Agent conversations."),
        );
      }

      const payload = (await res.json()) as SupportConversationsPayload;
      setSupportConversations(payload.conversations);
      setSupportConversationsError(null);

      const nextSessionId =
        payload.conversations.find(
          (conversation) => conversation.sessionId === selectedConversationSessionId,
        )?.sessionId ??
        payload.conversations[0]?.sessionId ??
        null;

      if (!nextSessionId) {
        setSelectedConversation(null);
        setSelectedConversationSessionId(null);
        return;
      }

      if (nextSessionId !== selectedConversationSessionId || !selectedConversation) {
        void loadSupportConversationDetail(nextSessionId);
      }
    } catch (caughtError) {
      console.error("Failed to load Support Agent conversations", caughtError);
      const message =
        caughtError instanceof Error && caughtError.message.trim()
          ? caughtError.message
          : "Unable to load Support Agent conversations.";
      setSupportConversationsError(message);
      updateDebug({
        exactErrorMessage: message,
      });
    } finally {
      setSupportConversationsLoading(false);
    }
  }, [
    getShopifySessionToken,
    loadSupportConversationDetail,
    selectedConversation,
    selectedConversationSessionId,
    updateDebug,
  ]);

  useEffect(() => {
    if (hasAutoLoadedRef.current) return;
    hasAutoLoadedRef.current = true;
    void loadStatus();
    if (view === "settings") {
      void loadSupportAgentSettings();
      void loadSupportAgentDeployment();
      void loadSupportAgentWidgetConfig();
      void loadSupportConversations();
    }
  }, [
    loadStatus,
    loadSupportConversations,
    loadSupportAgentDeployment,
    loadSupportAgentSettings,
    loadSupportAgentWidgetConfig,
    view,
  ]);

  async function saveSupportAgentSettings() {
    setSupportAgentSaving(true);
    setSupportAgentNotice(null);
    setSupportAgentError(null);
    setSupportAgentDeploymentCopyNotice(null);

    try {
      const sessionToken = await getShopifySessionToken();
      const res = await fetch(SHOPIFY_PROXY_ROUTES.supportAgent, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supportAgentForm),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(extractErrorMessage(text, "Unable to save Support Agent settings."));
      }

      const payload = (await res.json()) as SupportAgentPayload;
      setSupportAgent(payload.supportAgent);
      setSupportAgentForm(createSupportAgentFormState(payload.supportAgent));
      setSupportAgentNotice("Configuration saved.");
      await loadSupportAgentDeployment();
      await loadSupportAgentWidgetConfig();
    } catch (caughtError) {
      console.error("Failed to save Support Agent settings", caughtError);
      const message =
        caughtError instanceof Error && caughtError.message.trim()
          ? caughtError.message
          : "Unable to save Support Agent settings.";
      setSupportAgentError(message);
      updateDebug({
        exactErrorMessage: message,
      });
    } finally {
      setSupportAgentSaving(false);
    }
  }

  async function registerWebhooks() {
    setRegisteringWebhooks(true);
    setWebhookStatus(null);

    try {
      const sessionToken = await getShopifySessionToken();
      const res = await fetch(SHOPIFY_PROXY_ROUTES.registerWebhooks, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(extractErrorMessage(text, "Unable to register Shopify webhooks."));
      }

      const payload = (await res.json()) as WebhookRegistrationPayload;
      const topics = payload.registrations.map((entry) => entry.topic);
      const nextMessage = payload.result;

      setRegisteredWebhookTopics(topics);
      setWebhookStatus(nextMessage);
      setLastWebhookRegistrationAttemptAt(payload.attemptedAt);
      setStatus((current) =>
        current
          ? {
              ...current,
              webhooks: {
                topics,
                callbackUrl: payload.callbackUrl,
                registrationStatus: nextMessage,
                healthy: payload.healthy,
              },
            }
          : current,
      );
    } catch (caughtError) {
      console.error("Failed to register Shopify webhooks", caughtError);
      const message =
        caughtError instanceof Error && caughtError.message.trim()
          ? caughtError.message
          : "Unable to register Shopify webhooks.";
      setWebhookStatus(message);
      updateDebug({
        exactErrorMessage: message,
      });
    } finally {
      setRegisteringWebhooks(false);
    }
  }

  const connection = status?.connection;
  const store = status?.store;
  const products = status?.products;
  const storefrontSupportStatus = status?.supportAgent ?? null;
  const activeTopics = registeredWebhookTopics.length
    ? registeredWebhookTopics
    : status?.webhooks.topics ?? [];
  const supportAgentStatusLabel = supportAgent?.widgetStatusLabel ?? "Not deployed";
  const supportAgentDeploymentMessage =
    supportAgent?.deploymentMessage ?? "Theme app extension deployment is now available.";
  const deploymentStatusLabel = formatDeploymentWidgetStatus(
    supportAgentDeployment?.widgetStatus,
  );
  const deploymentPhaseLabel = formatDeploymentPhase(
    supportAgentWidgetConfig?.currentDeploymentPhase,
  );
  const deploymentTone =
    supportAgentDeployment?.widgetStatus === "live_on_storefront" ||
    supportAgentDeployment?.ready
      ? "success"
      : "neutral";
  const deploymentSummaryMessage = supportAgentDeployment
    ? supportAgentDeployment.widgetStatus === "live_on_storefront"
      ? "Storefront activation has been observed. The Support Agent widget is now live on the storefront and reporting back to Stackaura."
      : supportAgentDeployment.ready
        ? "Storefront widget shell and the first real conversation runtime are ready. Theme activation is the remaining live step."
      : supportAgentDeployment.widgetStatus === "not_configured"
        ? "Configuration incomplete. Save Support Agent settings before storefront deployment."
        : "Storefront deployment is prepared in code, but the widget is not yet injected into the live theme."
    : "Check deployment readiness to generate the future storefront widget payload.";
  const widgetRuntimeConfig = supportAgentWidgetConfig?.widgetConfig ?? null;
  const conversationRuntimeLabel = supportAgentWidgetConfig?.conversationRuntimeReady
    ? "Basic conversation runtime ready"
    : "Conversation runtime pending";
  const storefrontInteractionLabel = formatStorefrontInteractionPathStatus(
    supportAgentWidgetConfig?.storefrontInteractionPathStatus,
  );
  const storefrontMethodLabel =
    supportAgentWidgetConfig?.deploymentMethod === "theme_app_extension"
      ? "Theme app extension / App embed block"
      : "Theme app extension";
  const storefrontNextStep =
    supportAgentWidgetConfig?.nextRequiredStep ??
    "Prepare storefront deployment to see the next required merchant step.";
  const canOpenThemeEditor = Boolean(supportAgentWidgetConfig?.themeEditorUrl);
  const storefrontChatUrl = supportAgentWidgetConfig?.storefrontChatUrl ?? null;
  const productStatusSummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of status?.products.items ?? []) {
      const key = product.status || "unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries());
  }, [status?.products.items]);
  const productsAdminUrl = connection?.shopDomain
    ? `https://${connection.shopDomain}/admin/products`
    : null;

  async function copyShopDomain() {
    const value = connection?.shopDomain || embeddedContext.shopParam;
    if (!value || typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyFeedback("Unable to copy shop domain on this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback("Shop domain copied.");
      window.setTimeout(() => setCopyFeedback(null), 2500);
    } catch (error) {
      console.error("Failed to copy shop domain", error);
      setCopyFeedback("Unable to copy shop domain.");
    }
  }

  async function copyWidgetConfig() {
    if (
      !supportAgentWidgetConfig?.widgetConfig ||
      typeof navigator === "undefined" ||
      !navigator.clipboard
    ) {
      setSupportAgentDeploymentCopyNotice(
        "Unable to copy widget config on this browser.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(supportAgentWidgetConfig.widgetConfig, null, 2),
      );
      setSupportAgentDeploymentCopyNotice("Widget config copied.");
      window.setTimeout(() => setSupportAgentDeploymentCopyNotice(null), 2500);
    } catch (error) {
      console.error("Failed to copy widget config", error);
      setSupportAgentDeploymentCopyNotice("Unable to copy widget config.");
    }
  }

  async function prepareStorefrontDeployment() {
    setSupportAgentDeploymentCopyNotice(null);
    await Promise.all([
      loadSupportAgentDeployment(),
      loadSupportAgentWidgetConfig(),
    ]);
  }

  function updateSupportAgentForm<K extends keyof SupportAgentFormState>(
    key: K,
    value: SupportAgentFormState[K],
  ) {
    setSupportAgentForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  const refreshButton = (
    <button
      type="button"
      onClick={() => void loadStatus()}
      disabled={loading}
      className="rounded-full bg-[#635bff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5146df] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Refreshing…" : "Refresh"}
    </button>
  );

  const registerButton = (
    <button
      type="button"
      onClick={() => void registerWebhooks()}
      disabled={registeringWebhooks || loading || Boolean(error)}
      className="rounded-full border border-[#c5d2e0] px-4 py-2 text-sm font-medium text-[#102a43] transition hover:bg-[#f6f8fb] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {registeringWebhooks ? "Registering…" : "Register webhooks"}
    </button>
  );

  const overviewContent = (
    <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Connection health"
          description="Current embedded app installation and auth state."
        >
          <div className="space-y-4">
              <StatusPill tone={connection?.connected ? "success" : "neutral"}>
                {connection?.connected ? "Connected" : "Disconnected"}
              </StatusPill>
              <dl className="grid gap-3 text-sm text-[#243b53] sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Shop domain
                  </dt>
                  <dd className="mt-1 font-medium text-[#102a43]">
                    {connection?.shopDomain || embeddedContext.shopParam || "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Installed at
                  </dt>
                  <dd className="mt-1">{formatTimestamp(connection?.installedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Updated at
                  </dt>
                  <dd className="mt-1">{formatTimestamp(connection?.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Auth mode
                  </dt>
                  <dd className="mt-1">{connection?.authMode || "Not available"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Last refresh
                  </dt>
                  <dd className="mt-1">{formatTimestamp(lastSuccessfulRefreshAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Backend reachable
                  </dt>
                  <dd className="mt-1">
                    {debug.backendStatus === "succeeded" ? "Yes" : debug.backendStatus === "failed" ? "No" : "Checking"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Last backend code
                  </dt>
                  <dd className="mt-1">{debug.lastBackendStatusCode ?? "Not available"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Scopes
                  </dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {(connection?.scopes ?? ["read_products", "read_orders"]).map((scope) => (
                      <span
                        key={scope}
                        className="rounded-full border border-[#d9e2ec] bg-[#fbfcfd] px-2.5 py-1 text-xs font-medium text-[#486581]"
                      >
                        {scope}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Storefront widget
                  </dt>
                  <dd className="mt-1">
                    {storefrontSupportStatus
                      ? formatTitle(storefrontSupportStatus.storefrontStatus)
                      : "Not available"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    First activated
                  </dt>
                  <dd className="mt-1">
                    {formatTimestamp(storefrontSupportStatus?.storefrontActivatedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Last seen
                  </dt>
                  <dd className="mt-1">
                    {formatTimestamp(storefrontSupportStatus?.storefrontLastSeenAt)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Current app URL
                  </dt>
                  <dd className="mt-1 break-all">
                    {connection?.appUrl || "Not available"}
                  </dd>
                </div>
                {storefrontSupportStatus?.storefrontLastPageUrl ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                      Last active page
                    </dt>
                    <dd className="mt-1 break-all">
                      {storefrontSupportStatus.storefrontLastPageUrl}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void copyShopDomain()}
                  className="rounded-full border border-[#c5d2e0] px-3 py-1.5 text-sm font-medium text-[#102a43] transition hover:bg-[#f6f8fb]"
                >
                  Copy shop domain
                </button>
                {copyFeedback ? <span className="text-sm text-[#52606d]">{copyFeedback}</span> : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Store snapshot" description="Live store metadata from Shopify Admin API.">
            <div className="space-y-4">
              <p className="text-2xl font-semibold tracking-tight text-[#102a43]">
                {store?.name || "Unknown store"}
              </p>
              <dl className="grid gap-3 text-sm text-[#243b53]">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Domain
                  </dt>
                  <dd className="mt-1">{store?.myshopifyDomain || "Not available"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Plan
                  </dt>
                  <dd className="mt-1">{store?.planName || "Not available"}</dd>
                </div>
              </dl>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Product summary"
          description="A lightweight preview of the first few products in the store."
          action={
            <button
              type="button"
              onClick={() => void loadStatus()}
              disabled={loading}
              className="rounded-full border border-[#c5d2e0] px-3 py-1.5 text-sm font-medium text-[#102a43] transition hover:bg-[#f6f8fb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing…" : "Refresh products"}
            </button>
          }
        >
          {products ? (
            <div className="space-y-4">
              <p className="text-sm text-[#52606d]">
                {products.count} product{products.count === 1 ? "" : "s"} in Shopify. Previewing the first {products.items.length}.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {productStatusSummary.length ? (
                  productStatusSummary.map(([statusName, count]) => (
                    <span
                      key={statusName}
                      className="rounded-full border border-[#d9e2ec] bg-[#fbfcfd] px-2.5 py-1 text-xs font-medium text-[#486581]"
                    >
                      {formatTitle(statusName)}: {count}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#52606d]">No product status summary available yet.</span>
                )}
              </div>
              <div className="grid gap-3">
                {products.items.length ? (
                  products.items.map((product) => (
                    <article
                      key={product.id}
                      className="rounded-2xl border border-[#e7edf3] bg-[#fbfcfd] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#102a43]">{product.title}</p>
                          <p className="mt-1 text-sm text-[#52606d]">{product.handle}</p>
                        </div>
                        <StatusPill tone="neutral">{product.status}</StatusPill>
                      </div>
                      <p className="mt-3 text-xs text-[#7b8794]">
                        Updated {formatTimestamp(product.updatedAt)}
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyPanel message="No products were returned in the current MVP snapshot." />
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void loadStatus()}
                  disabled={loading}
                  className="rounded-full border border-[#c5d2e0] px-3 py-1.5 text-sm font-medium text-[#102a43] transition hover:bg-[#f6f8fb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Refreshing…" : "Refresh store data"}
                </button>
                {productsAdminUrl ? (
                  <a
                    href={productsAdminUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[#c5d2e0] px-3 py-1.5 text-sm font-medium text-[#102a43] transition hover:bg-[#f6f8fb]"
                  >
                    View all in Shopify
                  </a>
                ) : null}
                {lastSuccessfulRefreshAt ? (
                  <span className="self-center text-sm text-[#52606d]">
                    Last refreshed {formatTimestamp(lastSuccessfulRefreshAt)}
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <EmptyPanel message="Product preview will appear here after the first successful Shopify status fetch." />
          )}
        </SectionCard>

        <SectionCard
          title="Next actions"
          description="Primary setup paths we can layer in next without leaving Shopify Admin."
        >
          <div className="grid gap-3 md:grid-cols-3">
            <ActionLink
              href={`${settingsHref}#payments`}
              title="Connect payments"
              description="Prepare the embedded settings area for future payment gateway setup."
            />
            <ActionLink
              href={`${settingsHref}#support`}
              title="Configure support agent"
              description="Keep Shopify support tooling and Stackaura support controls connected in one place."
            />
            <ActionLink
              href={settingsHref}
              title="Open settings"
              description="Review store connection details, webhook management, and upcoming configuration areas."
            />
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard
          title="Webhook status"
          description="Current Shopify webhook coverage for the embedded app."
          action={registerButton}
        >
          <div className="space-y-4">
            <StatusPill tone={status?.webhooks.healthy ? "success" : "neutral"}>
              {status?.webhooks.healthy ? "Webhook active" : "Action required"}
            </StatusPill>
            <dl className="grid gap-3 text-sm text-[#243b53]">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                  app/uninstalled registered
                </dt>
                <dd className="mt-1">{activeTopics.includes("app/uninstalled") ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                  Callback URL
                </dt>
                <dd className="mt-1 break-all">{status?.webhooks.callbackUrl || "Not available"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                  Last registration attempt
                </dt>
                <dd className="mt-1">{formatTimestamp(lastWebhookRegistrationAttemptAt)}</dd>
              </div>
            </dl>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                Registered topics
              </p>
              {activeTopics.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[#243b53]">
                  {activeTopics.map((topic) => (
                    <li key={topic} className="rounded-xl border border-[#e7edf3] px-3 py-3">
                      {topic}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#52606d]">No webhook topics registered yet.</p>
              )}
            </div>
            <div className="rounded-2xl border border-[#e7edf3] bg-[#fbfcfd] px-4 py-4 text-sm text-[#52606d]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                Last registration result
              </p>
              <p className="mt-2">
                {webhookStatus || "Register the minimum Stackaura webhook for this store: app/uninstalled."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {registerButton}
            </div>
          </div>
        </SectionCard>

        <DiagnosticsPanel debug={debug} />
      </div>
    </section>
  );

  const settingsContent = (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <SectionCard title="Store connection details" description="Embedded install metadata and current Shopify store identity.">
          <dl className="grid gap-4 text-sm text-[#243b53] sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                Connected shop
              </dt>
              <dd className="mt-1 font-medium text-[#102a43]">
                {connection?.shopDomain || embeddedContext.shopParam || "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                Status
              </dt>
              <dd className="mt-1">
                <StatusPill tone={connection?.connected ? "success" : "neutral"}>
                  {connection?.connected ? "Connected" : "Disconnected"}
                </StatusPill>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                Installed at
              </dt>
              <dd className="mt-1">{formatTimestamp(connection?.installedAt)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                Updated at
              </dt>
              <dd className="mt-1">{formatTimestamp(connection?.updatedAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                Scopes
              </dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {(connection?.scopes ?? ["read_products", "read_orders"]).map((scope) => (
                  <span
                    key={scope}
                    className="rounded-full border border-[#d9e2ec] bg-[#fbfcfd] px-2.5 py-1 text-xs font-medium text-[#486581]"
                  >
                    {scope}
                  </span>
                ))}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                Auth mode
              </dt>
              <dd className="mt-1">{connection?.authMode || "Not available"}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Webhooks" description="Maintain the current MVP webhook coverage for this Shopify install." action={registerButton}>
          <div className="space-y-4">
            <p className="text-sm text-[#52606d]">
              The current MVP registers only <span className="font-medium text-[#102a43]">app/uninstalled</span>.
            </p>
            <p className="text-sm text-[#52606d]">
              Callback URL: <span className="font-medium text-[#102a43] break-all">{status?.webhooks.callbackUrl || "Not available"}</span>
            </p>
            {activeTopics.length ? (
              <ul className="space-y-2 text-sm text-[#243b53]">
                {activeTopics.map((topic) => (
                  <li key={topic} className="rounded-xl border border-[#e7edf3] px-3 py-3">
                    {topic}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyPanel message="No active webhook topics are registered for the current callback URL yet." />
            )}
            <div className="rounded-2xl border border-[#e7edf3] bg-[#fbfcfd] px-4 py-4 text-sm text-[#52606d]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                Last registration result
              </p>
              <p className="mt-2">{webhookStatus || "No webhook registration has been attempted in this session yet."}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="support"
          title="Support Agent"
          description="Configure the future Stackaura storefront AI support widget from Shopify Admin."
          action={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadSupportAgentSettings()}
                disabled={supportAgentLoading || supportAgentSaving}
                className="rounded-full border border-[#c5d2e0] px-3 py-1.5 text-sm font-medium text-[#102a43] transition hover:bg-[#f6f8fb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {supportAgentLoading ? "Reloading…" : "Reload settings"}
              </button>
              <button
                type="button"
                onClick={() => void saveSupportAgentSettings()}
                disabled={supportAgentLoading || supportAgentSaving}
                className="rounded-full bg-[#635bff] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#5146df] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {supportAgentSaving ? "Saving…" : "Save settings"}
              </button>
            </div>
          }
        >
          {supportAgentLoading ? (
            <EmptyPanel message="Loading Support Agent configuration…" />
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill
                  tone={
                    supportAgent?.widgetStatus === "live_on_storefront" ||
                    supportAgent?.widgetStatus === "ready" ||
                    supportAgent?.widgetStatus === "configured"
                      ? "success"
                      : "neutral"
                  }
                >
                  {supportAgentStatusLabel}
                </StatusPill>
                <StatusPill tone={supportAgentForm.enabled ? "success" : "neutral"}>
                  {supportAgentForm.enabled ? "Enabled" : "Disabled"}
                </StatusPill>
                {supportAgent?.configurationSaved ? (
                  <span className="text-sm text-[#127153]">Configuration saved</span>
                ) : null}
              </div>

              <div className="rounded-2xl border border-[#e7edf3] bg-[#fbfcfd] px-4 py-4 text-sm text-[#52606d]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                  Readiness
                </p>
                <p className="mt-2">{supportAgentDeploymentMessage}</p>
              </div>

              {supportAgentNotice ? (
                <div className="rounded-2xl border border-[#b8e6d1] bg-[#effaf4] px-4 py-3 text-sm text-[#127153]">
                  {supportAgentNotice}
                </div>
              ) : null}

              {supportAgentError ? (
                <div className="rounded-2xl border border-[#f0b7bf] bg-[#fff5f6] px-4 py-3 text-sm text-[#8a2332]">
                  {supportAgentError}
                </div>
              ) : null}

              <div className="grid gap-5 lg:grid-cols-2">
                <label className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#102a43]">Enabled</p>
                      <p className="mt-1 text-sm text-[#52606d]">
                        Allow the future storefront support widget to be activated for this shop.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={supportAgentForm.enabled}
                      onChange={(event) => updateSupportAgentForm("enabled", event.target.checked)}
                      className="h-5 w-5 rounded border-[#c5d2e0] text-[#635bff] focus:ring-[#635bff]"
                    />
                  </div>
                </label>

                <label className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#102a43]">Escalation enabled</p>
                      <p className="mt-1 text-sm text-[#52606d]">
                        Allow the widget to offer a human escalation path once deployment is available.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={supportAgentForm.escalationEnabled}
                      onChange={(event) =>
                        updateSupportAgentForm("escalationEnabled", event.target.checked)
                      }
                      className="h-5 w-5 rounded border-[#c5d2e0] text-[#635bff] focus:ring-[#635bff]"
                    />
                  </div>
                </label>

                <label className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4 lg:col-span-2">
                  <p className="text-sm font-semibold text-[#102a43]">Greeting message</p>
                  <p className="mt-1 text-sm text-[#52606d]">
                    The first message the support widget should show when the storefront deployment is ready.
                  </p>
                  <textarea
                    value={supportAgentForm.greetingMessage}
                    onChange={(event) =>
                      updateSupportAgentForm("greetingMessage", event.target.value)
                    }
                    rows={4}
                    className="mt-3 w-full rounded-2xl border border-[#d9e2ec] bg-[#fbfcfd] px-4 py-3 text-sm text-[#102a43] outline-none transition focus:border-[#635bff]"
                    placeholder="Hi there, how can we help you today?"
                  />
                </label>

                <label className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[#102a43]">Primary support email</p>
                  <p className="mt-1 text-sm text-[#52606d]">
                    The mailbox we should use for support escalations from the storefront widget.
                  </p>
                  <input
                    type="email"
                    value={supportAgentForm.supportEmail}
                    onChange={(event) => updateSupportAgentForm("supportEmail", event.target.value)}
                    className="mt-3 w-full rounded-2xl border border-[#d9e2ec] bg-[#fbfcfd] px-4 py-3 text-sm text-[#102a43] outline-none transition focus:border-[#635bff]"
                    placeholder="support@yourstore.com"
                  />
                </label>

                <label className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[#102a43]">Escalation label</p>
                  <p className="mt-1 text-sm text-[#52606d]">
                    The button label we should show for human escalation inside the widget.
                  </p>
                  <input
                    type="text"
                    value={supportAgentForm.escalationLabel}
                    onChange={(event) =>
                      updateSupportAgentForm("escalationLabel", event.target.value)
                    }
                    className="mt-3 w-full rounded-2xl border border-[#d9e2ec] bg-[#fbfcfd] px-4 py-3 text-sm text-[#102a43] outline-none transition focus:border-[#635bff]"
                    placeholder="Escalate to human"
                  />
                </label>

                <label className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[#102a43]">Theme preference</p>
                  <p className="mt-1 text-sm text-[#52606d]">
                    Placeholder for the storefront widget appearance mode.
                  </p>
                  <select
                    value={supportAgentForm.themePreference}
                    onChange={(event) =>
                      updateSupportAgentForm(
                        "themePreference",
                        event.target.value as SupportAgentFormState["themePreference"],
                      )
                    }
                    className="mt-3 w-full rounded-2xl border border-[#d9e2ec] bg-[#fbfcfd] px-4 py-3 text-sm text-[#102a43] outline-none transition focus:border-[#635bff]"
                  >
                    <option value="auto">Auto</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>

                <label className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[#102a43]">Position</p>
                  <p className="mt-1 text-sm text-[#52606d]">
                    Placeholder for where the storefront widget will appear.
                  </p>
                  <select
                    value={supportAgentForm.positionPreference}
                    onChange={(event) =>
                      updateSupportAgentForm(
                        "positionPreference",
                        event.target.value as SupportAgentFormState["positionPreference"],
                      )
                    }
                    className="mt-3 w-full rounded-2xl border border-[#d9e2ec] bg-[#fbfcfd] px-4 py-3 text-sm text-[#102a43] outline-none transition focus:border-[#635bff]"
                  >
                    <option value="bottom-right">Bottom right</option>
                    <option value="bottom-left">Bottom left</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 text-sm text-[#243b53] sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Saved at
                  </p>
                  <p className="mt-1">{formatTimestamp(supportAgent?.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Settings shop scope
                  </p>
                  <p className="mt-1">{supportAgent?.shopDomain || connection?.shopDomain || embeddedContext.shopParam || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    First activated
                  </p>
                  <p className="mt-1">{formatTimestamp(supportAgent?.storefrontActivatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Last seen on storefront
                  </p>
                  <p className="mt-1">{formatTimestamp(supportAgent?.storefrontLastSeenAt)}</p>
                </div>
                {supportAgent?.storefrontLastPageUrl ? (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                      Last active page
                    </p>
                    <p className="mt-1 break-all">{supportAgent.storefrontLastPageUrl}</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard
          title="Storefront widget deployment"
          description="Deploy the Shopify-native app embed path for the Stackaura storefront support widget."
          action={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void prepareStorefrontDeployment()}
                disabled={supportAgentDeploymentLoading || supportAgentWidgetConfigLoading}
                className="rounded-full bg-[#635bff] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#5146df] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {supportAgentDeploymentLoading || supportAgentWidgetConfigLoading
                  ? "Preparing…"
                  : "Prepare storefront deployment"}
              </button>
              <button
                type="button"
                onClick={() => void prepareStorefrontDeployment()}
                disabled={supportAgentDeploymentLoading || supportAgentWidgetConfigLoading}
                className="rounded-full border border-[#c5d2e0] px-3 py-1.5 text-sm font-medium text-[#102a43] transition hover:bg-[#f6f8fb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reload
              </button>
              <button
                type="button"
                onClick={() => void copyWidgetConfig()}
                disabled={!supportAgentWidgetConfig?.widgetConfig}
                className="rounded-full border border-[#c5d2e0] px-3 py-1.5 text-sm font-medium text-[#102a43] transition hover:bg-[#f6f8fb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Copy widget config
              </button>
              <button
                type="button"
                onClick={() => setShowDeploymentInstructions((current) => !current)}
                className="rounded-full border border-[#c5d2e0] px-3 py-1.5 text-sm font-medium text-[#102a43] transition hover:bg-[#f6f8fb]"
              >
                {showDeploymentInstructions
                  ? "Hide deployment instructions"
                  : "View deployment instructions"}
              </button>
            </div>
          }
        >
          {!supportAgentDeployment && supportAgentDeploymentLoading ? (
            <EmptyPanel message="Checking storefront widget deployment readiness…" />
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill tone={deploymentTone}>{deploymentStatusLabel}</StatusPill>
                <StatusPill
                  tone={
                    widgetRuntimeConfig?.deploymentStatus === "live_on_storefront"
                      ? "success"
                      : "neutral"
                  }
                >
                  {widgetRuntimeConfig?.deploymentStatus === "live_on_storefront"
                    ? "Live in storefront"
                    : widgetRuntimeConfig?.deploymentStatus === "theme_extension_pending"
                      ? "Theme activation pending"
                      : "Storefront widget not yet live"}
                </StatusPill>
              </div>

              <div className="grid gap-4 text-sm text-[#243b53] sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Deployment method
                  </p>
                  <p className="mt-2 font-medium text-[#102a43]">
                    {storefrontMethodLabel}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Current phase
                  </p>
                  <p className="mt-2 font-medium text-[#102a43]">
                    {deploymentPhaseLabel}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Extension runtime
                  </p>
                  <p className="mt-2 font-medium text-[#102a43]">
                    {supportAgentWidgetConfig?.widgetShellReady
                      ? "Storefront widget shell ready"
                      : "Scaffold pending"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Conversation runtime
                  </p>
                  <p className="mt-2 font-medium text-[#102a43]">
                    {conversationRuntimeLabel}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Theme activation
                  </p>
                  <p className="mt-2 font-medium text-[#102a43]">
                    {supportAgentWidgetConfig?.storefrontActivationObserved
                      ? "Live activation observed"
                      : "Theme activation still required"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Storefront interaction
                  </p>
                  <p className="mt-2 font-medium text-[#102a43]">
                    {storefrontInteractionLabel}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e7edf3] bg-[#fbfcfd] px-4 py-4 text-sm text-[#52606d]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                  Deployment state
                </p>
                <p className="mt-2">{deploymentSummaryMessage}</p>
                <p className="mt-2 text-xs text-[#7b8794]">
                  {supportAgentWidgetConfig?.storefrontActivationObserved
                    ? "A live storefront activation ping has been observed. Lightweight support is active, and richer AI handling can expand next."
                    : "The first live storefront support interaction path is ready in code. Theme activation is still required, and richer AI handling can expand next."}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4 text-sm text-[#243b53]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                  Next required merchant step
                </p>
                <p className="mt-2">{storefrontNextStep}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {supportAgentWidgetConfig?.themeEditorUrl ? (
                    <a
                      href={supportAgentWidgetConfig.themeEditorUrl}
                      target="_top"
                      rel="noreferrer"
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        canOpenThemeEditor
                          ? "border-[#c5d2e0] text-[#102a43] hover:bg-[#f6f8fb]"
                          : "border-[#d9e2ec] text-[#7b8794]"
                      }`}
                    >
                      {supportAgentWidgetConfig.storefrontActivationObserved
                        ? "Open theme editor"
                        : "Open theme editor to activate"}
                    </a>
                  ) : null}
                </div>
              </div>

              {supportAgentDeploymentError || supportAgentWidgetConfigError ? (
                <div className="rounded-2xl border border-[#f0b7bf] bg-[#fff5f6] px-4 py-3 text-sm text-[#8a2332]">
                  {supportAgentDeploymentError || supportAgentWidgetConfigError}
                </div>
              ) : null}

              {supportAgentDeploymentCopyNotice ? (
                <div className="rounded-2xl border border-[#d9e2ec] bg-[#fbfcfd] px-4 py-3 text-sm text-[#486581]">
                  {supportAgentDeploymentCopyNotice}
                </div>
              ) : null}

              {supportAgentDeployment?.missingRequirements.length ? (
                <div className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Missing requirements
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[#243b53]">
                    {supportAgentDeployment.missingRequirements.map((item) => (
                      <li key={item} className="rounded-xl border border-[#eef2f6] bg-[#fbfcfd] px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : supportAgentDeployment?.activation.storefrontActivationObserved ? (
                <div className="rounded-2xl border border-[#b8e6d1] bg-[#effaf4] px-4 py-4 text-sm text-[#127153]">
                  <p className="font-medium">Live on storefront.</p>
                  <p className="mt-2">
                    First activated {formatTimestamp(supportAgentDeployment.activation.storefrontActivatedAt)}. Last seen {formatTimestamp(supportAgentDeployment.activation.storefrontLastSeenAt)}.
                  </p>
                  {supportAgentDeployment.activation.storefrontLastPageUrl ? (
                    <p className="mt-2 break-all text-xs text-[#127153]">
                      Last active page: {supportAgentDeployment.activation.storefrontLastPageUrl}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#b8e6d1] bg-[#effaf4] px-4 py-3 text-sm text-[#127153]">
                  Ready for deployment preparation. The widget shell and basic conversation runtime are ready; the next live step is activating the theme app extension in Shopify.
                </div>
              )}

              <div className="rounded-2xl border border-[#e7edf3] bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                  Widget config preview
                </p>
                {widgetRuntimeConfig ? (
                  <dl className="mt-3 grid gap-3 text-sm text-[#243b53] sm:grid-cols-2">
                    <div>
                      <dt className="text-[#52606d]">Shop domain</dt>
                      <dd className="mt-1 font-medium text-[#102a43]">
                        {widgetRuntimeConfig.shopDomain}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#52606d]">Enabled</dt>
                      <dd className="mt-1">
                        {widgetRuntimeConfig.enabled ? "Yes" : "No"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#52606d]">Support email</dt>
                      <dd className="mt-1 break-all">
                        {widgetRuntimeConfig.supportEmail || "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#52606d]">Escalation</dt>
                      <dd className="mt-1">
                        {widgetRuntimeConfig.escalationEnabled
                          ? widgetRuntimeConfig.escalationLabel
                          : "Disabled"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#52606d]">Theme</dt>
                      <dd className="mt-1">
                        {formatTitle(widgetRuntimeConfig.themePreference)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#52606d]">Position</dt>
                      <dd className="mt-1">
                        {formatTitle(widgetRuntimeConfig.positionPreference)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#52606d]">Extension handle</dt>
                      <dd className="mt-1">
                        {supportAgentWidgetConfig?.extensionHandle || "Not available"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#52606d]">Runtime status</dt>
                      <dd className="mt-1">
                        {formatTitle(widgetRuntimeConfig.deploymentStatus)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#52606d]">First activated</dt>
                      <dd className="mt-1">
                        {formatTimestamp(supportAgentWidgetConfig?.storefrontActivatedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#52606d]">Last seen</dt>
                      <dd className="mt-1">
                        {formatTimestamp(supportAgentWidgetConfig?.storefrontLastSeenAt)}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[#52606d]">Storefront chat URL</dt>
                      <dd className="mt-1 break-all text-[#102a43]">
                        {storefrontChatUrl || "Not available"}
                      </dd>
                    </div>
                    {supportAgentWidgetConfig?.storefrontLastPageUrl ? (
                      <div className="sm:col-span-2">
                        <dt className="text-[#52606d]">Last active page</dt>
                        <dd className="mt-1 break-all text-[#102a43]">
                          {supportAgentWidgetConfig.storefrontLastPageUrl}
                        </dd>
                      </div>
                    ) : null}
                    <div className="sm:col-span-2">
                      <dt className="text-[#52606d]">Greeting message</dt>
                      <dd className="mt-1 text-[#102a43]">
                        {widgetRuntimeConfig.greetingMessage}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <EmptyPanel message="No deployment payload has been loaded yet." />
                )}
              </div>

              {showDeploymentInstructions ? (
                <div className="rounded-2xl border border-[#e7edf3] bg-[#fbfcfd] px-4 py-4 text-sm text-[#52606d]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                    Deployment instructions
                  </p>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-[#243b53]">
                    <li>Save the Support Agent settings and make sure deployment readiness is green.</li>
                    <li>Run <span className="font-mono text-xs">npm run shopify:config:link</span> once if this repo is not yet linked to the real Shopify app.</li>
                    <li>Run <span className="font-mono text-xs">npm run shopify:deploy</span> from this repo to deploy the app configuration and theme app extension.</li>
                    <li>Verify the `stackaura-support-agent-embed` app embed handle exists in Shopify after deploy.</li>
                    <li>Open the Shopify theme editor, activate the Stackaura Support Agent app embed block, and paste the Stackaura app URL into the embed setting.</li>
                    <li>The storefront widget will load from the theme app extension, fetch the storefront-safe widget config from Stackaura, and post customer messages to the public chat runtime.</li>
                    <li>Basic conversation runtime is ready. Richer live AI handling comes next.</li>
                  </ol>
                </div>
              ) : null}
            </div>
          )}
        </SectionCard>

        <SectionCard
          id="conversations"
          title="Support conversations"
          description="Review recent storefront support sessions for this Shopify shop."
          action={
            <button
              type="button"
              onClick={() => void loadSupportConversations()}
              disabled={supportConversationsLoading || selectedConversationLoading}
              className="rounded-full border border-[#c5d2e0] px-3 py-1.5 text-sm font-medium text-[#102a43] transition hover:bg-[#f6f8fb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {supportConversationsLoading ? "Refreshing…" : "Refresh conversations"}
            </button>
          }
        >
          <div className="space-y-5">
            {supportConversationsError ? (
              <div className="rounded-2xl border border-[#f0b7bf] bg-[#fff5f6] px-4 py-3 text-sm text-[#8a2332]">
                {supportConversationsError}
              </div>
            ) : null}

            {supportConversationsLoading && !supportConversations.length ? (
              <EmptyPanel message="Loading storefront support conversations…" />
            ) : supportConversations.length ? (
              <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-3">
                  {supportConversations.map((conversation) => {
                    const isSelected =
                      conversation.sessionId === selectedConversationSessionId;

                    return (
                      <button
                        key={conversation.sessionId}
                        type="button"
                        onClick={() => void loadSupportConversationDetail(conversation.sessionId)}
                        className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                          isSelected
                            ? "border-[#635bff] bg-[#f5f3ff] shadow-sm"
                            : "border-[#e7edf3] bg-white hover:border-[#c5d2e0] hover:bg-[#fbfcfd]"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                            Session
                          </p>
                          <StatusPill
                            tone={conversation.escalationOffered ? "success" : "neutral"}
                          >
                            {conversation.escalationOffered
                              ? "Escalation offered"
                              : "No escalation"}
                          </StatusPill>
                        </div>
                        <p className="mt-2 break-all text-sm font-medium text-[#102a43]">
                          {conversation.sessionId}
                        </p>
                        <p className="mt-3 text-sm text-[#243b53]">
                          {conversation.lastMessagePreview || "No message preview available yet."}
                        </p>
                        <dl className="mt-4 grid gap-3 text-xs text-[#52606d] sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.16em] text-[#7b8794]">
                              Started
                            </dt>
                            <dd className="mt-1">{formatTimestamp(conversation.startedAt)}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.16em] text-[#7b8794]">
                              Last activity
                            </dt>
                            <dd className="mt-1">
                              {formatTimestamp(conversation.lastMessageAt)}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.16em] text-[#7b8794]">
                              Messages
                            </dt>
                            <dd className="mt-1">{conversation.messageCount}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-[0.16em] text-[#7b8794]">
                              Support email shown
                            </dt>
                            <dd className="mt-1">
                              {conversation.supportEmailShown ? "Yes" : "No"}
                            </dd>
                          </div>
                        </dl>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-[#e7edf3] bg-[#fbfcfd] px-4 py-4">
                  {selectedConversationLoading ? (
                    <EmptyPanel message="Loading the selected conversation thread…" />
                  ) : selectedConversationError ? (
                    <div className="rounded-2xl border border-[#f0b7bf] bg-[#fff5f6] px-4 py-3 text-sm text-[#8a2332]">
                      {selectedConversationError}
                    </div>
                  ) : selectedConversation ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b8794]">
                            Conversation thread
                          </p>
                          <p className="mt-2 break-all text-sm font-medium text-[#102a43]">
                            {selectedConversation.sessionId}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusPill
                            tone={
                              selectedConversation.escalationOffered
                                ? "success"
                                : "neutral"
                            }
                          >
                            {selectedConversation.escalationOffered
                              ? "Escalation offered"
                              : "No escalation"}
                          </StatusPill>
                          <StatusPill
                            tone={
                              selectedConversation.supportEmailShown
                                ? "success"
                                : "neutral"
                            }
                          >
                            {selectedConversation.supportEmailShown
                              ? "Support email shown"
                              : "Support email hidden"}
                          </StatusPill>
                        </div>
                      </div>

                      <dl className="grid gap-3 text-xs text-[#52606d] sm:grid-cols-2">
                        <div>
                          <dt className="font-semibold uppercase tracking-[0.16em] text-[#7b8794]">
                            Started
                          </dt>
                          <dd className="mt-1">
                            {formatTimestamp(selectedConversation.startedAt)}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold uppercase tracking-[0.16em] text-[#7b8794]">
                            Last activity
                          </dt>
                          <dd className="mt-1">
                            {formatTimestamp(selectedConversation.lastMessageAt)}
                          </dd>
                        </div>
                      </dl>

                      <div className="space-y-3">
                        {selectedConversation.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`rounded-2xl border px-4 py-3 ${
                              message.role === "assistant"
                                ? "border-[#d9e2ec] bg-white"
                                : "border-[#d7def7] bg-[#f7f8ff]"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b8794]">
                                {formatConversationRole(message.role)}
                              </p>
                              <p className="text-xs text-[#7b8794]">
                                {formatTimestamp(message.createdAt)}
                              </p>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#102a43]">
                              {message.message}
                            </p>
                            {message.pageUrl ? (
                              <p className="mt-3 break-all text-xs text-[#52606d]">
                                Page: {message.pageUrl}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyPanel message="Select a conversation to view the full message thread." />
                  )}
                </div>
              </div>
            ) : (
              <EmptyPanel message="No storefront support conversations have been captured for this shop yet." />
            )}
          </div>
        </SectionCard>

        <SectionCard id="payments" title="Payments" description="Future gateway onboarding will live here inside Shopify Admin.">
          <EmptyPanel message="PayFast / Ozow Shopify integration coming next." />
        </SectionCard>
        <DiagnosticsPanel debug={debug} />
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-[#0a2540]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-[#d9e2ec] bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#635bff]">
                Shopify merchant console
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a2540]">
                {view === "home" ? "Stackaura merchant home" : "Stackaura settings"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#52606d]">
                {view === "home"
                  ? "A clean embedded home for Shopify merchants with connection health, product visibility, and webhook coverage."
                  : "Embedded settings for store connection details, webhook management, and the next Stackaura setup areas."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {refreshButton}
              {registerButton}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={homeHref}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname === "/shopify"
                  ? "bg-[#635bff] text-white"
                  : "border border-[#c5d2e0] text-[#102a43] hover:bg-[#f6f8fb]"
              }`}
            >
              Overview
            </Link>
            <Link
              href={settingsHref}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname === "/shopify/settings"
                  ? "bg-[#635bff] text-white"
                  : "border border-[#c5d2e0] text-[#102a43] hover:bg-[#f6f8fb]"
              }`}
            >
              Settings
            </Link>
          </div>
        </header>

        {error ? (
          <section className="rounded-3xl border border-[#f0b7bf] bg-[#fff5f6] px-5 py-4 text-sm text-[#8a2332]">
            {error}
          </section>
        ) : null}

        {!status && loading ? (
          <section className="rounded-3xl border border-[#d9e2ec] bg-white px-6 py-8 shadow-sm">
            <EmptyPanel message="Loading the Shopify merchant console…" />
          </section>
        ) : view === "home" ? (
          overviewContent
        ) : (
          settingsContent
        )}
      </div>
    </main>
  );
}
