import { describe, expect, it } from "vitest";
import {
  FOREST_LAYOUT_TEST_CONSTANTS,
  generateForestLayout,
} from "./forestLayout";

const { EXCLUDED_START, EXCLUDED_END, TOTAL_TREES } =
  FOREST_LAYOUT_TEST_CONSTANTS;

describe("generateForestLayout", () => {
  it("returns the expected total number of trees", () => {
    const layout = generateForestLayout();
    expect(layout.length).toBe(TOTAL_TREES);
  });

  it("is deterministic for a fixed seed", () => {
    expect(generateForestLayout()).toEqual(generateForestLayout());
  });

  it("produces different layouts for different seeds", () => {
    expect(generateForestLayout(1)).not.toEqual(generateForestLayout(2));
  });

  it("never places a tree inside the excluded sector", () => {
    for (const tree of generateForestLayout()) {
      const [x, , z] = tree.position;
      const angle = Math.atan2(x, z);
      const inExcluded = angle >= EXCLUDED_START && angle <= EXCLUDED_END;
      expect(inExcluded).toBe(false);
    }
  });

  it("keeps all trees outside the main subject footprint", () => {
    for (const tree of generateForestLayout()) {
      const [x, , z] = tree.position;
      expect(Math.hypot(x, z)).toBeGreaterThan(5);
    }
  });

  it("scales are within a plausible range", () => {
    for (const tree of generateForestLayout()) {
      expect(tree.scale).toBeGreaterThan(0.5);
      expect(tree.scale).toBeLessThan(2);
    }
  });
});
