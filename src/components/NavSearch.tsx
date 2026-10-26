"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SearchResult } from "@/app/api/search/route";

export interface SearchCategory {
  slug: string;
  label: string;
  count: number;
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function NavSearch({ categories }: { categories: SearchCategory[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const debouncedQuery = useDebounce(trimmed, 220);

  // Fetch product results from the search API
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data: { results: SearchResult[] }) => {
        if (!cancelled) {
          setResults(data.results ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  // Default suggestions — show top categories when query is empty
  const defaultSuggestions = categories.slice(0, 8);

  const showProductResults = trimmed.length > 0;
  // Only show "no results" when the debounced query matches what the user typed
  // (i.e. the fetch has actually completed for the current input)
  const searchSettled = debouncedQuery === trimmed;
  const noResults = showProductResults && searchSettled && !loading && results.length === 0;

  return (
    <div ref={containerRef} className="relative hidden w-[220px] shrink-0 xl:block 2xl:w-[270px]">
      <form
        action="/shop"
        method="get"
        role="search"
        className="group relative"
        onSubmit={() => {
          if (!trimmed) return;
          // Let the default form submission go to /shop?q=... for a full-page search
        }}
      >
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products..."
          autoComplete="off"
          aria-label="Search products"
          aria-expanded={open}
          aria-autocomplete="list"
          className="h-10 w-full rounded-[var(--radius-pill)] border border-transparent bg-[#f3f6f0] py-2 pl-10 pr-4 text-[14px] text-[#111f2a] outline-none transition-colors duration-[var(--duration-base)] placeholder:text-[#6b7280] focus:border-[#5eb047] focus:bg-white"
        />
        {loading ? (
          <svg
            className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#6b7280]"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : null}
      </form>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-[var(--radius-16)] border border-[#e8ece4] bg-white shadow-[0_24px_48px_-20px_rgba(8,15,21,0.35)]">
          {showProductResults ? (
            <>
              {results.length > 0 ? (
                <ul className="max-h-[420px] overflow-y-auto divide-y divide-[#eef1ea]">
                  {results.map((r) => (
                    <li key={r.href}>
                      <Link
                        href={r.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[#eefae8]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-[#111f2a]">{r.title}</p>
                          {r.brand ? (
                            <p className="truncate text-xs text-[var(--color-text-muted)]">{r.brand}</p>
                          ) : null}
                        </div>
                        <span className="shrink-0 rounded-[var(--radius-pill)] bg-[#eefae8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#357a25]">
                          {r.category.replace(/-/g, " ")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : noResults ? (
                <p className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                  No products found for &ldquo;{trimmed}&rdquo;
                </p>
              ) : null}

              <Link
                href={`/shop?q=${encodeURIComponent(trimmed)}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 border-t border-[#eef1ea] px-4 py-3 text-sm font-bold text-[#357a25] transition-colors hover:bg-[#eefae8]"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                See all results for &ldquo;{trimmed}&rdquo;
              </Link>
            </>
          ) : (
            <div className="p-2">
              <p className="px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-muted)]">
                Browse categories
              </p>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {defaultSuggestions.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/shop/${category.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-8)] px-3 py-2 text-sm font-semibold text-[#111f2a] transition-colors hover:bg-[#eefae8]"
                  >
                    <span className="truncate">{category.label}</span>
                    <span className="tabular text-xs font-medium text-[var(--color-text-muted)]">
                      {category.count.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}