"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 1.8V4.2" />
      <path d="M12 19.8V22.2" />
      <path d="M4.22 4.22L5.92 5.92" />
      <path d="M18.08 18.08L19.78 19.78" />
      <path d="M1.8 12H4.2" />
      <path d="M19.8 12H22.2" />
      <path d="M4.22 19.78L5.92 18.08" />
      <path d="M18.08 5.92L19.78 4.22" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.2 14.75A8.65 8.65 0 0 1 9.25 3.8a8.9 8.9 0 1 0 10.95 10.95Z" />
    </svg>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "fixed bottom-4 right-4 z-[180] h-12 w-12 rounded-full border border-white/45 bg-white/78 text-[#0a2540] shadow-[0_18px_40px_rgba(122,146,168,0.18)] backdrop-blur-2xl sm:bottom-5 sm:right-5",
        "hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#08152f]/88 dark:text-white dark:shadow-[0_22px_48px_rgba(0,0,0,0.32)]",
        className
      )}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <SunIcon
          className={cn(
            "absolute h-5 w-5 transition-all duration-200",
            isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          )}
        />
        <MoonIcon
          className={cn(
            "absolute h-5 w-5 transition-all duration-200",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
          )}
        />
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
