import { clamp, lerp, smoothstep } from "@/lib/math";
import * as THREE from "three";

/**
 * Progress milestones for the lathe chapter, expressed in chapter-local
 * units. The chapter spans global [0.4, 0.7].
 */
export const LATHE_SPIN_UP_END = 0.08;
export const CUT_START = 0.15;
export const CUT_END = 0.82;
export const SPIN_DOWN_START = 0.85;

/** Angular speed of the wood, in radians per second. */
const SPIN_RATE_CUTTING = 2.4;
const SPIN_RATE_SLOW = 0.6;

/** Source blank dimensions. Matches PrepareScene exactly so the crossfade
 *  between the two chapters lines up. */
export const BLANK_RADIUS = 0.28;
export const BLANK_HEIGHT = 0.42;

/** Target bowl dimensions after turning. */
const BOWL_BOTTOM_RADIUS = 0.24;
const BOWL_RIM_RADIUS = 0.26;
const BOWL_HEIGHT = 0.38;
const BOWL_WALL = 0.04;
const BOWL_BOTTOM_THICKNESS = 0.07;

/** Crossfade window between the prepare and lathe chapters. */
export const PREPARE_FADE_OUT_START = 0.36;
export const PREPARE_FADE_OUT_END = 0.42;
export const LATHE_FADE_IN_START = 0.38;
export const LATHE_FADE_IN_END = 0.44;

const VISIBLE_THRESHOLD = 0.001;

export interface WorkshopFadeState {
  readonly prepareOpacity: number;
  readonly latheOpacity: number;
  readonly prepareVisible: boolean;
  readonly latheVisible: boolean;
}

export function computeWorkshopFade(progress: number): WorkshopFadeState {
  const p = clamp(progress, 0, 1);
  const prepareT = smoothstep(
    clamp(
      (p - PREPARE_FADE_OUT_START) /
        (PREPARE_FADE_OUT_END - PREPARE_FADE_OUT_START),
      0,
      1,
    ),
  );
  const latheT = smoothstep(
    clamp(
      (p - LATHE_FADE_IN_START) / (LATHE_FADE_IN_END - LATHE_FADE_IN_START),
      0,
      1,
    ),
  );
  const prepareOpacity = 1 - prepareT;
  const latheOpacity = latheT;
  return {
    prepareOpacity,
    latheOpacity,
    prepareVisible: prepareOpacity > VISIBLE_THRESHOLD,
    latheVisible: latheOpacity > VISIBLE_THRESHOLD,
  };
}

/**
 * Morph amount: 0 means the untouched blank, 1 means the finished bowl.
 * Outside the cutting window the value clamps to the nearest endpoint.
 */
export function cutAmount(chapterProgress: number): number {
  const p = clamp(chapterProgress, 0, 1);
  return smoothstep(clamp((p - CUT_START) / (CUT_END - CUT_START), 0, 1));
}

/**
 * Angular speed at a given chapter progress. Ramps up from rest, holds a
 * cutting speed through the turning window, then slows to a presentation
 * speed for the final reveal.
 */
export function spinRate(chapterProgress: number): number {
  const p = clamp(chapterProgress, 0, 1);
  if (p < LATHE_SPIN_UP_END) {
    const t = smoothstep(p / LATHE_SPIN_UP_END);
    return lerp(0, SPIN_RATE_CUTTING, t);
  }
  if (p < SPIN_DOWN_START) {
    return SPIN_RATE_CUTTING;
  }
  const t = smoothstep(
    clamp((p - SPIN_DOWN_START) / (1 - SPIN_DOWN_START), 0, 1),
  );
  return lerp(SPIN_RATE_CUTTING, SPIN_RATE_SLOW, t);
}

/**
 * Builds the 2D lathe profile for a given morph amount.
 *
 * The profile walks from the bottom centre, out along the bottom face, up
 * the outer surface, across the rim, down the inner surface, and back to
 * the inner bottom centre. At morph = 0 the inner points coincide with the
 * outer points, so the revolved surface is a solid cylinder with a flat
 * top. At morph = 1 the profile traces a hollow bowl with wall thickness.
 */
export function buildProfile(cut: number): THREE.Vector2[] {
  const s = clamp(cut, 0, 1);

  const r_ob = lerp(BLANK_RADIUS, BOWL_BOTTOM_RADIUS, s);
  const r_or = lerp(BLANK_RADIUS, BOWL_RIM_RADIUS, s);
  const h_top = lerp(BLANK_HEIGHT, BOWL_HEIGHT, s);
  const wall = lerp(0, BOWL_WALL, s);
  const h_ib = lerp(BLANK_HEIGHT, BOWL_BOTTOM_THICKNESS, s);

  const r_ir = r_or - wall;
  const r_ib = r_ob - wall;

  const points: THREE.Vector2[] = [];
  const N_BOTTOM = 6;
  const N_OUTER = 18;
  const N_RIM = 3;
  const N_INNER = 15;
  const N_INNER_BOTTOM = 6;

  for (let i = 0; i < N_BOTTOM; i += 1) {
    const u = i / (N_BOTTOM - 1);
    points.push(new THREE.Vector2(u * r_ob, 0));
  }

  for (let i = 1; i < N_OUTER; i += 1) {
    const u = i / (N_OUTER - 1);
    const bulge = Math.sin(u * Math.PI) * 0.025 * s;
    points.push(new THREE.Vector2(lerp(r_ob, r_or, u) + bulge, u * h_top));
  }

  for (let i = 0; i < N_RIM; i += 1) {
    const u = i / (N_RIM - 1);
    points.push(new THREE.Vector2(lerp(r_or, r_ir, u), h_top));
  }

  for (let i = 1; i < N_INNER; i += 1) {
    const u = i / (N_INNER - 1);
    const bulge = Math.sin(u * Math.PI) * 0.02 * s;
    points.push(
      new THREE.Vector2(lerp(r_ir, r_ib, u) + bulge, lerp(h_top, h_ib, u)),
    );
  }

  for (let i = 0; i < N_INNER_BOTTOM; i += 1) {
    const u = i / (N_INNER_BOTTOM - 1);
    points.push(new THREE.Vector2(r_ib * (1 - u), h_ib));
  }

  return points;
}
