export const SCROLL_TOTAL_VH = 900;

/**
 * Progress windows for each narrative chapter.
 *
 * The boundaries are contiguous and cover [0, 1] exactly. Each chapter
 * length is proportional to the visual work it contains: the cut and bowl
 * chapters carry the most authored content, while prepare is a brief
 * breath before the lathe.
 */
export const CHAPTER_BOUNDS = {
  tree: { start: 0.0, end: 0.15 },
  cut: { start: 0.15, end: 0.3 },
  prepare: { start: 0.3, end: 0.4 },
  lathe: { start: 0.4, end: 0.7 },
  bowl: { start: 0.7, end: 1.0 },
} as const;

export type ChapterId = keyof typeof CHAPTER_BOUNDS;

export const CHAPTER_ORDER: readonly ChapterId[] = [
  "tree",
  "cut",
  "prepare",
  "lathe",
  "bowl",
] as const;

export const DPR_RANGE: readonly [number, number] = [1, 1.75];
export const DPR_LOW_POWER: readonly [number, number] = [1, 1.25];

/**
 * Camera anchor poses, one per chapter. Times are derived from chapter
 * midpoints by the camera rig, so changing a chapter's window automatically
 * moves the anchor's keyframe.
 */
export const CAMERA_ANCHORS = {
  tree: {
    position: [6.5, 2.4, 7.2] as const,
    target: [0, 2.2, 0] as const,
    fov: 38,
  },
  cut: {
    position: [2.8, 1.6, 3.2] as const,
    target: [0, 0.9, 0] as const,
    fov: 42,
  },
  prepare: {
    position: [0.9, 0.7, 1.4] as const,
    target: [0, 0.22, 0] as const,
    fov: 42,
  },
  lathe: {
    position: [1.7, 0.9, 2.2] as const,
    target: [0, 0.22, 0] as const,
    fov: 42,
  },
  bowl: {
    position: [1.4, 1.1, 1.4] as const,
    target: [0, 0.12, 0] as const,
    fov: 40,
  },
} as const;
