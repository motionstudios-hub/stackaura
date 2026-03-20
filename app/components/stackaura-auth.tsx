import Link from "next/link";
import type { ReactNode } from "react";
import {
  BrandLockup,
  cn,
  lightProductCompactGhostButtonClass,
  lightProductHeroClass,
  lightProductInsetPanelClass,
  lightProductPanelClass,
  lightProductStatusPillClass,
  PublicBackground,
  publicPillClass,
} from "./stackaura-ui";

type AuthFeature = {
  label: string;
  title: string;
  description: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  features,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  features: readonly AuthFeature[];
  children: ReactNode;
}) {
  return (
    <PublicBackground>
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        <Link
          href="/"
          className={cn(lightProductCompactGhostButtonClass, "mb-6 w-fit gap-3 px-4 py-2 sm:mb-8")}
        >
          <span>←</span>
          <span>Back to Stackaura</span>
        </Link>

        <section
          className={cn(
            "relative isolate overflow-hidden px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-10 lg:py-10",
            lightProductHeroClass
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.52),transparent_26%),radial-gradient(circle_at_76%_20%,rgba(125,211,252,0.30),transparent_24%),radial-gradient(circle_at_84%_72%,rgba(168,85,247,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(219,232,238,0.02))]" />

          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
            <section className="order-2 lg:order-1">
              <div className={cn(publicPillClass, "max-w-max px-3 py-1.5 text-xs sm:text-sm")}>
                {eyebrow}
              </div>

              <div className="mt-8">
                <BrandLockup />
              </div>

              <h1 className="mt-10 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#425466] sm:text-lg">
                {description}
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
                {features.map((feature) => (
                  <div key={feature.title} className={cn("p-5", lightProductInsetPanelClass)}>
                    <div className="text-xs uppercase tracking-[0.22em] text-[#6b7c93]">
                      {feature.label}
                    </div>
                    <div className="mt-3 text-xl font-semibold tracking-tight text-[#0a2540]">
                      {feature.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#425466]">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="order-1 lg:order-2">{children}</section>
          </div>
        </section>
      </div>
    </PublicBackground>
  );
}

export function AuthFormFrame({
  eyebrow,
  title,
  description,
  status,
  statusTone = "muted",
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
  statusTone?: "success" | "violet" | "muted" | "warning";
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto max-w-xl p-6 sm:p-8", lightProductPanelClass)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm uppercase tracking-[0.24em] text-[#635bff]">{eyebrow}</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0a2540]">{title}</h2>
        </div>

        {status ? <span className={lightProductStatusPillClass(statusTone)}>{status}</span> : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-[#425466]">{description}</p>

      <div className="mt-8">{children}</div>
    </div>
  );
}
