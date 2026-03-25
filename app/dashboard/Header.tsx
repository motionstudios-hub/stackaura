"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  cn,
  lightProductCompactGhostButtonClass,
  lightProductHeroClass,
  lightProductInputClass,
} from "../components/stackaura-ui";

function resolveTitle(pathname: string) {
  if (pathname.startsWith("/dashboard/api-keys")) return "API Keys";
  if (pathname.startsWith("/dashboard/gateways")) return "Gateways";
  if (pathname.startsWith("/dashboard/support")) return "Support";
  return "Overview";
}

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
  const [hashTitle, setHashTitle] = useState("");

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) {
        setHashTitle("");
        return;
      }

      const labels: Record<string, string> = {
        payments: "Payments",
        routing: "Routing",
        recovery: "Recovery",
        payouts: "Payouts",
        customers: "Customers",
        settings: "Settings",
      };

      setHashTitle(labels[hash] || "");
    };

    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

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
                {hashTitle || resolveTitle(pathname)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative min-w-0 sm:min-w-[320px]">
              <svg
                viewBox="0 0 20 20"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c93]"
                fill="none"
              >
                <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                placeholder="Search payments, customers, transactions..."
                className={cn(lightProductInputClass, "min-h-[48px] pl-11")}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className={cn(lightProductCompactGhostButtonClass, "relative h-11 w-11 rounded-2xl px-0")}
                aria-label="Notifications"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                  <path d="M10 4.25C8.2 4.25 6.75 5.7 6.75 7.5V9.1C6.75 9.7 6.55 10.28 6.18 10.75L5.25 11.95C4.72 12.65 5.22 13.65 6.1 13.65H13.9C14.78 13.65 15.28 12.65 14.75 11.95L13.82 10.75C13.45 10.28 13.25 9.7 13.25 9.1V7.5C13.25 5.7 11.8 4.25 10 4.25Z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8.3 15.2C8.63 15.9 9.26 16.25 10 16.25C10.74 16.25 11.37 15.9 11.7 15.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[#635bff]" />
              </button>

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
                      href="/dashboard#settings"
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
