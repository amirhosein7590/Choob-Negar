"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useScrollStore } from "@/store/scrollStore";

/**
 * Bridges the scroll store and the reduced-motion preference into R3F's
 * demand renderer.
 *
 * Under `frameloop="demand"` the renderer is idle between invalidations. The
 * store subscriptions here are the only things that schedule frames during
 * the narrative, keeping GPU and CPU idle unless the user is actively
 * scrolling.
 */
export function ScrollInvalidator(): null {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();

    const unsubscribeProgress = useScrollStore.subscribe(
      (state) => state.progress,
      () => invalidate(),
    );

    const unsubscribeMotion = useScrollStore.subscribe(
      (state) => state.reducedMotion,
      () => invalidate(),
    );

    return () => {
      unsubscribeProgress();
      unsubscribeMotion();
    };
  }, [invalidate]);

  return null;
}
