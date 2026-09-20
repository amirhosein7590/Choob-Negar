'use client';

import { LatheMachine } from '@/three/scenes/LatheMachine';
import { LatheBlank } from '@/three/scenes/LatheBlank';
import { LatheTool } from '@/three/scenes/LatheTool';
import { WoodShavings } from '@/three/scenes/WoodShavings';

/**
 * Chapter four: turning the blank into a bowl.
 *
 * The scene has no visibility or opacity logic. It is mounted by
 * SceneSwitcher at the start of the lathe chapter and unmounted at the
 * bowl chapter's boundary. The swap is covered by a DOM veil, so no fade
 * is required here and no overlapping geometry can occur.
 */
export function LatheScene() {
  return (
    <group frustumCulled={false}>
      <LatheMachine />
      <LatheBlank />
      <LatheTool />
      <WoodShavings />
    </group>
  );
}