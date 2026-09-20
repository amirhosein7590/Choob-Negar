"use client";

import { useMemo } from "react";
import { SCROLL_TOTAL_VH } from "@/lib/constants";
import type { Chapter } from "@/features/narrative/chapters";

interface ChapterSectionProps {
  readonly chapter: Chapter;
}

/**
 * A single narrative segment.
 *
 * The section contributes only height and an accessibility anchor; chapter
 * text is rendered by NarrativeOverlay. Keeping the text out of the scroll
 * body means the layout never has to reconcile a fixed-position overlay with
 * document flow.
 */
export function ChapterSection({ chapter }: ChapterSectionProps) {
  const heightVh = useMemo(
    () => Math.max(100, (chapter.end - chapter.start) * SCROLL_TOTAL_VH),
    [chapter.end, chapter.start],
  );

  return (
    <section
      data-chapter={chapter.id}
      id={`chapter-${chapter.id}`}
      className="relative"
      style={{ minHeight: `${heightVh}vh` }}
      aria-hidden="true"
    />
  );
}
