import { describe, expect, it } from "vitest";
import {
  CHAPTERS,
  assertChaptersAreContinuous,
  chapterAt,
  chapterProgress,
} from "./chapters";
import { CHAPTER_BOUNDS, CHAPTER_ORDER } from "@/lib/constants";

describe("chapters metadata", () => {
  it("is continuous and covers [0, 1]", () => {
    expect(() => assertChaptersAreContinuous()).not.toThrow();
  });

  it("has ordered indices matching array order", () => {
    CHAPTERS.forEach((chapter, index) => {
      expect(chapter.index).toBe(index);
    });
  });

  it("has the same number of entries as CHAPTER_ORDER", () => {
    expect(CHAPTERS.length).toBe(CHAPTER_ORDER.length);
  });
});

describe("chapterAt", () => {
  it("returns the first chapter at progress 0", () => {
    expect(chapterAt(0).id).toBe("tree");
  });

  it("returns the last chapter at progress 1", () => {
    expect(chapterAt(1).id).toBe("bowl");
  });

  it("clamps progress below 0", () => {
    expect(chapterAt(-0.5).id).toBe("tree");
  });

  it("clamps progress above 1", () => {
    expect(chapterAt(1.5).id).toBe("bowl");
  });

  it("returns the correct chapter at each chapter midpoint", () => {
    for (const id of CHAPTER_ORDER) {
      const { start, end } = CHAPTER_BOUNDS[id];
      const mid = (start + end) / 2;
      expect(chapterAt(mid).id).toBe(id);
    }
  });

  it("returns the next chapter exactly at each boundary", () => {
    expect(chapterAt(CHAPTER_BOUNDS.tree.end).id).toBe("cut");
    expect(chapterAt(CHAPTER_BOUNDS.cut.end).id).toBe("prepare");
    expect(chapterAt(CHAPTER_BOUNDS.prepare.end).id).toBe("lathe");
    expect(chapterAt(CHAPTER_BOUNDS.lathe.end).id).toBe("bowl");
  });
});

describe("chapterProgress", () => {
  it("is 0 at chapter start", () => {
    expect(chapterProgress(0, "tree")).toBe(0);
    expect(chapterProgress(CHAPTER_BOUNDS.lathe.start, "lathe")).toBe(0);
  });

  it("is 1 at chapter end", () => {
    expect(chapterProgress(CHAPTER_BOUNDS.tree.end, "tree")).toBe(1);
    expect(chapterProgress(1, "bowl")).toBe(1);
  });

  it("is 0.5 at chapter midpoint", () => {
    const mid = (CHAPTER_BOUNDS.prepare.start + CHAPTER_BOUNDS.prepare.end) / 2;
    expect(chapterProgress(mid, "prepare")).toBeCloseTo(0.5, 6);
  });

  it("clamps values outside the chapter", () => {
    expect(chapterProgress(-0.5, "bowl")).toBe(0);
    expect(chapterProgress(1.5, "tree")).toBe(1);
  });
});
