"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useForestTexture } from "@/three/hooks/useForestTexture";

const GROUND_RADIUS = 80;
const GROUND_SEGMENTS = 128;
const TEXTURE_REPEAT: readonly [number, number] = [24, 24];

const BASE_PATH = "/textures/ground";

/**
 * The forest floor.
 *
 * Uses the Ground037 PBR set for colour, normal, and roughness so the ground
 * reads as earth rather than a flat plane. The mesh sits fractionally below
 * the origin so the main tree's contact shadow lands on it cleanly. The base
 * colour is a dark, desaturated earth tone so the ground recedes behind the
 * subject instead of competing with it.
 */
export function ForestFloor() {
  const colorMap = useForestTexture(
    `${BASE_PATH}/Ground037_2K-JPG_Color.ktx2`,
    {
      srgb: true,
      repeat: TEXTURE_REPEAT,
    },
  );
  const normalMap = useForestTexture(
    `${BASE_PATH}/Ground037_2K-JPG_NormalGL.ktx2`,
    { repeat: TEXTURE_REPEAT },
  );
  const roughnessMap = useForestTexture(
    `${BASE_PATH}/Ground037_2K-JPG_Roughness.ktx2`,
    { repeat: TEXTURE_REPEAT },
  );
  const aoMap = useForestTexture(
    `${BASE_PATH}/Ground037_2K-JPG_AmbientOcclusion.ktx2`,
    { repeat: TEXTURE_REPEAT },
  );

  const ready = Boolean(colorMap && normalMap && roughnessMap && aoMap);

  const material = useMemo(() => {
    if (!ready) return null;
    return new THREE.MeshStandardMaterial({
      map: colorMap ?? null,
      normalMap: normalMap ?? null,
      roughnessMap: roughnessMap ?? null,
      aoMap: aoMap ?? null,
      aoMapIntensity: 0.9,
      roughness: 1,
      metalness: 0,
      // Dark, desaturated earth tone so the ground recedes behind the subject.
      color: new THREE.Color("#99ff66"),
    });
  }, [ready, colorMap, normalMap, roughnessMap, aoMap]);

  if (!material) return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.02, 0]}
      receiveShadow
      material={material}
    >
      <circleGeometry args={[GROUND_RADIUS, GROUND_SEGMENTS]} />
    </mesh>
  );
}
