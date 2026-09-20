import { describe, expect, it } from "vitest";
import {
  SKY_END,
  WORLD_SWAP,
  fogAt,
  isWorkshopWorld,
  skyVisible,
  workshopBackdropOpacity,
} from "./workshopTransition";

describe("workshopBackdropOpacity", () => {
  it("is zero before the fade window", () => {
    expect(workshopBackdropOpacity(0)).toBe(0);
    expect(workshopBackdropOpacity(0.2)).toBe(0);
  });

  it("is one after the fade window", () => {
    expect(workshopBackdropOpacity(1)).toBe(1);
  });

  it("is monotonically non-decreasing", () => {
    let previous = 0;
    for (let p = 0; p <= 1; p += 0.005) {
      const current = workshopBackdropOpacity(p);
      expect(current).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = current;
    }
  });
});

describe("isWorkshopWorld", () => {
  it("is false before the swap", () => {
    expect(isWorkshopWorld(WORLD_SWAP - 0.001)).toBe(false);
  });

  it("is true at and after the swap", () => {
    expect(isWorkshopWorld(WORLD_SWAP)).toBe(true);
    expect(isWorkshopWorld(1)).toBe(true);
  });
});

describe("skyVisible", () => {
  it("is true before SKY_END", () => {
    expect(skyVisible(0)).toBe(true);
    expect(skyVisible(SKY_END - 0.001)).toBe(true);
  });

  it("is false at and after SKY_END", () => {
    expect(skyVisible(SKY_END)).toBe(false);
  });
});

describe("fogAt", () => {
  /**
   * The world swap is hidden behind a DOM veil, not an in-scene fog peak.
   * The fog values are therefore two-state: forest density for the forest
   * world, workshop density for the workshop world. There is no peak and no
   * ramp between the two.
   */
  it("returns the forest density at progress 0", () => {
    expect(fogAt(0).density).toBeCloseTo(0.014, 6);
  });

  it("returns the forest density just before the swap", () => {
    expect(fogAt(WORLD_SWAP - 0.001).density).toBeCloseTo(0.014, 6);
  });

  it("returns the workshop density at the swap", () => {
    expect(fogAt(WORLD_SWAP).density).toBeCloseTo(0.004, 6);
  });

  it("returns the workshop density at progress 1", () => {
    expect(fogAt(1).density).toBeCloseTo(0.004, 6);
  });

  it("workshop density is lower than forest density", () => {
    const forest = fogAt(0).density;
    const workshop = fogAt(1).density;
    expect(workshop).toBeLessThan(forest);
  });

  it("produces finite values across the entire range", () => {
    for (let p = 0; p <= 1; p += 0.01) {
      const state = fogAt(p);
      expect(Number.isFinite(state.density)).toBe(true);
      expect(Number.isFinite(state.color.r)).toBe(true);
      expect(Number.isFinite(state.color.g)).toBe(true);
      expect(Number.isFinite(state.color.b)).toBe(true);
    }
  });

  it("is deterministic for a given progress", () => {
    const a = fogAt(0.5);
    const b = fogAt(0.5);
    expect(a.density).toBe(b.density);
    expect(a.color.getHexString()).toBe(b.color.getHexString());
  });

  it("switches colour at the same point it switches density", () => {
    const before = fogAt(WORLD_SWAP - 0.001);
    const at = fogAt(WORLD_SWAP);
    expect(before.color.getHexString()).not.toBe(at.color.getHexString());
  });
});
