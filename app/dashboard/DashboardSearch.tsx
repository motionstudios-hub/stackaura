"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn, lightProductInputClass, lightProductPanelClass } from "../components/stackaura-ui";

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
    <div ref={containerRef} className="relative min-w-0 sm:min-w-[320px]">
      <svg
        viewBox="0 0 20 20"
        className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#6b7c93]"
        fill="none"
      >
        <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>

      <input
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
        className={cn(lightProductInputClass, "min-h-[48px] pl-11")}
      />

      {showDropdown ? (
        <div className={cn(lightProductPanelClass, "absolute left-0 right-0 top-[calc(100%+12px)] z-30 p-2")}>
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="text-xs uppercase tracking-[0.18em] text-[#6b7c93]">
              Search results
            </div>
            {loading ? <div className="text-xs text-[#6b7c93]">Searching…</div> : null}
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
                  className="flex items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/44"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#0a2540]">{result.label}</div>
                    <div className="mt-1 truncate text-xs text-[#6b7c93]">{result.description}</div>
                  </div>
                  <span className="rounded-full border border-white/42 bg-white/22 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#6b7c93]">
                    {kindLabel(result.kind)}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-2xl px-3 py-4 text-sm text-[#6b7c93]">
                No matching dashboard records yet.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={submitSearch}
            className="mt-2 flex w-full rounded-2xl border border-white/42 bg-white/22 px-3 py-3 text-left text-sm font-medium text-[#0a2540] transition hover:bg-white/34"
          >
            View full payment search for “{query.trim()}”
          </button>
        </div>
      ) : null}
    </div>
  );
}
