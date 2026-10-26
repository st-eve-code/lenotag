import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { CartProvider } from "@/components/CartProvider";

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/inter-var.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
});

const bricolageGrotesque = localFont({
  variable: "--font-bricolage",
  display: "swap",
  src: [
    {
      path: "../../public/fonts/bricolage-var.woff2",
      weight: "700 800",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "lenotag — Online Vape Shop",
    template: "%s | lenotag",
  },
  description:
    "Shop trusted vapes and e-liquids at our leading vape shop online. Discover top brands, expert support, and fast UK delivery.",
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/favicon.png?v=2', sizes: '512x512', type: 'image/png' },
      { url: '/favicon-32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/android-chrome-512x512.png?v=2', sizes: '512x512', type: 'image/png' },
      { url: '/android-chrome-192x192.png?v=2', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [{ url: '/icon.png?v=2' }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolageGrotesque.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png?v=2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png?v=2" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] font-sans">
        <CartProvider>
          <Providers>{children}</Providers>
        </CartProvider>
      </body>
    </html>
  );
}