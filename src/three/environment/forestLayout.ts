/**
 * Deterministic placement of background trees.
 *
 * The layout is generated from a fixed seed so the same forest appears on
 * every load and in screenshot captures. Trees are placed in three
 * concentric rings; a narrow sector behind the camera is excluded so geometry
 * is not spent on trees that will never enter the frame.
 */

export interface TreePlacement {
  readonly position: readonly [number, number, number];
  readonly yaw: number;
  readonly scale: number;
  readonly castShadow: boolean;
}

interface RingConfig {
  readonly count: number;
  readonly innerRadius: number;
  readonly outerRadius: number;
  readonly minScale: number;
  readonly maxScale: number;
  readonly castShadow: boolean;
}

/**
 * Trees are authored at the same 20x base scale as the main subject. Ring
 * scales are relative multipliers on top of that base so a mid-ring tree at
 * 1.3 is 26x the source model and roughly 5.8 m tall.
 */
const RINGS: readonly RingConfig[] = [
  {
    count: 3,
    innerRadius: 8,
    outerRadius: 14,
    minScale: 1.1,
    maxScale: 1.5,
    castShadow: true,
  },
  {
    count: 4,
    innerRadius: 18,
    outerRadius: 30,
    minScale: 1.0,
    maxScale: 1.4,
    castShadow: false,
  },
  {
    count: 5,
    innerRadius: 38,
    outerRadius: 58,
    minScale: 0.9,
    maxScale: 1.2,
    castShadow: false,
  },
];

/**
 * The camera sits at roughly 0.73 rad from the +Z axis. Trees placed in this
 * narrow arc would be behind the viewer and invisible, so they are skipped.
 * The exclusion is deliberately narrow: any wider and visible trees on the
 * flanks are also removed.
 */
const EXCLUDED_START = 0.13;
const EXCLUDED_END = 1.33;

const SEED = 0x9e3779b9;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isExcluded(angle: number): boolean {
  return angle >= EXCLUDED_START && angle <= EXCLUDED_END;
}

export function generateForestLayout(seed = SEED): readonly TreePlacement[] {
  const rng = mulberry32(seed);
  const placements: TreePlacement[] = [];

  for (const ring of RINGS) {
    let attempts = 0;
    let accepted = 0;
    const maxAttempts = ring.count * 40;

    while (accepted < ring.count && attempts < maxAttempts) {
      attempts += 1;

      const angle = rng() * Math.PI * 2 - Math.PI;
      if (isExcluded(angle)) continue;

      const radius =
        ring.innerRadius + rng() * (ring.outerRadius - ring.innerRadius);
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const scale = ring.minScale + rng() * (ring.maxScale - ring.minScale);
      const yaw = rng() * Math.PI * 2;

      placements.push({
        position: [x, 0, z],
        yaw,
        scale,
        castShadow: ring.castShadow,
      });
      accepted += 1;
    }
  }

  return placements;
}

export const FOREST_LAYOUT_TEST_CONSTANTS = {
  EXCLUDED_START,
  EXCLUDED_END,
  TOTAL_TREES: RINGS.reduce((sum, ring) => sum + ring.count, 0),
} as const;
