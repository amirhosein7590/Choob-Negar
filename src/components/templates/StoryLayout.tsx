"use client";

import { CHAPTERS } from "@/features/narrative/chapters";
import { ChapterSection } from "@/components/organisms/ChapterSection";
import { NarrativeOverlay } from "../organisms/NarrativeOverlay";
import { CTASection } from "../organisms/CTASection";

/**
 * Root layout of the narrative experience.
 *
 * The scroll body defines the total scroll length via one section per
 * chapter; each section carries only height and anchor metadata. Chapter
 * text is rendered by NarrativeOverlay, a fixed element that reads the
 * active chapter from the scroll store.
 *
 * A CTA section follows the scroll body so the narrative runs undisturbed
 * for its full length, and the commercial call to action appears only once
 * the story has ended.
 */
export function StoryLayout() {
  return (
    <div className="relative isolate">
      <main className="relative z-10">
        {CHAPTERS.map((chapter) => (
          <ChapterSection key={chapter.id} chapter={chapter} />
        ))}
      </main>

      <CTASection />
      <NarrativeOverlay />
    </div>
  );
}
