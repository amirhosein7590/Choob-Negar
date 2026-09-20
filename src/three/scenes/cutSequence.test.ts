import { describe, expect, it } from "vitest";
import {
  APPROACH_END,
  APPROACH_START,
  FADE_OUT_END,
  SAWDUST_LIFETIME,
  SAWING_END,
  SAWING_START,
  particleAge,
  sawPose,
  sawingProgress,
} from "./cutSequence";

describe("sawPose", () => {
  it("is invisible at the chapter opening", () => {
    expect(sawPose(0).visible).toBe(false);
  });

  it("is visible during the sawing window", () => {
    expect(sawPose(0.4).visible).toBe(true);
    expect(sawPose(0.6).visible).toBe(true);
  });

  it("is fully faded out before the chapter closes", () => {
    expect(sawPose(0.95).scale).toBeLessThan(0.05);
  });

  it("is deterministic", () => {
    expect(sawPose(0.5)).toEqual(sawPose(0.5));
  });

  it("clamps values outside [0, 1]", () => {
    expect(sawPose(-1)).toEqual(sawPose(0));
    expect(sawPose(2)).toEqual(sawPose(1));
  });

  it("produces finite values across the entire range", () => {
    for (let p = 0; p <= 1; p += 0.01) {
      const pose = sawPose(p);
      expect(Number.isFinite(pose.position[0])).toBe(true);
      expect(Number.isFinite(pose.position[1])).toBe(true);
      expect(Number.isFinite(pose.position[2])).toBe(true);
      expect(Number.isFinite(pose.scale)).toBe(true);
    }
  });

  it("moves monotonically toward the log during approach", () => {
    let previous: readonly [number, number, number] | null = null;
    let previousDist = Infinity;
    for (let p = APPROACH_START; p <= APPROACH_END; p += 0.01) {
      const pose = sawPose(p);
      const dist = Math.hypot(
        pose.position[0] - 0,
        pose.position[1] - 0.56,
        pose.position[2] - 0,
      );
      expect(dist).toBeLessThanOrEqual(previousDist + 1e-6);
      previousDist = dist;
      previous = pose.position;
    }
    expect(previous).not.toBeNull();
  });

  it("oscillates along the blade axis during sawing", () => {
    const samples: number[] = [];
    for (let p = SAWING_START; p <= SAWING_END; p += 0.005) {
      samples.push(sawPose(p).position[2]);
    }
    const min = Math.min(...samples);
    const max = Math.max(...samples);
    // Reciprocation should span a meaningful range on the Z axis.
    expect(max - min).toBeGreaterThan(0.2);
  });

  it("returns to the cut position after withdraw", () => {
    const restBeforeFade = sawPose(FADE_OUT_END - 0.005);
    // Position should no longer be at the cut; saw has withdrawn.
    const distance = Math.hypot(
      restBeforeFade.position[0] - 0,
      restBeforeFade.position[1] - 0.56,
      restBeforeFade.position[2] - 0,
    );
    expect(distance).toBeGreaterThan(0.3);
  });
});

describe("sawingProgress", () => {
  it("is below zero before the sawing window", () => {
    expect(sawingProgress(0)).toBeLessThan(0);
  });

  it("is zero at the start of the sawing window", () => {
    expect(sawingProgress(SAWING_START)).toBeCloseTo(0, 6);
  });

  it("is one at the end of the sawing window", () => {
    expect(sawingProgress(SAWING_END)).toBeCloseTo(1, 6);
  });

  it("is above one after the sawing window", () => {
    expect(sawingProgress(1)).toBeGreaterThan(1);
  });
});

describe("particleAge", () => {
  it("is negative before the particle is born", () => {
    expect(particleAge(SAWING_START, 0.5)).toBeLessThan(0);
  });

  it("is zero exactly at birth", () => {
    const birthT = 0.4;
    const birthLocal = SAWING_START + birthT * (SAWING_END - SAWING_START);
    expect(particleAge(birthLocal, birthT)).toBeCloseTo(0, 6);
  });

  it("grows after birth", () => {
    const birthT = 0.2;
    const birthLocal = SAWING_START + birthT * (SAWING_END - SAWING_START);
    const a = particleAge(birthLocal + 0.02, birthT);
    const b = particleAge(birthLocal + 0.04, birthT);
    expect(b).toBeGreaterThan(a);
  });

  it("reaches the lifetime boundary", () => {
    const birthT = 0;
    const birthLocal = SAWING_START;
    const age = particleAge(birthLocal + SAWDUST_LIFETIME, birthT);
    expect(age).toBeCloseTo(SAWDUST_LIFETIME, 6);
  });
});
