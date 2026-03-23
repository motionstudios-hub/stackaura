import type { CSSProperties } from "react";
import Image from "next/image";

const networkBlue = "#7c9bc8";

const nodes = [
  { cx: 264, cy: 158, delay: "0s", scale: 1 },
  { cx: 206, cy: 516, delay: "0.9s", scale: 0.9 },
  { cx: 468, cy: 604, delay: "1.6s", scale: 1.04 },
  { cx: 832, cy: 274, delay: "2.1s", scale: 0.94 },
  { cx: 876, cy: 705, delay: "2.8s", scale: 0.98 },
  { cx: 680, cy: 1092, delay: "1.25s", scale: 1.08 },
] as const;

const routes = [
  {
    d: "M264 158C352 232 404 402 468 604",
    className: "africa-network-route",
    strokeWidth: 2.9,
    opacity: 0.9,
    pulseLength: "10 90",
    delay: "0s",
  },
  {
    d: "M832 274C906 356 936 514 876 705",
    className: "africa-network-route africa-network-route-slow",
    strokeWidth: 2.6,
    opacity: 0.78,
    pulseLength: "9 91",
    delay: "0.8s",
  },
  {
    d: "M206 516C390 566 658 592 876 705",
    className: "africa-network-route africa-network-route-reverse",
    strokeWidth: 2.8,
    opacity: 0.82,
    pulseLength: "11 89",
    delay: "1.1s",
  },
  {
    d: "M468 604C574 772 626 936 680 1092",
    className:
      "africa-network-route africa-network-route-slow africa-network-route-reverse",
    strokeWidth: 2.5,
    opacity: 0.74,
    pulseLength: "8 92",
    delay: "1.6s",
  },
] as const;

function SignalNode({
  cx,
  cy,
  delay,
  scale,
}: {
  cx: number;
  cy: number;
  delay: string;
  scale: number;
}) {
  return (
    <g
      className="africa-network-node"
      style={{ "--africa-node-delay": delay } as CSSProperties}
    >
      <circle
        cx={cx}
        cy={cy}
        r={14 * scale}
        fill={networkBlue}
        opacity="0.08"
        className="africa-network-node-pulse"
      />
      <circle
        cx={cx}
        cy={cy}
        r={4.6 * scale}
        fill={networkBlue}
        className="africa-network-node-core"
      />
      <circle cx={cx} cy={cy} r={1.9 * scale} fill="#f8fbff" opacity="0.96" />
    </g>
  );
}

export default function AfricaNetworkHero() {
  return (
    <div className="pointer-events-none relative hidden min-h-[620px] items-center justify-end overflow-visible lg:flex xl:min-h-[660px]">
      <div className="relative mr-[-8px] h-[620px] w-[620px] xl:mr-[-12px] xl:h-[700px] xl:w-[700px]">
        <div className="absolute inset-[7%]">
          <Image
            src="/hero/africa-map.svg"
            alt=""
            aria-hidden="true"
            priority
            width={1200}
            height={1230}
            className="absolute inset-0 h-full w-full object-contain opacity-[0.94]"
          />

          <svg
            viewBox="0 0 1200 1230"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            {routes.map((route) => (
              <g key={route.d}>
                <path
                  d={route.d}
                  fill="none"
                  stroke={networkBlue}
                  strokeWidth={1.25}
                  strokeLinecap="round"
                  opacity="0.16"
                />
                <path
                  d={route.d}
                  fill="none"
                  stroke={networkBlue}
                  strokeWidth={route.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={100}
                  strokeDasharray={route.pulseLength}
                  strokeDashoffset={0}
                  className={route.className}
                  opacity={route.opacity}
                  style={{ animationDelay: route.delay }}
                />
              </g>
            ))}

            {nodes.map((node) => (
              <SignalNode key={`${node.cx}-${node.cy}`} {...node} />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
