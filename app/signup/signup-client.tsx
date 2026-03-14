"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const highlights = [
  {
    label: "Unified API",
    title: "One integration",
    description:
      "Launch checkout, payment links, payment intents, and ledger-backed flows from a single stack.",
  },
  {
    label: "Gateway orchestration",
    title: "Smart routing",
    description:
      "Route across PayFast, Ozow, and future rails with failover, delivery tracking, and developer-first controls.",
  },
  {
    label: "Merchant workspace",
    title: "Ready fast",
    description:
      "Create your account, then continue to login with your email already prefilled.",
  },
];

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

export default function SignupClient() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("South Africa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backend = process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL || "http://localhost:3001";

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const res = await fetch(`${backend}/v1/merchants/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          email,
          password,
          country,
        }),
      });

      if (!res.ok) {
        let message = "Signup failed";
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Signup failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(32,188,237,0.24),transparent_30%),radial-gradient(circle_at_top_right,rgba(17,106,248,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(160,233,255,0.12),transparent_24%),linear-gradient(135deg,#061229_0%,#020817_48%,#04174a_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent_18%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="mb-6 inline-flex min-h-[44px] w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 backdrop-blur-xl transition hover:bg-white/10 sm:mb-8"
        >
          <span>←</span>
          <span>Back to Stackaura</span>
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <section className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#A0E9FF] backdrop-blur-xl">
              Self-serve merchant onboarding
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/25 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
                <Image
                  src="/stackaura-logo.png"
                  alt="Stackaura"
                  width={42}
                  height={42}
                  className="object-contain mix-blend-screen"
                  priority
                />
              </div>

              <div>
                <div className="text-3xl font-semibold tracking-tight">Stackaura</div>
                <div className="text-sm text-zinc-400">Payments Infrastructure</div>
              </div>
            </div>

            <h1 className="mt-10 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Start accepting payments on Stackaura with a merchant workspace that is ready fast.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
              Create your account, access your dashboard, generate API keys, launch payment links,
              and connect gateways like PayFast and Ozow from one platform.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                >
                  <div className="text-xs uppercase tracking-wide text-zinc-500">{item.label}</div>
                  <div className="mt-3 text-xl font-semibold tracking-tight text-white">
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="order-1 lg:order-2">
            <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-[#08152f]/60 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-[0.24em] text-[#A0E9FF]">
                    Create account
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                    Open your merchant workspace
                  </h2>
                </div>

                <div className="rounded-full border border-emerald-900/40 bg-emerald-950/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-300">
                  Live onboarding
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Sign up in under a minute. We&apos;ll take you to login next with your new account
                email already filled in.
              </p>

              <form onSubmit={handleSignup} className="mt-8 space-y-4">
                <label className="block">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Business name
                  </div>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Stackaura Technologies"
                    className="mt-2 min-h-[48px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#20BCED]/45 focus:ring-2 focus:ring-[#20BCED]/20"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Work email
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@stackaura.co.za"
                    className="mt-2 min-h-[48px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#20BCED]/45 focus:ring-2 focus:ring-[#20BCED]/20"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Password
                  </div>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="mt-2 min-h-[48px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#20BCED]/45 focus:ring-2 focus:ring-[#20BCED]/20"
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Country
                  </div>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-2 min-h-[48px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#20BCED]/45 focus:ring-2 focus:ring-[#20BCED]/20"
                  >
                    <option>South Africa</option>
                    <option>Nigeria</option>
                    <option>Kenya</option>
                    <option>United Kingdom</option>
                  </select>
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[48px] w-full rounded-2xl bg-[#A0E9FF] px-5 py-3 text-sm font-semibold text-[#02142b] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Creating account..." : "Create merchant account"}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300">
                You&apos;ll continue straight to sign in after account creation, with your new
                merchant email already prefilled.
              </div>

              <div className="mt-6 flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                <span>Already have an account?</span>
                <Link
                  href="/login"
                  className="inline-flex min-h-[44px] items-center gap-2 text-[#A0E9FF] transition hover:text-white"
                >
                  Sign in
                  <span>→</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
