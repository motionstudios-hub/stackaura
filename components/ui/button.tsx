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
          "border border-[#7a73ff]/30 bg-[linear-gradient(135deg,#6e5bff_0%,#4d8df7_100%)] text-white shadow-[0_14px_28px_rgba(93,106,255,0.24)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(93,106,255,0.28)]",
        ghost:
          "border border-white/45 bg-white/24 text-[#425466] shadow-[0_8px_18px_rgba(133,156,180,0.08)] hover:border-white/55 hover:bg-white/34 hover:text-[#0a2540]",
        outline:
          "border border-white/48 bg-white/18 text-[#0a2540] shadow-[0_8px_18px_rgba(133,156,180,0.08)] hover:border-white/55 hover:bg-white/30",
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
