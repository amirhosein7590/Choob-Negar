'use client';

import { useEffect, useState } from 'react';
import { TreeScene } from '@/three/scenes/TreeScene';
import { LogScene } from '@/three/scenes/LogScene';
import { PrepareScene } from '@/three/scenes/PrepareScene';
import { LatheScene } from '@/three/scenes/LatheScene';
import { BowlScene } from '@/three/scenes/BowlScene';
import { LOG_FADE_START, TREE_FADE_END } from '@/three/scenes/transition';
import {
  LATHE_FADE_IN_START,
  PREPARE_FADE_OUT_END,
} from '@/three/scenes/latheSequence';
import { WORLD_SWAP } from '@/three/environment/workshopTransition';
import { CHAPTER_BOUNDS } from '@/lib/constants';
import { useScrollStore } from '@/store/scrollStore';

interface MountState {
  readonly tree: boolean;
  readonly log: boolean;
  readonly prepare: boolean;
  readonly lathe: boolean;
  readonly bowl: boolean;
}

/**
 * Mounts subject scenes for the current chapter.
 *
 * Boundaries are strict: each scene unmounts at exactly the progress value
 * where the next one mounts, and no window exists in which two scenes are
 * simultaneously mounted. The lathe-to-bowl swap in particular is covered
 * by LatheToBowlVeil; the veil is fully opaque at the swap moment, so the
 * user sees a clean transition rather than two overlapping models.
 *
 * This replaces an earlier design in which the lathe and bowl scenes were
 * briefly both mounted for a crossfade. Because both scenes use materials
 * with interior surfaces visible, that overlap produced dark composited
 * geometry rather than a clean dissolve.
 */
export function SceneSwitcher() {
  const [mounted, setMounted] = useState<MountState>({
    tree: true,
    log: false,
    prepare: false,
    lathe: false,
    bowl: false,
  });

  useEffect(() => {
    const apply = (progress: number) => {
      setMounted((current) => {
        const bowlStart = CHAPTER_BOUNDS.bowl.start;

        const tree = progress < TREE_FADE_END;
        const log = progress > LOG_FADE_START && progress < WORLD_SWAP;
        const prepare =
          progress >= WORLD_SWAP && progress < PREPARE_FADE_OUT_END;
        const lathe =
          progress >= LATHE_FADE_IN_START && progress < bowlStart;
        const bowl = progress >= bowlStart;

        if (
          current.tree === tree &&
          current.log === log &&
          current.prepare === prepare &&
          current.lathe === lathe &&
          current.bowl === bowl
        ) {
          return current;
        }
        return { tree, log, prepare, lathe, bowl };
      });
    };
    apply(useScrollStore.getState().progress);
    return useScrollStore.subscribe((state) => state.progress, apply);
  }, []);

  return (
    <>
      {mounted.tree ? <TreeScene /> : null}
      {mounted.log ? <LogScene /> : null}
      {mounted.prepare ? <PrepareScene /> : null}
      {mounted.lathe ? <LatheScene /> : null}
      {mounted.bowl ? <BowlScene /> : null}
    </>
  );
}