"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FavouriteButton } from "@/components/FavouriteButton";
import { Price } from "@/components/Price";
import { useCart, cartKey } from "@/components/CartProvider";
import { imageSrc } from "@/lib/image";
import type { ShowcaseProduct } from "@/lib/catalog";

const PAGE_SIZE = 12;

function pageNumbers(current: number, pages: number): Array<number | "..."> {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, pages, current - 1, current, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out: Array<number | "..."> = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) out.push("...");
    out.push(n);
    prev = n;
  }
  return out;
}

function CartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2.2l2.3 12.2a1.6 1.6 0 0 0 1.6 1.3h9.2a1.6 1.6 0 0 0 1.6-1.3L21 7H6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

const PAGE_LINK =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-[var(--radius-pill)] px-3.5 text-[14px] font-semibold transition-colors duration-[var(--duration-base)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5eb047]";

export function BestProducts({ items }: { items: ShowcaseProduct[] }) {
  const [page, setPage] = useState(1);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addItem } = useCart();

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  if (!items.length) {
    return (
      <p className="py-12 text-center text-sm text-[var(--color-text-muted)]">
        No products available right now.
      </p>
    );
  }

  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

  const goTo = (next: number) => {
    const target = Math.min(Math.max(1, next), pages);
    if (target === current) return;
    setPage(target);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAdd = (item: ShowcaseProduct) => {
    addItem({
      category: item.category,
      slug: item.slug,
      title: item.title,
      brand: item.brand,
      price: item.price,
      image: item.image,
      href: item.href,
    });
    // brief "Added" confirmation on this card's button
    setJustAdded(cartKey(item));
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setJustAdded(null), 1500);
  };

  return (
    <div ref={gridRef} className="scroll-mt-28">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {visible.map((item) => {
          const added = justAdded === cartKey(item);
          return (
            <article
              key={cartKey(item)}
              className="group relative flex flex-col overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white p-2 transition-shadow duration-[var(--duration-base)] hover:shadow-[0_18px_38px_-20px_rgba(8,15,21,0.4)]"
            >
              <FavouriteButton
                item={{
                  category: item.category,
                  slug: item.slug,
                  title: item.title,
                  brand: item.brand,
                  price: item.price,
                  image: item.image,
                  href: item.href,
                }}
                className="absolute right-4 top-4 z-10 h-8 w-8 bg-white/90 shadow-[var(--shadow-sm)] backdrop-blur-sm hover:bg-white"
              />
              <Link
                href={item.href}
                className="relative block overflow-hidden rounded-[18px] bg-[#f4f9f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5eb047]"
              >
                {item.image ? (
                  <Image
                    src={imageSrc(item.image.file)}
                    alt={item.title}
                    width={item.image.width ?? 800}
                    height={item.image.height ?? 800}
                    className="aspect-square w-full object-cover transition-transform duration-700 ease-[var(--ease-custom-1)] group-hover:scale-105 motion-reduce:transition-none"
                    unoptimized
                  />
                ) : (
                  <div className="aspect-square w-full bg-[#f4f9f0]" />
                )}
              </Link>

              <div className="flex grow flex-col px-2 pb-1 pt-3.5">
                <span className="mb-1 text-[12px] font-semibold text-[#357a25]">
                  {item.brand}
                </span>
                <Link
                  href={item.href}
                  className="mb-2 line-clamp-2 text-[14px] font-semibold leading-[1.35] text-[#111f2a] md:text-[15px]"
                >
                  {item.title}
                </Link>

                <div className="mt-auto flex flex-col gap-3 pt-3">
                  <Price
                    price={item.price}
                    className="tabular text-[18px] font-extrabold leading-tight text-[#111f2a]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    aria-label={`Add ${item.title} to cart`}
                    className={`flex h-11 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-8)] px-2 text-[14px] font-bold transition-colors duration-[var(--duration-moderate)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5eb047] md:px-3 md:text-[15px] ${
                      added
                        ? "bg-[var(--color-green-dark)] text-white"
                        : "bg-[#111f2a] text-white hover:bg-[#1f3345]"
                    }`}
                  >
                    {added ? <CheckIcon /> : <CartIcon />}
                    <span aria-live="polite">{added ? "Added" : "Add to cart"}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {pages > 1 ? (
        <nav
          aria-label="Products pagination"
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={current === 1}
            className={`${PAGE_LINK} border border-[var(--color-border)] bg-white text-[#111f2a] hover:bg-[#f4f9f0] disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Previous
          </button>

          {pageNumbers(current, pages).map((n, i) =>
            n === "..." ? (
              <span
                key={`gap-${i}`}
                className="px-1 text-sm text-[var(--color-gray-dark)]"
              >
                &hellip;
              </span>
            ) : n === current ? (
              <span
                key={n}
                aria-current="page"
                className={`${PAGE_LINK} bg-[#111f2a] text-white`}
              >
                {n}
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => goTo(n)}
                className={`${PAGE_LINK} border border-[var(--color-border)] bg-white text-[#111f2a] hover:bg-[#f4f9f0]`}
              >
                {n}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => goTo(current + 1)}
            disabled={current === pages}
            className={`${PAGE_LINK} border border-[var(--color-border)] bg-white text-[#111f2a] hover:bg-[#f4f9f0] disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}