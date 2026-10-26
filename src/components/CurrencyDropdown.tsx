"use client";

import { useEffect, useRef, useState } from "react";
import { useCurrency } from "./CurrencyProvider";
import { CURRENCIES } from "@/lib/currency";

export function CurrencyDropdown() {
  const { currency: selected, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const selectedCurrency =
    CURRENCIES.find((c) => c.code === selected) ?? CURRENCIES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change currency"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-[var(--radius-8)] px-2 py-1.5 text-[14px] font-semibold text-white transition-colors duration-[var(--duration-base)] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#91f974]"
      >
        <span>
          {selectedCurrency.symbol} {selectedCurrency.code}
        </span>
        <svg
          className={`h-3 w-3 opacity-60 transition-transform duration-[var(--duration-base)] ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-[110] mt-2 w-32 overflow-hidden rounded-[var(--radius-12)] border border-[#e8ece4] bg-white py-1 shadow-[0_20px_40px_-18px_rgba(8,15,21,0.35)]"
        >
          {CURRENCIES.map((currency) => (
            <li key={currency.code}>
              <button
                type="button"
                role="option"
                aria-selected={currency.code === selectedCurrency.code}
                onClick={() => {
                  setCurrency(currency.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3.5 py-2 text-[14px] font-semibold transition-colors duration-[var(--duration-base)] hover:bg-[#eefae8] ${
                  currency.code === selectedCurrency.code ? "text-[#357a25]" : "text-[#111f2a]"
                }`}
              >
                <span>{currency.code}</span>
                <span className="text-[#357a25]">{currency.symbol}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}