"use client";

import { ForestLighting } from "@/three/lighting/ForestLighting";
import { ForestFloor } from "@/three/environment/ForestFloor";
import { BackgroundTrees } from "@/three/environment/BackgroundTrees";

/**
 * The shared forest environment.
 *
 * Lighting, ground, and background trees belong to the world rather than to
 * any single chapter, so they live here and are mounted once at the canvas
 * root. Each chapter scene contributes only its own subject on top of this
 * base.
 */
export function ForestEnvironment() {
  return (
    <>
      <ForestLighting />
      <ForestFloor />
      <BackgroundTrees />
    </>
  );
}
