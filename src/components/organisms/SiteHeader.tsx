"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE_NAME, PRIMARY_NAV } from "@/lib/siteConfig";
import { MobileMenu } from "./MobileMenu";

/**
 * Sticky site header.
 *
 * The background is transparent at the very top of the page and grows a
 * frosted backdrop after a small scroll. On the home page this keeps the
 * opening frame of the narrative untouched; on the about page the effect is
 * the same and reads as a normal sticky nav.
 *
 * The mobile trigger replaces the desktop link list below the md breakpoint.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background,backdrop-filter,border-color] duration-500 ${
          scrolled
            ? "border-b border-white/6 bg-[#0f0a06]/78 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:h-20 md:px-8">
          <Link
            href="/"
            className="group flex items-baseline gap-2 text-[var(--color-ink-0)]"
          >
            <span className="text-lg font-semibold tracking-tight">
              {SITE_NAME}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {PRIMARY_NAV.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href) && link.href !== "#";
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative rounded-sm px-4 py-2 text-sm transition-colors ${
                    active
                      ? "text-[var(--color-ink-0)]"
                      : "text-[var(--color-ink-2)] hover:text-[var(--color-ink-0)]"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-4 bottom-1 h-px origin-left bg-[var(--color-accent-amber)] transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <Link
            href="#"
            className="hidden rounded-sm border border-[var(--color-accent-amber)]/40 bg-[var(--color-accent-amber)]/10 px-5 py-2 text-sm font-medium text-[var(--color-accent-amber)] transition-all hover:border-[var(--color-accent-amber)] hover:bg-[var(--color-accent-amber)]/20 md:inline-flex"
          >
            سفارش طرح اختصاصی
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
          >
            <span className="sr-only">منو</span>
            <span aria-hidden="true" className="relative block h-3 w-6">
              <span
                className={`absolute left-0 h-px w-full bg-[var(--color-ink-0)] transition-all duration-300 ${
                  menuOpen ? "top-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 h-px bg-[var(--color-ink-0)] transition-all duration-300 ${
                  menuOpen ? "top-1/2 w-full -rotate-45" : "top-full w-2/3"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
