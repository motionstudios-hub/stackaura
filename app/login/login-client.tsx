"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const highlights = [
  "Merchant dashboard access with workspace switching",
  "Developer API keys for test and live environments",
  "Hosted checkout, payment links, and orchestration tools",
];

export default function LoginClient({
  accountCreated,
  initialEmail,
}: {
  accountCreated: boolean;
  initialEmail: string;
}) {
  const router = useRouter();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("ChangeMe123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(msg || `Login failed (${res.status})`);
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
              Merchant sign in
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
              Access your merchant console and keep payment operations moving.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
              Sign in to manage API access, merchant workspaces, hosted checkout, and the
              Stackaura tools that power orchestration across your payment rails.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/10 bg-[#08152f]/55 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                >
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Included</div>
                  <div className="mt-3 text-sm leading-6 text-zinc-300">{item}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="order-1 lg:order-2">
            <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-[#08152f]/60 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-[0.24em] text-[#A0E9FF]">
                    Secure access
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                    Sign in to Stackaura
                  </h2>
                </div>

                <div className="rounded-full border border-emerald-900/40 bg-emerald-950/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-300">
                  Merchant ready
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-400">
                Use your merchant credentials to open the dashboard, switch workspaces, and manage
                developer access.
              </p>

              {accountCreated ? (
                <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  Merchant workspace created{initialEmail ? ` for ${initialEmail}` : ""}. Sign in
                  to open your dashboard.
                </div>
              ) : null}

              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <label className="block">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Email
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 min-h-[48px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#20BCED]/45 focus:ring-2 focus:ring-[#20BCED]/20"
                    autoComplete="email"
                    placeholder="merchant@example.com"
                    disabled={loading}
                    required
                  />
                </label>

                <label className="block">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Password
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 min-h-[48px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-[#20BCED]/45 focus:ring-2 focus:ring-[#20BCED]/20"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[48px] w-full rounded-2xl bg-[#A0E9FF] px-4 py-3 text-sm font-semibold text-[#02142b] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign in to dashboard"}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300">
                Local development credentials are prefilled here for convenience. You can replace
                them with any merchant account before signing in.
              </div>

              <div className="mt-6 flex flex-col gap-3 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                <span>Need a merchant workspace first?</span>
                <Link
                  href="/signup"
                  className="inline-flex min-h-[44px] items-center gap-2 text-[#A0E9FF] transition hover:text-white"
                >
                  Create an account
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
