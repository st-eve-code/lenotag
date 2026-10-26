"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "nofacetrap-age-verified";

export function AgeVerification() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Start "verified" so SSR and the first client render match (no dialog open).
  // The effect below flips this if the visitor hasn't confirmed this session.
  const [verified, setVerified] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Storage unavailable (private mode) — default to showing the gate.
    }
    if (!seen) setVerified(false);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (!verified && !d.open) d.showModal();
    if (verified && d.open) d.close();
  }, [verified]);

  // Lock page scroll behind the gate.
  useEffect(() => {
    if (verified) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [verified]);

  const accept = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore — gate will simply reappear next visit.
    }
    setVerified(true);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="agegate-title"
      onCancel={(e) => {
        // Block Escape — the gate can only be dismissed by answering.
        e.preventDefault();
      }}
      onClose={() => {
        // If something closed it without verification, reopen.
        if (!verified) dialogRef.current?.showModal();
      }}
      className="agegate-dialog m-auto max-h-[100dvh] w-full max-w-[440px] overflow-y-auto overflow-x-hidden bg-transparent p-4 backdrop:bg-[#04090e]/75 backdrop:backdrop-blur-md"
    >
      <style>{`
        .agegate-dialog { --gate-accent: #91f974; }

        @keyframes agegate-in { from { opacity: 0; transform: translateY(18px) scale(.97); } to { opacity: 1; transform: none; } }
        @keyframes agegate-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes agegate-spin { to { transform: rotate(360deg); } }
        @keyframes agegate-glow { 0%, 100% { opacity: .55; } 50% { opacity: .9; } }

        dialog.agegate-dialog[open] { animation: agegate-in .34s cubic-bezier(.2,.8,.2,1); }
        dialog.agegate-dialog[open]::backdrop { animation: agegate-fade .25s ease-out; }

        /* Rotating gradient ring around the 18+ badge — the one moving thing on the gate */
        .agegate-ring {
          position: absolute; inset: 0; border-radius: 9999px; padding: 2px;
          background: conic-gradient(from 0deg, var(--gate-accent), rgba(255,255,255,.04) 45%, var(--gate-accent) 100%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
          animation: agegate-spin 7s linear infinite;
        }
        .agegate-glow { animation: agegate-glow 5s ease-in-out infinite; }

        /* Content swaps (ask -> denied) fade in instead of snapping */
        .agegate-swap { animation: agegate-fade .28s ease-out; }

        .agegate-card::after {
          content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
        }

        @media (prefers-reduced-motion: reduce) {
          dialog.agegate-dialog[open], dialog.agegate-dialog[open]::backdrop,
          .agegate-ring, .agegate-glow, .agegate-swap { animation: none; }
        }
      `}</style>

      <div className="agegate-card relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-b from-[#12202c] to-[#0a1219] p-7 text-center text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] sm:p-9">
        {/* Soft light spilling from the top of the card */}
        <div
          aria-hidden
          className="agegate-glow pointer-events-none absolute -top-24 left-1/2 h-56 w-[120%] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--gate-accent) 45%, transparent), transparent)",
          }}
        />

        <div className="relative">
          {denied ? (
            <div key="denied" className="agegate-swap">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/70"
                  aria-hidden
                >
                  <rect x="4" y="11" width="16" height="9" rx="2.5" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
              <h2
                id="agegate-title"
                className="mt-6 font-display text-[26px] font-extrabold leading-tight tracking-tight"
              >
                You must be 18 or over
              </h2>
              <p className="mx-auto mt-3 max-w-[34ch] text-[14px] leading-relaxed text-white/60">
                We can&rsquo;t let you into nofacetrap. UK law requires you to be 18 or
                older to view and buy vaping products.
              </p>
              <div className="mt-7 flex flex-col items-center gap-3">
                <Link
                  href="https://www.nhs.uk/live-well/quit-smoking/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 px-5 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gate-accent)]"
                >
                  Get help with quitting smoking
                </Link>
                <button
                  type="button"
                  onClick={() => setDenied(false)}
                  className="rounded-md px-2 py-1 text-[13px] text-white/50 underline underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gate-accent)]"
                >
                  I tapped the wrong button
                </button>
              </div>
            </div>
          ) : (
            <div key="ask" className="agegate-swap">
              {/* 18+ badge */}
              <div className="relative mx-auto h-24 w-24">
                <span className="agegate-ring" aria-hidden />
                <div
                  className="absolute inset-[6px] flex items-center justify-center rounded-full bg-[#0c161f] font-display text-[32px] font-extrabold leading-none tracking-tight"
                  role="img"
                  aria-label="18 plus"
                >
                  18
                  <span
                    className="ml-0.5 text-[22px]"
                    style={{ color: "var(--gate-accent)" }}
                  >
                    +
                  </span>
                </div>
              </div>

              <h2
                id="agegate-title"
                className="mt-7 font-display text-[28px] font-extrabold leading-tight tracking-tight"
              >
                Are you 18 or older?
              </h2>
              <p className="mx-auto mt-3 max-w-[36ch] text-[14px] leading-relaxed text-white/60">
                You need to be 18 or over to enter nofacetrap and to buy vaping
                products in the UK.
              </p>

              <div className="mt-7 space-y-2.5">
                <button
                  type="button"
                  onClick={accept}
                  autoFocus
                  className="h-[52px] w-full rounded-xl bg-white text-[15px] font-bold text-[#0a1219] shadow-[0_8px_24px_-8px_rgba(255,255,255,0.35)] transition-[transform,background-color,box-shadow] duration-150 hover:bg-white/90 active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gate-accent)]"
                >
                  Yes, I&rsquo;m 18 or over
                </button>
                <button
                  type="button"
                  onClick={() => setDenied(true)}
                  className="h-[52px] w-full rounded-xl border border-white/15 text-[15px] font-semibold text-white/70 transition-[transform,background-color,color] duration-150 hover:bg-white/[0.06] hover:text-white active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gate-accent)]"
                >
                  No, I&rsquo;m under 18
                </button>
              </div>

              <p className="mx-auto mt-6 max-w-[38ch] text-[12px] leading-relaxed text-white/40">
                By entering, you confirm you&rsquo;re of legal age to buy
                age-restricted products.{" "}
                <Link
                  href="/policies/age-verification"
                  className="font-semibold text-white/70 underline underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gate-accent)]"
                >
                  Why we verify age
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}