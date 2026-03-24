import type { Metadata } from "next";
import AdminShell from "./admin-shell";
import { requireAdminSession } from "../lib/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await requireAdminSession();

  return <AdminShell userEmail={me.user.email}>{children}</AdminShell>;
}
