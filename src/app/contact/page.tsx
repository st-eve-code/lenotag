import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with us on WhatsApp for help with orders, products, delivery and anything else.",
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "lenotag";
const COMPANY_ADDRESS = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "";
const COMPANY_NUMBER = process.env.NEXT_PUBLIC_COMPANY_NUMBER || "";

function WhatsAppGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

export default function ContactPage() {
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello ${COMPANY_NAME}, I need help with...`
  )}`;

  return (
    <>
      <section className="bg-[#080f15]">
        <div className="container-vapestore py-12 md:py-16">
          <Breadcrumbs
            crumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
          />
          <h1 className="mt-4 text-[var(--text-heading-lg)] leading-[var(--leading-heading-lg)] font-extrabold text-white">
            Contact Us
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-body)] leading-[var(--leading-body)] text-white/70">
            Questions about an order, a product or delivery? Our team is one
            message away &mdash; WhatsApp is the fastest way to reach us.
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-bg-canvas)]">
        <div className="container-vapestore grid grid-cols-1 gap-6 py-12 lg:grid-cols-2">
          <div className="flex flex-col rounded-[var(--radius-16)] border border-[var(--color-border)] bg-white p-6 md:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/15 text-[#128C7E]">
              <WhatsAppGlyph />
            </span>
            <h2 className="mt-4 text-[var(--text-heading)] font-bold leading-[var(--leading-heading)] text-[var(--color-text-primary)]">
              Chat on WhatsApp
            </h2>
            <p className="mt-2 text-sm leading-[1.55] text-[var(--color-text-muted)]">
              The quickest way to get help with orders, product questions,
              stock and delivery. We typically reply during opening hours.
            </p>
            {WHATSAPP_NUMBER ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-bold text-white transition-opacity duration-[var(--duration-base)] hover:opacity-80"
              >
                <WhatsAppGlyph />
                Start a chat
              </a>
            ) : (
              <p className="mt-6 rounded-lg bg-[var(--color-bg-canvas)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                Chat is not configured yet &mdash; set
                NEXT_PUBLIC_WHATSAPP_NUMBER to enable it.
              </p>
            )}
          </div>

          <div className="flex flex-col rounded-[var(--radius-16)] border border-[var(--color-border)] bg-white p-6 md:p-8">
            <h2 className="text-[var(--text-heading)] font-bold leading-[var(--leading-heading)] text-[var(--color-text-primary)]">
              Company details
            </h2>
            <div className="mt-4 flex flex-col gap-3 text-sm leading-[1.55] text-[var(--color-text-muted)]">
              <p>
                <span className="font-bold text-[var(--color-text-primary)]">
                  Name:
                </span>{" "}
                {COMPANY_NAME}
              </p>
              {COMPANY_ADDRESS ? (
                <p>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    Address:
                  </span>{" "}
                  {COMPANY_ADDRESS}
                </p>
              ) : null}
              {COMPANY_NUMBER ? (
                <p>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    Company number:
                  </span>{" "}
                  {COMPANY_NUMBER}
                </p>
              ) : null}
            </div>
            <p className="mt-auto pt-6 text-xs leading-[1.5] text-[var(--color-text-muted)]">
              When you contact us about an existing order, include your order
              number so we can help you faster.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
