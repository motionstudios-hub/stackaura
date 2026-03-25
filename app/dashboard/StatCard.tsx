import { cn } from "../components/stackaura-ui";

type Tone = "cyan" | "violet" | "amber" | "slate";

function accentClass(tone: Tone) {
  if (tone === "violet") return "from-[#8b7dff]/40 to-[#6aa8ff]/18";
  if (tone === "amber") return "from-[#ffbf7a]/36 to-transparent";
  if (tone === "slate") return "from-[#8da6c0]/24 to-transparent";
  return "from-[#8dd8ff]/38 to-[#5fb8ff]/16";
}

function chipClass(tone: Tone) {
  if (tone === "violet") return "border-[#9088ff]/26 bg-[#7b72ff]/12 text-[#dedbff]";
  if (tone === "amber") return "border-[#ffc68a]/24 bg-[#ffb364]/12 text-[#ffd9b2]";
  if (tone === "slate") return "border-white/12 bg-white/[0.04] text-[#d0dfef]";
  return "border-[#8dd8ff]/24 bg-[#8dd8ff]/12 text-[#dff6ff]";
}

export default function StatCard({
  label,
  value,
  tone = "cyan",
  indicator,
  detail,
}: {
  label: string;
  value: string;
  tone?: Tone;
  indicator: string;
  detail: string;
}) {
  return (
    <section className="group relative overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(13,32,60,0.92)_0%,rgba(8,21,47,0.92)_100%)] p-5 shadow-[0_22px_48px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b opacity-100",
          accentClass(tone),
        )}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#7ea4c7]">{label}</div>
          <span className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", chipClass(tone))}>
            {indicator}
          </span>
        </div>
        <div className="mt-5 text-3xl font-semibold tracking-tight text-white">{value}</div>
        <p className="mt-3 text-sm leading-6 text-[#9fb4c9]">{detail}</p>
      </div>
    </section>
  );
}
