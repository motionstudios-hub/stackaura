"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useTransition } from "react";
import {
  SoftProductBackground,
  cn,
  lightProductCompactGhostButtonClass,
  lightProductHeroClass,
  lightProductMutedTextClass,
  lightProductNavItemClass,
  lightProductSectionEyebrowClass,
  lightProductStatusPillClass,
} from "../components/stackaura-ui";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/docs", label: "Docs" },
  { href: "/", label: "Website" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <button
      onClick={logout}
      disabled={isPending}
      className={cn(
        lightProductCompactGhostButtonClass,
        "min-h-[44px] w-full rounded-2xl px-4 py-2 sm:w-auto"
      )}
    >
      {isPending ? "Signing out..." : "Logout"}
    </button>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SoftProductBackground>
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-6">
        <header className={cn(lightProductHeroClass, "relative overflow-hidden p-4 sm:p-5 lg:p-6")}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.34),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(122,115,255,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.14),transparent_24%)]" />

          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-[24px] border border-white/48 bg-[#0a2540] shadow-[0_14px_32px_rgba(122,146,168,0.16)]">
                    <Image
                      src="/stackaura-logo.png"
                      alt="Stackaura"
                      width={40}
                      height={40}
                      className="object-contain"
                      priority
                    />
                  </div>

                  <div className="min-w-0">
                    <div className={lightProductSectionEyebrowClass}>Merchant console</div>
                    <div className="mt-1 text-xl font-semibold tracking-tight text-[#0a2540] sm:text-2xl">
                      Stackaura Infrastructure Console
                    </div>
                    <div className={cn(lightProductMutedTextClass, "mt-2 max-w-2xl")}>
                      Manage merchant workspaces, developer access, checkout tooling, and payment
                      operations from the authenticated Stackaura experience.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={lightProductStatusPillClass("success")}>Operator mode</span>
                <Link href="/" className={cn(lightProductCompactGhostButtonClass, "min-h-[44px] rounded-2xl")}>
                  Open website
                </Link>
                <LogoutButton />
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <nav className="grid w-full grid-cols-2 gap-2 rounded-[24px] border border-white/44 bg-white/20 p-1.5 shadow-[0_8px_20px_rgba(133,156,180,0.08)] backdrop-blur-2xl sm:flex sm:flex-wrap xl:w-auto">
                {navItems.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link key={item.href} href={item.href} className={lightProductNavItemClass(active)}>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#6b7c93]">
                <span className={lightProductStatusPillClass("violet")}>Authenticated product</span>
                <span className="hidden sm:inline">Homepage-aligned visual system</span>
              </div>
            </div>
          </div>
        </header>
      </div>

      <div className="relative z-10 pb-10">{children}</div>
    </SoftProductBackground>
  );
}
