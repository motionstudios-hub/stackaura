"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import {
  cn,
  lightProductCompactGhostButtonClass,
  lightProductCompactPrimaryButtonClass,
  lightProductGhostButtonClass,
  lightProductInsetPanelClass,
  lightProductInputClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
} from "../../components/stackaura-ui";

type MerchantSeed = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  planCode: string;
} | null;

type GatewayState = {
  connected: boolean;
  [key: string]: unknown;
};

type SupportCitation = {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  source: string;
};

type ConversationSummary = {
  id: string;
  title: string;
  status: string;
  lastMessageAt: string;
  preview: string;
  lastMessageRole: string | null;
  escalation: {
    id: string;
    status: string;
    emailTo: string;
    sentAt: string | null;
  } | null;
};

type ConversationDetail = {
  id: string;
  merchantId: string;
  title: string;
  status: string;
  lastMessageAt: string;
  escalatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    citations: SupportCitation[];
    contextSnapshot: unknown;
    createdAt: string;
  }>;
  escalations: Array<{
    id: string;
    reason: string;
    summary: string;
    emailTo: string;
    status: string;
    sentAt: string | null;
    failureMessage: string | null;
    createdAt: string;
  }>;
};

type MerchantContext = {
  merchant: {
    id: string;
    name: string;
    email: string;
    accountStatus: string;
    planCode: string;
    currentEnvironment: string;
  };
  gateways: {
    connectedCount: number;
    ozow: GatewayState;
    yoco: GatewayState;
    paystack: GatewayState;
  };
  apiKeys: {
    activeCount: number;
    testKeyCount: number;
    liveKeyCount: number;
    latestCreatedAt: string | null;
    latestLastUsedAt: string | null;
  };
  onboarding: {
    completed: boolean;
    status: string;
    detail: string;
  };
  payments: {
    totalPayments: number;
    successRate: number;
    recentFailures: Array<{
      reference: string;
      status: string;
      gateway: string | null;
      updatedAt: string;
    }>;
    recentRoutingIssues: Array<{
      reference: string;
      status: string;
      routeSummary: string;
      fallbackCount: number;
      createdAt: string;
    }>;
  };
  payouts: {
    pendingCount: number;
    failedCount: number;
    recent: Array<{
      reference: string;
      status: string;
      amountCents: number;
      currency: string;
      provider: string | null;
      createdAt: string;
    }>;
  };
  kyc: {
    tracked: boolean;
    status: string;
    detail: string;
  };
  supportInboxEmail: string;
  generatedAt: string;
};

const suggestionPrompts = [
  "Why is my checkout failing?",
  "How do I connect Ozow?",
  "Where is my API key?",
  "Why is my account pending?",
];

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function gatewayLabel(gateway: string) {
  return gateway.charAt(0).toUpperCase() + gateway.slice(1).toLowerCase();
}

function connectedLabel(connection: GatewayState) {
  return connection.connected ? "Connected" : "Not connected";
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export default function SupportConsole({ merchant }: { merchant: MerchantSeed }) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationDetail | null>(null);
  const [merchantContext, setMerchantContext] = useState<MerchantContext | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeConversationId = activeConversation?.id ?? null;

  useEffect(() => {
    async function run() {
      if (!merchant?.id) {
        setConversations([]);
        setActiveConversation(null);
        setMerchantContext(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = (await apiFetch(
          `/v1/support/conversations?merchantId=${encodeURIComponent(merchant.id)}`,
        )) as {
          merchantContext: MerchantContext;
          conversations: ConversationSummary[];
        };

        setMerchantContext(data.merchantContext);
        setConversations(data.conversations);

        if (data.conversations[0]?.id) {
          const detail = (await apiFetch(
            `/v1/support/conversations/${data.conversations[0].id}`,
          )) as {
            merchantContext: MerchantContext;
            conversation: ConversationDetail;
          };

          setMerchantContext(detail.merchantContext);
          setActiveConversation(detail.conversation);
        } else {
          setActiveConversation(null);
        }
      } catch (loadError) {
        setError(normalizeErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, [merchant?.id]);

  const merchantBadge = useMemo(() => {
    if (!merchant) return "No workspace selected";
    return `${merchant.name} · ${merchant.planCode} plan`;
  }, [merchant]);

  async function refreshConversations(preferredConversationId?: string | null) {
    if (!merchant?.id) {
      return;
    }

    const data = (await apiFetch(
      `/v1/support/conversations?merchantId=${encodeURIComponent(merchant.id)}`,
    )) as {
      merchantContext: MerchantContext;
      conversations: ConversationSummary[];
    };

    setMerchantContext(data.merchantContext);
    setConversations(data.conversations);

    const nextConversationId =
      preferredConversationId || data.conversations[0]?.id || null;

    if (nextConversationId) {
      await openConversation(nextConversationId);
    } else {
      setActiveConversation(null);
    }
  }

  async function openConversation(conversationId: string) {
    const detail = (await apiFetch(`/v1/support/conversations/${conversationId}`)) as {
      merchantContext: MerchantContext;
      conversation: ConversationDetail;
    };

    setMerchantContext(detail.merchantContext);
    setActiveConversation(detail.conversation);
  }

  async function sendMessage(message: string) {
    if (!merchant?.id) {
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = (await apiFetch("/v1/support/chat", {
        method: "POST",
        body: JSON.stringify({
          merchantId: merchant.id,
          message: trimmed,
          conversationId: activeConversationId,
        }),
      })) as {
        merchantContext: MerchantContext;
        escalationRecommended: boolean;
        escalationReason: string | null;
        conversation: ConversationDetail;
      };

      setInput("");
      setMerchantContext(response.merchantContext);
      setActiveConversation(response.conversation);
      await refreshConversations(response.conversation.id);

      if (response.escalationRecommended) {
        setSuccess(
          `The AI recommends escalating this to human support${response.escalationReason ? ` because it involves ${response.escalationReason}` : ""}.`,
        );
      }
    } catch (sendError) {
      setError(normalizeErrorMessage(sendError));
    } finally {
      setSending(false);
    }
  }

  async function escalateConversation() {
    if (!activeConversationId) {
      return;
    }

    setEscalating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = (await apiFetch(
        `/v1/support/conversations/${activeConversationId}/escalate`,
        {
          method: "POST",
          body: JSON.stringify({
            reason: "Merchant requested human support from the dashboard support console",
          }),
        },
      )) as {
        supportInboxEmail: string;
        escalation: {
          status: string;
          emailTo: string;
          alreadyEscalated: boolean;
        };
        conversation: ConversationDetail;
      };

      setActiveConversation(response.conversation);
      await refreshConversations(response.conversation.id);
      setSuccess(
        response.escalation.alreadyEscalated
          ? `This conversation was already handed off to the support team behind ${response.escalation.emailTo}.`
          : `This conversation was handed off to the support team behind ${response.escalation.emailTo}.`,
      );
    } catch (escalateError) {
      setError(normalizeErrorMessage(escalateError));
    } finally {
      setEscalating(false);
    }
  }

  const disabled = !merchant?.id;

  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]">
      <div className={cn(lightProductPanelClass, "overflow-hidden")}>
        <div className="border-b border-white/45 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className={lightProductSectionEyebrowClass}>Support assistant</div>
              <div className="mt-3 text-2xl font-semibold text-[#0a2540]">
                Merchant-aware AI support
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                {merchantBadge}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={lightProductStatusPillClass("violet")}>Dashboard only</span>
              <span className={lightProductStatusPillClass("success")}>Read only</span>
              <button
                type="button"
                onClick={escalateConversation}
                disabled={!activeConversationId || escalating}
                className={cn(
                  lightProductCompactPrimaryButtonClass,
                  (!activeConversationId || escalating) && "cursor-not-allowed opacity-60",
                )}
              >
                {escalating ? "Escalating..." : "Escalate to human"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {suggestionPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={disabled || sending}
                onClick={() => void sendMessage(prompt)}
                className={cn(
                  lightProductCompactGhostButtonClass,
                  "justify-start rounded-2xl px-4 py-3 text-left text-sm",
                  (disabled || sending) && "cursor-not-allowed opacity-60",
                )}
              >
                {prompt}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-amber-300/70 bg-amber-50/85 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-4 rounded-2xl border border-emerald-300/70 bg-emerald-50/85 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          ) : null}
        </div>

        <div className="border-b border-white/35 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {conversations.length === 0 ? (
              <span className="text-sm text-[#6b7c93]">
                {loading ? "Loading conversations..." : "No support conversations yet."}
              </span>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => void openConversation(conversation.id)}
                  className={cn(
                    lightProductCompactGhostButtonClass,
                    "max-w-full rounded-2xl px-4 py-3 text-left",
                    activeConversationId === conversation.id &&
                      "border-white/56 bg-[linear-gradient(180deg,rgba(122,115,255,0.18),rgba(160,233,255,0.16))] text-[#0a2540]",
                  )}
                >
                  <div className="truncate text-sm font-semibold">{conversation.title}</div>
                  <div className="mt-1 truncate text-xs text-[#6b7c93]">
                    {conversation.preview || "Conversation ready"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          {activeConversation?.messages?.length ? (
            activeConversation.messages.map((message) => {
              const assistant = message.role === "ASSISTANT";

              return (
                <div
                  key={message.id}
                  className={cn(
                    lightProductInsetPanelClass,
                    "p-4",
                    assistant
                      ? "border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(238,246,250,0.22))]"
                      : "border-[#b8b2ff]/45 bg-[linear-gradient(180deg,rgba(122,115,255,0.12),rgba(160,233,255,0.10))]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">
                      {assistant ? "Stackaura AI" : "You"}
                    </div>
                    <div className="text-xs text-[#6b7c93]">{formatDateTime(message.createdAt)}</div>
                  </div>

                  <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#0a2540]">
                    {message.content}
                  </div>

                  {assistant && message.citations.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {message.citations.map((citation) => (
                        <a
                          key={`${message.id}-${citation.id}`}
                          href={citation.url}
                          className={cn(
                            lightProductCompactGhostButtonClass,
                            "rounded-full px-3 py-2 text-xs text-[#425466]",
                          )}
                        >
                          {citation.title}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className={cn(lightProductInsetPanelClass, "p-6")}>
              <div className="text-lg font-semibold text-[#0a2540]">
                Start a support conversation
              </div>
              <p className={cn(lightProductMutedTextClass, "mt-3")}>
                Ask about setup, integration, gateway configuration, account status, payment
                errors, or payout visibility. If the issue needs a person, use the visible
                escalation action and the case will be routed to wesupport@stackaura.co.za.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/40 px-5 py-5 sm:px-6">
          <label className="block text-xs uppercase tracking-[0.22em] text-[#6b7c93]">
            Message
          </label>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={disabled ? "Select a merchant workspace first" : "Ask Stackaura Support AI..."}
            disabled={disabled || sending}
            rows={4}
            className={cn(lightProductInputClass, "mt-3 min-h-[132px] resize-y")}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[#6b7c93]">
              Human support escalations route through
              {" "}
              <strong>{merchantContext?.supportInboxEmail || "wesupport@stackaura.co.za"}</strong>.
            </div>

            <button
              type="button"
              onClick={() => void sendMessage(input)}
              disabled={disabled || sending || input.trim().length === 0}
              className={cn(
                lightProductGhostButtonClass,
                "min-w-[160px] rounded-2xl",
                (disabled || sending || input.trim().length === 0) &&
                  "cursor-not-allowed opacity-60",
              )}
            >
              {sending ? "Sending..." : "Send message"}
            </button>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className={cn(lightProductPanelClass, "p-5")}>
          <div className={lightProductSectionEyebrowClass}>Merchant context</div>
          <div className="mt-3 text-xl font-semibold text-[#0a2540]">
            {merchantContext?.merchant.name || merchant?.name || "No merchant selected"}
          </div>
          <div className="mt-2 text-sm text-[#425466]">
            {merchantContext?.merchant.email || merchant?.email || "Support answers are grounded in the selected workspace."}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={lightProductStatusPillClass("violet")}>
              {merchantContext?.merchant.planCode || merchant?.planCode || "growth"} plan
            </span>
            <span
              className={lightProductStatusPillClass(
                merchantContext?.merchant.accountStatus === "ACTIVE" ? "success" : "warning",
              )}
            >
              {merchantContext?.merchant.accountStatus || (merchant?.isActive ? "ACTIVE" : "PENDING")}
            </span>
            <span className={lightProductStatusPillClass("muted")}>
              {merchantContext?.merchant.currentEnvironment || "unknown"} mode
            </span>
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-5")}>
          <div className="text-xs uppercase tracking-[0.22em] text-[#6b7c93]">Gateways</div>
          <div className="mt-4 grid gap-3">
            {merchantContext ? (
              (["ozow", "yoco", "paystack"] as const).map((gateway) => (
                <div key={gateway} className={cn(lightProductInsetPanelClass, "p-4")}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#0a2540]">{gatewayLabel(gateway)}</div>
                    <span
                      className={lightProductStatusPillClass(
                        merchantContext.gateways[gateway].connected ? "success" : "muted",
                      )}
                    >
                      {connectedLabel(merchantContext.gateways[gateway])}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-[#6b7c93]">Load a merchant to view gateway state.</div>
            )}
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-5")}>
          <div className="text-xs uppercase tracking-[0.22em] text-[#6b7c93]">API keys & onboarding</div>
          <div className="mt-4 grid gap-3">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-semibold text-[#0a2540]">
                {merchantContext?.apiKeys.activeCount ?? 0} active key(s)
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                {merchantContext
                  ? `${merchantContext.apiKeys.testKeyCount} test / ${merchantContext.apiKeys.liveKeyCount} live`
                  : "Support will show test/live key presence here."}
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-semibold text-[#0a2540]">
                {merchantContext?.onboarding.status || "Unknown"} onboarding
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                {merchantContext?.onboarding.detail || "Onboarding status will appear after context loads."}
              </div>
            </div>
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-5")}>
          <div className="text-xs uppercase tracking-[0.22em] text-[#6b7c93]">Recent issues</div>
          <div className="mt-4 space-y-3">
            {merchantContext?.payments.recentFailures.length ? (
              merchantContext.payments.recentFailures.map((failure) => (
                <div key={failure.reference} className={cn(lightProductInsetPanelClass, "p-4")}>
                  <div className="text-sm font-semibold text-[#0a2540]">{failure.reference}</div>
                  <div className="mt-2 text-sm text-[#425466]">
                    {failure.status} on {formatDateTime(failure.updatedAt)}
                    {failure.gateway ? ` via ${failure.gateway}` : ""}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-[#6b7c93]">
                No recent failed or cancelled payments are in the current support snapshot.
              </div>
            )}
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-5")}>
          <div className="text-xs uppercase tracking-[0.22em] text-[#6b7c93]">Payouts & account checks</div>
          <div className="mt-4 grid gap-3">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-semibold text-[#0a2540]">
                {merchantContext
                  ? `${merchantContext.payouts.pendingCount} pending / ${merchantContext.payouts.failedCount} failed payouts`
                  : "Payout state unavailable"}
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                {merchantContext?.payouts.recent[0]
                  ? `Latest payout: ${merchantContext.payouts.recent[0].reference} on ${formatDateTime(
                      merchantContext.payouts.recent[0].createdAt,
                    )}.`
                  : "No recent payout activity is in the current snapshot."}
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-semibold text-[#0a2540]">
                {merchantContext?.kyc.status || "UNAVAILABLE"} KYC visibility
              </div>
              <div className="mt-2 text-sm text-[#425466]">
                {merchantContext?.kyc.detail ||
                  "KYC progress will appear here when the merchant schema starts tracking it."}
              </div>
            </div>
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-5")}>
          <div className="text-xs uppercase tracking-[0.22em] text-[#6b7c93]">Human support handoff</div>
          <div className="mt-3 text-sm leading-7 text-[#425466]">
            Sensitive or unresolved issues should be escalated to the official Stackaura support
            inbox:
          </div>
          <div className="mt-4 text-lg font-semibold text-[#0a2540]">
            {merchantContext?.supportInboxEmail || "wesupport@stackaura.co.za"}
          </div>
          <div className="mt-3 text-sm text-[#425466]">
            Billing issues stay separate at billing@stackaura.co.za, and general inquiries stay
            separate at info@stackaura.co.za.
          </div>
        </div>
      </aside>
    </section>
  );
}
