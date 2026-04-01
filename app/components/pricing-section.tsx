import Link from "next/link";
import {
  cn,
  lightProductStatusPillClass,
  publicBadgeClass,
  publicInsetSurfaceClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
  publicSectionLabelClass,
  publicSubtleSurfaceClass,
  publicSurfaceClass,
  publicTextPrimaryClass,
  publicTextSecondaryClass,
} from "./stackaura-ui";
import ContactSalesLink from "./contact-sales-link";

export type HomepagePricingTier = {
  name: string;
  audience: string;
  price: string;
  priceSuffix: string;
  priceSupportingLine?: string | null;
  bullets: readonly string[];
  featured: boolean;
  badge?: string | null;
  ctaHref: string;
  ctaLabel: string;
};

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
          <h2 className={cn("mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl", publicTextPrimaryClass)}>
            Plans that grow with your payment volume
          </h2>
          <p className={cn("mt-4 max-w-2xl text-base sm:text-lg", publicTextSecondaryClass)}>
            Transaction-based pricing for Stackaura&apos;s orchestration layer. Gateway fees charged
            separately through the connected payment rail.
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
              "group relative overflow-hidden p-6 sm:p-7 transition duration-300",
              tier.featured
                ? "rounded-[32px] border border-[#7a73ff]/30 bg-white shadow-[0_24px_46px_rgba(122,146,168,0.14)] lg:-translate-y-2 dark:border-[#7a73ff]/24 dark:bg-[#091321]"
                : publicSurfaceClass,
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className={cn(publicSectionLabelClass, "text-[11px]")}>{tier.audience}</div>
                  <h3 className={cn("mt-3 text-2xl font-semibold tracking-[-0.03em]", publicTextPrimaryClass)}>
                    {tier.name}
                  </h3>
                </div>
                {tier.badge ? (
                  <span className={tier.featured ? lightProductStatusPillClass("violet") : publicBadgeClass}>
                    {tier.badge}
                  </span>
                ) : null}
              </div>

              <div className={cn("mt-6 px-5 py-5", publicSubtleSurfaceClass)}>
                <div className="flex items-end gap-2">
                  <div className={cn("text-4xl font-semibold tracking-[-0.05em] sm:text-[2.85rem]", publicTextPrimaryClass)}>
                    {tier.price}
                  </div>
                  {tier.priceSuffix ? (
                    <div className="pb-1 text-sm font-medium text-[#6b7c93]">
                      {tier.priceSuffix}
                    </div>
                  ) : null}
                </div>
                {tier.priceSupportingLine ? (
                  <div className="mt-2 text-sm font-medium text-[#516173]">
                    {tier.priceSupportingLine}
                  </div>
                ) : null}
                <p className={cn("mt-3 text-sm leading-6", publicTextSecondaryClass)}>
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
                      publicInsetSurfaceClass,
                      "group-hover:border-slate-300 dark:group-hover:border-white/16",
                    )}
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", bulletTone(index))} />
                    <span className={cn("text-sm font-medium leading-6", publicTextSecondaryClass)}>
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>

              <div className={cn("mt-6 flex items-center justify-between gap-4 px-4 py-4", publicInsetSurfaceClass)}>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7c93]">
                    Stackaura pricing
                  </div>
                  <div className={cn("mt-1 text-sm", publicTextSecondaryClass)}>
                    Infrastructure, orchestration, and payment recovery.
                  </div>
                </div>
                {tier.ctaHref === "/contact" ? (
                  <ContactSalesLink
                    className={cn(
                      tier.featured ? publicPrimaryButtonClass : publicSecondaryButtonClass,
                      "min-h-[44px] px-4 py-2.5",
                    )}
                    trackingParams={{ surface: "homepage_pricing_card", plan: tier.name }}
                  >
                    {tier.ctaLabel}
                  </ContactSalesLink>
                ) : (
                  <Link
                    href={tier.ctaHref}
                    className={cn(
                      tier.featured ? publicPrimaryButtonClass : publicSecondaryButtonClass,
                      "min-h-[44px] px-4 py-2.5",
                    )}
                  >
                    {tier.ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={cn("mt-5 px-5 py-4 text-sm leading-6", publicInsetSurfaceClass, publicTextSecondaryClass)}>
        Stackaura provides software infrastructure and orchestration tools. Stackaura does not
        directly process, hold, or settle customer funds. Licensed payment providers handle payment
        processing and settlement.
      </div>
    </section>
  );
}
