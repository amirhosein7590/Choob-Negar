import { describe, expect, it } from "vitest";
import {
  LOG_FADE_END,
  LOG_FADE_START,
  TREE_FADE_END,
  TREE_FADE_START,
  computeTransition,
} from "./transition";

describe("computeTransition", () => {
  it("shows only the tree at progress 0", () => {
    const state = computeTransition(0);
    expect(state.treeOpacity).toBe(1);
    expect(state.logOpacity).toBe(0);
    expect(state.treeVisible).toBe(true);
    expect(state.logVisible).toBe(false);
  });

  it("shows only the log at progress 1", () => {
    const state = computeTransition(1);
    expect(state.treeOpacity).toBe(0);
    expect(state.logOpacity).toBe(1);
    expect(state.treeVisible).toBe(false);
    expect(state.logVisible).toBe(true);
  });

  it("clamps progress outside [0, 1]", () => {
    expect(computeTransition(-1)).toEqual(computeTransition(0));
    expect(computeTransition(2)).toEqual(computeTransition(1));
  });

  it("is deterministic", () => {
    expect(computeTransition(0.15)).toEqual(computeTransition(0.15));
  });

  it("produces monotonically decreasing tree opacity", () => {
    let previous = 1;
    for (let p = 0; p <= 1; p += 0.005) {
      const current = computeTransition(p).treeOpacity;
      expect(current).toBeLessThanOrEqual(previous + 1e-9);
      previous = current;
    }
  });

  it("produces monotonically increasing log opacity", () => {
    let previous = 0;
    for (let p = 0; p <= 1; p += 0.005) {
      const current = computeTransition(p).logOpacity;
      expect(current).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = current;
    }
  });

  it("keeps both scenes visible at the midpoint of the overlap", () => {
    const overlapStart = Math.max(TREE_FADE_START, LOG_FADE_START);
    const overlapEnd = Math.min(TREE_FADE_END, LOG_FADE_END);
    const mid = (overlapStart + overlapEnd) / 2;
    const state = computeTransition(mid);
    expect(state.treeOpacity).toBeGreaterThan(0);
    expect(state.logOpacity).toBeGreaterThan(0);
  });

  it("has both scenes fully invisible only at progress 1", () => {
    expect(computeTransition(TREE_FADE_END).treeVisible).toBe(false);
    expect(computeTransition(LOG_FADE_START).logVisible).toBe(false);
  });
});
