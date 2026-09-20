"use client";

import { useEffect, type RefObject } from "react";
import { chapterProgress, type Chapter } from "@/features/narrative/chapters";
import { clamp } from "@/lib/math";
import { useScrollStore } from "@/store/scrollStore";

const FADE_IN_END = 0.2;
const FADE_OUT_START = 0.72;
const FADE_OUT_END = 0.95;
const TRANSLATE_RANGE_PX = 20;

interface ApplyOptions {
  readonly chapter: Chapter;
  readonly isFirst: boolean;
  readonly isLast: boolean;
}

function applyVisuals(
  element: HTMLElement,
  localProgress: number,
  options: ApplyOptions,
): void {
  const { isFirst, isLast } = options;

  const enter = isFirst ? 1 : clamp(localProgress / FADE_IN_END, 0, 1);
  const exit = isLast
    ? 0
    : clamp(
        (localProgress - FADE_OUT_START) / (FADE_OUT_END - FADE_OUT_START),
        0,
        1,
      );

  const opacity = Math.min(enter, 1 - exit);
  const translateY =
    (1 - enter) * TRANSLATE_RANGE_PX - exit * TRANSLATE_RANGE_PX;

  element.style.opacity = opacity.toString();
  element.style.transform = `translate3d(0, ${translateY}px, 0)`;
}

/**
 * Subscribes a DOM node to scroll progress and mutates its opacity and
 * transform directly. Avoids React re-renders while keeping the visual
 * response strictly deterministic with respect to scroll position.
 *
 * When reduced motion is requested, the element is shown fully without
 * any transform, and the scroll subscription is skipped.
 */
export function useLiveLocalProgress(
  contentRef: RefObject<HTMLElement | null>,
  options: ApplyOptions,
): void {
  const { chapter, isFirst, isLast } = options;

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const isReduced = () => useScrollStore.getState().reducedMotion;

    const apply = (progress: number) => {
      if (isReduced()) {
        element.style.opacity = "1";
        element.style.transform = "none";
        return;
      }
      const local = chapterProgress(progress, chapter.id);
      applyVisuals(element, local, { chapter, isFirst, isLast });
    };

    apply(useScrollStore.getState().progress);

    const unsubscribeProgress = useScrollStore.subscribe(
      (state) => state.progress,
      apply,
    );

    const unsubscribeReduced = useScrollStore.subscribe(
      (state) => state.reducedMotion,
      () => apply(useScrollStore.getState().progress),
    );

    return () => {
      unsubscribeProgress();
      unsubscribeReduced();
    };
  }, [contentRef, chapter, isFirst, isLast]);
}
