import { clamp, smoothstep } from "@/lib/math";

/**
 * Fade windows for the tree-to-log transition.
 *
 * The windows overlap: the tree starts disappearing before the log starts
 * appearing, and by the time the tree is fully invisible the log is already
 * half-visible. This overlap is what reads as a dissolve rather than a cut.
 *
 * Both windows sit inside the [0.13, 0.17] band, which corresponds to the
 * camera's motion between the chapter-one and chapter-two anchor poses.
 */
export const TREE_FADE_START = 0.13;
export const TREE_FADE_END = 0.16;
export const LOG_FADE_START = 0.14;
export const LOG_FADE_END = 0.17;

export interface TransitionState {
  readonly treeOpacity: number;
  readonly logOpacity: number;
  readonly treeVisible: boolean;
  readonly logVisible: boolean;
}

const INVISIBLE_THRESHOLD = 0.001;

/**
 * Computes the crossfade state for a given scroll progress.
 *
 * Pure function of progress: no time component, no randomness. Rolling the
 * scroll back to a previous position reproduces the exact previous state,
 * which is required for the narrative to be scrubbable.
 */
export function computeTransition(progress: number): TransitionState {
  const p = clamp(progress, 0, 1);

  const treeT = smoothstep(
    clamp((p - TREE_FADE_START) / (TREE_FADE_END - TREE_FADE_START), 0, 1),
  );
  const logT = smoothstep(
    clamp((p - LOG_FADE_START) / (LOG_FADE_END - LOG_FADE_START), 0, 1),
  );

  const treeOpacity = 1 - treeT;
  const logOpacity = logT;

  return {
    treeOpacity,
    logOpacity,
    treeVisible: treeOpacity > INVISIBLE_THRESHOLD,
    logVisible: logOpacity > INVISIBLE_THRESHOLD,
  };
}
