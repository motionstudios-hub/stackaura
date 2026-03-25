"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { cn } from "../components/stackaura-ui";

const mobileItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard#payments", label: "Payments" },
  { href: "/dashboard#routing", label: "Routing" },
  { href: "/dashboard#reports", label: "Reports" },
];

function AvatarCircle({ label }: { label: string }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(98,145,255,0.22),rgba(141,216,255,0.16))] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(34,89,170,0.24)]">
      {label}
    </div>
  );
}

export default function Header({
  merchantName,
  userEmail,
}: {
  merchantName: string;
  userEmail: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = useMemo(() => {
    const source = merchantName || userEmail;
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [merchantName, userEmail]);

  function logout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,21,47,0.88)_0%,rgba(8,21,47,0.72)_100%)] backdrop-blur-2xl">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.22em] text-[#8dd8ff]">Merchant dashboard</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">
              Hello, {merchantName}
            </div>
            <p className="mt-2 max-w-2xl text-sm text-[#9fb4c9]">
              See payments, routing, recovery, and merchant analytics from one structured workspace.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <div className="relative min-w-0 flex-1 sm:min-w-[320px] lg:min-w-[380px]">
              <svg
                viewBox="0 0 20 20"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                fill="none"
              >
                <circle cx="9" cy="9" r="5" stroke="#8ba8c6" strokeWidth="1.6" />
                <path d="M13 13L17 17" stroke="#8ba8c6" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                placeholder="Search payments, customers, transactions..."
                className="min-h-[52px] w-full rounded-[22px] border border-white/12 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#7b93ad] focus:border-[#8dd8ff]/30 focus:bg-white/[0.07]"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] text-white transition hover:border-[#8dd8ff]/26 hover:bg-white/[0.07]"
                aria-label="Notifications"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                  <path d="M10 4.25C8.2 4.25 6.75 5.7 6.75 7.5V9.1C6.75 9.7 6.55 10.28 6.18 10.75L5.25 11.95C4.72 12.65 5.22 13.65 6.1 13.65H13.9C14.78 13.65 15.28 12.65 14.75 11.95L13.82 10.75C13.45 10.28 13.25 9.7 13.25 9.1V7.5C13.25 5.7 11.8 4.25 10 4.25Z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8.3 15.2C8.63 15.9 9.26 16.25 10 16.25C10.74 16.25 11.37 15.9 11.7 15.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#8dd8ff]" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className={cn(
                    "inline-flex items-center gap-3 rounded-[22px] border border-white/12 bg-white/[0.04] px-3 py-2 text-left text-white transition hover:border-[#8dd8ff]/26 hover:bg-white/[0.07]",
                    menuOpen && "border-[#8dd8ff]/26 bg-white/[0.08]",
                  )}
                >
                  <AvatarCircle label={initials || "S"} />
                  <div className="hidden min-w-0 sm:block">
                    <div className="truncate text-sm font-semibold">{userEmail}</div>
                    <div className="text-xs text-[#8ba8c6]">Workspace operator</div>
                  </div>
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+12px)] w-56 rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(13,32,60,0.96)_0%,rgba(8,21,47,0.94)_100%)] p-2 shadow-[0_26px_60px_rgba(0,0,0,0.34)]">
                    <Link
                      href="/dashboard#settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex rounded-2xl px-4 py-3 text-sm text-[#d3e5f5] transition hover:bg-white/[0.06] hover:text-white"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      disabled={isPending}
                      className="flex w-full rounded-2xl px-4 py-3 text-left text-sm text-[#d3e5f5] transition hover:bg-white/[0.06] hover:text-white"
                    >
                      {isPending ? "Signing out..." : "Logout"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {mobileItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex whitespace-nowrap rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2 text-sm text-[#d3e5f5] transition hover:border-[#8dd8ff]/24 hover:bg-white/[0.08]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
