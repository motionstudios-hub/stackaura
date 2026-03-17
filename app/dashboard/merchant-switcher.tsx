"use client";

import { useMemo, useState, useTransition } from "react";
import { cn, darkInsetPanelClass, darkInputClass, darkStatusPillClass } from "../components/stackaura-ui";

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
  const selectedMerchant = options.find((merchant) => merchant.id === value) ?? options[0] ?? null;

  async function setActiveMerchant(merchantId: string) {
    await fetch("/api/active-merchant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId }),
    });
  }

  return (
    <div className={cn(darkInsetPanelClass, "flex w-full flex-col gap-3 p-4 sm:w-auto sm:min-w-[340px]")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Active merchant</div>
          <div className="mt-2 text-sm font-semibold text-white">
            {selectedMerchant?.name || "No merchant selected"}
          </div>
          <div className="mt-1 text-xs text-zinc-400">{selectedMerchant?.email || "Select a merchant workspace"}</div>
        </div>

        <span
          className={darkStatusPillClass(
            selectedMerchant?.isActive ? "success" : "muted"
          )}
        >
          {isPending ? "Updating" : selectedMerchant?.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="relative">
        <select
          value={value}
          disabled={isPending || options.length === 0}
          onChange={(e) => {
            const merchantId = e.target.value;
            setValue(merchantId);

            startTransition(async () => {
              await setActiveMerchant(merchantId);
              window.location.reload();
            });
          }}
          className={cn(
            darkInputClass,
            "min-h-[52px] appearance-none rounded-[20px] bg-black/24 pr-14 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
          )}
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
