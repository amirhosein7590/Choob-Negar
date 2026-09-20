"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useForestTexture } from "@/three/hooks/useForestTexture";
import { chapterProgress } from "@/features/narrative/chapters";
import { useScrollStore } from "@/store/scrollStore";
import { smoothstep, clamp } from "@/lib/math";
import { computeWorkshopFade } from "@/three/scenes/latheSequence";

const BLANK_RADIUS = 0.28;
const BLANK_HEIGHT = 0.42;
const BLANK_SEGMENTS = 96;
const TEXTURE_REPEAT: readonly [number, number] = [2, 1];
const TEXTURE_PATH = "/textures/wood_light";

/**
 * The raw wood blank from which the bowl will be turned.
 *
 * A procedural cylinder textured with the light-wood PBR set. Rotation is
 * a pure function of chapter-local progress: the blank turns about half a
 * revolution across the chapter, prefiguring the lathe's spin.
 */
export function PrepareScene() {
  const groupRef = useRef<THREE.Group>(null);

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
  const aoMap = useForestTexture(
    `${TEXTURE_PATH}/Wood062_2K-JPG_AmbientOcclusion.ktx2`,
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
      roughness: 0.82,
      metalness: 0,
      envMapIntensity: 1.0,
      transparent: true,
      opacity: 1,
    });
  }, [ready, colorMap, normalMap, roughnessMap, aoMap]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const globalProgress = useScrollStore.getState().progress;
    const local = chapterProgress(globalProgress, "prepare");
    group.rotation.y = smoothstep(clamp(local, 0, 1)) * Math.PI * 0.9;
    const { prepareOpacity, prepareVisible } = computeWorkshopFade(
      useScrollStore.getState().progress,
    );
    group.visible = prepareVisible;
    if (prepareVisible && material) {
      material.transparent = prepareOpacity < 0.999;
      material.opacity = prepareOpacity;
      material.depthWrite = prepareOpacity > 0.999;
    }
  });

  if (!material) return null;

  return (
    <group ref={groupRef} frustumCulled={false}>
      <mesh
        position={[0, BLANK_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
        material={material}
        frustumCulled={false}
      >
        <cylinderGeometry
          args={[
            BLANK_RADIUS,
            BLANK_RADIUS * 0.96,
            BLANK_HEIGHT,
            BLANK_SEGMENTS,
            1,
          ]}
        />
      </mesh>

      <Sparkles
        count={50}
        scale={[1.2, 0.9, 1.2]}
        size={2.5}
        speed={0.15}
        opacity={0.55}
        color="#e8d8b8"
        noise={0.4}
      />
    </group>
  );
}
