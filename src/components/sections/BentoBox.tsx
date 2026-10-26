import Image from "next/image";
import Link from "next/link";

const CDN = "https://www.vapestore.co.uk/cdn/shop/files";

interface BentoTile {
  area: "promo-1" | "promo-2" | "promo-3" | "promo-4" | "promo-5";
  image: string;
  alt: string;
  title: string;
  sub?: string;
  price?: string;
  badge?: string;
  align: "end" | "between";
  href: string;
  sizes: string;
}

const TILES: BentoTile[] = [
  {
    area: "promo-1",
    image: `${CDN}/G1-cliq-new-flavs-OCT-26.webp?v=1790946480&width=828`,
    alt: "Avomi CLIQ five all new pod flavours plus three bestsellers now as kits",
    title: "NEW Avomi CLIQ Flavours",
    sub: "From 2 for \u00a310",
    align: "end",
    href: "/shop/prefilled-pods",
    sizes: "(min-width: 1024px) 33vw, 100vw",
  },
  {
    area: "promo-2",
    image: `${CDN}/G2-argus-g4-bundle-OCT-26.webp?v=1791546182&width=1062`,
    alt: "Voopoo Argus G4 pod kit bundle with a pack of pods included",
    title: "Voopoo Argus G4 Pod Kit",
    sub: "With pack of pods included",
    price: "\u00a325.99",
    badge: "Bundle",
    align: "between",
    href: "/shop/pod-vape-kits",
    sizes: "(min-width: 1024px) 33vw, 100vw",
  },
  {
    area: "promo-3",
    image: `${CDN}/G4-gb-reload-OCT-26.webp?v=1791546209&width=500`,
    alt: "Gold Bar Reload pod kit and pods on a purple blue background",
    title: "Gold Bar Reload Pod Kit & Pods",
    sub: "From \u00a31.99",
    badge: "Reduced Price",
    align: "between",
    href: "/shop/prefilled-pods",
    sizes: "(min-width: 1024px) 16vw, 50vw",
  },
  {
    area: "promo-4",
    image: `${CDN}/G5-innokin-kwik-OCT-26.webp?v=1791544788&width=500`,
    alt: "Innokin Kwik 35K pod kit on a blue purple background",
    title: "Innokin Kwik 35K Pod Kit",
    sub: "Now \u00a34.99",
    align: "between",
    href: "/shop/pod-vape-kits",
    sizes: "(min-width: 1024px) 16vw, 50vw",
  },
  {
    area: "promo-5",
    image: `${CDN}/G3-oxva-xlim-4-OCT-26.webp?v=1791546175&width=610`,
    alt: "Oxva XLIM 4 pod kit on a blue purple background",
    title: "NEW Oxva XLIM 4 Pod Kit",
    price: "\u00a316.99",
    align: "end",
    href: "/shop/vape-kits",
    sizes: "(min-width: 1024px) 33vw, 100vw",
  },
];

export function BentoBox() {
  return (
    <section className="bg-[var(--color-bg-canvas)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-3.5 md:py-[18px]">
        <div className="bento-grid">
          {TILES.map((tile) => (
            <Link
              key={tile.area}
              href={tile.href}
              className={`group relative block overflow-hidden rounded-[var(--radius-16)] border-2 border-[var(--color-border)] transition-colors duration-[var(--duration-base)] hover:border-[#bbd6ed] bento-${tile.area}`}
            >
              <Image
                src={tile.image}
                alt={tile.alt}
                fill
                sizes={tile.sizes}
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/25" />
              <div
                className={`absolute inset-0 flex flex-col p-4 text-white ${
                  tile.align === "between" ? "justify-between" : "justify-end"
                }`}
              >
                {tile.badge ? (
                  <span className="w-fit rounded-[var(--radius-8)] border-2 border-[#a2a6a8]/30 bg-[#f4e468] px-2 py-1.5 text-xs font-bold text-[#003148]">
                    {tile.badge}
                  </span>
                ) : null}

                <div className="max-w-[280px]">
                  <p className="font-display text-[18px] font-bold leading-[1.25] sm:text-[20px]">
                    {tile.title}
                  </p>
                  {tile.sub ? (
                    <p className="mt-1 text-sm font-semibold text-[#d3fdc7]">{tile.sub}</p>
                  ) : null}
                  {tile.price ? (
                    <p className="tabular mt-1 text-sm font-bold text-[#f4e468]">{tile.price}</p>
                  ) : null}
                  <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-8)] border border-white/40 bg-black/25 px-4 py-2 text-[15px] font-semibold text-white backdrop-blur-sm">
                    Shop
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
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}