"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex min-h-[44px] w-full rounded-2xl border border-white/45 bg-white/30 px-4 py-3 text-sm text-[#0a2540] shadow-[0_8px_18px_rgba(133,156,180,0.08)] backdrop-blur-2xl outline-none transition placeholder:text-[#6b7c93]",
        "focus:border-[#7a73ff]/35 focus:bg-white/38 focus:ring-2 focus:ring-[#7a73ff]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
