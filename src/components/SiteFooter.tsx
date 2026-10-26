"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "lenotag";
const COMPANY_ADDRESS = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "";
const COMPANY_NUMBER = process.env.NEXT_PUBLIC_COMPANY_NUMBER || "";

const COLUMNS: FooterColumn[] = [
  {
    title: "Customer Service",
    links: [
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: `About ${COMPANY_NAME}`,
    links: [
      { label: "Environment Policy", href: "/policies/environment-policy" },
      { label: "Quality Policy", href: "/policies/quality-policy" },
    ],
  },
  {
    title: "Shop Our Range",
    links: [
      { label: "E-Liquid", href: "/shop/e-liquid" },
      { label: "Vape Kits", href: "/shop/vape-kits" },
      { label: "Pod Kits", href: "/shop/pod-vape-kits" },
      { label: "Tanks", href: "/shop/vape-tanks" },
      { label: "Coils", href: "/shop/coils" },
      { label: "Accessories", href: "/shop/vape-accessories" },
      { label: "Best Sellers", href: "/shop" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/policies/terms-and-conditions" },
      { label: "Privacy Policy", href: "/policies/privacy-policy" },
      { label: "Cookie Policy", href: "/policies/cookie-policy" },
      { label: "Age Verification", href: "/policies/age-verification" },
      { label: "Direct Marketing Policy", href: "/policies/direct-marketing-policy" },
      { label: "PECR Policy", href: "/policies/pecr-policy" },
    ],
  },
];

function Column({ column }: { column: FooterColumn }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full md:w-1/5">
      <nav className="flex flex-col md:gap-y-2">
        <p className="flex items-center justify-between py-4 text-[14px] font-bold text-white md:py-0">
          {column.title}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={`Toggle ${column.title}`}
            className="md:hidden"
          >
            <svg
              width="16"
              height="17"
              viewBox="0 0 16 17"
              fill="none"
              className={`cursor-pointer transition-transform duration-500 ${open ? "rotate-45" : ""}`}
            >
              <path
                d="M7.99998 4.05811V13.3914M3.33331 8.72477H12.6666"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </p>
        <div
          className={`overflow-hidden border-b border-white/10 transition-[max-height] duration-500 md:border-b-0 md:max-h-none ${
            open ? "max-h-[600px]" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-y-3 pb-4">
            {column.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-xs leading-[1.5] text-white/60 transition-colors duration-[var(--duration-base)] hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#080f15] px-4 py-5 md:py-9">
      <div className="mx-auto flex max-w-[1280px] flex-col justify-between">
        <div className="flex flex-col justify-center gap-y-7 md:flex-row md:justify-between md:gap-y-0">
          <div className="flex flex-col items-center md:max-w-[305px] md:items-start">
            <Link href="/" className="mb-4 flex max-w-[197px] items-center gap-2.5 md:mb-9">
              <Image
                src="/logo.png"
                alt={COMPANY_NAME}
                width={60}
                height={60}
                className="h-11 w-11 rounded-full"
              />
              <span className="text-2xl font-extrabold tracking-tight text-white">
                {COMPANY_NAME}
              </span>
            </Link>
            {COMPANY_ADDRESS || COMPANY_NUMBER ? (
              <div className="hidden md:block">
                <p className="mb-2 text-[14px] font-bold text-white">Company Details</p>
                <div className="text-sm text-white/60">
                  {COMPANY_ADDRESS ? <p>Address: {COMPANY_ADDRESS}</p> : null}
                  {COMPANY_NUMBER ? <p>Company number: {COMPANY_NUMBER}</p> : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex w-full max-w-[848px] flex-col gap-x-5 md:flex-row">
            {COLUMNS.map((column) => (
              <Column key={column.title} column={column} />
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-y-4 border-t border-white/10 pt-6 md:flex-row">
          <div className="flex items-center gap-3">
            <Image
              src="/age-18.png"
              alt="18+"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0"
            />
            <p className="text-xs leading-[1.5] text-white/70">
              You must be 18 or over to purchase from this website
            </p>
          </div>
          <small className="text-xs leading-[1.5] text-white">
            © 2026 <Link href="/" className="hover:underline">{COMPANY_NAME}</Link>
            <span className="ml-1">all rights reserved</span>
          </small>
        </div>
      </div>
    </footer>
  );
}
