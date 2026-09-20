"use client";

import { useGLTF } from "@react-three/drei";
import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { computeTransition } from "@/three/scenes/transition";
import { useScrollStore } from "@/store/scrollStore";
import { CutSequence } from "@/three/scenes/CutSequence";

const LOG_URL = "/models/branchbroken.glb";
const LOG_SCALE = 0.09;
const LOG_SOURCE_MIN_Y = -2.85;
const LOG_LIFT = -LOG_SOURCE_MIN_Y * LOG_SCALE;
const LOG_YAW = 0.32;

function prepareLog(root: THREE.Object3D): void {
  root.traverse((object) => {
    object.frustumCulled = false;

    if (!(object instanceof THREE.Mesh)) return;

    object.castShadow = true;
    object.receiveShadow = true;

    object.geometry.computeBoundingBox();
    object.geometry.computeBoundingSphere();

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;

      material.metalness = 0;
      material.roughness = THREE.MathUtils.clamp(
        material.roughness ?? 0.8,
        0.7,
        0.95,
      );
      material.envMapIntensity = 1.0;
      material.normalScale = new THREE.Vector2(1.1, 1.1);

      material.transparent = true;
      material.opacity = 0;

      material.needsUpdate = true;
    }
  });
}

export function LogScene() {
  const gltf = useGLTF(LOG_URL);
  const groupRef = useRef<THREE.Group>(null);

  const subjectMaterials = useMemo(() => {
    const list: THREE.MeshStandardMaterial[] = [];
    gltf.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials) {
        if (material instanceof THREE.MeshStandardMaterial) {
          list.push(material);
        }
      }
    });
    return list;
  }, [gltf.scene]);

  useLayoutEffect(() => {
    prepareLog(gltf.scene);
  }, [gltf.scene]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const progress = useScrollStore.getState().progress;
    const { logOpacity, logVisible } = computeTransition(progress);

    group.visible = logVisible;
    if (!logVisible) return;

    for (const material of subjectMaterials) {
      material.opacity = logOpacity;
      material.depthWrite = logOpacity > 0.99;
    }
  });

  return (
    <group ref={groupRef} frustumCulled={false}>
      <primitive
        object={gltf.scene}
        position={[0, LOG_LIFT, 0]}
        rotation={[0, LOG_YAW, 0]}
        scale={LOG_SCALE}
      />

      <Sparkles
        count={80}
        scale={[4, 1.5, 4]}
        size={3}
        speed={0.18}
        opacity={0.6}
        color="#e8d8b8"
        noise={0.4}
      />

      <CutSequence />
    </group>
  );
}

useGLTF.preload(LOG_URL, "/draco/");
