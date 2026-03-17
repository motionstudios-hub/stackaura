import Link from "next/link";
import {
  BrandLockup,
  PublicBackground,
  PublicFooter,
  PublicHeader,
  cn,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
  publicSurfaceClass,
} from "./stackaura-ui";

type PaymentStatePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  tone: "success" | "warning" | "error";
  detail: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  reference?: string | null;
};

function toneStyles(tone: PaymentStatePageProps["tone"]) {
  if (tone === "success") {
    return "border-emerald-300/70 bg-emerald-50/85 text-emerald-700";
  }

  if (tone === "warning") {
    return "border-amber-300/70 bg-amber-50/85 text-amber-700";
  }

  return "border-rose-300/70 bg-rose-50/85 text-rose-700";
}

export default function PaymentStatePage({
  eyebrow,
  title,
  description,
  tone,
  detail,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  reference,
}: PaymentStatePageProps) {
  return (
    <PublicBackground>
      <PublicHeader />

      <div className="relative mx-auto flex min-h-[calc(100vh-220px)] max-w-6xl items-center justify-center px-6 py-14 lg:px-10">
        <div className={cn(publicSurfaceClass, "w-full max-w-2xl p-8 text-center sm:p-10")}>
          <div className="mx-auto flex w-fit justify-center rounded-[24px] border border-white/45 bg-white/28 px-5 py-4 shadow-[0_12px_28px_rgba(122,146,168,0.08)] backdrop-blur-2xl">
            <BrandLockup compact />
          </div>

          <div className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-[#635bff]">
            {eyebrow}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#0a2540] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-[#425466]">{description}</p>

          {reference ? (
            <div className="mt-6 rounded-[24px] border border-white/42 bg-white/22 px-4 py-3 text-sm text-[#425466] shadow-[0_8px_24px_rgba(133,156,180,0.10)] backdrop-blur-2xl">
              Reference: <span className="font-mono text-[#0a2540]">{reference}</span>
            </div>
          ) : null}

          <div className={cn("mt-6 rounded-[24px] border p-4 text-sm", toneStyles(tone))}>{detail}</div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={primaryHref} className={cn(publicPrimaryButtonClass, "flex-1")}>
              {primaryLabel}
            </Link>

            <Link href={secondaryHref} className={cn(publicSecondaryButtonClass, "flex-1")}>
              {secondaryLabel}
            </Link>
          </div>

          <div className="mt-8 text-xs text-[#6b7c93]">
            Powered by Stackaura Payments Infrastructure
          </div>
        </div>
      </div>

      <PublicFooter />
    </PublicBackground>
  );
}
