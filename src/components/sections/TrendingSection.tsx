import Link from "next/link";
import { getShowcaseProducts } from "@/lib/catalog";
import { BestProducts } from "./BestProducts";
import { SERIF } from "./serif";

export async function TrendingSection() {
  const items = await getShowcaseProducts(5);

  if (!items.length) {
    return null;
  }

  return (
    <section className="bg-[var(--color-bg-canvas)]">
      <div className="container-vapestore py-14 md:py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-[13px] font-semibold text-[#357a25]">
              Best sellers
            </p>
            <h2
              style={SERIF}
              className="text-[34px] font-medium leading-[1.08] tracking-[-0.02em] text-[#111f2a] sm:text-[44px]"
            >
              What everyone&rsquo;s{" "}
              <span className="text-[#357a25]">buying right now</span>
            </h2>
            <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-[var(--color-text-muted)]">
              A hand-picked mix of our most popular vapes, pods and kits.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex h-11 items-center rounded-[var(--radius-8)] border border-[var(--color-border)] bg-white px-5 text-sm font-bold text-[#111f2a] shadow-sm transition-colors duration-[var(--duration-base)] hover:bg-[#f4f9f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5eb047]"
          >
            Shop all products
          </Link>
        </div>

        <BestProducts items={items} />
      </div>
    </section>
  );
}