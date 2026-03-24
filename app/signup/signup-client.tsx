"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormFrame, AuthShell } from "../components/stackaura-auth";
import {
  cn,
  lightProductInputClass,
  lightProductInsetPanelClass,
  lightProductMutedTextClass,
  lightProductStatusPillClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
  publicSubtleSurfaceClass,
} from "../components/stackaura-ui";
import { initiateOzowSignupPayment } from "../lib/ozow";

const DEFAULT_COUNTRY = "South Africa";
type PlanCode = "starter" | "growth" | "scale";
type SignupPlanOption = {
  code: PlanCode;
  name: string;
  price: string;
  suffix: string;
  description: string;
  featured: boolean;
};

const featureCards = [
  {
    label: "Unified API",
    title: "One integration",
    description:
      "Create payments, launch hosted checkout, and manage gateway orchestration from one infrastructure layer.",
  },
  {
    label: "Smart routing",
    title: "Route intelligently",
    description:
      "Send each payment across the right gateway path with better resilience and less operational friction.",
  },
  {
    label: "Hosted checkout",
    title: "Launch faster",
    description:
      "Go live quickly with Stackaura checkout flows designed for merchant growth and payment recovery.",
  },
] as const;

type SubmissionMode = "account" | "ozow" | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function extractSignupError(payload: unknown) {
  if (!isRecord(payload)) return null;

  if (typeof payload.message === "string") return payload.message;

  if (Array.isArray(payload.message) && payload.message.every((item) => typeof item === "string")) {
    return payload.message.join(", ");
  }

  return typeof payload.error === "string" ? payload.error : null;
}

export default function SignupClient({
  plans,
}: {
  plans: readonly SignupPlanOption[];
}) {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanCode | null>(null);
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>(null);
  const [error, setError] = useState<string | null>(null);

  const isLoading = submissionMode !== null;

  function buildReturnUrls() {
    const origin = window.location.origin;

    return {
      success: `${origin}/payments/success`,
      cancel: `${origin}/payments/cancel`,
      error: `${origin}/payments/error`,
    };
  }

  function validateSignupFields() {
    if (!businessName.trim()) {
      throw new Error("Business name is required.");
    }

    if (!email.trim()) {
      throw new Error("Email is required.");
    }

    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
  }

  async function createMerchantAccount() {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessName,
        email,
        password,
        country: DEFAULT_COUNTRY,
      }),
    });

    if (!res.ok) {
      let message = "We couldn't create your account.";
      try {
        const payload: unknown = await res.json();
        message = extractSignupError(payload) || message;
      } catch {
        // ignore json parse errors
      }
      throw new Error(message);
    }

    const params = new URLSearchParams({
      created: "1",
      email,
    });

    router.replace(`/login?${params.toString()}`);
    router.refresh();
  }

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      validateSignupFields();
      setSubmissionMode("account");
      await createMerchantAccount();
    } catch (signupError: unknown) {
      setError(getErrorMessage(signupError, "We couldn't create your account. Please try again."));
    } finally {
      setSubmissionMode(null);
    }
  }

  async function handleOzowSignup() {
    setError(null);

    try {
      validateSignupFields();
      setSubmissionMode("ozow");
      await initiateOzowSignupPayment({
        flow: "merchant_signup",
        signup: {
          businessName,
          email,
          password,
          country: DEFAULT_COUNTRY,
        },
        returnUrls: buildReturnUrls(),
      });
    } catch (signupError: unknown) {
      setError(getErrorMessage(signupError, "We couldn't start the payment step right now."));
      setSubmissionMode(null);
    }
  }

  const planNote =
    selectedPlan === null
      ? "Choose the plan preference that best fits your routing and support needs. You can adjust plan alignment as your payment stack grows."
      : `${plans.find((plan) => plan.code === selectedPlan)?.name ?? "Your selected"} plan preference can be refined as your routing needs evolve.`;

  return (
    <AuthShell
      eyebrow="Merchant onboarding"
      title="Start accepting payments in minutes."
      description="Launch with one integration for multiple gateways, then grow into smarter routing, fallback, and payment infrastructure built for merchant teams."
      features={featureCards}
    >
      <AuthFormFrame
        eyebrow="Create account"
        title="Open your merchant workspace"
        description="Create your account, step into the dashboard, and start building on a payment orchestration layer designed for routing, fallback, and merchant growth."
        status="Choose your plan"
        statusTone="muted"
      >
        <form onSubmit={handleSignup} className="space-y-4">
          <label className="block">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
              Business name
            </div>
            <input
              type="text"
              required
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="Stackaura Technologies"
              className={cn(lightProductInputClass, "mt-2")}
              disabled={isLoading}
            />
          </label>

          <label className="block">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
              Work email
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@company.com"
              className={cn(lightProductInputClass, "mt-2")}
              autoComplete="email"
              disabled={isLoading}
            />
          </label>

          <label className="block">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
              Password
            </div>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              className={cn(lightProductInputClass, "mt-2")}
              autoComplete="new-password"
              disabled={isLoading}
            />
          </label>

          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
              Starting plan
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {plans.map((plan) => {
                const selected = selectedPlan === plan.code;

                return (
                  <button
                    key={plan.code}
                    type="button"
                    onClick={() => setSelectedPlan(plan.code)}
                    disabled={isLoading}
                    className={cn(
                      "rounded-[24px] border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-70",
                      selected
                        ? "border-[#9288ff]/55 bg-[linear-gradient(180deg,rgba(122,115,255,0.18)_0%,rgba(160,233,255,0.12)_100%)] shadow-[0_16px_32px_rgba(99,91,255,0.16)]"
                        : cn(lightProductInsetPanelClass, "hover:border-white/55"),
                      plan.featured && !selected && "border-[#d6d0ff] bg-[#f6f3ff]/88"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[#0a2540]">{plan.name}</div>
                        <div className="mt-2 text-lg font-semibold tracking-tight text-[#0a2540]">
                          {plan.price}
                        </div>
                        <div className="text-[11px] tracking-[0.12em] text-[#6b7c93]">
                          {plan.suffix}
                        </div>
                      </div>

                      {plan.featured ? (
                        <span
                          className={lightProductStatusPillClass(
                            selected ? "success" : "violet"
                          )}
                        >
                          Popular
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#425466]">{plan.description}</p>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-sm leading-6 text-[#425466]">{planNote}</p>
          </div>

          {error ? (
            <div className="rounded-[22px] border border-rose-300/70 bg-rose-50/84 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              publicPrimaryButtonClass,
              "w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-70"
            )}
          >
            {submissionMode === "account" ? "Creating account..." : "Create merchant account"}
          </button>
        </form>

        <div className={cn("mt-6 p-4", publicSubtleSurfaceClass)}>
          <p className={lightProductMutedTextClass}>
            Stackaura provides software infrastructure and orchestration tools. Licensed payment
            providers process and settle payments.
          </p>

          <button
            type="button"
            onClick={handleOzowSignup}
            disabled={isLoading}
            className={cn(
              publicSecondaryButtonClass,
              "mt-4 w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            )}
          >
            {submissionMode === "ozow"
              ? "Redirecting to Ozow..."
              : "Need a payment-linked activation flow? Continue with Ozow"}
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-[#6b7c93]">Already have an account?</span>
          <Link href="/login" className={cn(publicSecondaryButtonClass, "px-5 py-3")}>
            Sign in
          </Link>
        </div>
      </AuthFormFrame>
    </AuthShell>
  );
}
