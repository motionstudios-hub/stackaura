"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../components/stackaura-ui";

type SidebarItem = {
  href: string;
  label: string;
  icon: "overview" | "payments" | "payouts" | "customers" | "routing" | "recovery" | "reports" | "settings";
};

const navItems: SidebarItem[] = [
  { href: "/dashboard", label: "Overview", icon: "overview" },
  { href: "/dashboard#payments", label: "Payments", icon: "payments" },
  { href: "/dashboard#payouts", label: "Payouts", icon: "payouts" },
  { href: "/dashboard#customers", label: "Customers", icon: "customers" },
  { href: "/dashboard#routing", label: "Routing", icon: "routing" },
  { href: "/dashboard#recovery", label: "Recovery", icon: "recovery" },
  { href: "/dashboard#reports", label: "Reports", icon: "reports" },
  { href: "/dashboard#settings", label: "Settings", icon: "settings" },
];

function iconClass(active: boolean) {
  return active ? "#ffffff" : "#a5c5de";
}

function NavIcon({ icon, active }: { icon: SidebarItem["icon"]; active: boolean }) {
  const stroke = iconClass(active);

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
        <rect x="3" y="14.5" width="14" height="2.5" rx="1.25" fill={stroke} fillOpacity="0.18" />
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

  if (icon === "reports") {
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <path d="M4 15.5V10.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M10 15.5V6.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 15.5V3.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
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
      <path d="M15.3 4.7L13.9 6.1" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.1 13.9L4.7 15.3" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.3 15.3L13.9 13.9" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.1 6.1L4.7 4.7" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function isActiveLink(pathname: string, currentHash: string, href: string) {
  const [basePath, hash = ""] = href.split("#");
  if (pathname !== basePath) {
    return false;
  }

  if (!hash) {
    return !currentHash;
  }

  return currentHash === `#${hash}`;
}

export default function Sidebar({
  merchantName,
  userEmail,
}: {
  merchantName: string;
  userEmail: string;
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
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[292px] lg:flex-col lg:px-5 lg:py-5">
      <div className="flex h-full flex-col rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(13,32,60,0.96)_0%,rgba(8,21,47,0.94)_48%,rgba(18,38,72,0.94)_100%)] px-5 py-6 shadow-[0_30px_80px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/5 px-4 py-3 shadow-[0_10px_26px_rgba(0,0,0,0.22)]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(68,176,255,0.24),rgba(87,76,240,0.12))]">
            <Image src="/stackaura-logo.png" alt="Stackaura" width={24} height={24} className="object-contain" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold tracking-tight text-white">Stackaura</div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#8dd8ff]">Merchant Console</div>
          </div>
        </Link>

        <nav className="mt-7 grid gap-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                item.active
                  ? "border-[#8dd8ff]/26 bg-[linear-gradient(180deg,rgba(130,226,255,0.18)_0%,rgba(76,109,255,0.18)_100%)] text-white shadow-[0_14px_32px_rgba(34,89,170,0.22)]"
                  : "border-white/8 bg-white/[0.03] text-[#c9d8e7] hover:border-[#8dd8ff]/18 hover:bg-white/[0.06] hover:text-white",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
                  item.active
                    ? "border-white/12 bg-white/10"
                    : "border-white/8 bg-white/[0.03] group-hover:border-[#8dd8ff]/18 group-hover:bg-white/[0.06]",
                )}
              >
                <NavIcon icon={item.icon} active={item.active} />
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#7ea4c7]">Live workspace</div>
          <div className="mt-3 text-lg font-semibold tracking-tight text-white">{merchantName}</div>
          <div className="mt-1 truncate text-sm text-[#93abc5]">{userEmail}</div>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#8dd8ff] shadow-[0_0_18px_rgba(141,216,255,0.65)]" />
            <span className="text-sm text-[#d3e5f5]">Workspace connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
