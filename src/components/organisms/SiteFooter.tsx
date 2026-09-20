"use client";

import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, FOOTER_NAV, CONTACT } from "@/lib/siteConfig";

/**
 * Site footer.
 *
 * Four columns: brand statement, quick links, contact, and a small
 * newsletter-style block. On mobile the columns stack. No backend is
 * involved; the newsletter input is a placeholder and its submit is a no-op.
 */
export function SiteFooter() {
  const year = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
  }).format(new Date());

  return (
    <footer className="relative z-10 border-t border-white/6 bg-[#0a0705]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="mb-2 text-xl font-semibold text-[var(--color-ink-0)]">
              {SITE_NAME}
            </p>
            <p className="mb-6 text-sm leading-relaxed text-[var(--color-ink-2)]">
              {SITE_TAGLINE}؛ از درخت تا کاسه، با دست و صبر ساخته می‌شود.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-medium tracking-[0.3em] text-[var(--color-ink-3)]">
              دسترسی سریع
            </h3>
            <ul className="space-y-3 text-sm">
              {FOOTER_NAV.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[var(--color-ink-1)] transition-colors hover:text-[var(--color-accent-amber)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-medium tracking-[0.3em] text-[var(--color-ink-3)]">
              تماس
            </h3>
            <ul className="space-y-3 text-sm text-[var(--color-ink-1)]">
              <li>{CONTACT.phone}</li>
              <li className="break-all">{CONTACT.email}</li>
              <li className="text-[var(--color-ink-2)]">{CONTACT.address}</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-medium tracking-[0.3em] text-[var(--color-ink-3)]">
              خبرنامه
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-[var(--color-ink-2)]">
              از ساخت هر کاسه‌ی جدید باخبر شو.
            </p>
            <form
              onSubmit={(event) => event.preventDefault()}
              className="flex items-stretch overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]"
            >
              <input
                type="email"
                required
                placeholder="ایمیل شما"
                className="w-full bg-transparent px-4 py-2.5 text-sm text-[var(--color-ink-1)] outline-none placeholder:text-[var(--color-ink-3)]"
                data-rtl-listener="true"
              />
              <button
                type="submit"
                className="shrink-0 bg-[var(--color-accent-amber)]/15 px-4 text-sm text-[var(--color-accent-amber)] transition-colors hover:bg-[var(--color-accent-amber)]/25"
              >
                عضویت
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/6 pt-8 text-xs text-[var(--color-ink-3)] md:flex-row md:items-center">
          <p>
            © {year} {SITE_NAME}. تمامی حقوق محفوظ است.
          </p>
          <p className="tabular-nums">ساخته‌شده با دست و چوب</p>
        </div>
      </div>
    </footer>
  );
}
