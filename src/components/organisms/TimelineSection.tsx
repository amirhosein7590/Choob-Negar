"use client";

import { useEffect, useRef, useState } from "react";
import { TIMELINE, type TimelineEvent } from "@/lib/timeline";

/**
 * Interactive timeline with a scroll-driven growth line.
 *
 * The vertical rule scales its Y axis in proportion to how far the viewer
 * has scrolled through the timeline container. Each entry reveals itself
 * when its top edge crosses the viewport midpoint, alternating left and
 * right on wide screens.
 *
 * Scroll progress is derived from the section's own bounding rect rather
 * than from the global scroll store, so the effect is independent of the
 * narrative on the home page.
 */
export function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const line = lineRef.current;
    if (!container || !line) return;

    let frame = 0;

    const update = () => {
      const rect = container.getBoundingClientRect();
      const viewportH = window.innerHeight;

      // Progress: 0 when the top of the container sits at the bottom of
      // the viewport; 1 when the bottom of the container has passed the
      // viewport top.
      const total = rect.height + viewportH;
      const traveled = viewportH - rect.top;
      const progress = Math.max(0, Math.min(1, traveled / total));

      line.style.transform = `scaleY(${progress})`;
      frame = 0;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="relative z-10 mx-auto max-w-5xl px-6 py-24 md:px-10 md:py-32">
      <header className="mb-24 text-center">
        <p className="mb-4 text-[10px] tracking-[0.5em] text-[var(--color-accent-amber)]">
          مسیر ما
        </p>
        <h2 className="text-3xl font-bold leading-tight text-[var(--color-ink-0)] md:text-5xl">
          از ۱۳۸۵ تا امروز
        </h2>
      </header>

      <div ref={containerRef} className="relative">
        {/* Static track (background) */}
        <div
          aria-hidden="true"
          className="absolute left-4 top-0 h-full w-px bg-white/6 md:left-1/2 md:-translate-x-1/2"
        />

        {/* Growing line */}
        <div
          ref={lineRef}
          aria-hidden="true"
          className="absolute left-4 top-0 h-full w-px origin-top bg-gradient-to-b from-[var(--color-accent-amber)] via-[var(--color-accent-amber)]/60 to-[var(--color-accent-amber)]/10 md:left-1/2 md:-translate-x-1/2"
          style={{ transform: "scaleY(0)" }}
        />

        <ol className="space-y-12 md:space-y-24">
          {TIMELINE.map((event, index) => (
            <TimelineEntry key={event.year} event={event} index={index} />
          ))}
        </ol>
      </div>
    </section>
  );
}

interface TimelineEntryProps {
  readonly event: TimelineEvent;
  readonly index: number;
}

function TimelineEntry({ event, index }: TimelineEntryProps) {
  const ref = useRef<HTMLLIElement>(null);
  const [revealed, setRevealed] = useState(false);
  const isRight = index % 2 === 1;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) {
            setRevealed(true);
            observer.unobserve(record.target);
          }
        }
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <li
      ref={ref}
      className={`relative grid grid-cols-[2rem_1fr] gap-x-4 md:grid-cols-[1fr_2rem_1fr] md:gap-x-8 ${
        isRight ? "" : "md:[&>*:first-child]:col-start-3"
      }`}
    >
      {/* Card */}
      <div
        className={`col-start-2 transition-all duration-700 ease-out md:col-start-auto ${
          isRight
            ? "md:col-start-3 md:pl-10"
            : "md:col-start-1 md:pr-10 md:text-left"
        } ${revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
      >
        <div className="rounded-lg border border-white/8 bg-[#0f0a06]/60 p-6 backdrop-blur-sm transition-colors duration-500 hover:border-[var(--color-accent-amber)]/30 md:p-7">
          <p className="mb-2 text-xs tabular-nums tracking-[0.3em] text-[var(--color-accent-amber)]">
            {toPersianDigits(event.year)}
          </p>
          <h3 className="mb-3 text-lg font-semibold text-[var(--color-ink-0)] md:text-xl">
            {event.title}
          </h3>
          <p className="text-sm leading-loose text-[var(--color-ink-2)]">
            {event.description}
          </p>
        </div>
      </div>

      {/* Node column (center) */}
      <div className="col-start-1 row-start-1 flex justify-start pt-8 md:col-start-2 md:row-start-auto md:justify-center md:pt-8">
        <span
          className={`relative flex h-3 w-3 items-center justify-center rounded-full border-2 transition-all duration-500 ${
            revealed ? "scale-100" : "scale-50"
          } ${
            event.highlight
              ? "border-[var(--color-accent-amber)] bg-[var(--color-accent-amber)] shadow-[0_0_0_6px_rgba(200,138,62,0.15)]"
              : "border-[var(--color-accent-amber)]/60 bg-[#0a0705]"
          }`}
        >
          {event.highlight && (
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-[var(--color-accent-amber)]/30"
            />
          )}
        </span>
      </div>
    </li>
  );
}

function toPersianDigits(value: number): string {
  const map = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return value
    .toString()
    .split("")
    .map((digit) => map[Number(digit)] ?? digit)
    .join("");
}
