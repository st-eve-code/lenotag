"use client";

import Link from "next/link";
import { SERIF } from "./serif";

const NEWSLETTER_IMAGE =
  "https://www.vapestore.co.uk/cdn/shop/files/hp-newsletter-img-4.webp?v=1729003112";

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

export function NewsletterSection() {
  return (
    <section className="bg-[var(--color-bg-canvas)]">
      <div className="container-vapestore pb-14 pt-4 md:pb-20">
        <div className="relative grid overflow-hidden rounded-[32px] bg-[#111f2a] md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_400px]">
          {/* soft lime glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#91f974]/15 blur-3xl"
          />

          <div className="relative p-7 text-white sm:p-10 md:p-12">
            <h2
              style={SERIF}
              className="text-[32px] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[40px]"
            >
              Be first to hear about{" "}
              <span className="text-[#91f974]">new drops &amp; deals</span>
            </h2>
            <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-white/70">
              New arrivals, offers and exclusive deals, straight to your inbox.
            </p>

            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-7 flex max-w-[520px] flex-col gap-2.5 sm:flex-row"
            >
              <input
                name="email"
                type="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                className="h-12 w-full rounded-[var(--radius-8)] bg-white px-4 text-[14px] text-[#111f2a] placeholder:text-[#8a96a0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#91f974]"
              />
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-8)] bg-[#91f974] px-6 text-[14px] font-bold text-[#111f2a] transition-colors duration-[var(--duration-base)] hover:bg-[#b0fa9a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <SendIcon className="h-4 w-4" />
                Subscribe
              </button>
            </form>

            <small className="mt-4 block max-w-[520px] text-[12px] leading-relaxed text-white/60">
              Sign me up for marketing emails from us. It&apos;s optional &amp;
              you can{" "}
              <Link
                href="/policies/direct-marketing-policy#emailm"
                className="text-[#91f974] underline underline-offset-2"
              >
                unsubscribe
              </Link>{" "}
              anytime. See our{" "}
              <Link href="/policies/terms-and-conditions" className="text-[#91f974]">
                Terms &amp; Conditions
              </Link>
              ,{" "}
              <Link href="/policies/privacy-policy" className="text-[#91f974]">
                Privacy Policy
              </Link>
              , and{" "}
              <Link href="/policies/direct-marketing-policy" className="text-[#91f974]">
                Direct Marketing Policy
              </Link>
              .
            </small>
          </div>

          <div
            aria-hidden="true"
            className="hidden bg-cover bg-center md:block"
            style={{ backgroundImage: `url(${NEWSLETTER_IMAGE})` }}
          />
        </div>
      </div>
    </section>
  );
}