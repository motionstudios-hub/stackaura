export type DashboardNavIcon =
  | "overview"
  | "payments"
  | "payouts"
  | "customers"
  | "routing"
  | "recovery"
  | "api"
  | "gateways"
  | "settings";

export type DashboardNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: DashboardNavIcon;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", shortLabel: "Overview", icon: "overview" },
  { href: "/dashboard/payments", label: "Payments", shortLabel: "Payments", icon: "payments" },
  { href: "/dashboard/payouts", label: "Payouts", shortLabel: "Payouts", icon: "payouts" },
  { href: "/dashboard/customers", label: "Customers", shortLabel: "Customers", icon: "customers" },
  { href: "/dashboard/routing", label: "Routing", shortLabel: "Routing", icon: "routing" },
  { href: "/dashboard/recovery", label: "Recovery", shortLabel: "Recovery", icon: "recovery" },
  { href: "/dashboard/api-keys", label: "API Keys", shortLabel: "API Keys", icon: "api" },
  { href: "/dashboard/gateways", label: "Gateways", shortLabel: "Gateways", icon: "gateways" },
  { href: "/dashboard/settings", label: "Settings", shortLabel: "Settings", icon: "settings" },
];

export function resolveDashboardTitle(pathname: string) {
  const item = dashboardNavItems.find((navItem) => pathname === navItem.href);
  if (item) return item.label;

  if (pathname.startsWith("/dashboard/api-keys")) return "API Keys";
  if (pathname.startsWith("/dashboard/gateways")) return "Gateways";
  if (pathname.startsWith("/dashboard/support")) return "Support";
  if (pathname.startsWith("/dashboard/payments")) return "Payments";
  if (pathname.startsWith("/dashboard/payouts")) return "Payouts";
  if (pathname.startsWith("/dashboard/customers")) return "Customers";
  if (pathname.startsWith("/dashboard/routing")) return "Routing";
  if (pathname.startsWith("/dashboard/recovery")) return "Recovery";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  return "Overview";
}
