"use client";

import { useMemo, useState, useTransition } from "react";
import {
  cn,
  lightProductInputClass,
  lightProductInsetPanelClass,
  lightProductStatusPillClass,
} from "../components/stackaura-ui";

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
    <div className={cn(lightProductInsetPanelClass, "flex w-full flex-col gap-3 p-4 sm:w-auto sm:min-w-[340px]")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[#6b7c93]">Active merchant</div>
          <div className="mt-2 text-sm font-semibold text-[#0a2540]">
            {selectedMerchant?.name || "Choose a merchant"}
          </div>
          <div className="mt-1 text-xs text-[#6b7c93]">
            {selectedMerchant?.email || "Select a workspace to continue"}
          </div>
        </div>

        <span className={lightProductStatusPillClass(selectedMerchant?.isActive ? "success" : "muted")}>
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
            lightProductInputClass,
            "min-h-[52px] appearance-none rounded-[20px] pr-14"
          )}
        >
          {options.map((m) => (
            <option key={m.id} value={m.id} className="bg-white text-[#0a2540]">
              {m.name} ({m.email})
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-[#6b7c93]">
          ▼
        </span>
      </div>
    </div>
  );
}
