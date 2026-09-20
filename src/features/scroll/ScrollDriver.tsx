"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { chapterAt } from "@/features/narrative/chapters";
import { clamp } from "@/lib/math";
import { useScrollStore } from "@/store/scrollStore";

/**
 * Reads native scroll position and normalises it to [0, 1].
 * Used as a fallback when smooth scrolling is disabled.
 */
function readNativeProgress(): number {
  if (typeof window === "undefined") return 0;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return clamp(window.scrollY / max, 0, 1);
}

/**
 * Wires Lenis into the scroll store.
 *
 * Renders nothing; the component exists solely to own the side effects of
 * creating, running, and tearing down the smooth-scroll loop. When the user
 * prefers reduced motion, Lenis is not instantiated and native scroll is
 * observed instead so the narrative still advances.
 */
export function ScrollDriver(): null {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const commit = (rawProgress: number) => {
      const progress = clamp(rawProgress, 0, 1);
      const chapter = chapterAt(progress);
      useScrollStore.getState().setProgress(progress, chapter.id);
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      useScrollStore.getState().setReducedMotion(event.matches);
    };

    useScrollStore.getState().setReducedMotion(motionQuery.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    if (motionQuery.matches) {
      const onScroll = () => commit(readNativeProgress());
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        motionQuery.removeEventListener("change", handleMotionChange);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    const onLenisScroll = (instance: Lenis) => {
      commit(instance.progress);
    };

    lenis.on("scroll", onLenisScroll);

    // Sync the store with the position Lenis restored from the browser.
    commit(lenis.progress);

    let rafId = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
    };
  }, []);

  return null;
}
