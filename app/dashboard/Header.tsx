"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  cn,
  lightProductCompactGhostButtonClass,
  lightProductHeroClass,
} from "../components/stackaura-ui";
import { resolveDashboardTitle } from "./dashboard-nav";
import DashboardNotifications from "./DashboardNotifications";
import DashboardSearch from "./DashboardSearch";

export default function Header({
  userEmail,
  onMenuToggle,
}: {
  userEmail: string;
  onMenuToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = useMemo(
    () =>
      userEmail
        .split("@")[0]
        .split(/[._-]/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "S",
    [userEmail],
  );

  function logout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-20 px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8">
      <div className={cn(lightProductHeroClass, "relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5")}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.34),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(122,115,255,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.14),transparent_24%)]" />

        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuToggle}
              className={cn(lightProductCompactGhostButtonClass, "h-11 w-11 rounded-2xl px-0 lg:hidden")}
              aria-label="Toggle navigation"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                <path d="M4 6H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M4 10H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M4 14H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-[#635bff]">Dashboard</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-[#0a2540]">
                {resolveDashboardTitle(pathname)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <DashboardSearch />

            <div className="flex items-center justify-end gap-3">
              <DashboardNotifications userEmail={userEmail} />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className={cn(
                    lightProductCompactGhostButtonClass,
                    "inline-flex min-h-[48px] items-center gap-3 rounded-2xl px-3 py-2",
                    menuOpen && "border-[#7a73ff]/35 bg-white/28",
                  )}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/44 bg-white/26 text-sm font-semibold text-[#0a2540] shadow-[0_8px_20px_rgba(133,156,180,0.10)]">
                    {initials}
                  </span>
                  <span className="hidden max-w-[220px] truncate text-sm font-medium text-[#0a2540] sm:block">
                    {userEmail}
                  </span>
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+12px)] w-56 rounded-[24px] border border-white/45 bg-white/88 p-2 shadow-[0_18px_34px_rgba(122,146,168,0.16)] backdrop-blur-2xl">
                    <a
                      href="/dashboard/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex rounded-2xl px-4 py-3 text-sm font-medium text-[#425466] transition hover:bg-white/60 hover:text-[#0a2540]"
                    >
                      Profile
                    </a>
                    <button
                      type="button"
                      onClick={logout}
                      disabled={isPending}
                      className="flex w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#425466] transition hover:bg-white/60 hover:text-[#0a2540]"
                    >
                      {isPending ? "Signing out..." : "Logout"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
