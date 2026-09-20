"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { fogAt } from "@/three/environment/workshopTransition";
import { useScrollStore } from "@/store/scrollStore";

/**
 * Advances the scene fog each frame.
 *
 * Fog density and colour are pure functions of scroll progress, so the
 * transition into the workshop is fully scrubbable. The fog is used as a
 * curtain: at the swap moment its density obscures both environments,
 * hiding the world exchange beneath it.
 */
export function FogDriver(): null {
  const scene = useThree((state) => state.scene);

  useFrame(() => {
    if (!(scene.fog instanceof THREE.FogExp2)) return;
    const progress = useScrollStore.getState().progress;
    const state = fogAt(progress);
    scene.fog.density = state.density;
    scene.fog.color.copy(state.color);
  });

  return null;
}
