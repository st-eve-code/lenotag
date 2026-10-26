"use client";

import Link from "next/link";
import { useFavourites } from "./FavouritesProvider";
import { HeartIcon } from "./FavouriteButton";

export function FavouritesNavIcon() {
  const { count } = useFavourites();

  return (
    <Link
      href="/favourites"
      aria-label={`Favourites (${count})`}
      className="relative text-[#111f2a] transition-colors duration-[var(--duration-base)] hover:text-[#357a25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5eb047]"
    >
      <HeartIcon className="h-[22px] w-[22px]" />
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}