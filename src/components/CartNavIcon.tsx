"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartNavIcon() {
  const { count, ready } = useCart();
  // `ready` keeps the first client render identical to the server HTML (no hydration mismatch)
  const shown = ready ? count : 0;
  const label = shown > 99 ? "99+" : String(shown);

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${shown} ${shown === 1 ? "item" : "items"}`}
      className="flex items-center gap-1.5 rounded-[var(--radius-8)] text-[#111f2a] outline-offset-4 transition-colors duration-150 hover:text-[#357a25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5eb047]"
    >
      <svg
        className="h-[22px] w-[22px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 3h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L20 7H6" />
        <circle cx="9.5" cy="19.5" r="1.4" />
        <circle cx="17.5" cy="19.5" r="1.4" />
      </svg>
      <span className="min-w-[1ch] rounded-full bg-[#eefae8] px-1.5 text-[13px] font-bold tabular-nums text-[#24591f]">
        {label}
      </span>
    </Link>
  );
}