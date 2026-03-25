"use client";

import { useMemo, useState } from "react";
import { cn } from "../components/stackaura-ui";

type RecentPayment = {
  amountCents: number;
  createdAt: string;
};

type TrendMode = "weekly" | "monthly";

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amountCents / 100);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildWeekly(payments: RecentPayment[]) {
  const today = startOfDay(new Date());
  const labels = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en-ZA", { weekday: "short" }).format(date),
      value: 0,
    };
  });

  const map = new Map(labels.map((item) => [item.key, item]));
  for (const payment of payments) {
    const key = startOfDay(new Date(payment.createdAt)).toISOString().slice(0, 10);
    const bucket = map.get(key);
    if (bucket) bucket.value += payment.amountCents;
  }

  return labels;
}

function buildMonthly(payments: RecentPayment[]) {
  const today = startOfDay(new Date());
  const buckets = Array.from({ length: 4 }, (_, index) => {
    const bucketEnd = new Date(today);
    bucketEnd.setDate(today.getDate() - 7 * (3 - index));
    return {
      label: `W${index + 1}`,
      from: new Date(bucketEnd.getFullYear(), bucketEnd.getMonth(), bucketEnd.getDate() - 6),
      to: bucketEnd,
      value: 0,
    };
  });

  for (const payment of payments) {
    const created = startOfDay(new Date(payment.createdAt));
    const bucket = buckets.find((item) => created >= item.from && created <= item.to);
    if (bucket) bucket.value += payment.amountCents;
  }

  return buckets.map(({ label, value }) => ({ label, value }));
}

export default function VolumeTrendCard({
  payments,
}: {
  payments: RecentPayment[];
}) {
  const [mode, setMode] = useState<TrendMode>("weekly");

  const series = useMemo(
    () => (mode === "weekly" ? buildWeekly(payments) : buildMonthly(payments)),
    [mode, payments],
  );
  const maxValue = Math.max(...series.map((item) => item.value), 0);

  return (
    <section className="rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(13,32,60,0.92)_0%,rgba(8,21,47,0.92)_100%)] p-6 shadow-[0_22px_48px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-[#8dd8ff]">Payment Volume</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Recent payment activity trend
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9fb4c9]">
            Based on the recent real payments currently loaded for this workspace.
          </p>
        </div>

        <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setMode("weekly")}
            className={cn(
              "rounded-[14px] px-4 py-2 text-sm font-medium transition",
              mode === "weekly"
                ? "bg-[linear-gradient(180deg,rgba(141,216,255,0.20),rgba(98,145,255,0.18))] text-white"
                : "text-[#9fb4c9] hover:text-white",
            )}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setMode("monthly")}
            className={cn(
              "rounded-[14px] px-4 py-2 text-sm font-medium transition",
              mode === "monthly"
                ? "bg-[linear-gradient(180deg,rgba(141,216,255,0.20),rgba(98,145,255,0.18))] text-white"
                : "text-[#9fb4c9] hover:text-white",
            )}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="mt-8 flex h-[240px] items-end gap-4">
        {series.map((item) => {
          const height = maxValue > 0 ? Math.max((item.value / maxValue) * 100, item.value > 0 ? 18 : 8) : 8;

          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
              <div className="relative flex h-[188px] w-full items-end justify-center overflow-hidden rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
                <div className="absolute inset-x-3 top-3 border-t border-dashed border-white/8" />
                <div className="absolute inset-x-3 top-1/2 border-t border-dashed border-white/8" />
                <div
                  className="w-[72%] rounded-[18px] bg-[linear-gradient(180deg,rgba(141,216,255,0.96)_0%,rgba(91,146,255,0.86)_100%)] shadow-[0_0_26px_rgba(141,216,255,0.26)]"
                  style={{ height: `${height}%` }}
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-[#dcecff]">{item.label}</div>
                <div className="mt-1 text-xs text-[#7ea4c7]">{formatCurrencyFromCents(item.value)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
