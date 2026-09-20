"use client";

import { TransitionVeil } from "./TransitionVeil";

/**
 * Curtain for the forest-to-workshop world swap.
 */
export function WorldTransitionVeil() {
  return (
    <TransitionVeil fadeInStart={0.275} fullOpacity={0.3} fadeOutEnd={0.325} />
  );
}
