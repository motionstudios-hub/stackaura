import Image from "next/image";
import Link from "next/link";
import { cn } from "../../lib/utils";
import FooterReveal from "./footer-reveal";

const footerSections = [
  {
    title: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/docs", label: "Docs" },
      { href: "/integrations", label: "Integrations" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/integrations", label: "Payment orchestration" },
      { href: "/integrations", label: "Smart routing" },
      { href: "/pricing", label: "Fallback flows" },
      { href: "/signup", label: "Merchant infrastructure" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs", label: "API docs" },
      { href: "/integrations", label: "Integration guides" },
      { href: "/docs", label: "Hosted checkout" },
      { href: "/docs", label: "Webhooks" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/dashboard/support", label: "Support assistant" },
      { href: "mailto:wesupport@stackaura.co.za", label: "wesupport@stackaura.co.za" },
      { href: "/docs", label: "Support docs" },
      { href: "/contact", label: "Contact support" },
    ],
  },
] as const;

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
] as const;

const brandPills = [
  "One integration",
  "Multiple gateways",
  "Licensed providers handle processing",
] as const;

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/35 bg-white/18 backdrop-blur-2xl dark:border-white/10 dark:bg-[#061229]/64">
      <FooterReveal className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="overflow-hidden rounded-[34px] border border-white/46 bg-[linear-gradient(180deg,rgba(255,255,255,0.32),rgba(240,247,250,0.22))] shadow-[0_18px_38px_rgba(122,146,168,0.12),inset_0_1px_0_rgba(255,255,255,0.56)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(12,27,57,0.92),rgba(6,15,36,0.82))] dark:shadow-[0_26px_72px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="pointer-events-none absolute inset-x-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.86),rgba(255,255,255,0))]" />

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_1.45fr] lg:gap-10 lg:p-10">
            <div className="max-w-xl">
              <Link href="/" className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/48 bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(238,246,250,0.24)_100%),radial-gradient(circle_at_30%_25%,rgba(125,211,252,0.18),transparent_52%),radial-gradient(circle_at_72%_74%,rgba(167,139,250,0.16),transparent_48%)] shadow-[0_14px_32px_rgba(122,146,168,0.14),inset_0_1px_0_rgba(255,255,255,0.58),inset_0_0_24px_rgba(122,115,255,0.08)] backdrop-blur-2xl">
                  <Image
                    src="/stackaura-logo.png"
                    alt="Stackaura"
                    width={26}
                    height={26}
                    className="object-contain"
                  />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-xl font-semibold tracking-tight text-[#0a2540] dark:text-white">
                    Stackaura
                  </div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#635bff] dark:text-[#8dd8ff]">
                    Financial Infrastructure
                  </div>
                </div>
              </Link>

              <p className="mt-5 text-sm leading-7 text-[#425466] sm:text-[15px] dark:text-zinc-300">
                Stackaura builds payment orchestration and infrastructure software for African
                commerce teams. Route across multiple gateways, recover failed payments, and operate
                through one merchant-ready integration layer.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {brandPills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center rounded-full border border-white/45 bg-white/24 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#425466] shadow-[0_8px_20px_rgba(133,156,180,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6 dark:text-zinc-200 dark:shadow-[0_12px_24px_rgba(0,0,0,0.22)]"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-white/42 bg-white/22 p-4 shadow-[0_10px_24px_rgba(133,156,180,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_14px_30px_rgba(0,0,0,0.24)]">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7c93] dark:text-[#8dd8ff]">
                  Trust and compliance
                </div>
                <p className="mt-2 text-sm leading-6 text-[#425466] dark:text-zinc-300">
                  Stackaura provides software infrastructure and orchestration tools. Licensed
                  payment providers process and settle customer funds.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7c93] dark:text-[#8dd8ff]">
                    {section.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {section.links.map((item) => (
                      <li key={`${section.title}-${item.label}`}>
                        <Link
                          href={item.href}
                          className="text-sm leading-6 text-[#425466] transition hover:text-[#0a2540] dark:text-zinc-300 dark:hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/38 bg-white/16 px-6 py-4 sm:px-8 lg:px-10 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[#425466] dark:text-zinc-300">
                © {year} Stackaura Payments (Pty) Ltd. Built for African commerce and payment
                infrastructure teams.
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-[#425466] dark:text-zinc-300">
                <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 shadow-[0_8px_18px_rgba(133,156,180,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_12px_22px_rgba(0,0,0,0.22)]">
                  South Africa
                </span>
                {legalLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "transition hover:text-[#0a2540] dark:hover:text-white",
                      item.label === "Contact" && "font-medium text-[#0a2540] dark:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FooterReveal>
    </footer>
  );
}
