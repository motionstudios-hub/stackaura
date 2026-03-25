type ActivityRow = {
  reference: string;
  amountCents: number;
  status: string;
  gatewayLabel: string;
  createdAt: string;
};

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClass(status: string) {
  if (status === "PAID") return "border-[#8dd8ff]/24 bg-[#8dd8ff]/12 text-[#dff6ff]";
  if (status === "FAILED" || status === "CANCELLED") {
    return "border-[#ffc68a]/24 bg-[#ffb364]/12 text-[#ffd9b2]";
  }

  if (status === "RECOVERED") return "border-[#8cf4d8]/24 bg-[#2ed6ac]/10 text-[#cffff3]";

  return "border-white/12 bg-white/[0.04] text-[#d0dfef]";
}

export default function ActivityTable({
  rows,
}: {
  rows: ActivityRow[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] px-5 py-10 text-sm text-[#9fb4c9]">
        No payment activity yet. Real transactions will appear here as soon as this workspace starts processing payments.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
      <div className="hidden grid-cols-[1.35fr_0.8fr_0.9fr_1fr_0.95fr] gap-4 border-b border-white/8 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7ea4c7] lg:grid">
        <div>Reference</div>
        <div>Amount</div>
        <div>Status</div>
        <div>Gateway</div>
        <div>Time</div>
      </div>

      <div className="divide-y divide-white/6">
        {rows.map((row) => (
          <div key={row.reference} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.35fr_0.8fr_0.9fr_1fr_0.95fr] lg:items-center">
            <div>
              <div className="text-sm font-semibold text-white">{row.reference}</div>
              <div className="mt-1 text-xs text-[#7ea4c7] lg:hidden">{row.gatewayLabel}</div>
            </div>
            <div className="text-sm font-medium text-[#d8e8f7]">{formatCurrencyFromCents(row.amountCents)}</div>
            <div>
              <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${statusClass(row.status)}`}>
                {row.status === "PAID" ? "Success" : row.status}
              </span>
            </div>
            <div className="hidden text-sm text-[#d8e8f7] lg:block">{row.gatewayLabel}</div>
            <div className="text-sm text-[#9fb4c9]">{formatDateTime(row.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
