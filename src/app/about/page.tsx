import type { Metadata } from "next";
import Link from "next/link";
import { MouseParallaxBackdrop } from "@/components/molecules/MouseParallaxBackdrop";
import { TimelineSection } from "@/components/organisms/TimelineSection";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "داستان کارگاه چوب نگار؛ از نخستین تراش در ۱۳۸۵ تا امروز.",
};

/**
 * About page.
 *
 * A lightweight narrative landing with a mouse-driven backdrop and a
 * timeline of the workshop's history. No WebGL here: the home narrative is
 * the visual spectacle, and the about page carries the studio's voice.
 */
export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#0a0705] pt-20">
      <MouseParallaxBackdrop />

      <section className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center md:px-10 md:py-32">
        <p className="mb-6 tracking-[0.5em] text-[var(--color-accent-amber)]">
          کارگاه چوب نگار
        </p>
        <h1 className="mb-8 text-4xl font-bold leading-[1.2] text-[var(--color-ink-0)] md:text-6xl">
          ما چوب را زنده نگه می‌داریم.
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-loose text-[var(--color-ink-2)] md:text-lg">
          بیست سال است که فقط یک کار می‌کنیم: تبدیل تنه‌ی درخت به ظرفی که بتواند
          سال‌ها در خانه‌ی تو بماند. این داستانِ ماست.
        </p>

        <div className="mt-12">
          <Link
            href="#timeline"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-2)] transition-colors hover:text-[var(--color-accent-amber)]"
          >
            <span>پایین‌تر، داستان را ببین</span>
            <span aria-hidden="true">↓</span>
          </Link>
        </div>
      </section>

      <div id="timeline">
        <TimelineSection />
      </div>

      <section className="relative z-10 border-t border-white/6 px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-2xl font-semibold text-[var(--color-ink-0)] md:text-4xl">
            کارگاه ما در دسترس توست.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-loose text-[var(--color-ink-2)]">
            اگر دوست داری چوب را از نزدیک ببینی، بوی چوب تازه را حس کنی، یا فقط
            یک قهوه در کارگاه بنوشی، درِ ما باز است.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-[var(--color-accent-amber)]/40 bg-[var(--color-accent-amber)]/10 px-8 py-3 text-sm font-medium text-[var(--color-accent-amber)] transition-colors hover:bg-[var(--color-accent-amber)]/20"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </section>
    </div>
  );
}
