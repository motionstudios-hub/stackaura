"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import {
  cn,
  lightProductHeroClass,
} from "../components/stackaura-ui";
import { resolveDashboardTitle } from "./dashboard-nav";
import DashboardNotifications from "./DashboardNotifications";
import DashboardSearch from "./DashboardSearch";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Separator } from "../../components/ui/separator";

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
    <header className="sticky top-0 z-30 px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8">
      <div className={cn(lightProductHeroClass, "relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5")}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.34),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(122,115,255,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.14),transparent_24%)]" />

        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMenuToggle}
              className="lg:hidden"
              aria-label="Toggle navigation"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                <path d="M4 6H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M4 10H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M4 14H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Button>

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

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="inline-flex min-h-[48px] items-center gap-3 rounded-2xl px-3 py-2"
                  >
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[220px] truncate text-left sm:block">
                      <span className="block text-sm font-medium text-[#0a2540]">{userEmail}</span>
                      <span className="mt-0.5 block text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                        Workspace operator
                      </span>
                    </span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="p-0" align="end">
                  <div className="rounded-[24px] border border-white/45 bg-white/88 p-2 shadow-[0_18px_34px_rgba(122,146,168,0.16)] backdrop-blur-2xl">
                    <div className="flex items-center gap-3 px-4 py-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[#0a2540]">{userEmail}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93]">
                          Workspace operator
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-white/50" />

                    <div className="grid gap-1 px-2 py-2">
                      <button
                        type="button"
                        onClick={() => router.push("/dashboard/settings#profile")}
                        className="flex rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#425466] transition hover:bg-white/60 hover:text-[#0a2540]"
                      >
                        View profile
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/dashboard/settings")}
                        className="flex rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#425466] transition hover:bg-white/60 hover:text-[#0a2540]"
                      >
                        Settings
                      </button>
                    </div>

                    <Separator className="bg-white/50" />

                    <div className="px-2 py-2">
                      <button
                        type="button"
                        onClick={logout}
                        disabled={isPending}
                        className="flex w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#425466] transition hover:bg-white/60 hover:text-[#0a2540]"
                      >
                        {isPending ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
