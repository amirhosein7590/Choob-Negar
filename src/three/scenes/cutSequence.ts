import { clamp, lerp, lerpVec3, smoothstep, type Vec3 } from "@/lib/math";

/**
 * Chapter-two local-progress milestones.
 *
 * All values are pure functions of the chapter's local progress, so every
 * stage of the saw sequence is fully scrubbable in both directions.
 */

export const APPROACH_START = 0.18;
export const APPROACH_END = 0.3;
export const SAWING_START = 0.32;
export const SAWING_END = 0.82;
export const WITHDRAW_START = 0.82;
export const WITHDRAW_END = 0.9;
export const FADE_OUT_START = 0.85;
export const FADE_OUT_END = 0.93;

/** Lifetime of a sawdust particle, in chapter-local progress units. */
export const SAWDUST_LIFETIME = 0.18;

/**
 * Top surface of the log, in world coordinates.
 *
 * Derived from LogScene: the log's lowest vertex is lifted to y = 0 and the
 * log is 0.52 world units tall, so the top sits at y = 0.52. The saw cuts a
 * few centimetres into this surface.
 */
export const LOG_TOP_Y = 0.52;

/**
 * Cut point on the log, in world coordinates. This is both where the blade
 * contacts the wood and where sawdust is emitted.
 */
export const CUT_POINT: Vec3 = [0, LOG_TOP_Y, 0];

/**
 * Saw pivot positions.
 *
 * The pivot is the centre of the blade. The handle sits at the positive end
 * of the blade's local axis. The blade's long axis runs along world Z, so
 * that the saw cross-cuts the log (which lies along world X).
 */
const PIVOT_APPROACH_START: Vec3 = [-1.15, 1.6, 1.0];
const PIVOT_CUT: Vec3 = [0, LOG_TOP_Y + 0.04, 0];
const PIVOT_WITHDRAW_END: Vec3 = [1.15, 1.4, -1.0];

/**
 * Reciprocation parameters.
 *
 * The blade moves back and forth along its own axis (world Z) during the
 * sawing window. Stroke count is set to a value that reads as natural
 * hand-sawing across the chapter's scroll length.
 */
const STROKE_AMPLITUDE = 0.22;
const STROKE_COUNT = 5;

export interface SawPose {
  readonly position: Vec3;
  readonly rotation: Vec3;
  readonly scale: number;
  readonly visible: boolean;
}

const PITCH = -0.14;
const YAW = 0.0;
const ROLL = 0.0;

function makePose(position: Vec3, scale: number): SawPose {
  return {
    position,
    rotation: [PITCH, YAW, ROLL],
    scale,
    visible: scale > 0.01,
  };
}

/**
 * Computes the saw pose for a given chapter-two local progress.
 *
 * The sequence: hidden, fade in and approach, saw with axial strokes,
 * withdraw, fade out. Nothing here depends on frame time, so scrolling
 * backwards retraces the same motion exactly.
 */
export function sawPose(localProgress: number): SawPose {
  const p = clamp(localProgress, 0, 1);

  const scaleIn = smoothstep(clamp((p - APPROACH_START) / 0.05, 0, 1));
  const scaleOut =
    1 -
    smoothstep(
      clamp((p - FADE_OUT_START) / (FADE_OUT_END - FADE_OUT_START), 0, 1),
    );
  const fade = Math.min(scaleIn, scaleOut);

  if (p < APPROACH_START) {
    return makePose(PIVOT_APPROACH_START, 0);
  }

  if (p < APPROACH_END) {
    const t = smoothstep(
      clamp((p - APPROACH_START) / (APPROACH_END - APPROACH_START), 0, 1),
    );
    return makePose(lerpVec3(PIVOT_APPROACH_START, PIVOT_CUT, t), fade);
  }

  if (p < SAWING_END) {
    const sawT = clamp((p - SAWING_START) / (SAWING_END - SAWING_START), 0, 1);
    const strokePhase = Math.sin(sawT * Math.PI * 2 * STROKE_COUNT);
    const zOffset = strokePhase * STROKE_AMPLITUDE;
    return makePose([PIVOT_CUT[0], PIVOT_CUT[1], PIVOT_CUT[2] + zOffset], fade);
  }

  const t = smoothstep(
    clamp((p - WITHDRAW_START) / (WITHDRAW_END - WITHDRAW_START), 0, 1),
  );
  return makePose(lerpVec3(PIVOT_CUT, PIVOT_WITHDRAW_END, t), fade);
}

/**
 * Normalised position within the sawing window. Returns a value below zero
 * before the window begins and above one after it ends, which the particle
 * shader uses to cull particles whose birth has not yet occurred.
 */
export function sawingProgress(localProgress: number): number {
  return (
    (clamp(localProgress, 0, 1) - SAWING_START) / (SAWING_END - SAWING_START)
  );
}

/**
 * Age of a particle born at the given normalised sawing position, measured
 * in chapter-local progress units. Negative when the particle is not yet
 * born.
 */
export function particleAge(localProgress: number, birthSawT: number): number {
  const currentSawT = sawingProgress(localProgress);
  const birthLocal = SAWING_START + birthSawT * (SAWING_END - SAWING_START);
  return clamp(localProgress, 0, 1) - birthLocal;
}
