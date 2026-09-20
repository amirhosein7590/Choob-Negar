import Link from "next/link";

/**
 * Commercial call to action shown after the narrative ends.
 *
 * The section is deliberately typeset-heavy rather than image-heavy: the
 * narrative already spent the viewer's visual budget, so the CTA works best
 * as a calm, confident offer rather than another visual spectacle.
 *
 * Background is a dark warm gradient with an amber glow, matching the
 * workshop chapter's palette. A subtle noise layer keeps the large flat
 * areas from banding on wide-gamut displays.
 */
export function CTASection() {
  return (
    <section className="relative z-10 overflow-hidden bg-[#0a0705]">
      {/* Ambient warm glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, rgba(200,138,62,0.14) 0%, rgba(200,138,62,0) 55%), radial-gradient(80% 60% at 50% 100%, rgba(58,42,26,0.6) 0%, rgba(10,7,5,0) 70%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 py-28 text-center md:px-10 md:py-40">
        <p className="mb-6 text-[10px] tracking-[0.5em] text-[var(--color-accent-amber)]">
          از روایت تا واقعیت
        </p>

        <h2 className="mb-8 text-3xl font-bold leading-[1.15] text-[var(--color-ink-0)] md:text-5xl lg:text-6xl">
          کاسه‌ای که دیدی،
          <br />
          می‌تواند کاسه‌ی تو باشد.
        </h2>

        <p className="mx-auto mb-14 max-w-2xl text-base leading-loose text-[var(--color-ink-2)] md:text-lg">
          هر کاسه‌ی چوب نگار از یک تنه‌ی مشخص، با دست و در کارگاه ما تراش
          می‌خورد. می‌توانی سفارش اختصاصی بدهی، یا از میان کاسه‌های آماده‌ی
          موجود، آن را که با تو حرف می‌زند انتخاب کنی.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#"
            className="group inline-flex w-full items-center justify-center gap-3 rounded-sm bg-[var(--color-accent-amber)] px-8 py-4 text-sm font-semibold text-[#1a120a] transition-transform duration-300 hover:scale-[1.02] sm:w-auto"
          >
            <span>مشاهده‌ی فروشگاه</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-x-1"
            >
              ←
            </span>
          </Link>

          <Link
            href="#"
            className="inline-flex w-full items-center justify-center gap-3 rounded-sm border border-white/15 px-8 py-4 text-sm font-medium text-[var(--color-ink-1)] transition-colors duration-300 hover:border-white/30 hover:text-[var(--color-ink-0)] sm:w-auto"
          >
            <span>تماس با ما</span>
          </Link>
        </div>

        <div className="mt-20 grid gap-10 border-t border-white/6 pt-12 md:grid-cols-3">
          {[
            {
              value: "۲۰ سال",
              label: "سابقه‌ی کار در چوب",
            },
            {
              value: "۱۰۰٪",
              label: "دست‌ساز، بدون ماشین صنعتی",
            },
            {
              value: "چوب",
              label: "گردو، بلوط، افرا و راش",
            },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="mb-2 text-2xl font-semibold text-[var(--color-ink-0)] md:text-3xl">
                {stat.value}
              </p>
              <p className="text-xs tracking-[0.15em] text-[var(--color-ink-3)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
