"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

type NavItem = {
  href: string;
  label: string;
};

function matchesPath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PublicHeaderNav({
  items,
  className,
}: {
  items: readonly NavItem[];
  className?: string;
}) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeIndex = items.findIndex((item) => matchesPath(pathname, item.href));

  useEffect(() => {
    const container = containerRef.current;
    const indicator = indicatorRef.current;

    if (!container || !indicator) {
      return;
    }

    const index = hoveredIndex ?? activeIndex;
    if (index < 0) {
      indicator.style.opacity = "0";
      return;
    }

    const target = itemRefs.current[index];
    if (!target) {
      indicator.style.opacity = "0";
      return;
    }

    const updateIndicator = () => {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      indicator.style.width = `${targetRect.width}px`;
      indicator.style.transform = `translateX(${targetRect.left - containerRect.left}px)`;
      indicator.style.opacity = "1";
    };

    updateIndicator();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateIndicator) : null;
    resizeObserver?.observe(container);
    resizeObserver?.observe(target);
    window.addEventListener("resize", updateIndicator);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeIndex, hoveredIndex, pathname]);

  return (
    <nav className={cn("hidden lg:flex", className)}>
      <div
        ref={containerRef}
        className="relative flex items-center gap-2 rounded-full border border-white/38 bg-white/16 p-1.5 shadow-[0_12px_28px_rgba(133,156,180,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_16px_32px_rgba(0,0,0,0.24)]"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1.5 left-0 rounded-full border border-white/62 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(233,242,248,0.50))] shadow-[0_10px_24px_rgba(122,146,168,0.14),inset_0_1px_0_rgba(255,255,255,0.82)] transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:border-[#8dd8ff]/22 dark:bg-[linear-gradient(180deg,rgba(130,226,255,0.14),rgba(76,109,255,0.16))] dark:shadow-[0_12px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.08)]"
          style={{ opacity: 0, width: 0 }}
        />

        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onFocus={() => setHoveredIndex(index)}
              className={cn(
                "group relative z-10 inline-flex min-h-[42px] items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-[#425466] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:text-[#0a2540] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a73ff]/18 motion-reduce:transform-none motion-reduce:transition-none dark:text-zinc-300 dark:hover:text-white dark:focus-visible:ring-[#20BCED]/24",
                isActive && "text-[#0a2540] dark:text-white",
              )}
            >
              <span className="relative">
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -bottom-1 h-px rounded-full bg-[linear-gradient(90deg,rgba(99,91,255,0),rgba(99,91,255,0.72),rgba(99,91,255,0))] transition-opacity duration-300 motion-reduce:transition-none",
                    "dark:bg-[linear-gradient(90deg,rgba(160,233,255,0),rgba(160,233,255,0.84),rgba(160,233,255,0))]",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70",
                  )}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
