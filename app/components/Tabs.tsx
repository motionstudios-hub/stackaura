"use client";

type Tab = { key: string; label: string };

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const isActive = t.key === active;

        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={[
              "rounded-2xl border px-4 py-2.5 text-sm font-medium shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl transition",
              isActive
                ? "border-[#A0E9FF]/20 bg-gradient-to-r from-[#A0E9FF] via-[#CDF5FD] to-white text-[#020D33]"
                : "border-[#A0E9FF]/15 bg-gradient-to-r from-[#163b7a]/85 via-[#102b5c]/85 to-[#0d2348]/85 text-zinc-100 shadow-[0_10px_30px_rgba(17,106,248,0.18)] backdrop-blur-xl hover:border-[#20BCED]/45 hover:from-[#1c4690]/90 hover:via-[#14356f]/90 hover:to-[#102b59]/90",
            ].join(" ")}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}