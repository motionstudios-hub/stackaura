"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/docs", label: "Docs" },
  { href: "/", label: "Website" },
];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

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
      className="min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-[#20BCED]/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
    >
      {isPending ? "Signing out..." : "Logout"}
    </button>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <div className="relative overflow-hidden border-b border-white/10 bg-[#020817]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(32,188,237,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(17,106,248,0.2),transparent_30%),linear-gradient(135deg,#061229_0%,#020817_48%,#04174a_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_18%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#08152f]/60 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-transparent shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                  <Image
                    src="/stackaura-logo.png"
                    alt="Stackaura"
                    width={38}
                    height={38}
                    className="object-contain mix-blend-screen"
                    priority
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.24em] text-[#A0E9FF]">
                    Merchant console
                  </div>
                  <div className="mt-1 text-lg font-semibold tracking-tight text-white">
                    Stackaura Dashboard
                  </div>
                  <div className="text-sm text-zinc-400">
                    Operations, developer access, and merchant controls.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[520px] xl:items-end">
              <nav className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:justify-end">
                {navItems.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={classNames(
                        "inline-flex min-h-[44px] items-center justify-center rounded-xl border px-4 py-2 text-center text-sm shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl transition sm:w-auto",
                        active
                          ? "border-[#20BCED]/35 bg-[#A0E9FF]/15 text-white"
                          : "border-white/10 bg-white/5 text-zinc-200 hover:border-[#20BCED]/35 hover:bg-white/10"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:w-auto xl:justify-end">
                <div className="hidden rounded-full border border-emerald-900/40 bg-emerald-950/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-300 sm:inline-flex">
                  Operator mode
                </div>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
