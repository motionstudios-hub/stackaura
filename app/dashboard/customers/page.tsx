import Link from "next/link";
import { redirect } from "next/navigation";
import {
  cn,
  lightProductHeroClass,
  lightProductInputClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
  publicSecondaryButtonClass,
} from "../../components/stackaura-ui";
import { getDashboardPayments, getSelectedMerchantWorkspace } from "../console-data";
import { formatCurrencyFromCents, formatDateTime, formatNumber } from "../console-utils";

type CustomerSummary = {
  email: string;
  paymentCount: number;
  totalVolumeCents: number;
  lastPaymentAt: string;
  lastStatus: string;
};

function summarizeCustomers(
  payments: Awaited<ReturnType<typeof getDashboardPayments>>["data"],
) {
  const map = new Map<string, CustomerSummary>();

  for (const payment of payments) {
    if (!payment.customerEmail) continue;

    const existing = map.get(payment.customerEmail);
    if (!existing) {
      map.set(payment.customerEmail, {
        email: payment.customerEmail,
        paymentCount: 1,
        totalVolumeCents: payment.amountCents,
        lastPaymentAt: payment.createdAt,
        lastStatus: payment.status,
      });
      continue;
    }

    existing.paymentCount += 1;
    existing.totalVolumeCents += payment.amountCents;
    if (new Date(payment.createdAt).getTime() > new Date(existing.lastPaymentAt).getTime()) {
      existing.lastPaymentAt = payment.createdAt;
      existing.lastStatus = payment.status;
    }
  }

  return [...map.values()].sort(
    (left, right) => new Date(right.lastPaymentAt).getTime() - new Date(left.lastPaymentAt).getTime(),
  );
}

export default async function DashboardCustomersPage({
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
  const payments = await getDashboardPayments(workspace.selectedMerchantId, {
    q: q || undefined,
    limit: 100,
  });
  const customers = summarizeCustomers(payments.data);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className={cn(lightProductHeroClass, "overflow-hidden p-6 lg:p-8")}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className={lightProductSectionEyebrowClass}>Customers</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
              Customer activity derived from real payment history.
            </h1>
            <p className={cn(lightProductMutedTextClass, "mt-5 max-w-2xl")}>
              Stackaura does not maintain a separate CRM yet, so this page truthfully groups merchant
              customers from payment records and checkout activity.
            </p>
          </div>

          <div className={cn(lightProductPanelClass, "p-4")}>
            <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">Customer records</div>
            <div className="mt-2 text-2xl font-semibold text-[#0a2540]">
              {formatNumber(customers.length)}
            </div>
          </div>
        </div>
      </section>

      <section className={cn(lightProductPanelClass, "mt-8 p-6 lg:p-7")}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={lightProductSectionEyebrowClass}>Search customers</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#0a2540]">
              Filter by customer email
            </div>
          </div>
          <Link href="/dashboard/payments" className={publicSecondaryButtonClass}>
            Open payments
          </Link>
        </div>

        <form className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search customer email"
            className={lightProductInputClass}
          />
          <button type="submit" className={publicSecondaryButtonClass}>
            Apply search
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-white/42 bg-white/16">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/42 bg-white/16">
                <tr className="text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Payments</th>
                  <th className="px-5 py-4 font-medium">Volume</th>
                  <th className="px-5 py-4 font-medium">Latest status</th>
                  <th className="px-5 py-4 font-medium">Last activity</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer.email} className="border-b border-white/30 last:border-b-0">
                      <td className="px-5 py-4 font-medium text-[#0a2540]">{customer.email}</td>
                      <td className="px-5 py-4 text-sm text-[#425466]">
                        {formatNumber(customer.paymentCount)}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#425466]">
                        {formatCurrencyFromCents(customer.totalVolumeCents)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={lightProductStatusPillClass(customer.lastStatus === "PAID" ? "success" : "warning")}>
                          {customer.lastStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#425466]">
                        {formatDateTime(customer.lastPaymentAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#6b7c93]">
                      No customer payment records match the current search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
