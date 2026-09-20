"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PRIMARY_NAV, SITE_NAME, CONTACT } from "@/lib/siteConfig";

interface MobileMenuProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

/**
 * Full-screen mobile menu.
 *
 * Panels slide in from the bottom-right in a staggered sequence to read as a
 * composed reveal rather than a plain fade. Background is nearly opaque so
 * the narrative canvas does not bleed through and distract from the links.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      aria-hidden={!open}
      className={`fixed inset-0 z-45 md:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[#0a0705]/95 backdrop-blur-md transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Decorative amber line that grows on open */}
      <div
        aria-hidden="true"
        className={`absolute right-0 top-0 h-full w-[2px] origin-top bg-gradient-to-b from-[var(--color-accent-amber)] via-[var(--color-accent-amber)]/40 to-transparent transition-transform duration-700 ease-out ${
          open ? "scale-y-100" : "scale-y-0"
        }`}
      />

      <nav className="relative flex h-full flex-col justify-between px-8 py-24">
        <ul className="space-y-2">
          {PRIMARY_NAV.map((link, index) => (
            <li
              key={link.label}
              style={{
                transitionDelay: open ? `${120 + index * 70}ms` : "0ms",
              }}
              className={`transition-all duration-500 ease-out ${
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
            >
              <Link
                href={link.href}
                onClick={onClose}
                className="group flex items-baseline gap-4 py-3 text-3xl font-semibold text-[var(--color-ink-0)] transition-colors hover:text-[var(--color-accent-amber)]"
              >
                <span className="text-xs tabular-nums text-[var(--color-ink-3)]">
                  ۰{index + 1}
                </span>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div
          className={`space-y-6 transition-all duration-500 ease-out ${
            open
              ? "translate-y-0 opacity-100 delay-300"
              : "translate-y-4 opacity-0"
          }`}
        >
          <div className="h-px bg-white/8" />
          <div className="space-y-1.5 text-sm text-[var(--color-ink-2)]">
            <p>{CONTACT.phone}</p>
            <p className="text-xs text-[var(--color-ink-3)]">
              {CONTACT.address}
            </p>
          </div>
          <Link
            href="#"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-sm border border-[var(--color-accent-amber)]/50 bg-[var(--color-accent-amber)]/10 py-3 text-sm font-medium text-[var(--color-accent-amber)] transition-colors hover:bg-[var(--color-accent-amber)]/20"
          >
            سفارش طرح اختصاصی
          </Link>
          <p className="text-[10px] tracking-[0.4em] text-[var(--color-ink-3)]">
            {SITE_NAME}
          </p>
        </div>
      </nav>
    </div>
  );
}
