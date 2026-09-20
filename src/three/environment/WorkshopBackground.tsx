"use client";

import { useLoader, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const HDRI_PATH = "/hdri/workshop_1k.hdr";

/**
 * Sets the workshop HDRI as the scene background while the component is
 * mounted.
 *
 * Uses scene.background with an equirectangular-mapped texture rather than a
 * back-facing sphere. Three.js handles the projection, colour space, and
 * tone mapping for scene.background in the standard pipeline, and the result
 * is not subject to transparency or render-order issues. A manual sphere was
 * prone to both.
 *
 * backgroundIntensity lifts the HDRI into a usable mid-tone range; the exact
 * value depends on the source file and is tuned for the current workshop
 * HDRI.
 */
const BACKGROUND_INTENSITY = 1.6;

export function WorkshopBackground(): null {
  const texture = useLoader(RGBELoader, HDRI_PATH);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const tex = texture.clone();
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.LinearSRGBColorSpace;
    tex.needsUpdate = true;

    const previousBackground = scene.background;
    const previousIntensity = scene.backgroundIntensity;

    scene.background = tex;
    scene.backgroundIntensity = BACKGROUND_INTENSITY;

    return () => {
      scene.background = previousBackground;
      scene.backgroundIntensity = previousIntensity;
      tex.dispose();
    };
  }, [texture, scene]);

  return null;
}
