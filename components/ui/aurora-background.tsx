"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex h-[100vh] flex-col items-center justify-center overflow-hidden bg-zinc-50 text-slate-950 transition-bg dark:bg-zinc-900",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `absolute -inset-[10px] opacity-65 will-change-transform sm:opacity-56 lg:opacity-44
              [--aurora-duration:38s] sm:[--aurora-duration:48s] lg:[--aurora-duration:60s]
              [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
              [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
              [--aurora:repeating-linear-gradient(100deg,var(--sky-300)_12%,var(--indigo-300)_18%,var(--blue-300)_26%,var(--violet-200)_34%,var(--cyan-200)_44%,var(--blue-400)_54%)]
              [background-image:var(--white-gradient),var(--aurora)]
              dark:[background-image:var(--dark-gradient),var(--aurora)]
              [background-size:240%,_190%] md:[background-size:280%,_190%] lg:[background-size:300%,_200%]
              [background-position:50%_50%,50%_50%]
              after:absolute after:inset-0 after:content-['']
              after:[background-image:var(--white-gradient),var(--aurora)]
              after:[background-size:200%,_100%]
              after:[background-attachment:fixed]
              after:animate-aurora
              after:mix-blend-soft-light
              after:opacity-100 sm:after:opacity-92 lg:after:opacity-80
              after:dark:[background-image:var(--dark-gradient),var(--aurora)]
              filter blur-[8px] sm:blur-[10px] lg:blur-[12px] invert
              dark:invert-0
              pointer-events-none`,
              showRadialGradient &&
                "[mask-image:radial-gradient(ellipse_at_82%_8%,black_10%,black_30%,var(--transparent)_86%)] lg:[mask-image:radial-gradient(ellipse_at_100%_0%,black_12%,var(--transparent)_72%)]"
            )}
          />
        </div>
        {children}
      </div>
    </main>
  );
};
