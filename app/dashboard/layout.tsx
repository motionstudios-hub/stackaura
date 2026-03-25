import { cookies } from "next/headers";
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

  const activeMerchantId = (await cookies()).get("active_merchant_id")?.value;
  const memberships = me.memberships ?? [];
  const fallbackMerchant = memberships[0]?.merchant ?? null;
  const selectedMembership =
    memberships.find((membership) => membership.merchant.id === activeMerchantId) ?? memberships[0] ?? null;
  const merchantName = selectedMembership?.merchant.name || fallbackMerchant?.name || "Merchant workspace";

  return (
    <DashboardShell merchantName={merchantName} userEmail={me.user.email}>
      {children}
    </DashboardShell>
  );
}
