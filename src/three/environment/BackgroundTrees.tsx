"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { generateForestLayout } from "@/three/environment/forestLayout";
import { applyWindToMaterial } from "@/three/scenes/wind";

const TREE_URL = "/models/tree.glb";
const BASE_TREE_SCALE = 20;

/**
 * Converts a shared tree material into a background variant.
 *
 * Always called on a fresh material clone, so the source (gltf.scene's
 * pristine template) is never touched. The background variant switches
 * alpha-tested foliage to alpha blending so leaves integrate with fog and
 * sky at distance.
 */
function prepareBackgroundMaterial(
  source: THREE.Material,
  minY: number,
  height: number,
): THREE.Material {
  const material = source.clone();

  if (material instanceof THREE.MeshStandardMaterial) {
    if (material.transparent || material.alphaTest > 0) {
      material.transparent = true;
      material.alphaTest = 0.05;
      material.depthWrite = false;
      material.side = THREE.DoubleSide;
    }
    material.envMapIntensity = 1.0;
    material.fog = true;
    applyWindToMaterial(material, minY, height);
  }

  return material;
}

/**
 * Renders the background forest.
 *
 * Clones are created from a pristine gltf.scene: TreeScene never mutates the
 * template, so every mount produces the same clone state. There is no
 * cleanup effect. React StrictMode would run any cleanup on the phantom
 * unmount between the two mounts of development mode, clearing the cloned
 * children and leaving empty containers behind on the second mount.
 */
export function BackgroundTrees() {
  const gltf = useGLTF(TREE_URL);

  const instances = useMemo(() => {
    return generateForestLayout().map((placement) => {
      const object = gltf.scene.clone(true);

      object.traverse((child) => {
        child.frustumCulled = false;
        if (!(child instanceof THREE.Mesh)) return;

        child.castShadow = placement.castShadow;
        child.receiveShadow = false;

        child.geometry.computeBoundingBox();
        const bbox = child.geometry.boundingBox;
        const minY = bbox ? bbox.min.y : 0;
        const height = bbox ? bbox.max.y - bbox.min.y : 1;

        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) =>
            prepareBackgroundMaterial(m, minY, height),
          );
        } else {
          child.material = prepareBackgroundMaterial(
            child.material,
            minY,
            height,
          );
        }
      });

      return {
        object,
        placement,
        effectiveScale: BASE_TREE_SCALE * placement.scale,
      };
    });
  }, [gltf.scene]);

  return (
    <>
      {instances.map(({ object, placement, effectiveScale }, index) => (
        <primitive
          key={index}
          object={object}
          position={[placement.position[0], 0, placement.position[2]]}
          rotation={[0, placement.yaw, 0]}
          scale={effectiveScale}
        />
      ))}
    </>
  );
}
