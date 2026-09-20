"use client";

import { useEffect, useRef, useState } from "react";
import {
  CHAPTERS,
  chapterProgress,
  type Chapter,
} from "@/features/narrative/chapters";
import { useScrollStore } from "@/store/scrollStore";
import { clamp, smoothstep } from "@/lib/math";

const ENTER_END = 0.16;
const EXIT_START = 0.82;
const EXIT_END = 1;

/**
 * Chapter text panel anchored at the bottom-right of the viewport.
 *
 * Sizes and paddings are deliberately modest: the narrative animation is the
 * primary content, and the text panel is a subtitle, not the main event. On
 * mobile the panel spans the viewport width minus the gutters and sits
 * closer to the bottom edge.
 *
 * Opacity and offset are written directly to the DOM on every scroll tick,
 * so the panel has no per-frame React cost. Only the chapter switch causes
 * a re-render.
 */
export function NarrativeOverlay() {
  const panelRef = useRef<HTMLDivElement>(null);
  const accentRef = useRef<HTMLSpanElement>(null);
  const [chapter, setChapter] = useState<Chapter>(CHAPTERS[0]!);

  useEffect(() => {
    const apply = (progress: number) => {
      const panel = panelRef.current;
      const accent = accentRef.current;
      if (!panel || !accent) return;

      const local = chapterProgress(progress, chapter.id);
      const isLast = chapter.index === CHAPTERS.length - 1;

      const enter = smoothstep(clamp(local / ENTER_END, 0, 1));
      const exit = isLast
        ? smoothstep(
            clamp((local - EXIT_START) / (EXIT_END - EXIT_START), 0, 1),
          )
        : 0;

      const opacity = enter * (1 - exit);
      panel.style.opacity = opacity.toString();
      panel.style.transform = `translate3d(0, ${(1 - enter) * 16}px, 0)`;
      panel.style.pointerEvents = opacity > 0.5 ? "auto" : "none";

      accent.style.transform = `scaleY(${enter})`;
    };

    apply(useScrollStore.getState().progress);

    const unsubscribe = useScrollStore.subscribe(
      (state) => state.progress,
      apply,
    );

    const unsubscribeChapter = useScrollStore.subscribe(
      (state) => state.activeChapterId,
      (id) => {
        const next = CHAPTERS.find((c) => c.id === id);
        if (next) setChapter(next);
        apply(useScrollStore.getState().progress);
      },
    );

    return () => {
      unsubscribe();
      unsubscribeChapter();
    };
  }, [chapter]);

  return (
    <div
      ref={panelRef}
      className="pointer-events-none fixed bottom-4 left-3 right-3 z-20 md:bottom-8 md:left-auto md:right-8 md:w-[min(320px,42vw)]"
      style={{ opacity: 0 }}
      role="region"
      aria-live="polite"
      aria-label="روایت"
    >
      <div className="relative overflow-hidden rounded border-r-2 border-[var(--color-accent-amber)]/55 bg-[#0f0a06]/55 px-4 py-4 backdrop-blur-[6px] md:px-5 md:py-5">
        <p className="mb-1.5 text-lg tracking-[0.35em] text-white w-full text-left">
          {chapter.kicker}
        </p>

        <h2 className="mb-2.5 text-base font-semibold leading-snug text-[var(--color-ink-0)] md:text-lg">
          {chapter.title}
        </h2>

        <p className="text-[12px] leading-relaxed text-[var(--color-ink-1)] md:text-[13px] md:leading-loose">
          {chapter.body}
        </p>

        <span
          ref={accentRef}
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-[2px] origin-top bg-[var(--color-accent-amber)]"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
    </div>
  );
}
