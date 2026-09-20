import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { ChapterId } from "@/lib/constants";

/**
 * Single source of truth for the scroll-driven narrative.
 *
 * - `progress` is updated on every Lenis tick and read directly by the
 *   renderer through {@link getScrollProgress} without triggering React
 *   re-renders.
 * - `activeChapterId` changes rarely and is consumed by UI overlays.
 * - `reducedMotion` mirrors the user's media query preference.
 */
export interface ScrollState {
  readonly progress: number;
  readonly activeChapterId: ChapterId;
  readonly reducedMotion: boolean;

  setProgress: (progress: number, chapterId: ChapterId) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE: Pick<
  ScrollState,
  "progress" | "activeChapterId" | "reducedMotion"
> = {
  progress: 0,
  activeChapterId: "tree",
  reducedMotion: false,
};

export const useScrollStore = create<ScrollState>()(
  subscribeWithSelector((set, get) => ({
    ...INITIAL_STATE,

    setProgress: (progress, chapterId) => {
      // Guard against NaN/Infinity from Lenis before they poison the store.
      if (!Number.isFinite(progress)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[scrollStore] rejected non-finite progress:", progress);
        }
        return;
      }

      const current = get();
      if (
        current.progress === progress &&
        current.activeChapterId === chapterId
      ) {
        return;
      }
      set({ progress, activeChapterId: chapterId });
    },

    setReducedMotion: (reducedMotion) => {
      if (get().reducedMotion === reducedMotion) {
        return;
      }
      set({ reducedMotion });
    },

    reset: () => set({ ...INITIAL_STATE }),
  })),
);

/**
 * Hot-path accessor for render loops. Bypasses React entirely.
 */
export function getScrollProgress(): number {
  return useScrollStore.getState().progress;
}
