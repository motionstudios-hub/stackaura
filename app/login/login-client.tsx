"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthFormFrame, AuthShell } from "../components/stackaura-auth";
import { trackMetaEvent } from "../lib/meta-pixel";
import {
  cn,
  publicFieldLabelClass,
  publicInputClass,
  publicPrimaryButtonClass,
  publicTextMutedClass,
} from "../components/stackaura-ui";

const MIN_PASSWORD_LENGTH = 8;

const highlights = [
  {
    label: "Merchant console",
    title: "Operate confidently",
    description:
      "Open your dashboard, switch workspaces, and stay close to checkout performance across your payment rails.",
  },
  {
    label: "Developer access",
    title: "Control environments",
    description:
      "Manage API keys for test and live traffic from one place without leaving your merchant console.",
  },
  {
    label: "Payment operations",
    title: "Keep flows moving",
    description:
      "Monitor hosted checkout, payment links, and orchestration tools designed to reduce failed payments.",
  },
] as const;

type LoginFields = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginFields, string>>;
type SubmitState = "idle" | "loading" | "success";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginFields(fields: LoginFields): LoginErrors {
  const errors: LoginErrors = {};

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

function validateLoginField(field: keyof LoginFields, fields: LoginFields) {
  return validateLoginFields(fields)[field];
}

function parseErrorPayload(payload: unknown): string | null {
  if (!payload) return null;
  if (typeof payload === "string") return payload;

  if (typeof payload === "object" && payload !== null && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) {
      const messages = message.filter((item): item is string => typeof item === "string");
      if (messages.length > 0) return messages.join(", ");
    }
  }

  return null;
}

async function readResponseMessage(res: Response) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const payload: unknown = await res.json();
      return parseErrorPayload(payload);
    } catch {
      return null;
    }
  }

  try {
    const text = await res.text();
    return parseErrorPayload(text);
  } catch {
    return null;
  }
}

function mapLoginError(status: number | null, message: string | null) {
  const normalized = (message || "").toLowerCase();

  if (
    status === 401 ||
    normalized.includes("invalid credentials") ||
    normalized.includes("incorrect email or password")
  ) {
    return "Incorrect email or password";
  }

  if (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    normalized.includes("service unavailable") ||
    normalized.includes("unable to reach server") ||
    normalized.includes("network") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("application failed to respond")
  ) {
    return "Unable to reach server. Try again.";
  }

  return "Unable to sign in. Try again.";
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

export default function LoginClient({
  accountCreated,
  createdEmail,
}: {
  accountCreated: boolean;
  createdEmail: string;
}) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!accountCreated) return;
    trackMetaEvent("CompleteRegistration");
  }, [accountCreated]);

  function updateField(field: keyof LoginFields, value: string) {
    if (field === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }

    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitState !== "idle") return;

    const nextFields = { email, password };
    const errors = validateLoginFields(nextFields);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitState("loading");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextFields),
      });

      if (!res.ok) {
        const message = await readResponseMessage(res);
        setFieldErrors({
          password: mapLoginError(res.status, message),
        });
        setSubmitState("idle");
        return;
      }

      setFieldErrors({});
      setSubmitState("success");
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFieldErrors({
        password: "Unable to reach server. Try again.",
      });
      setSubmitState("idle");
    }
  }

  const isBusy = submitState === "loading" || submitState === "success";

  return (
    <AuthShell
      eyebrow="Merchant sign in"
      title="Secure access to the Stackaura merchant console."
      description="Sign in to manage unified checkout, gateway routing, merchant workspaces, and the infrastructure that keeps payments moving."
      features={highlights}
    >
      <AuthFormFrame
        eyebrow="Secure access"
        title="Sign in to Stackaura"
        description="Use your merchant credentials to open the dashboard, manage environments, and monitor payment operations from one place."
        status="Merchant ready"
        statusTone="success"
      >
        {accountCreated ? (
          <div className="rounded-[22px] border border-emerald-300/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-400/18 dark:bg-emerald-400/10 dark:text-emerald-200">
            Your merchant workspace is ready{createdEmail ? ` for ${createdEmail}` : ""}. Sign in
            to open your dashboard.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <label className="block">
            <div className={publicFieldLabelClass}>Email</div>
            <input
              type="email"
              value={email}
              onChange={(event) => updateField("email", event.target.value)}
              onBlur={() => {
                setFieldErrors((current) => ({
                  ...current,
                  email: validateLoginField("email", { email, password }),
                }));
              }}
              className={cn(
                publicInputClass,
                "mt-2",
                fieldErrors.email &&
                  "border-red-500/50 bg-red-500/[0.04] focus:border-red-500/50 focus:ring-red-500/20",
                "focus:border-white/15 focus:ring-1 focus:ring-white/20"
              )}
              autoComplete="email"
              placeholder="merchant@example.com"
              disabled={isBusy}
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
            />
            {fieldErrors.email ? (
              <p
                id="login-email-error"
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
                value={password}
                onChange={(event) => updateField("password", event.target.value)}
                onBlur={() => {
                  setFieldErrors((current) => ({
                    ...current,
                    password: validateLoginField("password", { email, password }),
                  }));
                }}
                className={cn(
                  publicInputClass,
                  "pr-12",
                  fieldErrors.password &&
                    "border-red-500/50 bg-red-500/[0.04] focus:border-red-500/50 focus:ring-red-500/20",
                  "focus:border-white/15 focus:ring-1 focus:ring-white/20"
                )}
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={isBusy}
                required
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
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
                id="login-password-error"
                className="mt-2 translate-y-0 text-sm text-rose-300 opacity-100 transition-all duration-150 ease-out motion-reduce:transition-none"
                aria-live="polite"
              >
                {fieldErrors.password}
              </p>
            ) : null}
          </label>

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
                ? "Signing in..."
                : submitState === "success"
                  ? "Success"
                  : "Sign in to dashboard"}
            </span>
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className={publicTextMutedClass}>
            Stackaura provides payment orchestration and infrastructure software. Licensed payment
            providers process and settle payments.
          </p>
        </div>

        <div className="mt-6 text-sm text-white/60">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-white/70 transition-opacity duration-150 ease-out hover:text-white hover:opacity-85"
          >
            Create an account
          </Link>
        </div>
      </AuthFormFrame>
    </AuthShell>
  );
}
