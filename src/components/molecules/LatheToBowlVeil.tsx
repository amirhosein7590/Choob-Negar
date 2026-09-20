'use client';

import { TransitionVeil } from './TransitionVeil';

/**
 * Curtain for the lathe-to-bowl swap.
 *
 * The window is set so the veil is fully opaque at exactly the bowl
 * chapter's start (progress 0.7). SceneSwitcher unmounts the lathe and
 * mounts the bowl at that same progress value, and since the veil is at
 * z-index 30 and the WebGL canvas is at z-index 0, the swap happens entirely
 * below an opaque overlay.
 */
export function LatheToBowlVeil() {
  return (
    <TransitionVeil
      fadeInStart={0.67}
      fullOpacity={0.7}
      fadeOutEnd={0.73}
    />
  );
}