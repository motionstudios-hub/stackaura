export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#020D33] px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-semibold tracking-tight">About Stackaura</h1>
        <p className="mt-6 text-zinc-300">
          Stackaura is a South African fintech infrastructure company building
          payment orchestration software for merchants, platforms, and developers.
        </p>
        <p className="mt-4 text-zinc-300">
          Our platform is designed to help businesses manage payment routing,
          gateway failover, webhooks, subscriptions, and merchant operations
          through modern APIs and internal tooling.
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-zinc-400">Legal entity</div>
          <div className="mt-2 text-lg font-medium">
            Stackaura Technologies (Pty) Ltd
          </div>
          <div className="mt-4 text-sm text-zinc-400">Country</div>
          <div className="mt-2">South Africa</div>
        </div>
      </div>
    </main>
  );
}