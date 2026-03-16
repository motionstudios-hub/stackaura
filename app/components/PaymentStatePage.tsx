import Image from "next/image";
import Link from "next/link";

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
    return "border-emerald-900/40 bg-emerald-950/30 text-emerald-300";
  }

  if (tone === "warning") {
    return "border-amber-900/40 bg-amber-950/30 text-amber-300";
  }

  return "border-rose-900/40 bg-rose-950/30 text-rose-300";
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
    <main className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(32,188,237,0.24),transparent_30%),radial-gradient(circle_at_top_right,rgba(17,106,248,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(160,233,255,0.12),transparent_24%),linear-gradient(135deg,#061229_0%,#020817_48%,#04174a_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent_18%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[#08152f]/60 p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/30 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
              <Image
                src="/stackaura-logo.png"
                alt="Stackaura"
                width={40}
                height={40}
                className="object-contain mix-blend-screen"
                priority
              />
            </div>
          </div>

          <div className="text-xs uppercase tracking-[0.28em] text-[#A0E9FF]">{eyebrow}</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-300">{description}</p>

          {reference ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
              Reference: <span className="font-mono text-white">{reference}</span>
            </div>
          ) : null}

          <div className={`mt-6 rounded-2xl border p-4 text-sm ${toneStyles(tone)}`}>{detail}</div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-[#A0E9FF] px-5 py-3 text-sm font-medium text-[#02142b] transition hover:brightness-105"
            >
              {primaryLabel}
            </Link>

            <Link
              href={secondaryHref}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {secondaryLabel}
            </Link>
          </div>

          <div className="mt-8 text-xs text-zinc-500">Powered by Stackaura Payments Infrastructure</div>
        </div>
      </div>
    </main>
  );
}
