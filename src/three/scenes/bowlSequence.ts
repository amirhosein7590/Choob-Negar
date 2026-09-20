import { clamp, smoothstep } from '@/lib/math';

/**
 * Progress milestones for the bowl chapter, expressed in chapter-local
 * units. The chapter spans global [0.7, 1.0].
 *
 * There is no fade logic here. The transition from the lathe scene to the
 * bowl scene is handled by a DOM veil in the app shell: at the swap moment
 * the veil is fully opaque, both scenes are swapped below it, and the veil
 * fades out to reveal the bowl. Fading the scenes themselves produced
 * overlapping transparent geometry, which read as the two models merging.
 */

export const ORBIT_START = 0.15;
export const ORBIT_END = 0.85;

/**
 * Yaw of the bowl around the vertical axis, in radians. Two full turns are
 * covered across the orbit window.
 */
export function bowlOrbitYaw(chapterProgress: number): number {
  const p = clamp(chapterProgress, 0, 1);
  const t = smoothstep(
    clamp((p - ORBIT_START) / (ORBIT_END - ORBIT_START), 0, 1),
  );
  return t * Math.PI * 4;
}

/**
 * Vertical bob of the bowl, in world units. Amplitude is small: the bowl is
 * a resting object, not a floating one.
 */
export function bowlBobOffset(chapterProgress: number): number {
  const p = clamp(chapterProgress, 0, 1);
  const orbitT = smoothstep(
    clamp((p - ORBIT_START) / (ORBIT_END - ORBIT_START), 0, 1),
  );
  return Math.sin(orbitT * Math.PI * 4) * 0.012;
}