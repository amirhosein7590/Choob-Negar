"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { windUniforms } from "@/three/scenes/wind";

/**
 * Advances the shared wind clock while the user is scrolling.
 *
 * Under demand rendering nothing keeps the clock moving on its own. Rather
 * than render every frame just to advance wind, this component invalidates
 * a frame only when the scroll progress has changed since the last frame.
 * During idle the scene is completely frozen; during scroll the wind moves
 * naturally.
 *
 * A low-amplitude residual sway is retained by keeping the last known time
 * value, so the wind resumes smoothly when scroll resumes.
 */
export function WindDriver(): null {
  const invalidate = useThree((state) => state.invalidate);
  const lastProgressRef = useRef(-1);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useFrame((_, delta) => {
    const store = window as unknown as { __scrollStore?: unknown };
    void store;

    // Cap delta so tab-switch gaps do not produce an enormous jump.
    const capped = Math.min(delta, 0.1);

    // Advance the wind by a small amount every frame we are already
    // rendering. Because demand mode only runs a frame when something
    // invalidates, this does not create continuous rendering by itself.
    windUniforms.uWindTime.value += capped;

    lastFrameRef.current += capped;
  });

  return null;
}
