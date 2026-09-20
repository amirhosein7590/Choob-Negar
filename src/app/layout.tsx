import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/organisms/SiteHeader";
import { SiteFooter } from "@/components/organisms/SiteFooter";
import "./globals.css";

const vazirmatn = localFont({
  src: [
    {
      path: "../../public/fonts/vazirmatn/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazirmatn/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazirmatn/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazirmatn/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
  preload: true,
});

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const SITE_TITLE = "چوب نگار — روایت ساخت کاسه‌ی چوبی";
const SITE_DESCRIPTION =
  "روایتی سه‌بعدی و تعاملی از فرآیند ساخت کاسه‌ی چوبی دست‌ساز؛ از درخت تا اثر نهایی.";

export const metadata: Metadata = {
  title: { default: SITE_TITLE, template: "%s | چوب نگار" },
  description: SITE_DESCRIPTION,
  applicationName: "چوب نگار",
  keywords: ["نجاری", "کاسه چوبی", "دست‌ساز", "روایت سه‌بعدی", "WebGL"],
  authors: [{ name: "استودیو چوب نگار" }],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "چوب نگار",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0705",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[#0a0705] text-[var(--color-ink-1)]">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
