export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#020D33] px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-6 text-zinc-300">
          For business, partnership, developer, and compliance enquiries, contact Stackaura.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-zinc-400">Business name</div>
            <div className="mt-2 text-lg font-medium">
              Stackaura Technologies (Pty) Ltd
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-zinc-400">Email</div>
            <div className="mt-2">admin@stackaura.co.za</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-zinc-400">Website</div>
            <div className="mt-2">https://stackaura.co.za</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-zinc-400">Country</div>
            <div className="mt-2">South Africa</div>
          </div>
        </div>
      </div>
    </main>
  );
}