"use client";

import type { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardShell({
  children,
  merchantName,
  userEmail,
}: {
  children: ReactNode;
  merchantName: string;
  userEmail: string;
}) {

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(46,114,255,0.18),transparent_22%),linear-gradient(180deg,#071325_0%,#09172b_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(141,216,255,0.14),transparent_24%),radial-gradient(circle_at_78%_16%,rgba(104,92,255,0.12),transparent_20%),radial-gradient(circle_at_24%_80%,rgba(141,216,255,0.10),transparent_24%)]" />
      <Sidebar merchantName={merchantName} userEmail={userEmail} />

      <div className="relative z-10 min-h-screen lg:pl-[292px]">
        <Header merchantName={merchantName} userEmail={userEmail} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
