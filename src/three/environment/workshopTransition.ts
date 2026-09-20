import { clamp, smoothstep } from "@/lib/math";
import * as THREE from "three";

/**
 * Timing constants for the forest-to-workshop transition.
 *
 * The fog is a curtain for the world swap: it only needs to be dense enough
 * to fully hide the exchange, and only for the brief window around the swap.
 * Once the workshop is active, fog density drops to nearly zero so the HDRI
 * backdrop reads as a clean interior rather than a tinted haze.
 */
export const WORKSHOP_BACKDROP_START = 0.28;
export const WORKSHOP_BACKDROP_END = 0.32;
export const SKY_END = 0.295;
export const WORLD_SWAP = 0.3;

const FOREST_FOG_DENSITY = 0.014;
/**
 * Workshop fog is effectively off. A workshop is an interior; atmospheric
 * perspective has no place there, and any density that reads as fog also
 * tints the HDRI backdrop and destroys its legibility.
 */
const WORKSHOP_FOG_DENSITY = 0.004;

const FOREST_FOG_COLOR = new THREE.Color("#6a7a8a");
const WORKSHOP_FOG_COLOR = new THREE.Color("#4a4238");

export interface FogState {
  readonly density: number;
  readonly color: THREE.Color;
}

export function workshopBackdropOpacity(progress: number): number {
  return smoothstep(
    clamp(
      (progress - WORKSHOP_BACKDROP_START) /
        (WORKSHOP_BACKDROP_END - WORKSHOP_BACKDROP_START),
      0,
      1,
    ),
  );
}

export function isWorkshopWorld(progress: number): boolean {
  return progress >= WORLD_SWAP;
}

export function skyVisible(progress: number): boolean {
  return progress < SKY_END;
}

/**
 * Fog density and colour at a given progress.
 *
 * Returns a fresh Color instance on every call. A shared scratch instance
 * would be silently mutated by the next invocation, so a caller that stores
 * the result and later calls the function again would observe its stored
 * colour changing underneath it.
 *
 * The scene's fog colour is set from the result via `scene.fog.color.copy`,
 * so the allocation cost per call is one small object per frame, which is
 * negligible compared with the render work it supports.
 */
export function fogAt(progress: number): FogState {
  const workshop = progress >= WORLD_SWAP;
  return {
    density: workshop ? WORKSHOP_FOG_DENSITY : FOREST_FOG_DENSITY,
    color: (workshop ? WORKSHOP_FOG_COLOR : FOREST_FOG_COLOR).clone(),
  };
}
