import "server-only";

import { cache } from "react";
import type { HomepagePricingTier } from "../components/pricing-section";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:3001";
const PER_TRANSACTION_SUFFIX = " / transaction";

const LOCAL_FALLBACK_DEFAULTS = {
  starter: {
    fixedFeeCents: 150,
    percentageBps: 150,
  },
  growth: {
    fixedFeeCents: 250,
    percentageBps: 250,
  },
} as const;

export type PricingPlanCode = "starter" | "growth" | "scale";

export type PricingPlanResponse = {
  code: PricingPlanCode;
  name: string;
  feePolicy: {
    fixedFeeCents: number;
    percentageBps: number;
    ruleType: "NONE" | "FIXED" | "PERCENTAGE" | "FIXED_PLUS_PERCENTAGE";
    source: "platform_default" | "merchant_plan" | "merchant_override";
    merchantOverrideApplied: boolean;
  };
  routingFeatures: {
    planCode: PricingPlanCode;
    manualGatewaySelection: boolean;
    autoRouting: boolean;
    fallback: boolean;
    source: "platform_default" | "merchant_plan";
  };
  display: {
    percentage: string;
    fixedFee: string;
    fromPrice: string;
    startingFromPrice: string | null;
  };
};

export type PricingSnapshotResponse = {
  currency: "ZAR";
  defaultPlanCode: PricingPlanCode;
  notes: {
    gatewayFees: string;
    infrastructureRole: string;
  };
  plans: Record<PricingPlanCode, PricingPlanResponse>;
};

export type PricingPagePlan = {
  name: string;
  audience: string;
  price: string;
  priceSuffix: string;
  priceSupportingLine?: string | null;
  description: string;
  features: ReadonlyArray<{
    label: string;
    included: boolean | string;
  }>;
  badge?: string | null;
  featured: boolean;
  ctaLabel: string;
  ctaHref: string;
};

export type SignupPlanOption = {
  code: PricingPlanCode;
  name: string;
  price: string;
  suffix: string;
  description: string;
  featured: boolean;
};

const PLAN_ORDER: readonly PricingPlanCode[] = ["starter", "growth", "scale"];

const homepageMeta: Record<
  PricingPlanCode,
  Omit<HomepagePricingTier, "price" | "priceSuffix" | "priceSupportingLine">
> = {
  starter: {
    name: "Starter",
    audience: "For merchants launching with unified checkout and auto routing.",
    bullets: ["Auto routing", "Hosted checkout", "Unified API access"],
    featured: false,
    badge: null,
    ctaHref: "/signup",
    ctaLabel: "Start accepting payments",
  },
  growth: {
    name: "Growth",
    audience: "For growing teams that need fallback and manual gateway control.",
    bullets: [
      "Manual gateway selection",
      "Fallback routing",
      "Multi-gateway orchestration",
    ],
    featured: true,
    badge: "Most popular",
    ctaHref: "/signup",
    ctaLabel: "Explore Growth",
  },
  scale: {
    name: "Scale",
    audience:
      "For larger merchants that need custom routing and optimization support.",
    bullets: ["Custom routing support", "Custom optimization", "Priority support"],
    featured: false,
    badge: "Enterprise",
    ctaHref: "/contact",
    ctaLabel: "Talk to sales",
  },
};

const pricingPageMeta: Record<
  PricingPlanCode,
  Omit<PricingPagePlan, "price" | "priceSuffix" | "priceSupportingLine">
> = {
  starter: {
    name: "Starter",
    audience: "Best for getting started",
    description:
      "A clean starting point for merchants who want unified checkout, auto routing, and one integration into multiple gateways.",
    features: [
      { label: "Auto routing", included: true },
      { label: "Hosted checkout", included: true },
      { label: "API access", included: true },
      { label: "Manual gateway selection", included: false },
      { label: "Fallback", included: false },
    ],
    badge: null,
    featured: false,
    ctaLabel: "Start accepting payments",
    ctaHref: "/signup",
  },
  growth: {
    name: "Growth",
    audience: "Best for growing businesses",
    description:
      "Built for teams that need smarter routing, explicit gateway control, and payment recovery as volume grows.",
    features: [
      { label: "Auto routing", included: true },
      { label: "Manual gateway selection", included: true },
      { label: "Fallback routing", included: true },
      { label: "Multi-gateway orchestration", included: true },
      { label: "Operational visibility", included: true },
    ],
    badge: "Most popular",
    featured: true,
    ctaLabel: "Explore Growth",
    ctaHref: "/signup",
  },
  scale: {
    name: "Scale",
    audience: "Best for larger or high-volume merchants",
    description:
      "For platforms and larger merchants that want custom routing support, optimization guidance, and commercial flexibility.",
    features: [
      { label: "Everything in Growth", included: true },
      { label: "Custom routing support", included: "Coming / enterprise" },
      { label: "Priority support", included: "Coming / enterprise" },
      { label: "Custom optimization", included: "Coming / enterprise" },
      { label: "Volume-based commercial model", included: true },
    ],
    badge: "Enterprise",
    featured: false,
    ctaLabel: "Talk to sales",
    ctaHref: "/contact",
  },
};

const signupMeta: Record<
  PricingPlanCode,
  Omit<SignupPlanOption, "price" | "suffix">
> = {
  starter: {
    code: "starter",
    name: "Starter",
    description: "Unified checkout and auto routing for getting started.",
    featured: false,
  },
  growth: {
    code: "growth",
    name: "Growth",
    description: "Smart routing, fallback, and multi-gateway orchestration.",
    featured: true,
  },
  scale: {
    code: "scale",
    name: "Scale",
    description: "Custom routing support and optimization for larger teams.",
    featured: false,
  },
};

function splitPerTransactionLabel(value: string) {
  if (value.endsWith(PER_TRANSACTION_SUFFIX)) {
    return {
      price: value.slice(0, -PER_TRANSACTION_SUFFIX.length),
      priceSuffix: "/ transaction",
    };
  }

  return {
    price: value,
    priceSuffix: "",
  };
}

function resolvePlanHeadline(plan: PricingPlanResponse) {
  if (plan.code === "scale") {
    const hasExplicitScalePricing = plan.feePolicy.source !== "platform_default";

    return {
      price: "Custom pricing",
      priceSuffix: "",
      priceSupportingLine: hasExplicitScalePricing ? plan.display.startingFromPrice : null,
    };
  }

  return {
    ...splitPerTransactionLabel(plan.display.fromPrice),
    priceSupportingLine: null,
  };
}

function hasConfiguredEnvValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function readConfiguredIntegerEnv(
  keys: readonly string[],
  fallbackValue: number,
) {
  const configuredKey = keys.find((key) => hasConfiguredEnvValue(process.env[key]));
  if (!configuredKey) return fallbackValue;

  const parsed = Number(process.env[configuredKey]?.trim());
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : fallbackValue;
}

function hasConfiguredEnvKey(keys: readonly string[]) {
  return keys.some((key) => hasConfiguredEnvValue(process.env[key]));
}

function feeFixedKeys(prefix: string) {
  return [`${prefix}_FIXED`, `${prefix}_FIXED_CENTS`] as const;
}

function feeBpsKeys(prefix: string) {
  return [`${prefix}_BPS`] as const;
}

function formatPercentageBps(percentageBps: number) {
  return `${(Math.max(0, percentageBps) / 100).toFixed(2)}%`;
}

function formatRandCents(cents: number) {
  return `R${(Math.max(0, cents) / 100).toFixed(2)}`;
}

function formatPerTransaction(args: { percentageBps: number; fixedFeeCents: number }) {
  const parts: string[] = [];

  if (args.percentageBps > 0) {
    parts.push(formatPercentageBps(args.percentageBps));
  }

  if (args.fixedFeeCents > 0) {
    parts.push(formatRandCents(args.fixedFeeCents));
  }

  if (parts.length === 0) {
    return null;
  }

  return `${parts.join(" + ")}${PER_TRANSACTION_SUFFIX}`;
}

function localPlanDisplay(args: {
  code: PricingPlanCode;
  percentageBps: number;
  fixedFeeCents: number;
  source: PricingPlanResponse["feePolicy"]["source"];
}) {
  const perTransaction = formatPerTransaction(args);
  const hasExplicitScalePricing = args.code !== "scale" || args.source !== "platform_default";

  return {
    percentage: formatPercentageBps(args.percentageBps),
    fixedFee: formatRandCents(args.fixedFeeCents),
    fromPrice: perTransaction ? `From ${perTransaction}` : "Custom pricing",
    startingFromPrice:
      perTransaction && hasExplicitScalePricing ? `Starting from ${perTransaction}` : null,
  };
}

function buildLocalPricingSnapshot(): PricingSnapshotResponse {
  const platformFixedFeeCents = readConfiguredIntegerEnv(
    feeFixedKeys("STACKAURA_PLATFORM_FEE"),
    LOCAL_FALLBACK_DEFAULTS.starter.fixedFeeCents,
  );
  const platformPercentageBps = readConfiguredIntegerEnv(
    feeBpsKeys("STACKAURA_PLATFORM_FEE"),
    LOCAL_FALLBACK_DEFAULTS.starter.percentageBps,
  );

  const growthFixedKeys = feeFixedKeys("STACKAURA_PLAN_GROWTH_FEE");
  const growthBpsEnvKeys = feeBpsKeys("STACKAURA_PLAN_GROWTH_FEE");
  const scaleFixedKeys = feeFixedKeys("STACKAURA_PLAN_SCALE_FEE");
  const scaleBpsEnvKeys = feeBpsKeys("STACKAURA_PLAN_SCALE_FEE");

  const growthFixedFeeCents = readConfiguredIntegerEnv(
    growthFixedKeys,
    LOCAL_FALLBACK_DEFAULTS.growth.fixedFeeCents,
  );
  const growthPercentageBps = readConfiguredIntegerEnv(
    growthBpsEnvKeys,
    LOCAL_FALLBACK_DEFAULTS.growth.percentageBps,
  );

  const hasExplicitScalePricing =
    hasConfiguredEnvKey(scaleFixedKeys) || hasConfiguredEnvKey(scaleBpsEnvKeys);
  const scaleFixedFeeCents = hasExplicitScalePricing
    ? readConfiguredIntegerEnv(scaleFixedKeys, platformFixedFeeCents)
    : platformFixedFeeCents;
  const scalePercentageBps = hasExplicitScalePricing
    ? readConfiguredIntegerEnv(scaleBpsEnvKeys, platformPercentageBps)
    : platformPercentageBps;

  const defaultPlanCode = (() => {
    const value = process.env.STACKAURA_DEFAULT_MERCHANT_PLAN?.trim().toLowerCase();
    return value === "starter" || value === "growth" || value === "scale" ? value : "growth";
  })();

  return {
    currency: "ZAR",
    defaultPlanCode,
    notes: {
      gatewayFees: "Gateway fees charged separately through the connected payment rail.",
      infrastructureRole:
        "Stackaura provides orchestration and infrastructure software. Licensed payment providers process and settle payments.",
    },
    plans: {
      starter: {
        code: "starter",
        name: "Starter",
        feePolicy: {
          fixedFeeCents: platformFixedFeeCents,
          percentageBps: platformPercentageBps,
          ruleType: "FIXED_PLUS_PERCENTAGE",
          source: "platform_default",
          merchantOverrideApplied: false,
        },
        routingFeatures: {
          planCode: "starter",
          manualGatewaySelection: false,
          autoRouting: true,
          fallback: false,
          source: "merchant_plan",
        },
        display: localPlanDisplay({
          code: "starter",
          fixedFeeCents: platformFixedFeeCents,
          percentageBps: platformPercentageBps,
          source: "platform_default",
        }),
      },
      growth: {
        code: "growth",
        name: "Growth",
        feePolicy: {
          fixedFeeCents: growthFixedFeeCents,
          percentageBps: growthPercentageBps,
          ruleType: "FIXED_PLUS_PERCENTAGE",
          source: "merchant_plan",
          merchantOverrideApplied: false,
        },
        routingFeatures: {
          planCode: "growth",
          manualGatewaySelection: true,
          autoRouting: true,
          fallback: true,
          source: "merchant_plan",
        },
        display: localPlanDisplay({
          code: "growth",
          fixedFeeCents: growthFixedFeeCents,
          percentageBps: growthPercentageBps,
          source: "merchant_plan",
        }),
      },
      scale: {
        code: "scale",
        name: "Scale",
        feePolicy: {
          fixedFeeCents: scaleFixedFeeCents,
          percentageBps: scalePercentageBps,
          ruleType: "FIXED_PLUS_PERCENTAGE",
          source: hasExplicitScalePricing ? "merchant_plan" : "platform_default",
          merchantOverrideApplied: false,
        },
        routingFeatures: {
          planCode: "scale",
          manualGatewaySelection: true,
          autoRouting: true,
          fallback: true,
          source: "merchant_plan",
        },
        display: localPlanDisplay({
          code: "scale",
          fixedFeeCents: scaleFixedFeeCents,
          percentageBps: scalePercentageBps,
          source: hasExplicitScalePricing ? "merchant_plan" : "platform_default",
        }),
      },
    },
  };
}

export const getServerPricing = cache(async (): Promise<PricingSnapshotResponse> => {
  try {
    const res = await fetch(`${API_BASE}/v1/pricing`, {
      method: "GET",
      cache: "no-store",
    });

    if (res.ok) {
      return (await res.json()) as PricingSnapshotResponse;
    }
  } catch {
    // fall through to local env-backed pricing snapshot
  }

  return buildLocalPricingSnapshot();
});

export function buildHomepagePricingTiers(
  pricing: PricingSnapshotResponse,
): HomepagePricingTier[] {
  return PLAN_ORDER.map((code) => {
    const plan = pricing.plans[code];
    const headline = resolvePlanHeadline(plan);

    return {
      ...homepageMeta[code],
      price: headline.price,
      priceSuffix: headline.priceSuffix,
      priceSupportingLine: headline.priceSupportingLine,
    };
  });
}

export function buildPricingPagePlans(
  pricing: PricingSnapshotResponse,
): PricingPagePlan[] {
  return PLAN_ORDER.map((code) => {
    const plan = pricing.plans[code];
    const headline = resolvePlanHeadline(plan);

    return {
      ...pricingPageMeta[code],
      price: headline.price,
      priceSuffix: headline.priceSuffix,
      priceSupportingLine: headline.priceSupportingLine,
    };
  });
}

export function buildSignupPlans(
  pricing: PricingSnapshotResponse,
): SignupPlanOption[] {
  return PLAN_ORDER.map((code) => {
    const plan = pricing.plans[code];
    const headline = resolvePlanHeadline(plan);

    return {
      ...signupMeta[code],
      price: headline.price,
      suffix: headline.price === "Custom pricing" ? "" : headline.priceSuffix || "pricing",
    };
  });
}

export function buildDeckPricingSummary(pricing: PricingSnapshotResponse) {
  return [
    `Starter ${pricing.plans.starter.display.fromPrice}`,
    `Growth ${pricing.plans.growth.display.fromPrice}`,
    `Scale custom pricing${
      pricing.plans.scale.display.startingFromPrice
        ? ` (${pricing.plans.scale.display.startingFromPrice})`
        : ""
    }`,
  ].join(" · ");
}
