import { describe, expect, it } from "vitest";
import { sampleCamera } from "./cameraPath";
import { CAMERA_ANCHORS, CHAPTER_BOUNDS, CHAPTER_ORDER } from "@/lib/constants";

describe("sampleCamera", () => {
  it("returns the first anchor pose at progress 0", () => {
    const sample = sampleCamera(0);
    const firstId = CHAPTER_ORDER[0]!;
    const anchor = CAMERA_ANCHORS[firstId];
    expect(sample.position).toEqual(anchor.position);
    expect(sample.target).toEqual(anchor.target);
    expect(sample.fov).toBe(anchor.fov);
  });

  it("returns the last anchor pose at progress 1", () => {
    const sample = sampleCamera(1);
    const lastId = CHAPTER_ORDER[CHAPTER_ORDER.length - 1]!;
    const anchor = CAMERA_ANCHORS[lastId];
    expect(sample.position).toEqual(anchor.position);
    expect(sample.target).toEqual(anchor.target);
    expect(sample.fov).toBe(anchor.fov);
  });

  it("clamps values outside [0, 1]", () => {
    expect(sampleCamera(-0.5)).toEqual(sampleCamera(0));
    expect(sampleCamera(1.5)).toEqual(sampleCamera(1));
  });

  it("is deterministic for the same input", () => {
    const a = sampleCamera(0.42);
    const b = sampleCamera(0.42);
    expect(a).toEqual(b);
  });

  it("is continuous across chapter boundaries", () => {
    const epsilon = 0.002;
    for (const id of CHAPTER_ORDER) {
      const { start } = CHAPTER_BOUNDS[id];
      if (start === 0) continue;
      const before = sampleCamera(start - epsilon);
      const after = sampleCamera(start + epsilon);
      expect(Math.abs(before.position[0] - after.position[0])).toBeLessThan(
        0.5,
      );
      expect(Math.abs(before.position[1] - after.position[1])).toBeLessThan(
        0.5,
      );
      expect(Math.abs(before.position[2] - after.position[2])).toBeLessThan(
        0.5,
      );
      expect(Math.abs(before.fov - after.fov)).toBeLessThan(0.5);
    }
  });

  it("produces monotonically changing position between adjacent anchors", () => {
    const firstId = CHAPTER_ORDER[0]!;
    const secondId = CHAPTER_ORDER[1]!;
    const mid =
      (CHAPTER_BOUNDS[firstId].end + CHAPTER_BOUNDS[secondId].start) / 2;
    const a = sampleCamera(mid - 0.01);
    const b = sampleCamera(mid);
    const c = sampleCamera(mid + 0.01);
    const distance = (p: typeof a, q: typeof b) =>
      Math.hypot(
        p.position[0] - q.position[0],
        p.position[1] - q.position[1],
        p.position[2] - q.position[2],
      );
    expect(distance(a, b)).toBeGreaterThan(0);
    expect(distance(b, c)).toBeGreaterThan(0);
  });
});
