import { describe, expect, it } from "vitest";
import {
  BLANK_HEIGHT,
  BLANK_RADIUS,
  CUT_END,
  CUT_START,
  buildProfile,
  computeWorkshopFade,
  cutAmount,
  spinRate,
} from "./latheSequence";

describe("cutAmount", () => {
  it("is zero before the cut window", () => {
    expect(cutAmount(0)).toBe(0);
    expect(cutAmount(CUT_START - 0.01)).toBe(0);
  });

  it("is one after the cut window", () => {
    expect(cutAmount(1)).toBe(1);
    expect(cutAmount(CUT_END + 0.01)).toBe(1);
  });

  it("is monotonically non-decreasing", () => {
    let previous = 0;
    for (let p = 0; p <= 1; p += 0.005) {
      const current = cutAmount(p);
      expect(current).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = current;
    }
  });

  it("clamps inputs outside [0, 1]", () => {
    expect(cutAmount(-1)).toBe(0);
    expect(cutAmount(2)).toBe(1);
  });
});

describe("spinRate", () => {
  it("starts at zero", () => {
    expect(spinRate(0)).toBe(0);
  });

  it("reaches cutting speed mid-chapter", () => {
    expect(spinRate(0.5)).toBeGreaterThan(2);
  });

  it("slows down at the end", () => {
    expect(spinRate(1)).toBeLessThan(spinRate(0.5));
  });

  it("produces finite non-negative values across the range", () => {
    for (let p = 0; p <= 1; p += 0.01) {
      const rate = spinRate(p);
      expect(Number.isFinite(rate)).toBe(true);
      expect(rate).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("buildProfile", () => {
  it("returns a non-empty array at cut = 0", () => {
    expect(buildProfile(0).length).toBeGreaterThan(0);
  });

  it("returns a non-empty array at cut = 1", () => {
    expect(buildProfile(1).length).toBeGreaterThan(0);
  });

  it("produces the same point count at every cut", () => {
    const counts = new Set<number>();
    for (let p = 0; p <= 1; p += 0.1) {
      counts.add(buildProfile(p).length);
    }
    expect(counts.size).toBe(1);
  });

  it("starts at the axis and ends at the axis", () => {
    const profile = buildProfile(0.5);
    expect(profile[0]!.x).toBeCloseTo(0, 6);
    expect(profile[profile.length - 1]!.x).toBeCloseTo(0, 6);
  });

  it("outer radius at cut = 0 matches the blank radius", () => {
    const profile = buildProfile(0);
    const maxR = profile.reduce((m, p) => Math.max(m, p.x), 0);
    expect(maxR).toBeCloseTo(BLANK_RADIUS, 4);
  });

  it("maximum height at cut = 0 matches the blank height", () => {
    const profile = buildProfile(0);
    const maxY = profile.reduce((m, p) => Math.max(m, p.y), 0);
    expect(maxY).toBeCloseTo(BLANK_HEIGHT, 4);
  });

  it("the finished bowl is hollow", () => {
    const profile = buildProfile(1);
    // At the rim height, there should be both an outer and an inner point.
    const rimY = 0.38;
    const rimPoints = profile.filter((p) => Math.abs(p.y - rimY) < 0.01);
    expect(rimPoints.length).toBeGreaterThanOrEqual(2);
    const radii = rimPoints.map((p) => p.x).sort((a, b) => a - b);
    expect(radii[radii.length - 1]! - radii[0]!).toBeGreaterThan(0.02);
  });

  it("produces finite values across the entire range", () => {
    for (let p = 0; p <= 1; p += 0.1) {
      for (const point of buildProfile(p)) {
        expect(Number.isFinite(point.x)).toBe(true);
        expect(Number.isFinite(point.y)).toBe(true);
      }
    }
  });
});

describe("computeWorkshopFade", () => {
  it("shows only prepare at the workshop start", () => {
    const state = computeWorkshopFade(0.3);
    expect(state.prepareOpacity).toBe(1);
    expect(state.latheOpacity).toBe(0);
  });

  it("shows only the lathe at chapter end", () => {
    const state = computeWorkshopFade(0.7);
    expect(state.prepareOpacity).toBe(0);
    expect(state.latheOpacity).toBe(1);
  });

  it("produces overlapping opacities in the transition window", () => {
    const mid = (0.38 + 0.42) / 2;
    const state = computeWorkshopFade(mid);
    expect(state.prepareOpacity).toBeGreaterThan(0);
    expect(state.latheOpacity).toBeGreaterThan(0);
  });
});
