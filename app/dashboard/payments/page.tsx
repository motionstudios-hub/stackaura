import Link from "next/link";
import { redirect } from "next/navigation";
import {
  cn,
  lightProductHeroClass,
  lightProductInsetPanelClass,
  lightProductInputClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
  publicSecondaryButtonClass,
} from "../../components/stackaura-ui";
import { getDashboardPayments, getSelectedMerchantWorkspace, getWorkspaceAnalytics } from "../console-data";
import {
  formatCurrencyFromCents,
  formatDateTime,
  formatNumber,
  paymentStatusTone,
} from "../console-utils";

function buildQuery(
  current: Record<string, string | undefined>,
  next: Record<string, string | undefined | null>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    if (value) params.set(key, value);
  }

  for (const [key, value] of Object.entries(next)) {
    if (!value) {
      params.delete(key);
      continue;
    }
    params.set(key, value);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export default async function DashboardPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const workspace = await getSelectedMerchantWorkspace();
  if (!workspace) {
    redirect("/login");
  }

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "";
  const gateway = typeof params.gateway === "string" ? params.gateway : "";
  const cursor = typeof params.cursor === "string" ? params.cursor : "";

  const [payments, analytics] = await Promise.all([
    getDashboardPayments(workspace.selectedMerchantId, {
      q: q || undefined,
      status: status || undefined,
      gateway: gateway || undefined,
      cursor: cursor || undefined,
      limit: 25,
    }),
    getWorkspaceAnalytics(workspace.selectedMerchantId),
  ]);

  const queryState = {
    q: q || undefined,
    status: status || undefined,
    gateway: gateway || undefined,
  };

  const segments = [
    {
      label: "All",
      href: `/dashboard/payments${buildQuery(queryState, { status: null, cursor: null })}`,
      active: !status,
      value: analytics.totalPayments,
      detail: "All recorded payments",
    },
    {
      label: "Paid",
      href: `/dashboard/payments${buildQuery(queryState, { status: "PAID", cursor: null })}`,
      active: status === "PAID",
      value: analytics.successfulPayments,
      detail: "Final paid outcome",
    },
    {
      label: "Failed",
      href: `/dashboard/payments${buildQuery(queryState, { status: "FAILED", cursor: null })}`,
      active: status === "FAILED",
      value: analytics.failedPayments,
      detail: "Terminal failed outcome",
    },
    {
      label: "Cancelled",
      href: `/dashboard/payments${buildQuery(queryState, { status: "CANCELLED", cursor: null })}`,
      active: status === "CANCELLED",
      value: null,
      detail: "Metric not wired yet",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "overflow-hidden p-6 lg:p-8")}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className={lightProductSectionEyebrowClass}>Payments</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              Merchant payment activity in one operational view.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-2xl")}>
              Search, filter, and inspect real payments for the selected merchant workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Workspace</div>
              <div className="mt-2 text-lg font-semibold text-[#0a2540]">
                {workspace.selectedMerchantName}
              </div>
            </div>
            <div className={cn(lightProductInsetPanelClass, "p-4")}>
              <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Total volume</div>
              <div className="mt-2 text-lg font-semibold text-[#0a2540]">
                {formatCurrencyFromCents(analytics.totalVolumeCents)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Status segmentation</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Filter by payment outcome
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {segments.map((segment) => (
              <Link
                key={segment.label}
                href={segment.href}
                className={cn(
                  "rounded-[22px] border px-4 py-4 transition",
                  segment.active
                    ? "border-white/54 bg-[linear-gradient(180deg,rgba(122,115,255,0.22)_0%,rgba(160,233,255,0.20)_100%)]"
                    : "border-white/42 bg-white/18 hover:bg-white/28",
                )}
              >
                <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">{segment.label}</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
                  {segment.value === null ? "—" : formatNumber(segment.value)}
                </div>
                <div className="mt-2 text-sm text-[#425466]">{segment.detail}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className={cn(lightProductPanelClass, "p-6 lg:p-7")}>
          <div className={lightProductSectionEyebrowClass}>Search and filters</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
            Narrow the payment list
          </div>

          <form className="mt-5 grid gap-4 lg:grid-cols-[1fr_180px_auto]">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by reference or customer email"
              className={lightProductInputClass}
            />

            <select name="gateway" defaultValue={gateway} className={lightProductInputClass}>
              <option value="">All gateways</option>
              {analytics.gatewayDistribution.map((item) => (
                <option key={item.gateway} value={item.gateway}>
                  {item.label}
                </option>
              ))}
            </select>

            <button type="submit" className={publicSecondaryButtonClass}>
              Apply filters
            </button>

            {status ? <input type="hidden" name="status" value={status} /> : null}
          </form>
        </div>
      </section>

      <section className={cn(lightProductPanelClass, "mt-8 p-6 lg:p-7")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={lightProductSectionEyebrowClass}>Payment table</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
              Real payments for the selected workspace
            </div>
          </div>
          <span className={lightProductStatusPillClass(payments.data.length > 0 ? "success" : "muted")}>
            {payments.data.length > 0 ? `${payments.data.length} results` : "No results"}
          </span>
        </div>

        {payments.data.length === 0 ? (
          <div className={cn(lightProductInsetPanelClass, "mt-6 p-5")}>
            <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
              No payments match the current filters
            </div>
            <p className="mt-2 text-sm leading-6 text-[#425466]">
              Try adjusting the search term, gateway filter, or status segment.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-white/42 bg-white/16">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="border-b border-white/42 bg-white/16">
                  <tr className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                    <th className="px-5 py-4 font-medium">Reference</th>
                    <th className="px-5 py-4 font-medium">Customer</th>
                    <th className="px-5 py-4 font-medium">Amount</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Gateway</th>
                    <th className="px-5 py-4 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.data.map((payment) => (
                    <tr key={payment.id} className="border-b border-white/30 last:border-b-0">
                      <td className="px-5 py-4 align-top">
                        <div className="font-semibold text-[#0a2540]">{payment.reference}</div>
                        <div className="mt-1 text-xs text-[#6b7c93]">
                          {payment.description || "No description"}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top text-sm text-[#425466]">
                        {payment.customerEmail || "No customer email"}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="font-medium text-[#0a2540]">
                          {formatCurrencyFromCents(payment.amountCents)}
                        </div>
                        <div className="mt-1 text-xs text-[#6b7c93]">
                          Fee {formatCurrencyFromCents(payment.platformFeeCents ?? 0)}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <span className={lightProductStatusPillClass(paymentStatusTone(payment.status))}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-top text-sm text-[#425466]">
                        {payment.selectedGateway || payment.gateway || "AUTO"}
                      </td>
                      <td className="px-5 py-4 align-top text-sm text-[#425466]">
                        {formatDateTime(payment.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {payments.nextCursor ? (
          <div className="mt-5 flex justify-end">
            <Link
              href={`/dashboard/payments${buildQuery(queryState, {
                cursor: payments.nextCursor,
              })}`}
              className={publicSecondaryButtonClass}
            >
              Load next page
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
