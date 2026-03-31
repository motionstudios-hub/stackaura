"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormFrame, AuthShell } from "../components/stackaura-auth";
import { trackMetaEvent } from "../lib/meta-pixel";
import {
  cn,
  publicBadgeClass,
  publicFieldLabelClass,
  publicInputClass,
  publicInsetSurfaceClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
  publicTextMutedClass,
} from "../components/stackaura-ui";
import { initiateOzowSignupPayment } from "../lib/ozow";

const DEFAULT_COUNTRY = "South Africa";
const MIN_PASSWORD_LENGTH = 8;

type PlanCode = "starter" | "growth" | "scale";
type SubmissionMode = "account" | "ozow" | null;
type SubmitState = "idle" | "loading" | "success";

type SignupPlanOption = {
  code: PlanCode;
  name: string;
  price: string;
  suffix: string;
  description: string;
  featured: boolean;
};

type SignupFields = {
  businessName: string;
  email: string;
  password: string;
};

type SignupErrors = Partial<Record<keyof SignupFields, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function validateSignupFields(fields: SignupFields): SignupErrors {
  const errors: SignupErrors = {};

  if (!fields.businessName.trim()) {
    errors.businessName = "Business name is required";
  }

  if (!fields.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailPattern.test(fields.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!fields.password) {
    errors.password = "Password is required";
  } else if (fields.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

function validateSignupField(field: keyof SignupFields, fields: SignupFields) {
  return validateSignupFields(fields)[field];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractMessage(payload: unknown) {
  if (typeof payload === "string") return payload;
  if (!isRecord(payload)) return null;

  if (typeof payload.message === "string") return payload.message;

  if (Array.isArray(payload.message) && payload.message.every((item) => typeof item === "string")) {
    return payload.message.join(", ");
  }

  return typeof payload.error === "string" ? payload.error : null;
}

async function readResponseMessage(res: Response) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const payload: unknown = await res.json();
      return extractMessage(payload);
    } catch {
      return null;
    }
  }

  try {
    const text = await res.text();
    return extractMessage(text);
  } catch {
    return null;
  }
}

function mapSignupError(status: number | null, message: string | null): {
  field: keyof SignupFields;
  message: string;
} {
  const normalized = (message || "").toLowerCase();

  if (normalized.includes("already exists") || normalized.includes("already registered") || normalized.includes("already in use")) {
    return { field: "email", message: "An account with this email already exists" };
  }

  if (normalized.includes("email")) {
    return { field: "email", message: "Enter a valid email address" };
  }

  if (normalized.includes("password")) {
    return { field: "password", message: "Password must be at least 8 characters" };
  }

  if (normalized.includes("business")) {
    return { field: "businessName", message: "Business name is required" };
  }

  if (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    normalized.includes("service unavailable") ||
    normalized.includes("unable to reach server") ||
    normalized.includes("network") ||
    normalized.includes("failed to fetch")
  ) {
    return { field: "password", message: "Unable to reach server. Try again." };
  }

  return { field: "password", message: "Unable to create account. Try again." };
}

function SpinnerIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 animate-spin motion-reduce:animate-none"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M10 3a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4.5 10.5L8.2 14.2L15.5 6.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
        <path
          d="M2.5 10C4.2 6.9 6.8 5.25 10 5.25C13.2 5.25 15.8 6.9 17.5 10C15.8 13.1 13.2 14.75 10 14.75C6.8 14.75 4.2 13.1 2.5 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
      <path
        d="M3.25 3.25L16.75 16.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.64 5.54C9.08 5.35 9.53 5.25 10 5.25C13.2 5.25 15.8 6.9 17.5 10C16.82 11.24 15.98 12.25 15 13.02"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12.12 12.3C11.52 12.71 10.8 12.93 10 12.93C7.62 12.93 5.68 11.03 5.68 8.68C5.68 7.88 5.91 7.14 6.33 6.53"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.98 6.02C4.05 6.83 3.21 7.92 2.5 10C3.43 11.7 4.72 13.03 6.33 13.87"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
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
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const isPrimaryBusy = submitState === "loading" || submitState === "success";
  const isBusy = isPrimaryBusy || submissionMode === "ozow";

  function currentFields(overrides?: Partial<SignupFields>): SignupFields {
    return {
      businessName: overrides?.businessName ?? businessName,
      email: overrides?.email ?? email,
      password: overrides?.password ?? password,
    };
  }

  function updateField(field: keyof SignupFields, value: string) {
    if (field === "businessName") setBusinessName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function buildReturnUrls() {
    const origin = window.location.origin;

    return {
      success: `${origin}/payments/success`,
      cancel: `${origin}/payments/cancel`,
      error: `${origin}/payments/error`,
    };
  }

  async function autoLogin(nextFields: SignupFields) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: nextFields.email,
        password: nextFields.password,
      }),
    });

    if (!res.ok) {
      const message = await readResponseMessage(res);
      throw new Error(mapSignupError(res.status, message).message);
    }
  }

  async function createMerchantAccount(nextFields: SignupFields) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessName: nextFields.businessName,
        email: nextFields.email,
        password: nextFields.password,
        country: DEFAULT_COUNTRY,
      }),
    });

    if (!res.ok) {
      const message = await readResponseMessage(res);
      const mapped = mapSignupError(res.status, message);
      throw new Error(JSON.stringify(mapped));
    }
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitState !== "idle") return;

    const nextFields = currentFields();
    const errors = validateSignupFields(nextFields);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmissionMode("account");
    setSubmitState("loading");

    try {
      await createMerchantAccount(nextFields);
      await autoLogin(nextFields);
      trackMetaEvent("CompleteRegistration");
      setFieldErrors({});
      setSubmitState("success");
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.replace("/dashboard");
      router.refresh();
    } catch (signupError: unknown) {
      let mapped = { field: "password" as keyof SignupFields, message: "Unable to create account. Try again." };

      if (signupError instanceof Error) {
        try {
          const parsed = JSON.parse(signupError.message) as { field?: keyof SignupFields; message?: string };
          if (parsed.field && parsed.message) {
            mapped = parsed;
          } else {
            mapped = { field: "password", message: signupError.message };
          }
        } catch {
          mapped = { field: "password", message: signupError.message };
        }
      }

      setFieldErrors((current) => ({
        ...current,
        [mapped.field]: mapped.message,
      }));
      setSubmitState("idle");
      setSubmissionMode(null);
    }
  }

  async function handleOzowSignup() {
    if (submissionMode !== null || submitState !== "idle") return;

    const nextFields = currentFields();
    const errors = validateSignupFields(nextFields);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmissionMode("ozow");

    try {
      await initiateOzowSignupPayment({
        flow: "merchant_signup",
        signup: {
          businessName: nextFields.businessName,
          email: nextFields.email,
          password: nextFields.password,
          country: DEFAULT_COUNTRY,
        },
        returnUrls: buildReturnUrls(),
      });
    } catch {
      setFieldErrors((current) => ({
        ...current,
        password: "Unable to reach server. Try again.",
      }));
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
        <form onSubmit={handleSignup} className="space-y-5">
          <label className="block">
            <div className={publicFieldLabelClass}>Business name</div>
            <input
              type="text"
              required
              value={businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
              onBlur={() => {
                setFieldErrors((current) => ({
                  ...current,
                  businessName: validateSignupField("businessName", currentFields()),
                }));
              }}
              placeholder="Stackaura Technologies"
              className={cn(
                publicInputClass,
                "mt-2",
                fieldErrors.businessName &&
                  "border-red-500/50 bg-red-500/[0.04] focus:border-red-500/50 focus:ring-red-500/20",
                "focus:border-white/15 focus:ring-1 focus:ring-white/20"
              )}
              disabled={isBusy}
              aria-invalid={Boolean(fieldErrors.businessName)}
              aria-describedby={fieldErrors.businessName ? "signup-business-error" : undefined}
            />
            {fieldErrors.businessName ? (
              <p
                id="signup-business-error"
                className="mt-2 translate-y-0 text-sm text-rose-300 opacity-100 transition-all duration-150 ease-out motion-reduce:transition-none"
                aria-live="polite"
              >
                {fieldErrors.businessName}
              </p>
            ) : null}
          </label>

          <label className="block">
            <div className={publicFieldLabelClass}>Work email</div>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => updateField("email", event.target.value)}
              onBlur={() => {
                setFieldErrors((current) => ({
                  ...current,
                  email: validateSignupField("email", currentFields()),
                }));
              }}
              placeholder="admin@company.com"
              className={cn(
                publicInputClass,
                "mt-2",
                fieldErrors.email &&
                  "border-red-500/50 bg-red-500/[0.04] focus:border-red-500/50 focus:ring-red-500/20",
                "focus:border-white/15 focus:ring-1 focus:ring-white/20"
              )}
              autoComplete="email"
              disabled={isBusy}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
            />
            {fieldErrors.email ? (
              <p
                id="signup-email-error"
                className="mt-2 translate-y-0 text-sm text-rose-300 opacity-100 transition-all duration-150 ease-out motion-reduce:transition-none"
                aria-live="polite"
              >
                {fieldErrors.email}
              </p>
            ) : null}
          </label>

          <label className="block">
            <div className={publicFieldLabelClass}>Password</div>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(event) => updateField("password", event.target.value)}
                onBlur={() => {
                  setFieldErrors((current) => ({
                    ...current,
                    password: validateSignupField("password", currentFields()),
                  }));
                }}
                placeholder="Minimum 8 characters"
                className={cn(
                  publicInputClass,
                  "pr-12",
                  fieldErrors.password &&
                    "border-red-500/50 bg-red-500/[0.04] focus:border-red-500/50 focus:ring-red-500/20",
                  "focus:border-white/15 focus:ring-1 focus:ring-white/20"
                )}
                autoComplete="new-password"
                disabled={isBusy}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 inline-flex items-center text-white/50 transition-colors duration-150 ease-out hover:text-white/80 focus-visible:outline-none focus-visible:text-white motion-reduce:transition-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            {fieldErrors.password ? (
              <p
                id="signup-password-error"
                className="mt-2 translate-y-0 text-sm text-rose-300 opacity-100 transition-all duration-150 ease-out motion-reduce:transition-none"
                aria-live="polite"
              >
                {fieldErrors.password}
              </p>
            ) : null}
          </label>

          <div>
            <div className={publicFieldLabelClass}>Starting plan</div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {plans.map((plan) => {
                const selected = selectedPlan === plan.code;

                return (
                  <button
                    key={plan.code}
                    type="button"
                    onClick={() => setSelectedPlan(plan.code)}
                    disabled={isBusy}
                    className={cn(
                      "h-full rounded-[24px] border p-4 text-left transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none",
                      selected
                        ? "border-[#7a73ff]/40 bg-[#f5f3ff] shadow-[0_16px_28px_rgba(99,91,255,0.10)] dark:border-[#7a73ff]/28 dark:bg-[#121830] dark:shadow-none"
                        : cn(
                            publicInsetSurfaceClass,
                            "hover:border-slate-300 dark:hover:border-white/16"
                          ),
                      plan.featured &&
                        !selected &&
                        "border-[#d7d2ff] bg-[#faf8ff] dark:border-[#7a73ff]/20 dark:bg-[#10172b]"
                    )}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#0a2540]">{plan.name}</div>
                      </div>

                      {plan.featured ? (
                        <span
                          className={cn(
                            publicBadgeClass,
                            selected
                              ? "max-w-max self-start border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/18 dark:bg-emerald-400/10 dark:text-emerald-200"
                              : "max-w-max self-start border-[#d7d2ff] bg-[#f4f2ff] text-[#5146df] dark:border-[#7a73ff]/24 dark:bg-[#151a34] dark:text-[#d8d5ff]",
                            "max-w-max self-start"
                          )}
                        >
                          Popular
                        </span>
                      ) : null}

                      <div>
                        <div className="text-lg font-semibold tracking-tight text-[#0a2540]">
                          {plan.price}
                        </div>
                        <div className="text-[11px] tracking-[0.12em] text-[#6b7c93]">
                          {plan.suffix}
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#425466]">{plan.description}</p>
                  </button>
                );
              })}
            </div>

            <p className={cn("mt-3 text-sm leading-6", publicTextMutedClass)}>{planNote}</p>
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className={cn(
              publicPrimaryButtonClass,
              "h-11 min-h-11 w-full rounded-xl border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-0 shadow-[0_12px_30px_rgba(79,70,229,0.34),0_0_20px_rgba(99,102,241,0.25)] transition-all duration-200 ease-out hover:translate-y-[0.5px] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1220] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transform-none motion-reduce:transition-none",
              submitState === "success" &&
                "border-emerald-500/70 bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-[0_12px_30px_rgba(16,185,129,0.28)] hover:translate-y-0 hover:brightness-100"
            )}
          >
            <span className="inline-flex items-center gap-2">
              {submitState === "loading" ? <SpinnerIcon /> : null}
              {submitState === "success" ? <CheckIcon /> : null}
              {submitState === "loading"
                ? "Creating account..."
                : submitState === "success"
                  ? "Success"
                  : "Create merchant account"}
            </span>
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className={publicTextMutedClass}>
            Stackaura provides software infrastructure and orchestration tools. Licensed payment
            providers process and settle payments.
          </p>

          <button
            type="button"
            onClick={handleOzowSignup}
            disabled={isBusy}
            className={cn(
              publicSecondaryButtonClass,
              "mt-4 min-h-11 w-full rounded-xl border-white/10 bg-white/[0.04] px-5 py-0 text-white shadow-none transition-all duration-200 ease-out hover:translate-y-[0.5px] hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1220] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transform-none motion-reduce:transition-none sm:w-auto"
            )}
          >
            <span className="inline-flex items-center gap-2">
              {submissionMode === "ozow" ? <SpinnerIcon /> : null}
              {submissionMode === "ozow"
                ? "Redirecting to Ozow..."
                : "Need a payment-linked activation flow? Continue with Ozow"}
            </span>
          </button>
        </div>

        <div className="mt-6 text-sm text-white/60">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-white/70 transition-opacity duration-150 ease-out hover:text-white hover:opacity-85"
          >
            Sign in
          </Link>
        </div>
      </AuthFormFrame>
    </AuthShell>
  );
}
