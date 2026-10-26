import Image from "next/image";
import Link from "next/link";

const CDN = "https://www.vapestore.co.uk/cdn/shop/files";

interface Tile {
  label: string;
  href: string;
  image: string;
  tint: string;
}

// NOTE: E-liquid and Accessories reuse promo images as placeholders.
// Replace `image` with real category photos when you have them.
const TILES: Tile[] = [
  {
    label: "Pod kits",
    href: "/shop/pod-vape-kits",
    image: `${CDN}/G2-argus-g4-bundle-OCT-26.webp?v=1791546182&width=1062`,
    tint: "bg-[#d9f3cf]",
  },
  {
    label: "Prefilled pods",
    href: "/shop/prefilled-pods",
    image: `${CDN}/G1-cliq-new-flavs-OCT-26.webp?v=1790946480&width=828`,
    tint: "bg-[#e4e9f7]",
  },
  {
    label: "Vape kits",
    href: "/shop/vape-kits",
    image: `${CDN}/G3-oxva-xlim-4-OCT-26.webp?v=1791546175&width=610`,
    tint: "bg-[#f3e6f5]",
  },
  {
    label: "E-liquid",
    href: "/shop/e-liquid",
    image: `${CDN}/G5-innokin-kwik-OCT-26.webp?v=1791544788&width=500`,
    tint: "bg-[#fbf0d4]",
  },
  {
    label: "Accessories",
    href: "/shop/vape-accessories",
    image: `${CDN}/G4-gb-reload-OCT-26.webp?v=1791546209&width=500`,
    tint: "bg-[#dbeef7]",
  },
];

export function CategoryTiles() {
  return (
    <section
      aria-label="Shop by category"
      className="bg-[var(--color-bg-canvas)]"
    >
      <div className="container-vapestore py-6 md:py-10">
        <ul className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {TILES.map((tile) => (
            <li
              key={tile.label}
              className="w-[158px] shrink-0 snap-start md:w-auto"
            >
              <Link
                href={tile.href}
                className="group block overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-white transition-shadow duration-[var(--duration-base)] hover:shadow-[0_16px_34px_-18px_rgba(8,15,21,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5eb047]"
              >
                <div className={`relative aspect-[4/5] overflow-hidden ${tile.tint}`}>
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 20vw, 160px"
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                  <span className="text-[15px] font-bold leading-tight text-[#111f2a]">
                    {tile.label}
                  </span>
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-[#111f2a] transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5"
                    viewBox="0 0 13 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M1 6h10M7 2l4 4-4 4" />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}