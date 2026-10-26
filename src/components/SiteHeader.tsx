import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import { CurrencyDropdown } from "./CurrencyDropdown";
import { MobileNav } from "./MobileNav";
import { NavSearch, type SearchCategory } from "./NavSearch";
import { UspBar } from "./UspBar";
import { FavouritesNavIcon } from "./FavouritesNavIcon";
import { CartNavIcon } from "./CartNavIcon";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "lenotag";

export async function SiteHeader() {
  const categories = await getCategories();

  const searchCategories: SearchCategory[] = categories.map((category) => ({
    slug: category.slug,
    label: category.label,
    count: category.count,
  }));

  return (
    <div className="sticky top-0 z-[100]">
      {/* Announcement pill strip */}
      <div className="border-b border-[#1f2935] bg-[#080f15]">
        <div className="container-vapestore flex items-center justify-center py-1.5">
          <p className="text-center text-[12px] font-bold text-white">
            Black Market Friday &mdash; 10% off with code{" "}
            <span className="ml-0.5 rounded-[var(--radius-pill)] bg-[#91f974] px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-[#111f2a]">
              VS10
            </span>
          </p>
        </div>
      </div>

      {/* Main bar: logo | search | actions */}
      <header className="relative border-b border-white/10 bg-[#080f15]">
        <div className="container-vapestore grid h-16 grid-cols-[auto_1fr_auto] items-center gap-x-4 lg:h-[72px]">
          <div className="col-start-1 flex min-w-0 items-center gap-1 sm:gap-2">
            <MobileNav categories={categories} />
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91f974]"
            >
              <Image
                src="/logo.png"
                alt={COMPANY_NAME}
                width={60}
                height={60}
                className="h-10 w-10 rounded-full sm:h-11 sm:w-11"
                priority
              />
              <span className="font-display hidden text-[22px] font-extrabold tracking-tight text-white sm:inline">
                {COMPANY_NAME}
              </span>
            </Link>
          </div>

          <NavSearch categories={searchCategories} />

          <div className="col-start-3 flex shrink-0 items-center justify-self-end gap-2 sm:gap-3">
            <CurrencyDropdown />
            <div aria-hidden="true" className="h-6 w-px bg-white/15" />
            <FavouritesNavIcon />
            <CartNavIcon />

            <Link
              href="/shop"
              className="hidden h-10 items-center rounded-[var(--radius-8)] bg-[#91f974] px-5 text-[14px] font-bold text-[#111f2a] transition-colors duration-[var(--duration-base)] hover:bg-[#b0fa9a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:inline-flex"
            >
              Shop all
            </Link>
          </div>
        </div>
      </header>

      <UspBar />
    </div>
  );
}