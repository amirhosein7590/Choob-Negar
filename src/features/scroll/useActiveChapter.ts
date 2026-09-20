"use client";

import type { ChapterId } from "@/lib/constants";
import { useScrollStore } from "@/store/scrollStore";

/**
 * Returns the identifier of the chapter currently occupying the viewport.
 * Re-renders only when the active chapter changes, not on every scroll tick.
 */
export function useActiveChapter(): ChapterId {
  return useScrollStore((state) => state.activeChapterId);
}

/**
 * Returns the user's reduced-motion preference as observed at runtime.
 */
export function useReducedMotion(): boolean {
  return useScrollStore((state) => state.reducedMotion);
}
