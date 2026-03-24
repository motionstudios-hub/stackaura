import { unstable_rethrow } from "next/navigation";
import {
  cn,
  lightProductHeroClass,
  lightProductInsetPanelClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
} from "../../components/stackaura-ui";
import {
  AdminOverviewFetchError,
  getAdminOverview,
  type AdminOverviewResponse,
} from "../../lib/admin";

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatShortCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amountCents / 100);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-ZA").format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function metricTone(value: "success" | "violet" | "warning" | "muted") {
  return lightProductStatusPillClass(value);
}

function renderStatusPill(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "PAID" || normalized === "SUCCESS" || normalized === "SENT") {
    return <span className={metricTone("success")}>{status}</span>;
  }

  if (normalized === "FAILED" || normalized === "CANCELLED") {
    return <span className={metricTone("warning")}>{status}</span>;
  }

  if (normalized === "PENDING" || normalized === "ESCALATED") {
    return <span className={metricTone("violet")}>{status}</span>;
  }

  return <span className={metricTone("muted")}>{status}</span>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className={cn(lightProductInsetPanelClass, "p-5 text-sm leading-7 text-[#6b7c93]")}>
      {message}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "success" | "violet" | "warning" | "muted";
}) {
  return (
    <div className={cn(lightProductPanelClass, "p-5")}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">{label}</div>
        <span className={metricTone(tone)}>{label}</span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-[#0a2540]">{value}</div>
      <p className="mt-3 text-sm leading-6 text-[#425466]">{detail}</p>
    </div>
  );
}

function MiniTrendChart({
  title,
  description,
  data,
  valueKey,
  tone,
  valueFormatter = formatNumber,
}: {
  title: string;
  description: string;
  data: Array<Record<string, number | string | null>>;
  valueKey: string;
  tone: string;
  valueFormatter?: (value: number) => string;
}) {
  const points = data.slice(-14);
  const max = Math.max(
    1,
    ...points.map((point) =>
      typeof point[valueKey] === "number" ? (point[valueKey] as number) : 0
    )
  );

  return (
    <div className={cn(lightProductPanelClass, "p-6")}>
      <div className={lightProductSectionEyebrowClass}>{title}</div>
      <p className={cn(lightProductMutedTextClass, "mt-3 max-w-2xl text-sm")}>{description}</p>

      {points.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No data yet." />
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex h-52 items-end gap-2">
            {points.map((point) => {
              const value = typeof point[valueKey] === "number" ? (point[valueKey] as number) : 0;
              const height = `${Math.max(10, (value / max) * 100)}%`;

              return (
                <div key={String(point.date)} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="text-[11px] font-medium text-[#6b7c93]">
                    {valueFormatter(value)}
                  </div>
                  <div className="flex h-40 w-full items-end rounded-[18px] bg-white/35 px-1.5 pb-1.5">
                    <div
                      className={cn("w-full rounded-[14px]", tone)}
                      style={{ height }}
                    />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#6b7c93]">
                    {String(point.date).slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function GatewayUsagePanel({
  data,
}: {
  data: AdminOverviewResponse["payments"]["gatewayUsage"];
}) {
  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <div className={cn(lightProductPanelClass, "p-6")}>
      <div className={lightProductSectionEyebrowClass}>Gateway usage breakdown</div>
      <p className={cn(lightProductMutedTextClass, "mt-3 text-sm")}>
        Real gateway mix resolved from the latest attempt on each payment.
      </p>

      <div className="mt-6 space-y-4">
        {data.length === 0 ? (
          <EmptyState message="No payment gateway usage yet." />
        ) : (
          data.map((item) => (
            <div key={item.gateway} className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[#0a2540]">{item.label}</div>
                  <div className="text-sm text-[#6b7c93]">{formatCurrencyFromCents(item.volumeCents)}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-[#0a2540]">{formatNumber(item.count)}</div>
                  <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">payments</div>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/50">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(92,123,255,0.92)_0%,rgba(59,130,246,0.82)_100%)]"
                  style={{ width: `${Math.max(10, (item.count / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RevenueByMerchantPanel({
  title,
  description,
  items,
  metricKey,
}: {
  title: string;
  description: string;
  items: AdminOverviewResponse["revenue"]["revenueByMerchant"];
  metricKey: "grossVolumeCents" | "stackauraFeeCents";
}) {
  const rows = items.slice(0, 6);
  const max = Math.max(1, ...rows.map((item) => item[metricKey]));

  return (
    <div className={cn(lightProductPanelClass, "p-6")}>
      <div className={lightProductSectionEyebrowClass}>{title}</div>
      <p className={cn(lightProductMutedTextClass, "mt-3 text-sm")}>{description}</p>

      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No successful merchant payments yet." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((item) => (
            <div key={`${item.merchantId}-${metricKey}`} className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[#0a2540]">{item.merchantName}</div>
                  <div className="text-sm text-[#6b7c93]">
                    {formatNumber(item.paymentCount)} payments
                  </div>
                </div>
                <div className="text-right text-base font-semibold text-[#0a2540]">
                  {formatCurrencyFromCents(item[metricKey])}
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/50">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(92,123,255,0.92)_0%,rgba(59,130,246,0.82)_100%)]"
                  style={{ width: `${Math.max(10, (item[metricKey] / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FunnelPanel({ funnel }: { funnel: AdminOverviewResponse["funnel"] }) {
  const orderedStages: Array<{
    key: keyof AdminOverviewResponse["funnel"]["counts"];
    label: string;
    tone: "success" | "violet" | "warning" | "muted";
  }> = [
    { key: "created", label: "Created", tone: "muted" },
    { key: "pending", label: "Pending", tone: "violet" },
    { key: "paid", label: "Paid", tone: "success" },
    { key: "failed", label: "Failed", tone: "warning" },
    { key: "cancelled", label: "Cancelled", tone: "warning" },
    { key: "expired", label: "Expired", tone: "muted" },
  ];
  const max = Math.max(1, ...orderedStages.map((stage) => funnel.counts[stage.key]));
  const trendPoints = funnel.overTime.slice(-14);

  return (
    <div className={cn(lightProductPanelClass, "p-6")}>
      <div className={lightProductSectionEyebrowClass}>Payment funnel</div>
      <p className={cn(lightProductMutedTextClass, "mt-3 text-sm")}>
        Current payment-state mix plus conversion from created to pending and paid.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {orderedStages.map((stage) => (
          <div key={stage.key} className={cn(lightProductInsetPanelClass, "p-4")}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#6b7c93]">
                {stage.label}
              </div>
              <span className={metricTone(stage.tone)}>{stage.label}</span>
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-[#0a2540]">
              {formatNumber(funnel.counts[stage.key])}
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/50">
              <div
                className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(92,123,255,0.92)_0%,rgba(59,130,246,0.82)_100%)]"
                style={{ width: `${Math.max(8, (funnel.counts[stage.key] / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className={cn(lightProductInsetPanelClass, "p-4")}>
          <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Created → pending</div>
          <div className="mt-2 text-2xl font-semibold text-[#0a2540]">
            {formatPercent(funnel.conversion.createdToPendingPct)}
          </div>
        </div>
        <div className={cn(lightProductInsetPanelClass, "p-4")}>
          <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Pending → paid</div>
          <div className="mt-2 text-2xl font-semibold text-[#0a2540]">
            {formatPercent(funnel.conversion.pendingToPaidPct)}
          </div>
        </div>
        <div className={cn(lightProductInsetPanelClass, "p-4")}>
          <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Created → paid</div>
          <div className="mt-2 text-2xl font-semibold text-[#0a2540]">
            {formatPercent(funnel.conversion.createdToPaidPct)}
          </div>
        </div>
        <div className={cn(lightProductInsetPanelClass, "p-4")}>
          <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Pending → terminal</div>
          <div className="mt-2 text-2xl font-semibold text-[#0a2540]">
            {formatPercent(funnel.conversion.pendingToTerminalPct)}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
          Stage trends (14 days)
        </div>
        {trendPoints.length === 0 ? (
          <div className="mt-4">
            <EmptyState message="No funnel trend data yet." />
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {orderedStages.map((stage) => {
              const stageMax = Math.max(1, ...trendPoints.map((point) => point[stage.key]));

              return (
                <div key={`trend-${stage.key}`} className={cn(lightProductInsetPanelClass, "p-4")}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[#0a2540]">{stage.label}</div>
                    <span className={metricTone(stage.tone)}>
                      {formatNumber(funnel.counts[stage.key])}
                    </span>
                  </div>
                  <div className="mt-4 flex h-12 items-end gap-1.5">
                    {trendPoints.map((point) => (
                      <div key={`${stage.key}-${point.date}`} className="flex flex-1 items-end">
                        <div
                          className="w-full rounded-[999px] bg-[linear-gradient(180deg,rgba(92,123,255,0.92)_0%,rgba(59,130,246,0.72)_100%)]"
                          style={{
                            height: `${Math.max(8, (point[stage.key] / stageMax) * 100)}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function GatewayHealthPanel({
  data,
}: {
  data: AdminOverviewResponse["gatewayHealth"]["byGateway"];
}) {
  return (
    <div className={cn(lightProductPanelClass, "p-6")}>
      <div className={lightProductSectionEyebrowClass}>Gateway health</div>
      <p className={cn(lightProductMutedTextClass, "mt-3 text-sm")}>
        Terminal outcome rates, failover volume, and resolution time by final gateway.
      </p>

      {data.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No gateway health data yet." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {data.map((gateway) => (
            <div key={gateway.gateway} className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-[#0a2540]">{gateway.label}</div>
                  <div className="mt-1 text-sm text-[#6b7c93]">
                    {formatNumber(gateway.totalPayments)} payments · {formatPercent(gateway.successRate)} success
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={metricTone("success")}>{formatPercent(gateway.successRate)} success</span>
                  <span className={metricTone("warning")}>{formatPercent(gateway.failureRate)} failed</span>
                  <span className={metricTone("muted")}>{formatPercent(gateway.cancelRate)} cancelled</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Failovers landing here</div>
                  <div className="mt-1 text-lg font-semibold text-[#0a2540]">
                    {formatNumber(gateway.failoverCount)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Avg resolution</div>
                  <div className="mt-1 text-lg font-semibold text-[#0a2540]">
                    {gateway.avgResolutionMinutes === null
                      ? "Not wired yet"
                      : `${gateway.avgResolutionMinutes.toFixed(1)} min`}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Webhook issues</div>
                  <div className="mt-1 text-lg font-semibold text-[#0a2540]">
                    {gateway.webhookIssueCount === null ? "Not wired yet" : formatNumber(gateway.webhookIssueCount)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Latest failing references</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {gateway.latestFailingReferences.length === 0 ? (
                    <span className="text-sm text-[#6b7c93]">No recent failing references.</span>
                  ) : (
                    gateway.latestFailingReferences.map((item) => (
                      <span
                        key={`${gateway.gateway}-${item.reference}-${item.createdAt}`}
                        className="rounded-full border border-white/48 bg-white/58 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-[#425466]"
                      >
                        {item.reference}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeeBearingPaymentTable({
  payments,
}: {
  payments: AdminOverviewResponse["revenue"]["recentFeeBearingPayments"];
}) {
  return (
    <div className={cn(lightProductPanelClass, "p-6")}>
      <div className={lightProductSectionEyebrowClass}>Recent fee-bearing payments</div>
      <p className={cn(lightProductMutedTextClass, "mt-3 text-sm")}>
        Successful payments already carrying real stored Stackaura fee values.
      </p>

      {payments.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No successful fee-bearing payments yet." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[24px] border border-white/48 bg-white/40">
          <div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.8fr] gap-3 border-b border-white/48 px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[#6b7c93]">
            <div>Reference</div>
            <div>Merchant</div>
            <div>Base</div>
            <div>Stackaura fee</div>
          </div>
          <div className="divide-y divide-white/44">
            {payments.map((payment) => (
              <div
                key={`${payment.reference}-${payment.createdAt}`}
                className="grid grid-cols-[1.1fr_1fr_0.8fr_0.8fr] gap-3 px-4 py-4 text-sm text-[#425466]"
              >
                <div>
                  <div className="font-semibold text-[#0a2540]">{payment.reference}</div>
                  <div className="mt-1 text-xs text-[#6b7c93]">
                    {payment.gatewayLabel} · {formatDateTime(payment.createdAt)}
                  </div>
                </div>
                <div className="font-medium text-[#0a2540]">{payment.merchantName}</div>
                <div>{formatCurrencyFromCents(payment.baseAmountCents)}</div>
                <div className="font-semibold text-[#0a2540]">
                  {formatCurrencyFromCents(payment.platformFeeCents)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecentOutcomeTable({
  outcomes,
}: {
  outcomes: AdminOverviewResponse["payments"]["recentOutcomes"];
}) {
  return (
    <div className={cn(lightProductPanelClass, "p-6")}>
      <div className={lightProductSectionEyebrowClass}>Recent payment outcomes</div>
      <p className={cn(lightProductMutedTextClass, "mt-3 text-sm")}>
        Latest successful and failed real merchant payments across the platform.
      </p>

      {outcomes.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="No payment outcomes recorded yet." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[24px] border border-white/48 bg-white/40">
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.9fr] gap-3 border-b border-white/48 px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[#6b7c93]">
            <div>Reference</div>
            <div>Merchant</div>
            <div>Gateway</div>
            <div>Outcome</div>
          </div>
          <div className="divide-y divide-white/44">
            {outcomes.map((outcome) => (
              <div
                key={`${outcome.reference}-${outcome.createdAt}`}
                className="grid grid-cols-[1.2fr_1fr_0.8fr_0.9fr] gap-3 px-4 py-4 text-sm text-[#425466]"
              >
                <div>
                  <div className="font-semibold text-[#0a2540]">{outcome.reference}</div>
                  <div className="mt-1 text-xs text-[#6b7c93]">
                    {formatCurrencyFromCents(outcome.amountCents)} · {formatDateTime(outcome.createdAt)}
                  </div>
                </div>
                <div className="font-medium text-[#0a2540]">{outcome.merchantName}</div>
                <div>{outcome.gatewayLabel}</div>
                <div>{renderStatusPill(outcome.status)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IssueList({
  title,
  description,
  issues,
}: {
  title: string;
  description: string;
  issues: Array<{
    key: string;
    title: string;
    merchantName: string;
    status: string;
    detail: string;
    createdAt: string;
  }>;
}) {
  return (
    <div className={cn(lightProductPanelClass, "p-6")}>
      <div className={lightProductSectionEyebrowClass}>{title}</div>
      <p className={cn(lightProductMutedTextClass, "mt-3 text-sm")}>{description}</p>

      <div className="mt-6 space-y-3">
        {issues.length === 0 ? (
          <EmptyState message="No issues to review right now." />
        ) : (
          issues.map((issue) => (
            <div key={issue.key} className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-[#0a2540]">{issue.title}</div>
                  <div className="mt-1 text-sm text-[#425466]">{issue.merchantName}</div>
                </div>
                {renderStatusPill(issue.status)}
              </div>
              <p className="mt-3 text-sm leading-6 text-[#425466]">{issue.detail}</p>
              <div className="mt-3 text-xs uppercase tracking-[0.14em] text-[#6b7c93]">
                {formatDateTime(issue.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  let overview: AdminOverviewResponse | null = null;
  let unavailable = false;
  let failureStatus: number | null = null;

  try {
    overview = await getAdminOverview();
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AdminOverviewFetchError) {
      failureStatus = error.status;
    }
    unavailable = true;
  }

  if (!overview || unavailable) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <section className={cn(lightProductHeroClass, "p-6 lg:p-8")}>
          <div className={lightProductSectionEyebrowClass}>Admin overview</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a2540]">
            Admin analytics are temporarily unavailable.
          </h1>
          <p className={cn(lightProductMutedTextClass, "mt-4 max-w-2xl")}>
            Stackaura could not load the internal analytics feed just now. The admin route remains
            protected, but the summary data needs the backend admin endpoint to respond.
          </p>
          {failureStatus ? (
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.16em] text-[#6b7c93]">
              Backend status: {failureStatus}
            </p>
          ) : null}
        </section>
      </div>
    );
  }

  const topMetrics = [
    {
      label: "Gross volume",
      value: formatCurrencyFromCents(overview.revenue.grossProcessedVolumeCents),
      detail: "Successful processed volume charged through Stackaura-managed payment flows.",
      tone: "success" as const,
    },
    {
      label: "Stackaura revenue",
      value: formatCurrencyFromCents(overview.revenue.stackauraFeeEarnedCents),
      detail: "Real stored Stackaura platform fees earned from successful payments.",
      tone: "violet" as const,
    },
    {
      label: "Provider fees",
      value:
        overview.revenue.providerFeesObservedCents === null
          ? "Not wired yet"
          : formatCurrencyFromCents(overview.revenue.providerFeesObservedCents),
      detail: overview.revenue.providerFeesAvailable
        ? "Observed provider fee amounts captured from stored payment data."
        : "Provider fee capture is not wired yet for current payment rails.",
      tone: "muted" as const,
    },
    {
      label: "Net volume",
      value:
        overview.revenue.netVolumeAfterProviderFeesCents === null
          ? formatCurrencyFromCents(
              overview.revenue.grossProcessedVolumeCents -
                overview.revenue.stackauraFeeEarnedCents
            )
          : formatCurrencyFromCents(overview.revenue.netVolumeAfterProviderFeesCents),
      detail: overview.revenue.providerFeesAvailable
        ? "Merchant receivable after provider fees where provider costs are known."
        : "Merchant receivable before provider fees while provider fee capture is not wired.",
      tone: "warning" as const,
    },
  ];

  const secondaryMetrics = [
    {
      label: "Created",
      value: formatNumber(overview.funnel.counts.created),
      detail: "Payments currently still in CREATED status.",
      tone: "success" as const,
    },
    {
      label: "Pending",
      value: formatNumber(overview.funnel.counts.pending),
      detail: "Payments waiting on provider completion or user action.",
      tone: "violet" as const,
    },
    {
      label: "Paid",
      value: formatNumber(overview.funnel.counts.paid),
      detail: `Success rate ${formatPercent(overview.payments.successRate)} across terminal payments.`,
      tone: "success" as const,
    },
    {
      label: "Failed / cancelled",
      value: formatNumber(
        overview.funnel.counts.failed + overview.funnel.counts.cancelled
      ),
      detail: `${formatNumber(overview.funnel.counts.failed)} failed · ${formatNumber(
        overview.funnel.counts.cancelled
      )} cancelled`,
      tone: "warning" as const,
    },
  ];

  const businessMetrics = [
    {
      label: "Total merchants",
      value: formatNumber(overview.business.totalMerchants),
      detail: "All merchant workspaces currently recorded in the platform database.",
      tone: "success" as const,
    },
    {
      label: "New signups",
      value: formatNumber(overview.business.newSignups.last7Days),
      detail: `${formatNumber(overview.business.newSignups.today)} today · ${formatNumber(
        overview.business.newSignups.last30Days
      )} in 30 days`,
      tone: "violet" as const,
    },
    {
      label: "Active merchants",
      value: formatNumber(overview.business.activeMerchants),
      detail: "Merchant workspaces currently marked active in the backend.",
      tone: "muted" as const,
    },
    {
      label: "Avg fee / payment",
      value: formatCurrencyFromCents(overview.revenue.averageFeePerPaymentCents),
      detail: "Average Stackaura fee on successful fee-bearing payments.",
      tone: "warning" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "relative overflow-hidden p-6 lg:p-8")}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.34),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(122,115,255,0.14),transparent_24%),radial-gradient(circle_at_74%_76%,rgba(125,211,252,0.16),transparent_26%)]" />
        <div className="relative">
          <div className={lightProductSectionEyebrowClass}>Internal overview</div>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
            Monitor merchant growth, payment performance, and platform issues from one internal
            control surface.
          </h1>
          <p className={cn(lightProductMutedTextClass, "mt-5 max-w-3xl")}>
            This route is internal owner tooling only. Data is server-rendered from the admin
            analytics endpoint and excludes merchant credentials or gateway secrets.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className={metricTone("warning")}>Admin-only access</span>
            <span className={metricTone("success")}>
              Generated {formatDateTime(overview.generatedAt)}
            </span>
            <span className={metricTone("muted")}>Noindex</span>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-4">
        {topMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-4">
        {secondaryMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-4">
        {businessMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <MiniTrendChart
          title="Revenue over time"
          description="Daily Stackaura fee earned from successful payments over the last 30 days."
          data={overview.revenue.revenueOverTime}
          valueKey="stackauraFeeCents"
          valueFormatter={formatShortCurrencyFromCents}
          tone="bg-[linear-gradient(180deg,rgba(92,123,255,0.94)_0%,rgba(59,130,246,0.78)_100%)]"
        />
        <FunnelPanel funnel={overview.funnel} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.95fr]">
        <MiniTrendChart
          title="Payments over time"
          description="Daily payment outcomes over the last 30 days."
          data={overview.payments.paymentsOverTime}
          valueKey="total"
          tone="bg-[linear-gradient(180deg,rgba(92,123,255,0.94)_0%,rgba(59,130,246,0.78)_100%)]"
        />
        <MiniTrendChart
          title="Merchant growth"
          description="Daily merchant signups over the last 30 days."
          data={overview.business.signupTrend}
          valueKey="count"
          tone="bg-[linear-gradient(180deg,rgba(16,185,129,0.88)_0%,rgba(45,212,191,0.72)_100%)]"
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.55fr]">
        <GatewayUsagePanel data={overview.payments.gatewayUsage} />
        <RecentOutcomeTable outcomes={overview.payments.recentOutcomes} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <GatewayHealthPanel data={overview.gatewayHealth.byGateway} />
        <IssueList
          title="Recent gateway incidents"
          description="Latest failed and cancelled outcomes grouped from real payment records."
          issues={overview.gatewayHealth.recentIncidents.map((issue) => ({
            key: `${issue.reference}-${issue.createdAt}`,
            title: issue.reference,
            merchantName: issue.merchantName,
            status: issue.status,
            detail: `${issue.gatewayLabel} · ${issue.routeSummary}`,
            createdAt: issue.createdAt,
          }))}
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <RevenueByMerchantPanel
          title="Top merchants by volume"
          description="Successful processed volume ranked across merchants."
          items={overview.revenue.revenueByMerchant}
          metricKey="grossVolumeCents"
        />
        <RevenueByMerchantPanel
          title="Top merchants by Stackaura fee"
          description="Merchants currently generating the most stored Stackaura fee revenue."
          items={overview.revenue.revenueByMerchant.slice().sort((a, b) => b.stackauraFeeCents - a.stackauraFeeCents)}
          metricKey="stackauraFeeCents"
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <FeeBearingPaymentTable payments={overview.revenue.recentFeeBearingPayments} />
        <div className={cn(lightProductPanelClass, "p-6")}>
          <div className={lightProductSectionEyebrowClass}>Revenue by gateway</div>
          <p className={cn(lightProductMutedTextClass, "mt-3 text-sm")}>
            Fee-earned and processed volume by final successful gateway.
          </p>

          <div className="mt-6 space-y-4">
            {overview.revenue.revenueByGateway.length === 0 ? (
              <EmptyState message="No successful gateway revenue data yet." />
            ) : (
              overview.revenue.revenueByGateway.map((gateway) => (
                <div key={gateway.gateway} className={cn(lightProductInsetPanelClass, "p-4")}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-[#0a2540]">{gateway.label}</div>
                      <div className="text-sm text-[#6b7c93]">
                        {formatNumber(gateway.paymentCount)} payments
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#0a2540]">
                        {formatCurrencyFromCents(gateway.grossVolumeCents)}
                      </div>
                      <div className="text-xs uppercase tracking-[0.14em] text-[#6b7c93]">
                        Gross volume
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Stackaura fee</div>
                      <div className="mt-1 text-lg font-semibold text-[#0a2540]">
                        {formatCurrencyFromCents(gateway.stackauraFeeCents)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">Provider fees</div>
                      <div className="mt-1 text-lg font-semibold text-[#0a2540]">
                        {gateway.providerFeeObservedCents === null
                          ? "Not wired yet"
                          : formatCurrencyFromCents(gateway.providerFeeObservedCents)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <IssueList
          title="Recent operational issues"
          description="Latest cross-platform problems spanning payments, webhooks, and support."
          issues={overview.operations.recentIssues.map((issue) => ({
            key: `${issue.kind}-${issue.title}-${issue.createdAt}`,
            title: issue.title,
            merchantName: issue.merchantName,
            status: issue.status,
            detail: issue.detail,
            createdAt: issue.createdAt,
          }))}
        />

        <IssueList
          title="Recent payment errors"
          description="Latest failed payment outcomes and their routing summaries."
          issues={overview.payments.recentErrors.map((issue) => ({
            key: `${issue.reference}-${issue.createdAt}`,
            title: issue.reference,
            merchantName: issue.merchantName,
            status: issue.status,
            detail: issue.routeSummary,
            createdAt: issue.createdAt,
          }))}
        />

        <div className={cn(lightProductPanelClass, "p-6")}>
          <div className={lightProductSectionEyebrowClass}>Support and webhook health</div>
          <p className={cn(lightProductMutedTextClass, "mt-3 text-sm")}>
            Operational queues and recent human handoff activity.
          </p>

          <div className="mt-6 grid gap-3">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#6b7c93]">
                Support conversations
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-[#0a2540]">
                {formatNumber(overview.operations.support.conversationCount)}
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#6b7c93]">
                Support escalations
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-[#0a2540]">
                {formatNumber(overview.operations.support.escalationCount)}
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#6b7c93]">
                Latest escalations
              </div>
              <div className="mt-4 space-y-3">
                {overview.operations.support.recentEscalations.length === 0 ? (
                  <div className="text-sm text-[#6b7c93]">No support escalations yet.</div>
                ) : (
                  overview.operations.support.recentEscalations.map((escalation) => (
                    <div key={escalation.id} className="rounded-[20px] border border-white/44 bg-white/50 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#0a2540]">{escalation.merchantName}</div>
                          <div className="mt-1 text-sm text-[#425466]">{escalation.conversationTitle}</div>
                        </div>
                        {renderStatusPill(escalation.status)}
                      </div>
                      <div className="mt-3 text-sm leading-6 text-[#425466]">{escalation.reason}</div>
                      <div className="mt-3 text-xs uppercase tracking-[0.14em] text-[#6b7c93]">
                        {formatDateTime(escalation.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#6b7c93]">
                Recent webhook issues
              </div>
              <div className="mt-4 space-y-3">
                {overview.operations.webhookIssues.recent.length === 0 ? (
                  <div className="text-sm text-[#6b7c93]">No webhook delivery issues yet.</div>
                ) : (
                  overview.operations.webhookIssues.recent.map((issue) => (
                    <div key={issue.id} className="rounded-[20px] border border-white/44 bg-white/50 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#0a2540]">{issue.merchantName}</div>
                          <div className="mt-1 text-sm text-[#425466]">{issue.event}</div>
                        </div>
                        {renderStatusPill(issue.status)}
                      </div>
                      <div className="mt-3 text-sm leading-6 text-[#425466]">
                        {issue.lastError ?? "Delivery issue recorded without an error message."}
                      </div>
                      <div className="mt-3 text-xs uppercase tracking-[0.14em] text-[#6b7c93]">
                        {formatDateTime(issue.updatedAt)} · {formatNumber(issue.attempts)} attempts
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-[#6b7c93]">
                Data notes
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#425466]">
                <li>{overview.dataNotes.successRate}</li>
                <li>{overview.dataNotes.failoverCount}</li>
                <li>{overview.dataNotes.gatewayUsage}</li>
                <li>{overview.gatewayHealth.dataNotes.webhookIssuesByGateway}</li>
                <li>{overview.gatewayHealth.dataNotes.avgResolutionTime}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
