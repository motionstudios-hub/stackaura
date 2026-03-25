"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { SoftProductBackground, cn } from "../components/stackaura-ui";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SoftProductBackground>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapseToggle={() => setCollapsed((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "relative z-10 min-h-screen transition-[padding] duration-300",
          collapsed ? "lg:pl-[108px]" : "lg:pl-[288px]",
        )}
      >
        <Header userEmail={userEmail} onMenuToggle={() => setMobileOpen((open) => !open)} />
        <div className="relative z-10 pb-10">{children}</div>
      </div>
    </SoftProductBackground>
  );
}
