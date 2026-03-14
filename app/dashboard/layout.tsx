import { redirect } from "next/navigation";

import { getServerMe } from "../lib/auth";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getServerMe();
  if (!me) redirect("/login");

  return <DashboardShell>{children}</DashboardShell>;
}
