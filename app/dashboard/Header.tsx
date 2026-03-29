"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  cn,
  lightProductHeroClass,
  lightProductSectionEyebrowClass,
} from "../components/stackaura-ui";
import { resolveDashboardTitle } from "./dashboard-nav";
import DashboardNotifications from "./DashboardNotifications";
import DashboardSearch from "./DashboardSearch";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Separator } from "../../components/ui/separator";
import { useProfileAvatar } from "./use-profile-avatar";

export default function Header({
  userId,
  userEmail,
  onMenuToggle,
}: {
  userId: string;
  userEmail: string;
  onMenuToggle: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { avatarSrc, initials } = useProfileAvatar(userId, userEmail);

  function logout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-30 px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8">
      <div className={cn(lightProductHeroClass, "px-4 py-4 sm:px-5 sm:py-5")}>
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
              <div className={lightProductSectionEyebrowClass}>Dashboard</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-[#0a2540] dark:text-white">
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
                      <AvatarImage src={avatarSrc ?? undefined} alt={`${userEmail} profile photo`} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[220px] truncate text-left sm:block">
                      <span className="block text-sm font-medium text-[#0a2540] dark:text-white">{userEmail}</span>
                      <span className="mt-0.5 block text-xs uppercase tracking-[0.16em] text-[#6b7c93] dark:text-[#8ea5c0]">
                        Workspace operator
                      </span>
                    </span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[320px] overflow-hidden p-0" align="end">
                  <div className="flex items-center gap-3 px-4 py-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={avatarSrc ?? undefined} alt={`${userEmail} profile photo`} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#0a2540] dark:text-white">{userEmail}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#6b7c93] dark:text-[#8ea5c0]">
                        Workspace operator
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-1 p-2">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/settings#profile")}
                      className="flex rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#475569] transition-all duration-200 ease-out hover:bg-slate-50 hover:text-[#0f172a] dark:text-[#c9d5e5] dark:hover:bg-white/[0.04] dark:hover:text-white"
                    >
                      Edit profile
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/settings")}
                      className="flex rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#475569] transition-all duration-200 ease-out hover:bg-slate-50 hover:text-[#0f172a] dark:text-[#c9d5e5] dark:hover:bg-white/[0.04] dark:hover:text-white"
                    >
                      Settings
                    </button>
                  </div>

                  <Separator />

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={logout}
                      disabled={isPending}
                      className="flex w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#475569] transition-all duration-200 ease-out hover:bg-slate-50 hover:text-[#0f172a] dark:text-[#c9d5e5] dark:hover:bg-white/[0.04] dark:hover:text-white"
                    >
                      {isPending ? "Signing out..." : "Sign out"}
                    </button>
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
