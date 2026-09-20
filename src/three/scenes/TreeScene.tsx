"use client";

import { useGLTF } from "@react-three/drei";
import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { applyWindToMaterial } from "@/three/scenes/wind";
import { computeTransition } from "@/three/scenes/transition";
import { useScrollStore } from "@/store/scrollStore";

const TREE_URL = "/models/tree.glb";
const TREE_SCALE = 20;
const TREE_Y_OFFSET = 0.05;
const TREE_YAW = 0.42;

/**
 * Normalises the tree's materials and wires the wind effect.
 *
 * This function is only ever called on a private clone of gltf.scene. The
 * original gltf.scene is treated as an immutable template: BackgroundTrees
 * clones it on every mount, and any mutation here would leak into those
 * clones and produce a shader-state mismatch after a remount cycle.
 *
 * Materials are cloned before modification for the same reason. Sharing a
 * material with gltf.scene would allow modifications applied here to also
 * mutate the shared template.
 */
function prepareTree(root: THREE.Object3D): void {
  root.traverse((object) => {
    object.frustumCulled = false;

    if (!(object instanceof THREE.Mesh)) return;

    object.castShadow = true;
    object.receiveShadow = true;

    object.geometry.computeBoundingBox();
    object.geometry.computeBoundingSphere();

    // Detach from gltf.scene's materials. The clone owns its own material
    // instances from this point forward.
    if (Array.isArray(object.material)) {
      object.material = object.material.map((m) => m.clone());
    } else {
      object.material = object.material.clone();
    }

    const bbox = object.geometry.boundingBox;
    const minY = bbox ? bbox.min.y : 0;
    const height = bbox ? bbox.max.y - bbox.min.y : 1;

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue;

      material.metalness = 0;
      material.roughness = THREE.MathUtils.clamp(
        material.roughness ?? 0.8,
        0.6,
        0.85,
      );
      material.envMapIntensity = 1.1;
      material.normalScale = new THREE.Vector2(1.2, 1.2);

      if (material.transparent || material.alphaTest > 0) {
        material.transparent = true;
        material.alphaTest = 0.45;
        material.depthWrite = true;
        material.side = THREE.DoubleSide;
      }

      applyWindToMaterial(material, minY, height);
      material.needsUpdate = true;
    }
  });
}

export function TreeScene() {
  const gltf = useGLTF(TREE_URL);
  const groupRef = useRef<THREE.Group>(null);

  const treeInstance = useMemo(() => {
    const clone = gltf.scene.clone(true) as THREE.Object3D;
    prepareTree(clone);
    return clone;
  }, [gltf.scene]);

  const subjectMaterials = useMemo(() => {
    const list: THREE.MeshStandardMaterial[] = [];
    treeInstance.traverse((object) => {
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
  }, [treeInstance]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const progress = useScrollStore.getState().progress;
    const { treeOpacity, treeVisible } = computeTransition(progress);

    group.visible = treeVisible;
    if (!treeVisible) return;

    for (const material of subjectMaterials) {
      material.opacity = treeOpacity;
      material.depthWrite = treeOpacity > 0.99;
    }
  });

  return (
    <group ref={groupRef} frustumCulled={false}>
      <primitive
        object={treeInstance}
        position={[0, TREE_Y_OFFSET, 0]}
        rotation={[0, TREE_YAW, 0]}
        scale={TREE_SCALE}
      />

      <Sparkles
        count={90}
        scale={[12, 8, 12]}
        size={6}
        speed={0.32}
        opacity={0.85}
        color="#ffe6b8"
        noise={0.5}
      />
    </group>
  );
}

useGLTF.preload(TREE_URL, "/draco/");
