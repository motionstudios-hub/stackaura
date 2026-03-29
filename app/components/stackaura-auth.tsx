import Link from "next/link";
import type { ReactNode } from "react";
import {
  BrandLockup,
  cn,
  lightProductStatusPillClass,
  PublicBackground,
  publicFieldLabelClass,
  publicFormSurfaceClass,
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
    <PublicBackground className="bg-[#05070F] text-white dark:bg-[#05070F]">
      <div className="dark relative min-h-screen text-white">
        <div className="absolute inset-0 bg-[#05070F]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(56,189,248,0.08),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(99,102,241,0.08),transparent_28%)]" />

        <div className="relative flex min-h-screen justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="w-full max-w-6xl">
            <div className="mb-10 flex items-center justify-between gap-4">
              <div className="shrink-0">
                <BrandLockup />
              </div>

              <div className="shrink-0">
                <Link
                  href="/"
                  className="text-sm font-medium text-white/60 transition-opacity duration-150 ease-out hover:text-white hover:opacity-85"
                >
                  Back to home
                </Link>
              </div>
            </div>

            <section className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,520px)] lg:items-start lg:gap-16">
              <section className="hidden max-w-md lg:block lg:space-y-8 lg:pt-3">
                <div>
                  <div className={publicFieldLabelClass}>{eyebrow}</div>
                  <h1 className="mt-5 text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-white">
                    {title}
                  </h1>
                  <p className="mt-5 text-base leading-7 text-white/65">
                    {description}
                  </p>
                </div>

                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div
                      key={feature.title}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/80">
                          {index + 1}
                        </span>
                        <div>
                          <div className={publicFieldLabelClass}>{feature.label}</div>
                          <div className="mt-1 text-base font-semibold text-white">{feature.title}</div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/60">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mx-auto w-full max-w-xl lg:ml-auto lg:mr-0 lg:max-w-[520px] lg:pt-10">
                {children}
              </section>
            </section>
          </div>
        </div>
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
    <div className={cn("auth-card-enter mx-auto max-w-xl p-6 sm:p-8 lg:p-9", publicFormSurfaceClass)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={publicFieldLabelClass}>{eyebrow}</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {title}
          </h2>
        </div>

        {status ? <span className={lightProductStatusPillClass(statusTone)}>{status}</span> : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-white/60">{description}</p>

      <div className="mt-8">{children}</div>
    </div>
  );
}
