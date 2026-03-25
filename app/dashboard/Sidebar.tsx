"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  cn,
  lightProductCompactGhostButtonClass,
  lightProductHeroClass,
} from "../components/stackaura-ui";

type SidebarItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon:
    | "overview"
    | "payments"
    | "payouts"
    | "customers"
    | "routing"
    | "recovery"
    | "api"
    | "gateways"
    | "settings";
};

const navItems: SidebarItem[] = [
  { href: "/dashboard", label: "Overview", shortLabel: "Overview", icon: "overview" },
  { href: "/dashboard#payments", label: "Payments", shortLabel: "Payments", icon: "payments" },
  { href: "/dashboard#payouts", label: "Payouts", shortLabel: "Payouts", icon: "payouts" },
  { href: "/dashboard#customers", label: "Customers", shortLabel: "Customers", icon: "customers" },
  { href: "/dashboard#routing", label: "Routing", shortLabel: "Routing", icon: "routing" },
  { href: "/dashboard#recovery", label: "Recovery", shortLabel: "Recovery", icon: "recovery" },
  { href: "/dashboard/api-keys", label: "API Keys", shortLabel: "API Keys", icon: "api" },
  { href: "/dashboard/gateways", label: "Gateways", shortLabel: "Gateways", icon: "gateways" },
  { href: "/dashboard#settings", label: "Settings", shortLabel: "Settings", icon: "settings" },
];

function isActiveLink(pathname: string, currentHash: string, href: string) {
  const [basePath, hash = ""] = href.split("#");
  if (pathname !== basePath) {
    return !hash && basePath !== "/dashboard" && pathname.startsWith(`${basePath}/`);
  }

  if (!hash) {
    return !currentHash;
  }

  return currentHash === `#${hash}`;
}

function navIcon(active: boolean, icon: SidebarItem["icon"]) {
  const stroke = active ? "#0a2540" : "#6b7c93";

  if (icon === "overview") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke={stroke} strokeWidth="1.6" />
        <rect x="11" y="3" width="6" height="4" rx="1.5" stroke={stroke} strokeWidth="1.6" />
        <rect x="11" y="9" width="6" height="8" rx="1.5" stroke={stroke} strokeWidth="1.6" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" stroke={stroke} strokeWidth="1.6" />
      </svg>
    );
  }

  if (icon === "payments") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <rect x="2.75" y="4" width="14.5" height="12" rx="2.5" stroke={stroke} strokeWidth="1.6" />
        <path d="M2.75 8H17.25" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.5 12.25H9.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "payouts") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <path d="M10 3.5V14" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.5 10.5L10 14L13.5 10.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16H16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "customers") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <circle cx="7" cy="7.25" r="2.5" stroke={stroke} strokeWidth="1.6" />
        <circle cx="13.5" cy="8" r="2" stroke={stroke} strokeWidth="1.6" />
        <path d="M3.75 15.5C4.4 13.35 5.95 12.25 7.95 12.25C9.95 12.25 11.5 13.35 12.15 15.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12.5 14.75C12.95 13.4 14 12.75 15.35 12.75C16.1 12.75 16.8 12.98 17.35 13.45" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "routing") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <circle cx="4.5" cy="10" r="1.75" fill={stroke} />
        <circle cx="10" cy="5" r="1.75" fill={stroke} />
        <circle cx="15.5" cy="13.5" r="1.75" fill={stroke} />
        <path d="M6 9L8.5 6.8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M11.2 6.35L14 11.55" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "recovery") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <path d="M14.75 8.5C14.3 6.35 12.35 4.75 10 4.75C7.4 4.75 5.25 6.9 5.25 9.5C5.25 12.1 7.4 14.25 10 14.25C11.8 14.25 13.35 13.2 14.1 11.7" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M13.1 5.25H15.6V7.75" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "api") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <path d="M6 6L3 10L6 14" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 6L17 10L14 14" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.5 4.5L8.5 15.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "gateways") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <rect x="3" y="5" width="14" height="10" rx="2" stroke={stroke} strokeWidth="1.6" />
        <path d="M7 8.5H13" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M7 11.5H11" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
      <circle cx="10" cy="10" r="3" stroke={stroke} strokeWidth="1.6" />
      <path d="M10 2.5V4.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 15.5V17.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17.5 10H15.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.5 10H2.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCollapseToggle,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapseToggle: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const items = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        active: isActiveLink(pathname, currentHash, item.href),
      })),
    [currentHash, pathname],
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-[#0a2540]/28 backdrop-blur-[2px] transition lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col px-4 py-5 transition-transform duration-300 lg:translate-x-0",
          collapsed ? "w-[108px]" : "w-[288px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className={cn(lightProductHeroClass, "flex h-full flex-col overflow-hidden px-3 py-4")}>
          <div className="flex items-center justify-between gap-3 px-2">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[20px] border border-white/48 bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(238,246,250,0.24)_100%),radial-gradient(circle_at_30%_25%,rgba(125,211,252,0.18),transparent_52%),radial-gradient(circle_at_72%_74%,rgba(167,139,250,0.16),transparent_48%)] shadow-[0_14px_32px_rgba(122,146,168,0.14),inset_0_1px_0_rgba(255,255,255,0.58),inset_0_0_24px_rgba(122,115,255,0.08)] backdrop-blur-2xl">
                <Image src="/stackaura-logo.png" alt="Stackaura" width={26} height={26} className="object-contain" priority />
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold tracking-tight text-[#0a2540]">
                    Stackaura
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[#635bff]">
                    Merchant Console
                  </div>
                </div>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={onCollapseToggle}
              className={cn(lightProductCompactGhostButtonClass, "hidden h-10 w-10 rounded-2xl px-0 lg:inline-flex")}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none">
                <path d={collapsed ? "M7 4L13 10L7 16" : "M13 4L7 10L13 16"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <nav className="mt-5 grid gap-2">
            {items.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                onClick={() => {
                  if (mobileOpen) onCloseMobile();
                }}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                  item.active
                    ? "border-white/52 bg-[linear-gradient(180deg,rgba(122,115,255,0.22)_0%,rgba(160,233,255,0.20)_100%)] text-[#0a2540]"
                    : "border-white/42 bg-white/18 text-[#425466] hover:border-white/55 hover:bg-white/28 hover:text-[#0a2540]",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
                    item.active
                      ? "border-white/48 bg-white/32"
                      : "border-white/34 bg-white/22 group-hover:border-white/44 group-hover:bg-white/28",
                  )}
                >
                  {navIcon(item.active, item.icon)}
                </span>
                {!collapsed ? <span className="truncate">{item.shortLabel}</span> : null}
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-2">
            {!collapsed ? (
              <div className="rounded-[24px] border border-white/42 bg-white/22 p-4 shadow-[0_10px_24px_rgba(133,156,180,0.10)] backdrop-blur-2xl">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#6b7c93]">Workspace navigation</div>
                <div className="mt-2 text-sm leading-6 text-[#425466]">
                  Collapse the sidebar for more canvas space or keep it expanded for full section labels.
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onCollapseToggle}
                className={cn(lightProductCompactGhostButtonClass, "h-10 w-10 rounded-2xl px-0")}
                aria-label="Expand sidebar"
              >
                <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none">
                  <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
