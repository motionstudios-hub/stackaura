"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex min-h-[44px] w-full rounded-2xl border border-slate-200/80 bg-white/92 px-4 py-3 text-sm text-[#0f172a] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[border-color,box-shadow,background-color] duration-150 ease-out placeholder:text-[#64748b]",
        "focus:border-[#4f46e5]/50 focus:ring-1 focus:ring-[#4f46e5]/16 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/50 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] dark:focus:border-indigo-500/60 dark:focus:ring-indigo-500/30",
        className
      )}
      {...props}
    />
  );
}

export { Input };
