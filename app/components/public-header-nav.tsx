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
        className="relative flex items-center gap-1"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-px bg-[#4f46e5] transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none dark:bg-[#8dd8ff]"
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
                "group relative z-10 inline-flex min-h-[42px] items-center justify-center px-4 py-2 text-sm font-medium text-[#425466] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[#0a2540] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a73ff]/18 motion-reduce:transition-none dark:text-[#e2ebf8] dark:hover:text-white dark:focus-visible:ring-[#20BCED]/24",
                isActive && "text-[#0a2540] dark:text-white",
              )}
            >
              <span className="relative">
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 -bottom-1 h-px bg-[#4f46e5] transition-opacity duration-300 motion-reduce:transition-none",
                    "dark:bg-[#8dd8ff]",
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
