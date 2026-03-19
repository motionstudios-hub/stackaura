import type { JsonValue } from "./types";

export type PaymentSuccessSource =
  | {
      gateway?: string | null;
      metadata?: JsonValue | null;
    }
  | null
  | undefined;

export type PaymentSuccessContent = {
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

const genericSuccessContent: PaymentSuccessContent = {
  eyebrow: "Payment successful",
  title: "Payment successful",
  description: "Your payment was completed successfully",
  detail:
    "You can return to the merchant flow, or contact Stackaura if you need help confirming the payment state.",
  primaryHref: "/",
  primaryLabel: "Back to homepage",
  secondaryHref: "/contact",
  secondaryLabel: "Contact support",
};

const signupSuccessContent: PaymentSuccessContent = {
  eyebrow: "Payment successful",
  title: "Merchant account activated",
  description:
    "Your payment was completed successfully, and your Stackaura merchant workspace is now active.",
  detail:
    "You can continue to login and access your dashboard, API keys, and payment tools.",
  primaryHref: "/login",
  primaryLabel: "Continue to login",
  secondaryHref: "/",
  secondaryLabel: "Back to homepage",
};

function isJsonObject(
  value: JsonValue | null | undefined
): value is { [key: string]: JsonValue | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeFlag(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function hasSignupMarker(value: JsonValue | undefined) {
  if (typeof value !== "string") return false;

  const normalized = normalizeFlag(value);
  return normalized === "merchant_signup" || normalized === "signup";
}

export function isExplicitSignupPayment(payment: PaymentSuccessSource) {
  if (!payment || !isJsonObject(payment.metadata)) {
    return false;
  }

  const metadata = payment.metadata;

  if (hasSignupMarker(metadata.flow)) return true;
  if (hasSignupMarker(metadata.context)) return true;
  if (hasSignupMarker(metadata.kind)) return true;
  if (hasSignupMarker(metadata.purpose)) return true;

  return isJsonObject(metadata.signup);
}

export function resolvePaymentSuccessContent(
  payment: PaymentSuccessSource
): PaymentSuccessContent {
  return isExplicitSignupPayment(payment)
    ? signupSuccessContent
    : genericSuccessContent;
}
