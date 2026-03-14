"use client";

import Image from "next/image";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_16px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 flex items-center justify-center rounded-2xl border border-white/10 bg-transparent">
            <Image
              src="/stackaura-logo.png"
              alt="Stackaura"
              width={40}
              height={40}
              className="object-contain mix-blend-screen"
              priority
            />
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Payment Successful
        </h1>

        <p className="mt-3 text-zinc-400 text-sm">
          Your payment has been processed successfully.
        </p>

        <div className="mt-6 rounded-2xl border border-emerald-900/40 bg-emerald-950/30 p-4 text-emerald-300 text-sm">
          Thank you for your payment.
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-white text-black px-5 py-3 text-sm font-medium hover:bg-zinc-200 transition"
          >
            Return to Merchant
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-800 px-5 py-3 text-sm text-zinc-300 hover:bg-zinc-900 transition"
          >
            View Payment Details
          </Link>
        </div>

        <div className="mt-8 text-xs text-zinc-500">
          Powered by Stackaura Payments Infrastructure
        </div>
      </div>
    </main>
  );
}
