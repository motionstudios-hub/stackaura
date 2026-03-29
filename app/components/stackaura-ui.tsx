import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import PublicHeaderNav from "./public-header-nav";
import SiteFooter from "./site-footer";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn(publicSubtleSurfaceClass, className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("space-y-4", className)} {...props} />;
}

export const publicSurfaceClass =
  "rounded-[32px] border border-slate-200/80 bg-white/96 shadow-[0_20px_44px_rgba(148,163,184,0.12)] dark:border-white/10 dark:bg-[#081221] dark:shadow-[0_16px_36px_rgba(0,0,0,0.22)]";

export const publicSubtleSurfaceClass =
  "rounded-[26px] border border-slate-200/80 bg-slate-50/92 shadow-[0_12px_28px_rgba(148,163,184,0.09)] dark:border-white/10 dark:bg-[#0d1829] dark:shadow-[0_10px_20px_rgba(0,0,0,0.12)]";

export const publicInsetSurfaceClass =
  "rounded-[22px] border border-slate-200/75 bg-white/88 shadow-[0_10px_22px_rgba(148,163,184,0.08)] dark:border-white/10 dark:bg-[#101b2d] dark:shadow-none";

export const publicFormSurfaceClass =
  "relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#0D1220] shadow-[0_10px_40px_rgba(0,0,0,0.4)] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:border before:border-white/5 before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-24 after:rounded-t-2xl after:bg-gradient-to-b after:from-white/[0.03] after:to-transparent after:content-['']";

export const publicInputClass =
  "min-h-[48px] w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] outline-none transition-[border-color,box-shadow,background-color] duration-150 ease-out placeholder:text-white/50 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none";

export const publicFieldLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50";

export const publicPrimaryButtonClass =
  "inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-[#4f46e5] bg-[#4f46e5] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca] dark:border-[#4f46e5] dark:bg-[#4f46e5] dark:shadow-[0_16px_28px_rgba(0,0,0,0.22)] dark:hover:bg-[#5b54ee]";

export const publicSecondaryButtonClass =
  "inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#0a2540] shadow-[0_10px_20px_rgba(148,163,184,0.08)] transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/14 dark:bg-[#0d1829] dark:text-[#e2ebf8] dark:shadow-none dark:hover:border-white/22 dark:hover:bg-[#122033]";

export const publicPillClass =
  "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#0a2540] shadow-[0_10px_22px_rgba(148,163,184,0.08)] dark:border-white/10 dark:bg-[#0d1829] dark:text-white dark:shadow-none";

export const publicSectionLabelClass =
  "text-sm font-semibold uppercase tracking-[0.18em] text-[#6b7c93] dark:text-[#8dd8ff]";

export const publicTextPrimaryClass =
  "text-[#0a2540] dark:text-[#f8fafc]";

export const publicTextSecondaryClass =
  "text-[#425466] dark:text-[#e2e9f5]";

export const publicTextMutedClass =
  "text-[#5b6b7e] dark:text-[#b4c2d8]";

export const publicBorderSubtleClass =
  "border-slate-200 dark:border-white/16";

export const publicBadgeClass =
  "inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93] shadow-[0_8px_18px_rgba(148,163,184,0.08)] dark:border-white/12 dark:bg-[#0d1829] dark:text-[#d7e2f2] dark:shadow-none";

export const publicMinimalSecondaryButtonClass =
  "inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-[#0a2540] transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/14 dark:bg-[#0d1829] dark:text-[#f8fafc] dark:hover:border-white/24 dark:hover:bg-[#122033]";

export const publicHeaderSecondaryButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#0a2540] transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/14 dark:bg-[#0d1829] dark:text-[#f8fafc] dark:hover:border-white/24 dark:hover:bg-[#122033]";

export const publicHeaderMobileButtonClass =
  "inline-flex min-h-[46px] w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-[#0a2540] transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/14 dark:bg-[#0d1829] dark:text-[#f8fafc] dark:hover:border-white/24 dark:hover:bg-[#122033]";

export const publicCodePanelClass =
  "rounded-[32px] border border-[#12243c] bg-[#071323] p-6 text-white shadow-[0_20px_42px_rgba(2,8,23,0.22)] dark:border-white/10 dark:bg-[#050d19] dark:shadow-[0_18px_34px_rgba(0,0,0,0.24)]";

export const brandGlassContainerClass =
  "border border-slate-200 bg-white shadow-[0_8px_18px_rgba(148,163,184,0.10)] dark:border-white/10 dark:bg-[#0d1829] dark:shadow-none";

export const lightProductHeroClass =
  "relative isolate rounded-[32px] border border-slate-200/80 bg-white/96 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0d1220] dark:shadow-[0_18px_40px_rgba(0,0,0,0.32)]";

export const lightProductPanelClass =
  "relative isolate rounded-[28px] border border-slate-200/75 bg-white/94 shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#0f1727] dark:shadow-[0_14px_32px_rgba(0,0,0,0.24)]";

export const lightProductInsetPanelClass =
  "relative isolate rounded-[24px] border border-slate-200/70 bg-slate-50/92 shadow-[0_10px_20px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#111b2d] dark:shadow-none";

export const lightProductGhostButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-semibold text-[#0f172a] shadow-[0_10px_20px_rgba(15,23,42,0.06)] transition-all duration-200 ease-out hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-none dark:hover:border-white/16 dark:hover:bg-white/[0.06]";

export const lightProductCompactGhostButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-sm font-semibold text-[#0f172a] shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition-all duration-200 ease-out hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-none dark:hover:border-white/16 dark:hover:bg-white/[0.06]";

export const lightProductCompactPrimaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-indigo-500/70 bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,70,229,0.22)] transition-all duration-200 ease-out hover:brightness-105 active:scale-[0.99] dark:border-indigo-400/70 dark:shadow-[0_14px_30px_rgba(0,0,0,0.24)]";

export const lightProductInputClass =
  "min-h-[48px] w-full rounded-[20px] border border-slate-200/80 bg-white/92 px-4 py-3 text-sm text-[#0f172a] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-[border-color,box-shadow,background-color] duration-150 ease-out placeholder:text-[#64748b] focus:border-[#4f46e5]/50 focus:ring-1 focus:ring-[#4f46e5]/16 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/50 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] dark:focus:border-indigo-500/60 dark:focus:ring-indigo-500/30";

export const lightProductSectionEyebrowClass =
  "text-xs uppercase tracking-[0.24em] text-[#635bff] dark:text-[#8dd8ff]";

export const lightProductMutedTextClass = "text-sm leading-6 text-[#475569] dark:text-[#c3d1e2]";

export function lightProductNavItemClass(active: boolean) {
  return cn(
    "inline-flex min-h-[46px] items-center justify-center rounded-2xl border px-4 py-2 text-center text-sm font-semibold transition-all duration-200 ease-out",
    active
      ? "border-indigo-200 bg-indigo-50 text-[#0f172a] shadow-[0_10px_20px_rgba(79,70,229,0.10)] dark:border-indigo-500/35 dark:bg-indigo-500/10 dark:text-white dark:shadow-none"
      : "border-slate-200/80 bg-white/90 text-[#475569] hover:border-slate-300 hover:bg-slate-50 hover:text-[#0f172a] dark:border-white/10 dark:bg-white/[0.03] dark:text-[#c9d5e5] dark:hover:border-white/16 dark:hover:bg-white/[0.05] dark:hover:text-white"
  );
}

export function lightProductStatusPillClass(tone: "success" | "violet" | "muted" | "warning") {
  if (tone === "success") {
    return "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-400/18 dark:bg-emerald-400/10 dark:text-emerald-200";
  }

  if (tone === "violet") {
    return "inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-indigo-700 dark:border-indigo-400/18 dark:bg-indigo-400/10 dark:text-indigo-200";
  }

  if (tone === "warning") {
    return "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-700 dark:border-amber-400/18 dark:bg-amber-400/10 dark:text-amber-200";
  }

  return "inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#475569] dark:border-white/10 dark:bg-white/[0.04] dark:text-[#c9d5e5]";
}

export const darkSurfaceClass =
  "rounded-[28px] border border-white/10 bg-[#08152f]/60 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl";

export const darkPanelClass =
  "rounded-3xl border border-white/10 bg-[#08152f]/55 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl";

export const darkSubtleSurfaceClass =
  "rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl";

export const darkHeroSurfaceClass =
  "rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(12,27,57,0.92)_0%,rgba(6,15,36,0.78)_100%)] shadow-[0_26px_96px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl";

export const darkRichPanelClass =
  "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,24,52,0.90)_0%,rgba(6,14,34,0.76)_100%)] shadow-[0_18px_56px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl";

export const darkInsetPanelClass =
  "rounded-[24px] border border-white/[0.08] bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

export const darkGhostButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10";

export const darkPrimaryButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-[#A0E9FF] px-4 py-3 text-sm font-semibold text-[#02142b] transition hover:brightness-105";

export const darkSecondaryButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(114,98,255,0.18)_0%,rgba(61,83,207,0.18)_100%)] px-4 py-3 text-sm font-semibold text-[#d7dcff] shadow-[0_10px_30px_rgba(44,56,133,0.22)] backdrop-blur-xl transition hover:border-[#8da0ff]/30 hover:bg-[linear-gradient(180deg,rgba(114,98,255,0.24)_0%,rgba(61,83,207,0.22)_100%)]";

export const darkCompactGhostButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10";

export const darkCompactPrimaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-[#A0E9FF] px-4 py-2 text-sm font-semibold text-[#02142b] transition hover:brightness-105";

export const darkInputClass =
  "min-h-[48px] w-full rounded-[20px] border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] outline-none transition-[border-color,box-shadow,background-color] duration-150 ease-out placeholder:text-white/50 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30";

export const darkPillClass =
  "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200";

export const darkSectionEyebrowClass =
  "text-xs uppercase tracking-[0.24em] text-[#8dd8ff]";

export const darkMutedTextClass = "text-sm leading-6 text-zinc-300";

export function darkNavItemClass(active: boolean) {
  return cn(
    "inline-flex min-h-[46px] items-center justify-center rounded-2xl border px-4 py-2 text-center text-sm font-medium shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl transition",
    active
      ? "border-[#86dfff]/30 bg-[linear-gradient(180deg,rgba(130,226,255,0.16)_0%,rgba(76,109,255,0.18)_100%)] text-white shadow-[0_12px_32px_rgba(34,89,170,0.24)]"
      : "border-white/10 bg-white/5 text-zinc-200 hover:border-[#20BCED]/35 hover:bg-white/10"
  );
}

export function darkStatusPillClass(tone: "default" | "success" | "violet" | "muted") {
  if (tone === "success") {
    return "inline-flex items-center rounded-full border border-emerald-400/18 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-200";
  }

  if (tone === "violet") {
    return "inline-flex items-center rounded-full border border-[#9288ff]/22 bg-[#7b72ff]/12 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#d8d5ff]";
  }

  if (tone === "muted") {
    return "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-300";
  }

  return darkPillClass;
}

const navItems = [
  { href: "/signup", label: "Products" },
  { href: "/integrations", label: "Integrations" },
  { href: "/docs", label: "Developers" },
  { href: "/dashboard", label: "Merchant Console" },
  { href: "/pricing", label: "Pricing" },
];

export function BrandLockup({
  compact = false,
  showTagline = true,
}: {
  compact?: boolean;
  showTagline?: boolean;
}) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3">
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl",
          brandGlassContainerClass,
          compact ? "h-10 w-10" : "h-11 w-11"
        )}
      >
        <Image
          src="/stackaura-logo.png"
          alt="Stackaura"
          width={compact ? 22 : 26}
          height={compact ? 22 : 26}
          className="object-contain"
          priority
        />
      </div>

      <div className="min-w-0">
        <div
          className={cn(
            "truncate font-semibold tracking-tight text-[#0a2540] dark:text-white",
            compact ? "text-lg" : "text-xl"
          )}
        >
          Stackaura
        </div>
        {showTagline ? (
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#635bff] dark:text-[#8dd8ff]">
            Financial infrastructure
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function PublicBackground({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "min-h-screen overflow-x-clip bg-[#f8fafc] text-[#0a2540] dark:bg-[#020817] dark:text-white",
        className
      )}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-slate-200 dark:bg-white/10" />
        {children}
      </div>
    </main>
  );
}

export function SoftProductBackground({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <PublicBackground className={cn("bg-[#f8fafc] dark:bg-[#05070F]", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.06),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_24%)]" />
      <div className="relative">{children}</div>
    </PublicBackground>
  );
}

export function PublicHeader() {
  return (
    <header className="public-header-shell relative z-20 border-b border-slate-200 bg-white/96 px-4 sm:px-6 lg:px-10 dark:border-white/14 dark:bg-[#030712]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 py-4 lg:relative lg:gap-6">
        <div className="public-header-block min-w-0 flex items-center gap-10">
          <div className="min-w-0 lg:hidden">
            <BrandLockup compact showTagline={false} />
          </div>
          <div className="hidden lg:block">
            <BrandLockup />
          </div>

          <PublicHeaderNav
            items={navItems}
            className="public-header-block public-header-block-delay-1 lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
          />
        </div>

        <div className="public-header-block public-header-block-delay-2 hidden items-center gap-3 lg:flex">
          <Link href="/login" className={publicHeaderSecondaryButtonClass}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className={cn(
              "inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338ca]",
            )}
          >
            Start integrating
          </Link>
        </div>

        <details className="public-header-block public-header-block-delay-1 relative lg:hidden">
          <summary className="group flex min-h-[44px] list-none items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#425466] transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/22 dark:bg-[#0f172a] dark:text-[#f8fafc] dark:hover:border-white/34 dark:hover:bg-[#111827] [&::-webkit-details-marker]:hidden">
            <span>Menu</span>
            <span className="flex flex-col gap-1">
              <span className="block h-[2px] w-4 rounded-full bg-[#4f46e5] dark:bg-[#8dd8ff]" />
              <span className="block h-[2px] w-4 rounded-full bg-[#4f46e5] dark:bg-[#8dd8ff]" />
              <span className="block h-[2px] w-4 rounded-full bg-[#4f46e5] dark:bg-[#8dd8ff]" />
            </span>
          </summary>

          <div className="absolute right-0 top-[calc(100%+12px)] z-30 w-[min(320px,calc(100vw-2rem))] rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_38px_rgba(148,163,184,0.14)] dark:border-white/14 dark:bg-[#0f172a] dark:shadow-[0_22px_42px_rgba(0,0,0,0.30)]">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#425466] transition hover:bg-slate-100 hover:text-[#0a2540] dark:border-white/14 dark:bg-[#111b2d] dark:text-[#dbe6f6] dark:hover:bg-[#18253a] dark:hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-3 grid gap-2">
              <Link href="/login" className={publicHeaderMobileButtonClass}>
                Sign in
              </Link>
              <Link
                href="/signup"
                className={cn(
                  "inline-flex min-h-[46px] w-full items-center justify-center rounded-xl bg-[#4f46e5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4338ca]",
                )}
              >
                Start integrating
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return <SiteFooter />;
}

export function PublicPageShell({
  eyebrow,
  title,
  description,
  actions,
  aside,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <PublicBackground>
      <PublicHeader />

      <div className="relative mx-auto max-w-[1440px] px-6 py-14 lg:px-10 lg:py-16">
        <section
          className={cn(
            "gap-8 lg:gap-12",
            aside ? "grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start" : "max-w-4xl"
          )}
        >
          <div className={cn("max-w-3xl", !aside && "max-w-4xl")}>
            <div className={publicPillClass}>{eyebrow}</div>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#0a2540] sm:text-6xl dark:text-white">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#425466] sm:text-[21px] dark:text-zinc-300">
              {description}
            </p>

            {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
          </div>

          {aside ? <div className="lg:pt-2">{aside}</div> : null}
        </section>

        {children ? <div className="mt-10 space-y-6">{children}</div> : null}
      </div>

      <PublicFooter />
    </PublicBackground>
  );
}

export function DarkBackground({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("relative min-h-screen overflow-hidden bg-[#020817] text-white", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(32,188,237,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(17,106,248,0.20),transparent_30%),linear-gradient(135deg,#061229_0%,#020817_48%,#04174a_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_18%)]" />
      {children}
    </main>
  );
}
