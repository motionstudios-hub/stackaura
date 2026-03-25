"use client";

import { useMemo, useState, useTransition } from "react";
import {
  cn,
  darkInputClass,
  darkInsetPanelClass,
  darkStatusPillClass,
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
  theme = "light",
}: {
  memberships: Membership[];
  selectedMerchantId: string | null;
  theme?: "light" | "dark";
}) {
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(selectedMerchantId || "");

  const options = useMemo(() => memberships.map((m) => m.merchant), [memberships]);
  const selectedMerchant = options.find((merchant) => merchant.id === value) ?? options[0] ?? null;
  const isDark = theme === "dark";

  async function setActiveMerchant(merchantId: string) {
    await fetch("/api/active-merchant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId }),
    });
  }

  return (
    <div
      className={cn(
        isDark ? darkInsetPanelClass : lightProductInsetPanelClass,
        "flex w-full flex-col gap-3 p-4 sm:w-auto sm:min-w-[340px]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={cn("text-xs uppercase tracking-[0.2em]", isDark ? "text-[#7ea4c7]" : "text-[#6b7c93]")}>
            Active merchant
          </div>
          <div className={cn("mt-2 text-sm font-semibold", isDark ? "text-white" : "text-[#0a2540]")}>
            {selectedMerchant?.name || "Choose a merchant"}
          </div>
          <div className={cn("mt-1 text-xs", isDark ? "text-[#9fb4c9]" : "text-[#6b7c93]")}>
            {selectedMerchant?.email || "Select a workspace to continue"}
          </div>
        </div>

        <span
          className={
            isDark
              ? darkStatusPillClass(selectedMerchant?.isActive ? "success" : "muted")
              : lightProductStatusPillClass(selectedMerchant?.isActive ? "success" : "muted")
          }
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
            isDark ? darkInputClass : lightProductInputClass,
            "min-h-[52px] appearance-none rounded-[20px] pr-14"
          )}
        >
          {options.map((m) => (
            <option
              key={m.id}
              value={m.id}
              className={isDark ? "bg-[#08152f] text-white" : "bg-white text-[#0a2540]"}
            >
              {m.name} ({m.email})
            </option>
          ))}
        </select>

        <span
          className={cn(
            "pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs",
            isDark ? "text-[#7ea4c7]" : "text-[#6b7c93]",
          )}
        >
          ▼
        </span>
      </div>
    </div>
  );
}
