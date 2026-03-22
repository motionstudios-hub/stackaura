import Image from "next/image";
import { cn } from "@/lib/utils";
import InfiniteSlider from "./infinite-slider";

export type LogoCloudRail = {
  name: string;
  src: string;
  width: number;
  height: number;
  pillClassName?: string;
  imageClassName?: string;
};

type LogoCloudProps = {
  items: readonly LogoCloudRail[];
  className?: string;
};

function LogoCloudPill({
  item,
  subdued = false,
}: {
  item: LogoCloudRail;
  subdued?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-[64px] items-center justify-center rounded-full border border-white/52 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(238,246,250,0.22))] px-6 shadow-[0_12px_28px_rgba(122,146,168,0.10),inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-2xl sm:h-[70px] sm:px-7",
        subdued
          ? "border-white/36 bg-white/18 shadow-[0_8px_18px_rgba(122,146,168,0.07)] opacity-[0.7]"
          : "opacity-100",
        item.pillClassName
      )}
      aria-label={item.name}
      title={item.name}
    >
      <Image
        src={item.src}
        alt={item.name}
        width={item.width}
        height={item.height}
        unoptimized
        className={cn(
          "max-h-7 w-auto object-contain sm:max-h-8",
          item.imageClassName
        )}
      />
    </div>
  );
}

export default function LogoCloud({ items, className }: LogoCloudProps) {
  const reversedItems = [...items].reverse();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[30px] border border-white/48 bg-[linear-gradient(180deg,rgba(255,255,255,0.30),rgba(236,245,249,0.16))] p-4 shadow-[0_14px_34px_rgba(122,146,168,0.10),inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-2xl sm:p-5",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_20%_15%,rgba(125,211,252,0.16),transparent_28%),radial-gradient(circle_at_78%_30%,rgba(122,115,255,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0))]" />
      <div className="relative z-0">
        <div className="inline-flex rounded-full border border-white/46 bg-white/26 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7c93] shadow-[0_8px_18px_rgba(133,156,180,0.08)] backdrop-blur-xl">
          Current live rails
        </div>

        <div className="mt-4 space-y-3 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <InfiniteSlider
            gap="1.6rem"
            pauseOnHover={false}
            durationSeconds={15}
            className="relative z-0"
            itemClassName="py-1"
          >
            {items.map((item) => (
              <LogoCloudPill key={item.name} item={item} />
            ))}
          </InfiniteSlider>

          <InfiniteSlider
            reverse
            gap="1.5rem"
            pauseOnHover={false}
            durationSeconds={22}
            className="relative z-0 hidden sm:block"
            itemClassName="py-1"
          >
            {reversedItems.map((item) => (
              <LogoCloudPill key={`${item.name}-reverse`} item={item} subdued />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </div>
  );
}
