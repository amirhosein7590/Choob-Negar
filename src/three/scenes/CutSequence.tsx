"use client";

import { Saw } from "@/three/scenes/Saw";
import { SawdustStream } from "@/three/scenes/SawdustStream";
import { useActiveChapter } from "@/features/scroll/useActiveChapter";

/**
 * Orchestrates the cut sequence.
 *
 * Both children gate their own visibility through the scroll store, so
 * mounting this component outside the cut chapter would be harmless. The
 * chapter check here avoids mounting the subtree when it is not needed.
 */
export function CutSequence() {
  const chapter = useActiveChapter();

  if (chapter !== "cut") return null;

  return (
    <>
      <Saw />
      <SawdustStream />
    </>
  );
}
