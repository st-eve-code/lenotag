"use client";

import { useState } from "react";
import Link from "next/link";
import type { ShopCategory } from "@/lib/catalog";

type GroupKey = "vapes" | "cannabis" | "recreational";

interface Section {
  title: string;
  items: ShopCategory[];
}

const GROUPS: { key: GroupKey; label: string }[] = [
  { key: "vapes", label: "Vape Store" },
  { key: "cannabis", label: "Cannabis" },
  { key: "recreational", label: "Recreational" },
];

function buildSections(categories: ShopCategory[], group: GroupKey): Section[] {
  const sections: Section[] = [];
  for (const category of categories) {
    if (category.group !== group) continue;
    const title = category.section ?? "More";
    const section = sections.find((s) => s.title === title);
    if (section) section.items.push(category);
    else sections.push({ title, items: [category] });
  }
  return sections;
}

export function MobileNav({ categories }: { categories: ShopCategory[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-8)] text-white transition-colors duration-[var(--duration-base)] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#91f974]"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-[99] border-t border-[#e8ece4] bg-white shadow-[0_24px_40px_-24px_rgba(8,15,21,0.35)]">
          <div className="max-h-[75vh] overflow-y-auto px-4 py-4">
            {/* Search (plain GET form to /shop?q=) */}
            <form action="/shop" method="get" role="search" className="relative">
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
                type="search"
                name="q"
                placeholder="Search products..."
                aria-label="Search products"
                className="h-11 w-full rounded-[var(--radius-pill)] border border-transparent bg-[#f3f6f0] pl-10 pr-4 text-[15px] text-[#111f2a] outline-none placeholder:text-[#6b7280] focus:border-[#5eb047] focus:bg-white"
              />
            </form>

            <Link
              href="/shop"
              onClick={close}
              className="mt-3 flex min-h-[48px] items-center justify-center rounded-[var(--radius-8)] bg-[#24591f] px-4 text-sm font-bold text-white transition-colors duration-[var(--duration-base)] hover:bg-[#1a4416]"
            >
              Shop all categories
            </Link>

            <div className="mt-6 space-y-7">
              {GROUPS.map((group) => {
                const sections = buildSections(categories, group.key);
                if (!sections.length) return null;
                return (
                  <div key={group.key}>
                    <p className="mb-3 text-xs font-semibold text-[#357a25]">
                      {group.label}
                    </p>
                    <div className="space-y-4">
                      {sections.map((section) => (
                        <div key={section.title}>
                          <p className="mb-1.5 px-1 text-xs font-semibold text-[#8a929a]">
                            {section.title}
                          </p>
                          <ul className="divide-y divide-[#eef1ea] overflow-hidden rounded-[var(--radius-16)] border border-[#e8ece4]">
                            {section.items.map((category) => (
                              <li key={category.slug}>
                                <Link
                                  href={`/shop/${category.slug}`}
                                  onClick={close}
                                  className="flex min-h-[52px] items-center justify-between gap-3 bg-white px-3.5 text-[15px] font-semibold text-[#111f2a] transition-colors duration-[var(--duration-base)] hover:bg-[#f4f9f0]"
                                >
                                  <span>{category.label}</span>
                                  <span className="tabular rounded-[var(--radius-pill)] bg-[#eefae8] px-2 py-0.5 text-xs font-semibold text-[#357a25]">
                                    {category.count}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}