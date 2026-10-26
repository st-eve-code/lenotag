import Image from "next/image";
import Link from "next/link";
import { SERIF } from "./serif";

const CDN = "https://www.vapestore.co.uk/cdn/shop/files";
// Swap this for any product shot you like.
const HERO_IMAGE = `${CDN}/G2-argus-g4-bundle-OCT-26.webp?v=1791546182&width=1062`;

const CHECKS = [
  "Top vape brands",
  "Bitcoin & WhatsApp checkout",
  "Prices in GBP, USD & EUR",
];

function Check() {
  return (
    <svg
      className="h-[18px] w-[18px] shrink-0 text-[#357a25]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.3 2.4 2.4 4.6-5" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg
      className="h-3 w-3"
      viewBox="0 0 13 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 9l3-3-3-3" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="bg-[var(--color-bg-canvas)]">
      <div className="container-vapestore grid items-center gap-10 py-10 md:grid-cols-[1.05fr_1fr] md:gap-12 md:py-16 lg:gap-16">
        <div>
          <Link
            href="/shop/prefilled-pods"
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[#cfe9c4] bg-[#eefae8] px-3.5 py-1.5 text-[13px] font-semibold text-[#1f4d14] transition-colors duration-[var(--duration-base)] hover:bg-[#d3fdc7]"
          >
            New in: Avomi CLIQ flavours &amp; Oxva XLIM 4
            <Arrow />
          </Link>

          <h1
            style={SERIF}
            className="mt-6 text-[42px] font-medium leading-[1.05] tracking-[-0.02em] text-[#111f2a] sm:text-[54px] lg:text-[68px]"
          >
            Vaping,
            <br />
            <span className="text-[#357a25]">made simple</span> for
            <br />
            real life.
          </h1>

          <p className="mt-6 max-w-[460px] text-[16px] leading-relaxed text-[var(--color-text-muted)]">
            Pods, kits, e-liquid and more from the brands you already know. Pick
            what you want, check out your way, and it&rsquo;s on its way.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5">
            {CHECKS.map((label) => (
              <li
                key={label}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#111f2a]"
              >
                <Check />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center rounded-[var(--radius-8)] bg-[#111f2a] px-7 text-[15px] font-bold text-white transition-colors duration-[var(--duration-base)] hover:bg-[#1f3345] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5eb047]"
            >
              Shop all
            </Link>
            <Link
              href="/shop/pod-vape-kits"
              className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-8)] border border-[var(--color-border)] bg-white px-6 text-[15px] font-semibold text-[#111f2a] shadow-sm transition-colors duration-[var(--duration-base)] hover:bg-[#f4f9f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5eb047]"
            >
              Browse pod kits
              <Arrow />
            </Link>
          </div>
        </div>

        {/* Product panel with floating card */}
        <div className="relative">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[32px] bg-[#d9f3cf] md:aspect-square">
            <Image
              src={HERO_IMAGE}
              alt="Voopoo Argus G4 pod kit bundle with a pack of pods included"
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              unoptimized
              className="object-cover"
            />
          </div>

          <Link
            href="/shop/pod-vape-kits"
            className="absolute -bottom-5 left-4 right-4 rounded-2xl bg-white p-4 shadow-[0_18px_40px_-14px_rgba(8,15,21,0.35)] transition-transform duration-[var(--duration-base)] hover:-translate-y-0.5 motion-reduce:transition-none sm:left-auto sm:right-6 sm:w-[270px]"
          >
            <p className="text-[12px] font-semibold text-[#357a25]">Bundle deal</p>
            <p className="mt-1 text-[15px] font-bold leading-snug text-[#111f2a]">
              Voopoo Argus G4 pod kit
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
              With a pack of pods included
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="tabular text-[17px] font-extrabold text-[#111f2a]">
                &pound;25.99
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#111f2a]">
                See the bundle
                <Arrow />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}