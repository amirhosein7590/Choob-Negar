/**
 * Single source of truth for site-wide metadata and navigation.
 * Consumed by the header, the mobile menu, and the footer.
 */
export const SITE_NAME = "چوب نگار";
export const SITE_TAGLINE = "کاسه‌های چوبی دست‌ساز";

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export const PRIMARY_NAV: readonly NavLink[] = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/about", label: "درباره ما" },
  { href: "#", label: "تماس با ما" },
] as const;

export const FOOTER_NAV: readonly NavLink[] = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/about", label: "درباره ما" },
  { href: "#", label: "تماس با ما" },
  { href: "#", label: "فروشگاه" },
] as const;

export const CONTACT = {
  phone: "۰۲۱ ۰۰۰۰ ۰۰۰۰",
  email: "hello@choobnegar.example",
  address: "تهران، کارگاه چوب نگار",
} as const;
