import { Fragment, type ReactNode } from "react";

interface UspItem {
  title: string;
  body?: string;
  icon: ReactNode;
}

const iconClass = "h-4 w-4 shrink-0 text-[#357a25]";

const ITEMS: UspItem[] = [
  {
    title: "FREE UK Delivery",
    body: " on Orders Over £20",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6h11v10H2z" />
        <path d="M13 9h4l3 3v4h-7z" />
        <circle cx="6.5" cy="17.5" r="1.5" />
        <circle cx="15.5" cy="17.5" r="1.5" />
      </svg>
    ),
  },
  {
    title: "We Ship 7 Days a Week",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
        <path d="M3 7l9 4 9-4" />
        <path d="M12 11v10" />
      </svg>
    ),
  },
  {
    title: "Trustpilot Rated - 'Excellent'",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.2l5.9-.9z" />
      </svg>
    ),
  },
  {
    title: "Rewards Scheme",
    body: " - Spend & Save",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4l1.4 4.6L18 10l-4.6 1.4L12 16l-1.4-4.6L6 10l4.6-1.4z" />
      </svg>
    ),
  },
];

export function UspBar() {
  return (
    <div className="overflow-x-auto border-b border-[#e3eddc] bg-[#f4f9f0]">
      <div className="container-vapestore flex w-max items-center gap-4 py-1.5 whitespace-nowrap md:w-auto md:items-center md:justify-center">
        {ITEMS.map((item, i) => (
          <Fragment key={item.title}>
            {i > 0 ? (
              <span aria-hidden="true" className="hidden h-4 w-px bg-[#cfe3c4] md:block" />
            ) : null}
            <span className="flex items-center gap-1.5 text-[12px] text-[#111f2a]">
              {item.icon}
              <strong className="font-bold">{item.title}</strong>
              {item.body ? <span>{item.body}</span> : null}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}