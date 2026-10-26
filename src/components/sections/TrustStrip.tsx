const ICON_PROPS = {
  className: "h-7 w-7 shrink-0 text-[#111f2a]",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const ITEMS = [
  {
    label: "Shipped to",
    sub: "your door",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
        <path d="m3 7.5 9 4.5 9-4.5M12 12v9" />
      </svg>
    ),
  },
  {
    label: "Bitcoin &",
    sub: "WhatsApp checkout",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="6" width="18" height="12" rx="2.5" />
        <path d="M3 10h18M7 15h3" />
      </svg>
    ),
  },
  {
    label: "18+ only,",
    sub: "age verified",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 3 4.5 6v5.5c0 4.4 3 8 7.5 9.5 4.5-1.5 7.5-5.1 7.5-9.5V6L12 3Z" />
        <path d="m9 12 2.2 2.2L15.5 10" />
      </svg>
    ),
  },
  {
    label: "Clear pricing in",
    sub: "GBP, USD & EUR",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="9" />
        <path d="M14.8 9.2c-.5-.8-1.5-1.2-2.8-1.2-1.6 0-2.7.8-2.7 2s1 1.7 2.7 2c1.7.3 2.8.8 2.8 2s-1.2 2-2.8 2c-1.3 0-2.4-.5-2.9-1.4M12 6.5V8m0 8v1.5" />
      </svg>
    ),
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-[var(--color-border)] bg-white">
      <div className="container-vapestore">
        <ul className="grid grid-cols-2 gap-y-6 py-7 md:grid-cols-4 md:py-8">
          {ITEMS.map((item, i) => (
            <li
              key={item.sub}
              className={`flex items-center gap-3.5 px-2 md:justify-center ${
                i > 0 ? "md:border-l md:border-[var(--color-border)]" : ""
              }`}
            >
              {item.icon}
              <p className="text-[13px] font-semibold leading-[1.35] text-[#111f2a]">
                {item.label}
                <br />
                <span className="font-normal text-[var(--color-text-muted)]">
                  {item.sub}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}