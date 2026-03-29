"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-[transform,background-color,border-color,box-shadow,color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#635bff]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-indigo-500/70 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_12px_28px_rgba(79,70,229,0.22)] hover:brightness-105 active:scale-[0.99] dark:border-indigo-400/70 dark:shadow-[0_16px_34px_rgba(0,0,0,0.26)]",
        ghost:
          "border border-slate-200/80 bg-white/92 text-[#0f172a] shadow-[0_8px_18px_rgba(15,23,42,0.06)] hover:border-slate-300 hover:bg-slate-50 hover:text-[#0f172a] active:scale-[0.99] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-none dark:hover:border-white/16 dark:hover:bg-white/[0.06] dark:hover:text-white",
        outline:
          "border border-slate-200/80 bg-transparent text-[#0f172a] hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:border-white/16 dark:hover:bg-white/[0.04]",
      },
      size: {
        default: "min-h-[44px] px-4 py-2.5",
        sm: "min-h-[38px] rounded-xl px-3 py-2 text-xs",
        icon: "h-11 w-11 rounded-2xl px-0",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
