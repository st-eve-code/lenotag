"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useCart } from "@/components/CartProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { convertAmount, formatPrice } from "@/lib/currency";
import { imageSrc } from "@/lib/image";

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

// Set these in .env.local (see instructions):
//   NEXT_PUBLIC_WHATSAPP_NUMBER=447123456789   (country code, digits only)
//   NEXT_PUBLIC_BTC_ADDRESS=bc1...             (your RECEIVING address only)
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const BTC_ADDRESS = process.env.NEXT_PUBLIC_BTC_ADDRESS ?? "";

// Shipping: a flat fee, discounted when the cart subtotal is above the threshold.
const SHIPPING_FEE = Number(process.env.NEXT_PUBLIC_SHIPPING_FEE ?? 0);
const SHIPPING_DISCOUNT_PERCENT = Number(
  process.env.NEXT_PUBLIC_SHIPPING_DISCOUNT_PERCENT ?? 25,
);
const SHIPPING_DISCOUNT_THRESHOLD = Number(
  process.env.NEXT_PUBLIC_SHIPPING_DISCOUNT_THRESHOLD ?? 1000,
);

// Accent for the checkout method check circles (buttons are black, like the rest of the site).
const CHECKOUT_ACCENT = "#000000";

// Height (px) of the tear-off section of the receipt that holds the buttons.
const STUB_H = 156;

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "nofacetrap";

type Method = "whatsapp" | "bitcoin";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const ROW_COLS = "md:grid-cols-[96px_minmax(0,2fr)_1fr_132px_1fr_28px]";

export default function CartPage() {
  const { items, count, ready, setQuantity, removeItem, clear } = useCart();
  const { currency } = useCurrency();
  // Everything is shown in the currency the customer picked in the header
  const fmt = (n: number) => formatPrice(n, n, currency);

  const [method, setMethod] = useState<Method>("whatsapp");
  const [showBtc, setShowBtc] = useState(false);
  const [rate, setRate] = useState<number | null>(null);
  const [rateState, setRateState] = useState<"idle" | "loading" | "error">("idle");
  const [copied, setCopied] = useState<"address" | "amount" | "receipt" | null>(null);

  // Receipt step
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const btcRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (receiptOpen && !d.open) d.showModal();
    if (!receiptOpen && d.open) d.close();
  }, [receiptOpen]);

  const lines = items.map((item) => {
    const unit = item.price
      ? convertAmount(item.price.min, item.price.currency, currency)
      : null;
    return { item, unit, total: unit !== null ? unit * item.quantity : null };
  });
  const complete = lines.every((l) => l.total !== null);
  const subtotal = complete ? lines.reduce((s, l) => s + (l.total ?? 0), 0) : null;

  // Shipping discount: applies when the cart subtotal is above the threshold.
  const shippingDiscountApplies =
    subtotal !== null && subtotal > SHIPPING_DISCOUNT_THRESHOLD;
  const shippingDiscount = shippingDiscountApplies
    ? (SHIPPING_FEE * SHIPPING_DISCOUNT_PERCENT) / 100
    : 0;
  const shipping = SHIPPING_FEE - shippingDiscount;
  const total = subtotal !== null ? subtotal + shipping : null;

  const btcAmount =
    total !== null && rate ? (total / rate).toFixed(8) : null;

  const loadRate = useCallback(async () => {
    setRateState("loading");
    try {
      const cur = currency.toLowerCase();
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${cur}`,
      );
      const data = await res.json();
      const value = data?.bitcoin?.[cur];
      if (typeof value !== "number") throw new Error("bad rate");
      setRate(value);
      setRateState("idle");
    } catch {
      setRateState("error");
    }
  }, [currency]);

  // (Re)load the Bitcoin rate when the panel opens or the currency changes
  useEffect(() => {
    if (method === "bitcoin" && showBtc) {
      setRate(null);
      void loadRate();
    }
  }, [method, showBtc, loadRate]);

  const buildMessage = (extra?: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const rows = lines.map(({ item, total }, i) => {
      const price = total !== null ? ` - ${fmt(total)}` : "";
      return `${i + 1}. ${item.title} (${item.brand}) x${item.quantity}${price}\n${origin}${item.href}`;
    });
    return [
      "Hi, I'd like to place an order:",
      orderRef ? `Order ref: ${orderRef}` : "",
      "",
      ...rows,
      "",
      subtotal !== null ? `Subtotal: ${fmt(subtotal)}` : "",
      subtotal !== null
        ? `Shipping${shippingDiscountApplies ? ` (${SHIPPING_DISCOUNT_PERCENT}% discount)` : ""}: ${fmt(shipping)}`
        : "",
      total !== null ? `Total: ${fmt(total)}` : "",
      extra ?? "",
    ]
      .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
      .join("\n")
      .trim();
  };

  const whatsappUrl = (extra?: string) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(extra))}`;

  // Step 1: "Proceed to checkout" shows the receipt
  const openReceipt = () => {
    setOrderRef(`ORD-${Date.now().toString(36).toUpperCase().slice(-6)}`);
    setReceiptDate(
      new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
    );
    setReceiptOpen(true);
  };

  // Step 2: from the receipt, continue with the chosen method
  const proceedFromReceipt = () => {
    setReceiptOpen(false);
    if (method === "whatsapp") {
      window.open(
        whatsappUrl("Please send me the payment details."),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    setShowBtc(true);
    setTimeout(
      () => btcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      80,
    );
  };

  const copy = async (text: string, what: "address" | "amount" | "receipt") => {
    const done = () => {
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    };
    try {
      await navigator.clipboard.writeText(text);
      done();
    } catch {
      // Fallback for browsers that block the clipboard API
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch {
        /* clipboard unavailable */
      }
    }
  };

  const configMissing =
    method === "whatsapp" ? !WHATSAPP_NUMBER : !BTC_ADDRESS;

  const methodName = method === "whatsapp" ? "WhatsApp" : "Bitcoin";

  // Plain-text version of the receipt for the copy button
  const receiptText = () =>
    [
      `${COMPANY_NAME} - Order receipt`,
      `Reference: ${orderRef}`,
      `Date: ${receiptDate}`,
      `Payment: ${method === "whatsapp" ? "WhatsApp order" : "Bitcoin"}`,
      "",
      ...lines.map(({ item, unit, total }) => {
        const each = unit !== null ? ` @ ${fmt(unit)}` : "";
        const sum = total !== null ? ` = ${fmt(total)}` : "";
        return `${item.quantity} x ${item.title}${each}${sum}`;
      }),
      "",
      `Subtotal (${count} ${count === 1 ? "item" : "items"}): ${subtotal !== null ? fmt(subtotal) : "-"}`,
      `Shipping${shippingDiscountApplies ? ` (${SHIPPING_DISCOUNT_PERCENT}% discount)` : ""}: ${fmt(shipping)}`,
      `Total: ${total !== null ? fmt(total) : "-"}`,
    ].join("\n");

  return (
    <section
      className="bg-[var(--color-bg-canvas)]"
      style={{ "--checkout-accent": CHECKOUT_ACCENT } as CSSProperties}
    >
      <div className="container-vapestore py-10 sm:py-14">
        {/* Title row */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="font-display text-[34px] font-extrabold leading-none text-[var(--color-text-primary)] sm:text-[48px]">
            My Cart
          </h1>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-[var(--radius-8)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-bold text-[var(--color-text-primary)] transition-colors duration-150 hover:bg-[var(--color-bg-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <ArrowLeft />
            <span className="hidden sm:inline">Continue shopping</span>
            <span className="sm:hidden">Shop</span>
          </Link>
        </div>

        {!ready ? (
          <div className="h-48 animate-pulse rounded-[var(--radius-12)] bg-[var(--color-bg-surface)] motion-reduce:animate-none" />
        ) : items.length === 0 ? (
          <div className="rounded-[var(--radius-12)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] px-6 py-16 text-center">
            <p className="text-base font-bold text-[var(--color-text-primary)]">
              Your cart is empty.
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Add a product and it will show up here.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex rounded-[var(--radius-8)] bg-black px-5 py-2.5 text-[15px] font-semibold text-white transition-colors duration-[var(--duration-moderate)] hover:bg-[#111f2a]"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            {/* Column headings (desktop) */}
            <div
              className={`hidden border-b border-[var(--color-border)] pb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-gray-dark)] md:grid md:items-center md:gap-x-4 ${ROW_COLS}`}
              aria-hidden="true"
            >
              <span />
              <span>Product</span>
              <span>Price</span>
              <span>Qty</span>
              <span>Total</span>
              <span />
            </div>

            {/* Rows */}
            <ul className="divide-y divide-[var(--color-border)] border-b border-[var(--color-border)] md:border-b-0">
              {lines.map(({ item, unit, total }) => (
                <li
                  key={item.key}
                  className={`grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 py-5 md:gap-x-4 ${ROW_COLS}`}
                >
                  <Link
                    href={item.href}
                    className="relative col-start-1 row-span-2 row-start-1 aspect-square w-full overflow-hidden rounded-[var(--radius-4)] bg-[var(--color-bg-surface)] md:col-auto md:row-auto md:row-span-1"
                  >
                    {item.image ? (
                      <Image
                        src={imageSrc(item.image.file)}
                        alt={item.title}
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="col-start-2 row-start-1 min-w-0 md:col-auto md:row-auto">
                    <Link
                      href={item.href}
                      className="line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--color-text-primary)] hover:text-[#2563eb]"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {item.brand}
                    </p>
                    {/* unit price on mobile */}
                    <p className="mt-1 text-xs text-[var(--color-text-muted)] md:hidden">
                      {unit !== null ? fmt(unit) : "—"} each
                    </p>
                  </div>

                  {/* unit price on desktop */}
                  <div className="hidden text-[15px] font-semibold text-[var(--color-text-primary)] md:block">
                    {unit !== null ? fmt(unit) : "—"}
                  </div>

                  <div
                    className="col-start-2 row-start-2 inline-flex w-fit items-center md:col-auto md:row-auto"
                    role="group"
                    aria-label={`Quantity for ${item.title}`}
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="grid h-8 w-8 place-items-center rounded-full text-lg text-[var(--color-text-muted)] transition-colors duration-150 hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      &minus;
                    </button>
                    <span
                      className="min-w-8 text-center text-[15px] font-semibold tabular-nums"
                      aria-live="polite"
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="grid h-8 w-8 place-items-center rounded-full text-lg text-[var(--color-text-muted)] transition-colors duration-150 hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                    >
                      +
                    </button>
                  </div>

                  <div className="col-start-3 row-start-2 text-right text-[16px] font-bold tabular-nums text-[var(--color-text-primary)] md:col-auto md:row-auto md:text-left">
                    {total !== null ? fmt(total) : "—"}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label={`Remove ${item.title}`}
                    className="col-start-3 row-start-1 grid h-8 w-8 place-items-center justify-self-end rounded-full text-xl leading-none text-[var(--color-gray-dark)] transition-colors duration-150 hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] md:col-auto md:row-auto"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-3">
              <button
                type="button"
                onClick={clear}
                className="text-[13px] font-semibold text-[var(--color-text-muted)] underline-offset-4 transition-colors duration-150 hover:text-[var(--color-text-primary)] hover:underline"
              >
                Clear cart
              </button>
            </div>

            {/* Checkout panel */}
            <div className="mt-10 grid gap-10 rounded-[18px] bg-[var(--color-bg-surface)] p-6 shadow-[0_14px_34px_-14px_rgba(17,31,42,0.28)] sm:p-9 md:grid-cols-[1fr_minmax(0,330px)] md:gap-16">
              <fieldset>
                <legend className="font-display text-[19px] font-bold text-[var(--color-text-primary)]">
                  Choose checkout method:
                </legend>

                <div className="mt-6 space-y-5">
                  {(
                    [
                      {
                        id: "whatsapp" as const,
                        title: "Order on WhatsApp",
                        hint: "( we reply with payment details )",
                        note: "Your order is sent to us as a chat message",
                      },
                      {
                        id: "bitcoin" as const,
                        title: "Pay with Bitcoin",
                        hint: "( live rate )",
                        note: "Pay from any wallet, then confirm on WhatsApp",
                      },
                    ]
                  ).map((opt) => (
                    <label key={opt.id} className="flex cursor-pointer items-start gap-3.5">
                      <input
                        type="radio"
                        name="checkout-method"
                        value={opt.id}
                        checked={method === opt.id}
                        onChange={() => {
                          setMethod(opt.id);
                          if (opt.id === "whatsapp") setShowBtc(false);
                        }}
                        className="peer sr-only"
                      />
                      <span className="mt-px grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border border-[#c3c9d0] bg-white text-white transition-colors duration-150 peer-checked:border-[var(--checkout-accent)] peer-checked:bg-[var(--checkout-accent)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-accent)] [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                        <Check />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] leading-tight">
                          <span className="font-bold text-[var(--color-text-primary)]">{opt.title}</span>{" "}
                          <span className="text-[11px] text-[var(--color-text-muted)]">{opt.hint}</span>
                        </span>
                        <span className="mt-1.5 block text-[11px] leading-tight text-[var(--color-text-muted)]">
                          {opt.note}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col md:pt-1">
                <dl className="text-[12px]">
                  <div className="flex items-center justify-between border-b border-[#d6dbe1] py-3">
                    <dt className="text-[11px] uppercase tracking-[0.03em] text-[var(--color-text-muted)]">
                      Subtotal ({count} {count === 1 ? "item" : "items"})
                    </dt>
                    <dd className="font-medium tabular-nums text-[var(--color-text-primary)]">
                      {subtotal !== null ? fmt(subtotal) : "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#d6dbe1] py-3">
                    <dt className="text-[11px] uppercase tracking-[0.03em] text-[var(--color-text-muted)]">
                      Shipping
                      {shippingDiscountApplies ? (
                        <span className="ml-1.5 normal-case tracking-normal text-[#15803d]">
                          ({SHIPPING_DISCOUNT_PERCENT}% discount)
                        </span>
                      ) : null}
                    </dt>
                    <dd className="font-medium tabular-nums text-[var(--color-text-primary)]">
                      {shippingDiscountApplies ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-[var(--color-text-muted)] line-through">
                            {fmt(SHIPPING_FEE)}
                          </span>
                          <span>{fmt(shipping)}</span>
                        </span>
                      ) : (
                        fmt(shipping)
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-[11px] uppercase tracking-[0.03em] text-[var(--color-text-muted)]">
                      Total
                    </dt>
                    <dd className="font-medium tabular-nums text-[var(--color-text-primary)]">
                      {total !== null ? fmt(total) : "—"}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={openReceipt}
                  disabled={configMissing}
                  className="mt-3 flex h-12 w-full items-center justify-between gap-3 rounded-[8px] bg-black px-4 text-[14px] font-bold text-white transition-colors duration-[var(--duration-moderate)] hover:bg-[#111f2a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>Proceed to checkout</span>
                  <span className="tabular-nums">{total !== null ? fmt(total) : ""}</span>
                </button>

                {configMissing ? (
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                    {method === "whatsapp"
                      ? "Add NEXT_PUBLIC_WHATSAPP_NUMBER to .env.local to enable this."
                      : "Add NEXT_PUBLIC_BTC_ADDRESS to .env.local to enable this."}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Bitcoin payment details */}
            {method === "bitcoin" && showBtc ? (
              <div
                ref={btcRef}
                className="mt-6 scroll-mt-40 rounded-[var(--radius-16)] border border-[var(--color-border)] p-5 sm:p-8"
              >
                <h2 className="font-display text-[20px] font-extrabold text-[var(--color-text-primary)]">
                  Bitcoin payment
                </h2>
                {orderRef ? (
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Order ref {orderRef}
                  </p>
                ) : null}

                {total === null ? (
                  <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                    We couldn&rsquo;t work out the cart total, so the Bitcoin amount can&rsquo;t be calculated.
                  </p>
                ) : !rate && rateState !== "error" ? (
                  <p className="mt-3 text-sm text-[var(--color-text-muted)]">Fetching the live rate…</p>
                ) : rateState === "error" && !rate ? (
                  <div className="mt-3 text-sm text-[var(--color-text-muted)]">
                    Couldn&rsquo;t fetch the Bitcoin rate.{" "}
                    <button
                      type="button"
                      onClick={() => void loadRate()}
                      className="font-semibold text-[var(--color-text-primary)] underline underline-offset-4"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-5 md:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-gray-dark)]">
                        Send exactly
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-3">
                        <span className="text-[22px] font-extrabold tabular-nums text-[var(--color-text-primary)]">
                          {btcAmount} BTC
                        </span>
                        <button
                          type="button"
                          onClick={() => btcAmount && copy(btcAmount, "amount")}
                          className="text-[13px] font-semibold text-[var(--color-text-muted)] underline underline-offset-4 hover:text-[var(--color-text-primary)]"
                        >
                          {copied === "amount" ? "Copied" : "Copy amount"}
                        </button>
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        &asymp; {total !== null ? fmt(total) : ""} at 1 BTC = {rate ? fmt(rate) : "…"}.{" "}
                        <button
                          type="button"
                          onClick={() => void loadRate()}
                          className="font-semibold underline underline-offset-4 hover:text-[var(--color-text-primary)]"
                        >
                          {rateState === "loading" ? "Refreshing…" : "Refresh rate"}
                        </button>
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-gray-dark)]">
                        To this address
                      </p>
                      <p className="mt-1 break-all rounded-[var(--radius-8)] bg-[var(--color-bg-surface)] px-3 py-2 font-mono text-[13px] text-[var(--color-text-primary)]">
                        {BTC_ADDRESS}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-4 text-[13px] font-semibold">
                        <button
                          type="button"
                          onClick={() => copy(BTC_ADDRESS, "address")}
                          className="text-[var(--color-text-muted)] underline underline-offset-4 hover:text-[var(--color-text-primary)]"
                        >
                          {copied === "address" ? "Copied" : "Copy address"}
                        </button>
                        <a
                          href={`bitcoin:${BTC_ADDRESS}?amount=${btcAmount}`}
                          className="text-[var(--color-text-muted)] underline underline-offset-4 hover:text-[var(--color-text-primary)]"
                        >
                          Open in wallet
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 border-t border-[var(--color-border)] pt-5">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Once you&rsquo;ve sent the payment, send us your order and the transaction ID so we can confirm it.
                  </p>
                  <a
                    href={whatsappUrl(
                      btcAmount
                        ? `I paid ${btcAmount} BTC to ${BTC_ADDRESS}.\nTransaction ID: `
                        : "I paid with Bitcoin.\nTransaction ID: ",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-3 inline-flex items-center gap-2 rounded-[var(--radius-8)] bg-black px-5 py-2.5 text-[15px] font-semibold text-white transition-colors duration-[var(--duration-moderate)] hover:bg-[#111f2a] ${
                      !WHATSAPP_NUMBER ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <ChatIcon />
                    I&rsquo;ve paid &mdash; send details on WhatsApp
                  </a>
                </div>
              </div>
            ) : null}

            {/* Receipt */}
            <style>{`
              @keyframes receipt-in { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
              @keyframes receipt-fade { from { opacity: 0; } to { opacity: 1; } }
              dialog.receipt-dialog[open] { animation: receipt-in .26s cubic-bezier(.2,.8,.2,1); }
              dialog.receipt-dialog[open]::backdrop { animation: receipt-fade .2s ease-out; }
              @media (prefers-reduced-motion: reduce) {
                dialog.receipt-dialog[open], dialog.receipt-dialog[open]::backdrop { animation: none; }
              }
            `}</style>
            <dialog
              ref={dialogRef}
              onClose={() => setReceiptOpen(false)}
              onClick={(e) => {
                if (e.target === dialogRef.current) setReceiptOpen(false);
              }}
              aria-labelledby="receipt-title"
              className="receipt-dialog m-auto max-h-[100dvh] w-full max-w-[460px] overflow-y-auto overflow-x-hidden bg-transparent p-4 backdrop:bg-[#0b1218]/55 backdrop:backdrop-blur-[3px]"
            >
              <div className="drop-shadow-[0_20px_36px_rgba(8,15,21,0.3)]">
                {/* The sheet: side notches are cut out at the tear line */}
                <div
                  className="bg-white text-[var(--color-text-primary)]"
                  style={{
                    WebkitMask: `radial-gradient(11px at 0 calc(100% - ${STUB_H}px), #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(11px at 100% calc(100% - ${STUB_H}px), #0000 97%, #000) right / 51% 100% no-repeat`,
                    mask: `radial-gradient(11px at 0 calc(100% - ${STUB_H}px), #0000 97%, #000) left / 51% 100% no-repeat, radial-gradient(11px at 100% calc(100% - ${STUB_H}px), #0000 97%, #000) right / 51% 100% no-repeat`,
                  }}
                >
                  <div className="p-6 pb-8 sm:p-8 sm:pb-9">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 id="receipt-title" className="font-display text-[26px] font-extrabold leading-none">
                          {COMPANY_NAME}
                        </h2>
                        <p className="mt-1.5 text-[13px] text-[var(--color-text-muted)]">Order receipt</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReceiptOpen(false)}
                        aria-label="Close receipt"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--color-border)] text-lg leading-none text-[var(--color-text-muted)] transition-colors duration-150 hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                      >
                        &times;
                      </button>
                    </div>

                    <dl className="mt-6 grid grid-cols-3 gap-x-4 text-[13px]">
                      <div>
                        <dt className="text-[12px] text-[var(--color-text-muted)]">Reference</dt>
                        <dd className="mt-0.5 font-semibold tabular-nums">{orderRef}</dd>
                      </div>
                      <div>
                        <dt className="text-[12px] text-[var(--color-text-muted)]">Date</dt>
                        <dd className="mt-0.5 font-semibold leading-snug">{receiptDate}</dd>
                      </div>
                      <div>
                        <dt className="text-[12px] text-[var(--color-text-muted)]">Payment</dt>
                        <dd className="mt-0.5 font-semibold">{methodName}</dd>
                      </div>
                    </dl>

                    <ul className="mt-5 space-y-4 border-t border-[var(--color-border)] pt-5">
                      {lines.map(({ item, unit, total }) => (
                        <li key={item.key} className="flex items-start gap-3">
                          <div className="min-w-0 grow">
                            <p className="line-clamp-2 text-[14px] font-semibold leading-snug">{item.title}</p>
                            <p className="mt-0.5 text-[12px] tabular-nums text-[var(--color-text-muted)]">
                              {item.quantity} &times; {unit !== null ? fmt(unit) : "—"}
                            </p>
                          </div>
                          <p className="shrink-0 text-[14px] font-semibold tabular-nums">
                            {total !== null ? fmt(total) : "—"}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <dl className="mt-5 space-y-2 border-t border-[var(--color-border)] pt-4 text-[13px]">
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--color-text-muted)]">
                          Subtotal ({count} {count === 1 ? "item" : "items"})
                        </dt>
                        <dd className="tabular-nums">{subtotal !== null ? fmt(subtotal) : "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--color-text-muted)]">
                          Shipping
                          {shippingDiscountApplies ? (
                            <span className="ml-1 text-[#15803d]">
                              ({SHIPPING_DISCOUNT_PERCENT}% discount)
                            </span>
                          ) : null}
                        </dt>
                        <dd className="tabular-nums">
                          {shippingDiscountApplies ? (
                            <span className="flex items-center gap-1.5">
                              <span className="text-[var(--color-text-muted)] line-through">
                                {fmt(SHIPPING_FEE)}
                              </span>
                              <span>{fmt(shipping)}</span>
                            </span>
                          ) : (
                            fmt(shipping)
                          )}
                        </dd>
                      </div>
                      <div className="flex items-baseline justify-between gap-4 pt-3">
                        <dt className="text-[15px] font-semibold">Total</dt>
                        <dd className="font-display text-[32px] font-extrabold leading-none tabular-nums">
                          {total !== null ? fmt(total) : "—"}
                        </dd>
                      </div>
                    </dl>

                    <p className="mt-5 text-[12px] leading-relaxed text-[var(--color-text-muted)]">
                      This receipt summarises your order. It is not proof of payment.
                    </p>
                  </div>

                  {/* Tear-off stub */}
                  <div
                    className="relative flex flex-col justify-center gap-2 px-6 sm:px-8"
                    style={{ height: STUB_H }}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-6 top-0 border-t-2 border-dashed border-[#d3d8de] sm:inset-x-8"
                    />
                    <button
                      type="button"
                      onClick={proceedFromReceipt}
                      className="h-12 w-full rounded-[10px] bg-black text-[15px] font-bold text-white transition-colors duration-[var(--duration-moderate)] hover:bg-[#111f2a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                    >
                      Proceed to {methodName}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => copy(receiptText(), "receipt")}
                        className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[var(--color-border)] text-[13px] font-semibold transition-colors duration-150 hover:bg-[var(--color-bg-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                      >
                        {copied === "receipt" ? <Check /> : <CopyIcon />}
                        <span aria-live="polite">{copied === "receipt" ? "Copied" : "Copy receipt"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReceiptOpen(false)}
                        className="h-10 rounded-[10px] text-[13px] font-semibold text-[var(--color-text-muted)] transition-colors duration-150 hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                      >
                        Back to cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </dialog>
          </>
        )}
      </div>
    </section>
  );
}