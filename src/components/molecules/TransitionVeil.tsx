"use client";

import { useEffect, useRef } from "react";
import { clamp, smoothstep } from "@/lib/math";
import { useScrollStore } from "@/store/scrollStore";

interface TransitionVeilProps {
  readonly fadeInStart: number;
  readonly fullOpacity: number;
  readonly fadeOutEnd: number;
  readonly color?: string;
}

/**
 * A full-screen DOM overlay used as a cinematic curtain during a scene
 * transition.
 *
 * A DOM element rather than a 3D fog or mesh: scene.background and the Sky
 * mesh are drawn before any scene fog applies, so an in-scene fog wall
 * cannot hide them. Only an overlay drawn on top of the WebGL canvas can
 * reliably obscure both scenes at the swap moment.
 *
 * The veil never intercepts pointer events and carries no interactivity.
 */
export function TransitionVeil({
  fadeInStart,
  fullOpacity,
  fadeOutEnd,
  color = "#0a0705",
}: TransitionVeilProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = (progress: number) => {
      const el = ref.current;
      if (!el) return;

      let opacity = 0;
      if (progress >= fadeInStart && progress < fullOpacity) {
        opacity = smoothstep(
          clamp((progress - fadeInStart) / (fullOpacity - fadeInStart), 0, 1),
        );
      } else if (progress >= fullOpacity && progress < fadeOutEnd) {
        opacity =
          1 -
          smoothstep(
            clamp((progress - fullOpacity) / (fadeOutEnd - fullOpacity), 0, 1),
          );
      }

      el.style.opacity = opacity.toString();
    };

    apply(useScrollStore.getState().progress);
    return useScrollStore.subscribe((state) => state.progress, apply);
  }, [fadeInStart, fullOpacity, fadeOutEnd]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-30"
      style={{ backgroundColor: color, opacity: 0 }}
      aria-hidden="true"
    />
  );
}
