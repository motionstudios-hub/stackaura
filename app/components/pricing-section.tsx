import Link from "next/link";
import {
  cn,
  lightProductInsetPanelClass,
  lightProductMutedTextClass,
  lightProductPanelClass,
  lightProductStatusPillClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
  publicSectionLabelClass,
} from "./stackaura-ui";

export type HomepagePricingTier = {
  name: string;
  audience: string;
  price: string;
  priceSuffix: string;
  bullets: readonly string[];
  featured: boolean;
  badge?: string | null;
  ctaHref: string;
  ctaLabel: string;
};

function tierAccent(name: string) {
  if (name === "Starter") {
    return "bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.22),transparent_58%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.14),transparent_52%)]";
  }

  if (name === "Growth") {
    return "bg-[radial-gradient(circle_at_top_left,rgba(122,115,255,0.24),transparent_58%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.18),transparent_52%)]";
  }

  return "bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_58%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.16),transparent_52%)]";
}

function bulletTone(index: number) {
  if (index === 0) return "bg-[#635bff]";
  if (index === 1) return "bg-sky-400";
  return "bg-emerald-400";
}

export default function PricingSection({
  tiers,
  className,
}: {
  tiers: readonly HomepagePricingTier[];
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <div className={publicSectionLabelClass}>Pricing</div>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0a2540] sm:text-5xl">
            Plans that grow with your payment volume
          </h2>
          <p className={cn(lightProductMutedTextClass, "mt-4 max-w-2xl text-base sm:text-lg")}>
            Transaction-based pricing for Stackaura&apos;s orchestration layer. Gateway and provider
            fees still apply separately through the connected payment rail.
          </p>
        </div>
        <Link href="/pricing" className={publicSecondaryButtonClass}>
          View pricing
        </Link>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-5">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "group relative overflow-hidden rounded-[32px] p-[1px] transition duration-300",
              tier.featured
                ? "bg-[linear-gradient(180deg,rgba(122,115,255,0.42),rgba(125,211,252,0.22))] shadow-[0_22px_48px_rgba(122,146,168,0.16)] lg:-translate-y-2"
                : "bg-[linear-gradient(180deg,rgba(255,255,255,0.64),rgba(255,255,255,0.28))] shadow-[0_16px_34px_rgba(122,146,168,0.10)] hover:shadow-[0_20px_42px_rgba(122,146,168,0.14)]",
            )}
          >
            <div
              className={cn(
                "relative h-full rounded-[31px] p-6 sm:p-7",
                tier.featured
                  ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(244,247,255,0.30))]"
                  : lightProductPanelClass,
              )}
            >
              <div className={cn("pointer-events-none absolute inset-0 opacity-90", tierAccent(tier.name))} />
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.88),rgba(255,255,255,0))]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#0a2540]">
                      {tier.name}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[#425466]">{tier.audience}</p>
                  </div>
                  {tier.badge ? (
                    <span className={lightProductStatusPillClass(tier.featured ? "violet" : "muted")}>
                      {tier.badge}
                    </span>
                  ) : null}
                </div>

                <div className="mt-7 rounded-[24px] border border-white/56 bg-white/42 px-5 py-5 shadow-[0_12px_28px_rgba(133,156,180,0.10)] backdrop-blur-2xl">
                  <div className="flex items-end gap-2">
                    <div className="text-4xl font-semibold tracking-[-0.05em] text-[#0a2540] sm:text-[2.85rem]">
                      {tier.price}
                    </div>
                    <div className="pb-1 text-sm font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
                      {tier.priceSuffix}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#425466]">
                    {tier.featured
                      ? "Recommended for merchants that want routing control, fallback, and clearer payment operations."
                      : tier.name === "Starter"
                        ? "A straightforward way to launch on Stackaura without adding orchestration complexity too early."
                        : "Designed for higher-volume teams that need tailored support and commercial flexibility."}
                  </p>
                </div>

                <div className="mt-6 grid gap-3">
                  {tier.bullets.map((bullet, index) => (
                    <div
                      key={bullet}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 transition",
                        lightProductInsetPanelClass,
                        "group-hover:bg-white/34",
                      )}
                    >
                      <span className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.28)]", bulletTone(index))} />
                      <span className="text-sm font-medium leading-6 text-[#425466]">{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 rounded-[24px] border border-white/52 bg-white/28 px-4 py-4 shadow-[0_10px_24px_rgba(133,156,180,0.08)]">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7c93]">
                      Stackaura pricing
                    </div>
                    <div className="mt-1 text-sm text-[#425466]">
                      Infrastructure, orchestration, and payment recovery.
                    </div>
                  </div>
                  <Link
                    href={tier.ctaHref}
                    className={tier.featured ? publicPrimaryButtonClass : publicSecondaryButtonClass}
                  >
                    {tier.ctaLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[24px] border border-white/42 bg-white/18 px-5 py-4 text-sm leading-6 text-[#425466] shadow-[0_10px_24px_rgba(133,156,180,0.08)] backdrop-blur-2xl">
        Stackaura provides software infrastructure and orchestration tools. Stackaura does not
        directly process, hold, or settle customer funds. Licensed payment providers handle payment
        processing and settlement.
      </div>
    </section>
  );
}
