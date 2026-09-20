"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  buildProfile,
  cutAmount,
  spinRate,
} from "@/three/scenes/latheSequence";
import { useForestTexture } from "@/three/hooks/useForestTexture";
import { chapterProgress } from "@/features/narrative/chapters";
import { useScrollStore } from "@/store/scrollStore";

const TEXTURE_REPEAT: readonly [number, number] = [3, 1];
const TEXTURE_PATH = "/textures/wood_light";
const LATHE_SEGMENTS = 64;

/**
 * The rotating wood on the lathe.
 *
 * Geometry is rebuilt from the current morph amount only when that amount
 * has moved by more than REBUILD_THRESHOLD, avoiding per-frame allocations
 * during the spin-up and spin-down phases where the shape is static. Rotation
 * is integrated frame by frame from the spin rate, so the wood keeps turning
 * smoothly even while the shape is unchanged.
 */
const REBUILD_THRESHOLD = 0.0008;

export function LatheBlank() {
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(0);
  const lastCutRef = useRef(-1);
  const geometryRef = useRef<THREE.BufferGeometry>(
    new THREE.LatheGeometry(buildProfile(0), LATHE_SEGMENTS),
  );

  const colorMap = useForestTexture(
    `${TEXTURE_PATH}/Wood062_2K-JPG_Color.ktx2`,
    { srgb: true, repeat: TEXTURE_REPEAT },
  );
  const normalMap = useForestTexture(
    `${TEXTURE_PATH}/Wood062_2K-JPG_NormalGL.ktx2`,
    { repeat: TEXTURE_REPEAT },
  );
  const roughnessMap = useForestTexture(
    `${TEXTURE_PATH}/Wood062_2K-JPG_Roughness.ktx2`,
    { repeat: TEXTURE_REPEAT },
  );
const material = useMemo(() => {
  if (!colorMap || !normalMap || !roughnessMap) return null;
  return new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap,
    roughnessMap,
    roughness: 0.85,
    metalness: 0,
    envMapIntensity: 0.9,
    side: THREE.DoubleSide,
  });
}, [colorMap, normalMap, roughnessMap]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh || !material) return;

    const progress = useScrollStore.getState().progress;
    const local = chapterProgress(progress, "lathe");

    const cut = cutAmount(local);
    if (Math.abs(cut - lastCutRef.current) > REBUILD_THRESHOLD) {
      lastCutRef.current = cut;
      const next = new THREE.LatheGeometry(buildProfile(cut), LATHE_SEGMENTS);
      geometryRef.current.dispose();
      geometryRef.current = next;
      mesh.geometry = next;
    }

    const rate = spinRate(local);
    angleRef.current += rate * delta;
    mesh.rotation.y = angleRef.current;
  });

  if (!material) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometryRef.current}
      material={material}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}
