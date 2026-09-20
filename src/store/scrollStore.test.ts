import { beforeEach, describe, expect, it } from "vitest";
import { getScrollProgress, useScrollStore } from "./scrollStore";

describe("scrollStore", () => {
  beforeEach(() => {
    useScrollStore.getState().reset();
  });

  it("starts with the documented initial state", () => {
    const state = useScrollStore.getState();
    expect(state.progress).toBe(0);
    expect(state.activeChapterId).toBe("tree");
    expect(state.reducedMotion).toBe(false);
  });

  it("updates progress and active chapter atomically", () => {
    useScrollStore.getState().setProgress(0.35, "prepare");
    const state = useScrollStore.getState();
    expect(state.progress).toBe(0.35);
    expect(state.activeChapterId).toBe("prepare");
  });

  it("notifies progress subscribers in order", () => {
    const seen: number[] = [];
    const unsubscribe = useScrollStore.subscribe(
      (state) => state.progress,
      (progress) => {
        seen.push(progress);
      },
    );

    useScrollStore.getState().setProgress(0.1, "tree");
    useScrollStore.getState().setProgress(0.2, "cut");
    useScrollStore.getState().setProgress(0.35, "prepare");
    unsubscribe();

    expect(seen).toEqual([0.1, 0.2, 0.35]);
  });

  it("does not notify when both fields are unchanged", () => {
    const seen: number[] = [];
    const unsubscribe = useScrollStore.subscribe(
      (state) => state.progress,
      (progress) => {
        seen.push(progress);
      },
    );

    useScrollStore.getState().setProgress(0.2, "cut");
    useScrollStore.getState().setProgress(0.2, "cut");
    unsubscribe();

    expect(seen).toEqual([0.2]);
  });

  it("notifies chapter subscribers only on chapter change", () => {
    const seen: string[] = [];
    const unsubscribe = useScrollStore.subscribe(
      (state) => state.activeChapterId,
      (chapter) => {
        seen.push(chapter);
      },
    );

    useScrollStore.getState().setProgress(0.05, "tree");
    useScrollStore.getState().setProgress(0.1, "tree");
    useScrollStore.getState().setProgress(0.2, "cut");
    useScrollStore.getState().setProgress(0.25, "cut");
    useScrollStore.getState().setProgress(0.35, "prepare");
    unsubscribe();

    expect(seen).toEqual(["cut", "prepare"]);
  });

  it("mirrors setReducedMotion without spurious notifications", () => {
    const seen: boolean[] = [];
    const unsubscribe = useScrollStore.subscribe(
      (state) => state.reducedMotion,
      (value) => {
        seen.push(value);
      },
    );

    useScrollStore.getState().setReducedMotion(false);
    useScrollStore.getState().setReducedMotion(true);
    useScrollStore.getState().setReducedMotion(true);
    useScrollStore.getState().setReducedMotion(false);
    unsubscribe();

    expect(seen).toEqual([true, false]);
  });

  it("exposes progress through the hot-path accessor", () => {
    useScrollStore.getState().setProgress(0.42, "lathe");
    expect(getScrollProgress()).toBe(0.42);
  });

  it("resets back to the initial state", () => {
    useScrollStore.getState().setProgress(0.8, "bowl");
    useScrollStore.getState().setReducedMotion(true);
    useScrollStore.getState().reset();

    const state = useScrollStore.getState();
    expect(state.progress).toBe(0);
    expect(state.activeChapterId).toBe("tree");
    expect(state.reducedMotion).toBe(false);
  });
});
