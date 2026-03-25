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
  return <div className={cn(lightProductPanelClass, className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("space-y-4", className)} {...props} />;
}

export const publicSurfaceClass =
  "rounded-[28px] border border-white/45 bg-white/24 shadow-[0_16px_34px_rgba(122,146,168,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_20px_60px_rgba(0,0,0,0.24)]";

export const publicSubtleSurfaceClass =
  "rounded-[24px] border border-white/42 bg-white/20 shadow-[0_12px_28px_rgba(122,146,168,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_16px_42px_rgba(0,0,0,0.22)]";

export const publicPrimaryButtonClass =
  "inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/30 bg-[linear-gradient(180deg,rgba(108,92,255,0.92),rgba(87,76,240,0.92))] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(99,91,255,0.22)] backdrop-blur-xl transition hover:brightness-105 dark:border-[#8dd8ff]/18 dark:shadow-[0_18px_38px_rgba(0,0,0,0.28)]";

export const publicSecondaryButtonClass =
  "inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/45 bg-white/22 px-6 py-3.5 text-sm font-semibold text-[#4f46e5] shadow-[0_10px_24px_rgba(133,156,180,0.12)] backdrop-blur-2xl transition hover:border-white/55 hover:bg-white/30 dark:border-white/10 dark:bg-white/5 dark:text-[#d7dcff] dark:shadow-[0_12px_28px_rgba(0,0,0,0.24)] dark:hover:border-[#20BCED]/35 dark:hover:bg-white/10";

export const publicPillClass =
  "inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/24 px-4 py-2 text-sm font-medium text-[#0a2540] shadow-[0_8px_24px_rgba(133,156,180,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6 dark:text-white dark:shadow-[0_12px_28px_rgba(0,0,0,0.22)]";

export const publicSectionLabelClass =
  "text-sm font-semibold uppercase tracking-[0.18em] text-[#6b7c93] dark:text-[#8dd8ff]";

export const publicCodePanelClass =
  "rounded-[28px] border border-white/25 bg-[linear-gradient(180deg,rgba(10,37,64,0.84),rgba(28,53,94,0.80))] p-6 text-white shadow-[0_16px_36px_rgba(10,37,64,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(12,27,57,0.92),rgba(6,15,36,0.82))] dark:shadow-[0_22px_56px_rgba(0,0,0,0.28)]";

export const brandGlassContainerClass =
  "border border-white/48 bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(238,246,250,0.24)_100%),radial-gradient(circle_at_30%_25%,rgba(125,211,252,0.18),transparent_52%),radial-gradient(circle_at_72%_74%,rgba(167,139,250,0.16),transparent_48%)] shadow-[0_14px_32px_rgba(122,146,168,0.14),inset_0_1px_0_rgba(255,255,255,0.58),inset_0_0_24px_rgba(122,115,255,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%),radial-gradient(circle_at_28%_24%,rgba(32,188,237,0.16),transparent_52%),radial-gradient(circle_at_74%_72%,rgba(114,98,255,0.18),transparent_48%)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.08)]";

export const lightProductHeroClass =
  "rounded-[32px] border border-white/48 bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(242,248,251,0.24)_100%)] shadow-[0_20px_42px_rgba(122,146,168,0.12),inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-2xl dark:border-white/12 dark:bg-[linear-gradient(180deg,rgba(12,27,57,0.92)_0%,rgba(6,15,36,0.78)_100%)] dark:shadow-[0_26px_96px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)]";

export const lightProductPanelClass =
  "rounded-[28px] border border-white/45 bg-white/24 shadow-[0_16px_34px_rgba(122,146,168,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#08152f]/60 dark:shadow-[0_20px_80px_rgba(0,0,0,0.28)]";

export const lightProductInsetPanelClass =
  "rounded-[24px] border border-white/42 bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(238,246,250,0.22)_100%)] shadow-[0_12px_28px_rgba(122,146,168,0.08),inset_0_1px_0_rgba(255,255,255,0.54)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(3,9,24,0.24)_100%)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

export const lightProductGhostButtonClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-white/45 bg-white/22 px-4 py-3 text-sm font-semibold text-[#425466] shadow-[0_10px_24px_rgba(133,156,180,0.12)] backdrop-blur-2xl transition hover:border-white/55 hover:bg-white/30 hover:text-[#0a2540] dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:shadow-[0_12px_28px_rgba(0,0,0,0.24)] dark:hover:border-[#20BCED]/35 dark:hover:bg-white/10 dark:hover:text-white";

export const lightProductCompactGhostButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/42 bg-white/22 px-4 py-2 text-sm font-semibold text-[#425466] shadow-[0_8px_20px_rgba(133,156,180,0.10)] backdrop-blur-2xl transition hover:border-white/52 hover:bg-white/30 hover:text-[#0a2540] dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:shadow-[0_12px_24px_rgba(0,0,0,0.22)] dark:hover:border-[#20BCED]/35 dark:hover:bg-white/10 dark:hover:text-white";

export const lightProductCompactPrimaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/30 bg-[linear-gradient(180deg,rgba(108,92,255,0.92),rgba(87,76,240,0.92))] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(99,91,255,0.22)] backdrop-blur-xl transition hover:brightness-105 dark:border-[#8dd8ff]/18 dark:shadow-[0_14px_30px_rgba(0,0,0,0.24)]";

export const lightProductInputClass =
  "min-h-[48px] w-full rounded-2xl border border-white/45 bg-white/28 px-4 py-3 text-sm text-[#0a2540] shadow-[0_10px_24px_rgba(133,156,180,0.10)] backdrop-blur-2xl outline-none transition placeholder:text-[#6b7c93] focus:border-[#7a73ff]/45 focus:ring-2 focus:ring-[#7a73ff]/16 dark:border-white/10 dark:bg-white/6 dark:text-white dark:placeholder:text-[#89a4bf] dark:shadow-[0_12px_28px_rgba(0,0,0,0.24)] dark:focus:border-[#20BCED]/40 dark:focus:ring-[#20BCED]/18";

export const lightProductSectionEyebrowClass =
  "text-xs uppercase tracking-[0.24em] text-[#635bff] dark:text-[#8dd8ff]";

export const lightProductMutedTextClass = "text-sm leading-6 text-[#425466] dark:text-zinc-300";

export function lightProductNavItemClass(active: boolean) {
  return cn(
    "inline-flex min-h-[46px] items-center justify-center rounded-2xl border px-4 py-2 text-center text-sm font-semibold shadow-[0_8px_20px_rgba(133,156,180,0.10)] backdrop-blur-2xl transition",
    active
      ? "border-white/56 bg-[linear-gradient(180deg,rgba(122,115,255,0.22)_0%,rgba(160,233,255,0.20)_100%)] text-[#0a2540] dark:border-[#86dfff]/30 dark:bg-[linear-gradient(180deg,rgba(130,226,255,0.16)_0%,rgba(76,109,255,0.18)_100%)] dark:text-white dark:shadow-[0_12px_32px_rgba(34,89,170,0.24)]"
      : "border-white/42 bg-white/20 text-[#425466] hover:border-white/55 hover:bg-white/28 hover:text-[#0a2540] dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-[#20BCED]/35 dark:hover:bg-white/10 dark:hover:text-white"
  );
}

export function lightProductStatusPillClass(tone: "success" | "violet" | "muted" | "warning") {
  if (tone === "success") {
    return "inline-flex items-center rounded-full border border-emerald-300/70 bg-emerald-50/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-400/18 dark:bg-emerald-400/10 dark:text-emerald-200";
  }

  if (tone === "violet") {
    return "inline-flex items-center rounded-full border border-[#b8b2ff]/70 bg-[#eeedff]/82 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5146df] dark:border-[#9288ff]/22 dark:bg-[#7b72ff]/12 dark:text-[#d8d5ff]";
  }

  if (tone === "warning") {
    return "inline-flex items-center rounded-full border border-amber-300/70 bg-amber-50/82 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-amber-700 dark:border-amber-400/18 dark:bg-amber-400/10 dark:text-amber-200";
  }

  return "inline-flex items-center rounded-full border border-white/45 bg-white/22 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#425466] dark:border-white/10 dark:bg-white/5 dark:text-zinc-300";
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
  "rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(3,9,24,0.24)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl";

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
  "min-h-[48px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#20BCED]/45 focus:ring-2 focus:ring-[#20BCED]/20";

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
        "min-h-screen overflow-x-clip bg-[#dbe8ee] text-[#0a2540] dark:bg-[#020817] dark:text-white",
        className
      )}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[6px] bg-[linear-gradient(90deg,#7a73ff_0%,#4f46e5_22%,#7dd3fc_46%,#fb7185_72%,#f59e0b_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(255,255,255,0.30),transparent_24%),radial-gradient(circle_at_34%_40%,rgba(186,214,227,0.26),transparent_26%),radial-gradient(circle_at_78%_28%,rgba(241,248,251,0.28),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(32,188,237,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(17,106,248,0.20),transparent_30%),linear-gradient(135deg,#061229_0%,#020817_48%,#04174a_100%)]" />
        <div className="pointer-events-none absolute left-0 top-[88px] h-[560px] w-[60%] bg-[linear-gradient(135deg,rgba(231,240,245,0.36)_0%,rgba(196,220,233,0.12)_30%,rgba(255,255,255,0)_76%)] dark:bg-[linear-gradient(135deg,rgba(32,188,237,0.12)_0%,rgba(17,106,248,0.06)_30%,rgba(255,255,255,0)_76%)]" />
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
  return <PublicBackground className={className}>{children}</PublicBackground>;
}

export function PublicHeader() {
  return (
    <header className="public-header-shell relative z-20 border-b border-white/35 bg-white/18 backdrop-blur-2xl shadow-[0_10px_30px_rgba(122,146,168,0.10)] supports-[backdrop-filter]:bg-white/14 dark:border-white/10 dark:bg-[#061229]/68 dark:shadow-[0_10px_30px_rgba(0,0,0,0.28)] dark:supports-[backdrop-filter]:bg-[#061229]/60">
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
        <div className="flex items-center justify-between gap-4 lg:gap-6">
          <div className="public-header-block min-w-0 flex items-center gap-10">
            <div className="min-w-0 lg:hidden">
              <BrandLockup compact showTagline={false} />
            </div>
            <div className="hidden lg:block">
              <BrandLockup />
            </div>

            <PublicHeaderNav items={navItems} className="public-header-block public-header-block-delay-1" />
          </div>

          <div className="public-header-block public-header-block-delay-2 hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className={cn(
                publicSecondaryButtonClass,
                "group relative overflow-hidden px-5 py-2.5 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/32 hover:shadow-[0_16px_30px_rgba(133,156,180,0.14)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a73ff]/16 motion-reduce:transform-none motion-reduce:transition-none",
              )}
            >
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.20),rgba(255,255,255,0))] opacity-0 transition duration-300 group-hover:opacity-100 motion-reduce:transition-none" />
              <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.84),rgba(255,255,255,0))] opacity-70" />
              <span className="relative z-10">Sign in</span>
            </Link>
            <Link
              href="/contact"
              className={cn(
                publicPrimaryButtonClass,
                "group relative overflow-hidden px-5 py-2.5 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.015] hover:shadow-[0_22px_38px_rgba(99,91,255,0.30)] focus-visible:-translate-y-0.5 focus-visible:scale-[1.015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a73ff]/24 motion-reduce:transform-none motion-reduce:transition-none",
              )}
            >
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0)_38%,rgba(160,233,255,0.18)_100%)] opacity-80 transition duration-500 group-hover:opacity-100 motion-reduce:transition-none" />
              <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.92),rgba(255,255,255,0))]" />
              <span className="pointer-events-none absolute inset-y-0 left-[-28%] w-[42%] -skew-x-12 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.34),rgba(255,255,255,0))] opacity-0 transition-[left,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:left-[108%] group-hover:opacity-100 motion-reduce:hidden" />
              <span className="relative z-10">Contact sales</span>
            </Link>
          </div>

          <details className="public-header-block public-header-block-delay-1 relative lg:hidden">
            <summary className="group flex min-h-[44px] list-none items-center justify-center gap-2 rounded-2xl border border-white/45 bg-white/24 px-4 py-2 text-sm font-semibold text-[#425466] shadow-[0_8px_24px_rgba(133,156,180,0.10)] backdrop-blur-2xl transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white/30 hover:shadow-[0_14px_28px_rgba(133,156,180,0.14)] focus-visible:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none dark:border-white/10 dark:bg-white/6 dark:text-zinc-200 dark:shadow-[0_12px_26px_rgba(0,0,0,0.24)] dark:hover:bg-white/10 [&::-webkit-details-marker]:hidden">
              <span>Menu</span>
              <span className="flex flex-col gap-1 transition duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none">
                <span className="block h-[2px] w-4 rounded-full bg-[#4f46e5] transition duration-300 group-hover:w-[18px] motion-reduce:transition-none dark:bg-[#8dd8ff]" />
                <span className="block h-[2px] w-4 rounded-full bg-[#4f46e5] transition duration-300 group-hover:w-[14px] motion-reduce:transition-none dark:bg-[#8dd8ff]" />
                <span className="block h-[2px] w-4 rounded-full bg-[#4f46e5] transition duration-300 group-hover:w-[18px] motion-reduce:transition-none dark:bg-[#8dd8ff]" />
              </span>
            </summary>

            <div className="absolute right-0 top-[calc(100%+12px)] z-30 w-[min(320px,calc(100vw-2rem))] rounded-[28px] border border-white/45 bg-white/24 p-4 shadow-[0_18px_38px_rgba(122,146,168,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#08152f]/92 dark:shadow-[0_22px_42px_rgba(0,0,0,0.34)]">
              <nav className="grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-white/42 bg-white/20 px-4 py-3 text-sm font-medium text-[#425466] shadow-[0_8px_20px_rgba(133,156,180,0.08)] backdrop-blur-2xl transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white/28 hover:text-[#0a2540] motion-reduce:transform-none motion-reduce:transition-none dark:border-white/10 dark:bg-white/6 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-3 grid gap-2">
                <Link
                  href="/login"
                  className={cn(
                    publicSecondaryButtonClass,
                    "group relative w-full overflow-hidden px-4 py-3 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none",
                  )}
                >
                  <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0))] opacity-0 transition duration-300 group-hover:opacity-100 motion-reduce:transition-none" />
                  <span className="relative z-10">Sign in</span>
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    publicPrimaryButtonClass,
                    "group relative w-full overflow-hidden px-4 py-3 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(99,91,255,0.30)] motion-reduce:transform-none motion-reduce:transition-none",
                  )}
                >
                  <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0)_38%,rgba(160,233,255,0.18)_100%)] opacity-80 transition duration-500 group-hover:opacity-100 motion-reduce:transition-none" />
                  <span className="relative z-10">Contact sales</span>
                </Link>
              </div>
            </div>
          </details>
        </div>
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
