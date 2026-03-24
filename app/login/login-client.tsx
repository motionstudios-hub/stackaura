"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthFormFrame, AuthShell } from "../components/stackaura-auth";
import { trackMetaEvent } from "../lib/meta-pixel";
import {
  cn,
  lightProductInputClass,
  lightProductMutedTextClass,
  publicPrimaryButtonClass,
  publicSecondaryButtonClass,
  publicSubtleSurfaceClass,
} from "../components/stackaura-ui";

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

function getErrorMessage(error: string | null) {
  if (!error) return null;

  if (error === "Invalid credentials" || error.startsWith("Login failed")) {
    return "We couldn't sign you in. Check your email and password, then try again.";
  }

  return error.startsWith("<!DOCTYPE html>")
    ? "Unable to sign in right now. Please try again."
    : error;
}

function parseAuthErrorMessage(payload: string) {
  try {
    const parsed: unknown = JSON.parse(payload);
    if (typeof parsed === "object" && parsed !== null && "message" in parsed) {
      if (typeof parsed.message === "string") return parsed.message;
      if (Array.isArray(parsed.message)) {
        const messages = parsed.message.filter((item): item is string => typeof item === "string");
        if (messages.length > 0) return messages.join(", ");
      }
    }
  } catch {
    // ignore JSON parse errors
  }

  return payload;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accountCreated) return;
    trackMetaEvent("CompleteRegistration");
  }, [accountCreated]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(parseAuthErrorMessage(msg) || `Login failed (${res.status})`);
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  }

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
          <div className="rounded-[22px] border border-emerald-300/70 bg-emerald-50/82 px-4 py-3 text-sm text-emerald-800">
            Your merchant workspace is ready{createdEmail ? ` for ${createdEmail}` : ""}. Sign in
            to open your dashboard.
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
              Email
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(lightProductInputClass, "mt-2")}
              autoComplete="email"
              placeholder="merchant@example.com"
              disabled={loading}
              required
            />
          </label>

          <label className="block">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#6b7c93]">
              Password
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(lightProductInputClass, "mt-2")}
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </label>

          {error ? (
            <div className="rounded-[22px] border border-rose-300/70 bg-rose-50/84 px-4 py-3 text-sm text-rose-700">
              {getErrorMessage(error)}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              publicPrimaryButtonClass,
              "w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-70"
            )}
          >
            {loading ? "Signing in..." : "Sign in to dashboard"}
          </button>
        </form>

        <div className={cn("mt-6 p-4", publicSubtleSurfaceClass)}>
          <p className={lightProductMutedTextClass}>
            Stackaura provides payment orchestration and infrastructure software. Licensed payment
            providers process and settle payments.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-[#6b7c93]">Need a merchant workspace first?</span>
          <Link href="/signup" className={cn(publicSecondaryButtonClass, "px-5 py-3")}>
            Create an account
          </Link>
        </div>
      </AuthFormFrame>
    </AuthShell>
  );
}
