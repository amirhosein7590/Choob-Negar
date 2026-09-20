"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

const FADE_DURATION_MS = 900;
const FORCE_DISMISS_AFTER_MS = 8000;

/**
 * First-load veil.
 *
 * Dismissal is a three-phase state machine: loading, fading, gone. The
 * transitions are idempotent, so React's StrictMode double-invocation of
 * effects is harmless: the loading-to-fading transition is guarded by the
 * current phase value itself, not by a ref.
 *
 * A fallback timer force-dismisses the veil after a fixed delay. drei's
 * useProgress can remain active indefinitely if a lazy-loaded asset is
 * waiting on a slow network or a stalled decoder. Without a fallback the
 * user would stare at the loader forever.
 */
export function LoadingVeil() {
  const { active, progress } = useProgress();
  const [phase, setPhase] = useState<"loading" | "fading" | "gone">("loading");

  const ratio = Math.min(Math.max(progress / 100, 0), 1);

  // Fallback: always reveal the app eventually.
  useEffect(() => {
    if (phase !== "loading") return;
    const timer = window.setTimeout(
      () => setPhase("fading"),
      FORCE_DISMISS_AFTER_MS,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Normal path: dismiss once every loader reports done.
  useEffect(() => {
    if (phase !== "loading") return;
    if (active) return;
    if (progress < 100) return;
    setPhase("fading");
  }, [active, progress, phase]);

  // Fading is a separate phase so its timeout cannot be cancelled by an
  // unrelated re-render of the effect that triggered it.
  useEffect(() => {
    if (phase !== "fading") return;
    const timer = window.setTimeout(() => setPhase("gone"), FADE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#0a0705]"
      style={{
        opacity: phase === "loading" ? 1 : 0,
        transition: `opacity ${FADE_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
      aria-hidden={phase !== "loading"}
    >
      <div className="w-56 text-center">
        <div className="mb-5 h-px w-full bg-white/8">
          <div
            className="h-full bg-[var(--color-accent-amber)]"
            style={{
              transform: `scaleX(${ratio})`,
              transformOrigin: "left",
              transition: "transform 300ms ease-out",
            }}
          />
        </div>
        <p className="text-[10px] tracking-[0.4em] text-[var(--color-ink-3)]">
          در حال آماده‌سازی
        </p>
      </div>
    </div>
  );
}
