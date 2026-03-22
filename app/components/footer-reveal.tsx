"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "../../lib/utils";

export default function FooterReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const entryThreshold = window.innerHeight * 0.94;
    const initialTop = node.getBoundingClientRect().top;
    if (initialTop <= entryThreshold) return;

    const hiddenClasses = ["translate-y-6", "opacity-0", "blur-[10px]"];
    const visibleClasses = ["translate-y-0", "opacity-100", "blur-0"];
    node.classList.remove(...visibleClasses);
    node.classList.add(...hiddenClasses);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          window.requestAnimationFrame(() => {
            node.classList.remove(...hiddenClasses);
            node.classList.add(...visibleClasses);
          });
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      node.classList.remove(...hiddenClasses);
      node.classList.add(...visibleClasses);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "translate-y-0 transform-gpu opacity-100 blur-0 will-change-transform transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:blur-none motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
