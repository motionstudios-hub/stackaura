"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  cn,
  lightProductCompactGhostButtonClass,
  lightProductPanelClass,
  lightProductStatusPillClass,
} from "../components/stackaura-ui";
import { Input } from "../../components/ui/input";

type SearchResult = {
  id: string;
  label: string;
  description: string;
  href: string;
  kind: "payment" | "customer" | "gateway" | "api_key";
};

function kindLabel(kind: SearchResult["kind"]) {
  if (kind === "payment") return "Payment";
  if (kind === "customer") return "Customer";
  if (kind === "gateway") return "Gateway";
  return "API key";
}

export default function DashboardSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [pathname, searchParams]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/dashboard/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          setResults([]);
          return;
        }

        const payload = (await res.json()) as { results?: SearchResult[] };
        setResults(Array.isArray(payload.results) ? payload.results : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
      setLoading(false);
    };
  }, [query]);

  const hasResults = results.length > 0;
  const showDropdown = open && query.trim().length >= 2;
  const quickRoute = useMemo(() => `/dashboard/payments?q=${encodeURIComponent(query.trim())}`, [query]);

  function submitSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(quickRoute);
  }

  return (
    <div ref={containerRef} className="relative w-full min-w-0 sm:w-[340px]">
      <svg
        viewBox="0 0 20 20"
        className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#6b7c93] dark:text-[#8ea5c0]"
        fill="none"
      >
        <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>

      <Input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submitSearch();
          }
        }}
        placeholder="Search payments, customers, transactions..."
        className={cn("h-11 w-full pl-11 pr-4")}
      />

      {showDropdown ? (
        <div className={cn(lightProductPanelClass, "absolute left-0 right-0 top-[calc(100%+12px)] z-30 p-2")}>
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93] dark:text-[#8ea5c0]">
              Search results
            </div>
            {loading ? <div className="text-xs text-[#6b7c93] dark:text-[#8ea5c0]">Searching…</div> : null}
          </div>

          <div className="grid gap-1">
            {hasResults ? (
              results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(result.href);
                  }}
                  className="flex items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ease-out hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#0a2540] dark:text-white">{result.label}</div>
                    <div className="mt-1 truncate text-xs text-[#6b7c93] dark:text-[#8ea5c0]">{result.description}</div>
                  </div>
                  <span className={lightProductStatusPillClass("muted")}>
                    {kindLabel(result.kind)}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-2xl px-3 py-4 text-sm text-[#6b7c93] dark:text-[#8ea5c0]">
                No matching dashboard records yet.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={submitSearch}
            className={cn(
              lightProductCompactGhostButtonClass,
              "mt-2 flex w-full justify-start rounded-2xl px-3 py-3 text-left text-sm",
            )}
          >
            View full payment search for “{query.trim()}”
          </button>
        </div>
      ) : null}
    </div>
  );
}
