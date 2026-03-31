import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import FooterReveal from "./footer-reveal";

function InstagramIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.64 21v-7.06h2.37l.35-2.75h-2.72V9.44c0-.8.22-1.34 1.36-1.34h1.45V5.64c-.25-.03-1.1-.1-2.09-.1-2.07 0-3.49 1.26-3.49 3.58v2.07H8.5v2.75h2.37V21h2.77Z" />
    </svg>
  );
}

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
    <footer className="relative z-10 border-t border-slate-200/80 dark:border-white/10">
      <FooterReveal className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
        <div className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-white/96 shadow-[0_20px_40px_rgba(148,163,184,0.10)] dark:border-white/10 dark:bg-[#081221] dark:shadow-[0_16px_32px_rgba(0,0,0,0.20)]">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_1.45fr] lg:gap-10 lg:p-10">
            <div className="max-w-xl">
              <Link href="/" className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_10px_20px_rgba(148,163,184,0.10)] dark:border-white/10 dark:bg-[#0d1829] dark:shadow-none">
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
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#425466] shadow-[0_8px_16px_rgba(148,163,184,0.08)] dark:border-white/10 dark:bg-[#0d1829] dark:text-zinc-200 dark:shadow-none"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-slate-50/92 p-4 shadow-[0_10px_20px_rgba(148,163,184,0.08)] dark:border-white/10 dark:bg-[#0d1829] dark:shadow-none">
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

          <div className="border-t border-slate-200/80 bg-slate-50/80 px-6 py-4 sm:px-8 lg:px-10 dark:border-white/10 dark:bg-[#0d1829]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center text-sm text-[#425466] dark:text-zinc-300 sm:text-left">
                © {year} Stackaura Payments (Pty) Ltd. Built for African commerce and payment
                infrastructure teams.
              </div>

              <div className="flex flex-col items-center gap-3 sm:items-end">
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[#425466] dark:text-zinc-300 sm:justify-end">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-[0_8px_16px_rgba(148,163,184,0.08)] dark:border-white/10 dark:bg-[#101b2d] dark:shadow-none">
                    South Africa
                  </span>
                  {legalLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "transition-all duration-200 ease-out hover:text-[#0a2540] motion-reduce:transition-none dark:hover:text-white",
                        item.label === "Contact" && "font-medium text-[#0a2540] dark:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 sm:justify-end">
                  <a
                    href="https://www.instagram.com/stackaura/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-[#5f6f82] transition-all duration-200 ease-out hover:scale-105 hover:text-[#635bff] hover:drop-shadow-[0_0_6px_rgba(99,91,255,0.6)] motion-reduce:transition-none dark:text-zinc-300 dark:hover:text-white"
                  >
                    <InstagramIcon className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61579471440722"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="text-[#5f6f82] transition-all duration-200 ease-out hover:scale-105 hover:text-[#635bff] hover:drop-shadow-[0_0_6px_rgba(99,91,255,0.6)] motion-reduce:transition-none dark:text-zinc-300 dark:hover:text-white"
                  >
                    <FacebookIcon className="h-5 w-5" />
                  </a>
                  <a
                    href="https://x.com/Stackaura_"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X"
                    className="text-[#5f6f82] transition-all duration-200 ease-out hover:scale-105 hover:text-[#635bff] hover:drop-shadow-[0_0_6px_rgba(99,91,255,0.6)] motion-reduce:transition-none dark:text-zinc-300 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FooterReveal>
    </footer>
  );
}
