"use client";

import { useMemo, useState, useTransition } from "react";

type Membership = {
  id: string;
  role: string;
  merchant: { id: string; name: string; email: string; isActive: boolean };
};

export default function MerchantSwitcher({
  memberships,
  selectedMerchantId,
}: {
  memberships: Membership[];
  selectedMerchantId: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(selectedMerchantId || "");

  const options = useMemo(() => memberships.map((m) => m.merchant), [memberships]);

  async function setActiveMerchant(merchantId: string) {
    await fetch("/api/active-merchant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId }),
    });
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
        <span>Merchant</span>
        {isPending ? (
          <span className="rounded-full border border-[#20BCED]/25 bg-[#20BCED]/10 px-2 py-0.5 text-[10px] text-[#A0E9FF]">
            Updating
          </span>
        ) : null}
      </div>

      <div className="relative w-full sm:w-auto">
        <select
          value={value}
          disabled={isPending || options.length === 0}
          onChange={(e) => {
            const merchantId = e.target.value;
            setValue(merchantId);

            startTransition(async () => {
              await setActiveMerchant(merchantId);
              // Simple refresh so the Server Component re-reads the cookie
              window.location.reload();
            });
          }}
          className="min-h-[48px] w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl outline-none transition hover:border-[#20BCED]/35 focus:border-[#20BCED]/45 focus:ring-2 focus:ring-[#20BCED]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[280px]"
        >
          {options.map((m) => (
            <option key={m.id} value={m.id} className="bg-[#08152f] text-white">
              {m.name} ({m.email})
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-zinc-400">
          ▼
        </span>
      </div>
    </div>
  );
}
