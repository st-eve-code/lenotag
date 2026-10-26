import Link from "next/link";
import type { NavSectionData } from "@/lib/catalog";

/**
 * Centred top-level links. The mega dropdown is positioned against the
 * <header className="relative"> in SiteHeader, so it spans the full bar width.
 */
export function NavMenu({ menu }: { menu: NavSectionData[] }) {
  return (
    <nav
      className="col-start-2 hidden min-w-0 justify-self-center lg:block"
      aria-label="Shop by category"
    >
      <div className="flex items-center justify-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {menu.map((section) => (
          <div key={section.label} className="group static">
            <Link
              href={section.href}
              className="flex h-[72px] items-center whitespace-nowrap border-b-2 border-transparent px-3.5 text-[14px] font-semibold text-[#111f2a]/75 transition-colors duration-[var(--duration-base)] hover:border-[#5eb047] hover:text-[#111f2a] group-hover:border-[#5eb047] group-hover:text-[#111f2a] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#5eb047]"
            >
              {section.label}
            </Link>

            <div className="invisible absolute inset-x-0 top-full z-50 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="border-b border-t border-[#e8ece4] bg-white shadow-[0_24px_40px_-24px_rgba(8,15,21,0.35)]">
                <div className="container-vapestore py-7">
                  {section.products.length ? (
                    <ul className="grid grid-cols-2 gap-x-5 gap-y-0.5 md:grid-cols-3 lg:grid-cols-5">
                      {section.products.map((product) => (
                        <li key={product.href}>
                          <Link
                            href={product.href}
                            className="block truncate rounded-[var(--radius-8)] px-2.5 py-2 text-[14px] font-semibold text-[#111f2a] transition-colors duration-[var(--duration-base)] hover:bg-[#eefae8]"
                          >
                            {product.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-2.5 py-2 text-sm text-[var(--color-text-muted)]">
                      No products yet.
                    </p>
                  )}

                  <Link
                    href={section.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#357a25] transition-colors duration-[var(--duration-base)] hover:text-[#111f2a]"
                  >
                    View all {section.total.toLocaleString()} products
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 13 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M5 9l3-3-3-3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}