import { CAMERA_ANCHORS, CHAPTER_BOUNDS, CHAPTER_ORDER } from "@/lib/constants";
import { clamp, lerpVec3, smoothstep, type Vec3 } from "@/lib/math";

export interface CameraSample {
  readonly position: Vec3;
  readonly target: Vec3;
  readonly fov: number;
}

/**
 * The camera is authored as a set of anchor poses, one per chapter. Each
 * anchor sits at the midpoint of its chapter, so the camera "arrives" at a
 * composition, holds it while the chapter text is on screen, and departs.
 *
 * Time values below are the progress positions at which the camera should be
 * exactly on the matching anchor.
 */
const ANCHOR_TIMES: readonly number[] = CHAPTER_ORDER.map((id) => {
  const { start, end } = CHAPTER_BOUNDS[id];
  return (start + end) / 2;
});

const ANCHOR_POSITIONS: readonly Vec3[] = CHAPTER_ORDER.map(
  (id): Vec3 => CAMERA_ANCHORS[id].position,
);

const ANCHOR_TARGETS: readonly Vec3[] = CHAPTER_ORDER.map(
  (id): Vec3 => CAMERA_ANCHORS[id].target,
);

const ANCHOR_FOVS: readonly number[] = CHAPTER_ORDER.map(
  (id): number => CAMERA_ANCHORS[id].fov,
);

const COUNT = ANCHOR_TIMES.length;

/**
 * Samples the camera pose for a given overall progress.
 *
 * Between anchors, smoothstep easing is applied so the camera decelerates as
 * it approaches each chapter and accelerates out of it. This reads as the
 * camera "settling" on each composition instead of gliding past at constant
 * speed, which is the desired narrative rhythm.
 */
export function sampleCamera(progress: number): CameraSample {
  const p = clamp(progress, 0, 1);

  const firstTime = ANCHOR_TIMES[0] ?? 0;
  if (p <= firstTime) {
    return freeze(0);
  }

  const lastTime = ANCHOR_TIMES[COUNT - 1] ?? 1;
  if (p >= lastTime) {
    return freeze(COUNT - 1);
  }

  for (let i = 0; i < COUNT - 1; i += 1) {
    const t0 = ANCHOR_TIMES[i]!;
    const t1 = ANCHOR_TIMES[i + 1]!;
    if (p >= t0 && p <= t1) {
      const span = t1 - t0;
      const rawT = span > 0 ? (p - t0) / span : 0;
      const t = smoothstep(rawT);
      return {
        position: lerpVec3(ANCHOR_POSITIONS[i]!, ANCHOR_POSITIONS[i + 1]!, t),
        target: lerpVec3(ANCHOR_TARGETS[i]!, ANCHOR_TARGETS[i + 1]!, t),
        fov: lerpNumber(ANCHOR_FOVS[i]!, ANCHOR_FOVS[i + 1]!, t),
      };
    }
  }

  // Unreachable under the bounds above, but keeps the type checker happy.
  return freeze(COUNT - 1);
}

function freeze(index: number): CameraSample {
  return {
    position: ANCHOR_POSITIONS[index]!,
    target: ANCHOR_TARGETS[index]!,
    fov: ANCHOR_FOVS[index]!,
  };
}

function lerpNumber(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
