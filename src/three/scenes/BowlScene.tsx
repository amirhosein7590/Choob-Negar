'use client';

import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { bowlBobOffset, bowlOrbitYaw } from '@/three/scenes/bowlSequence';
import { chapterProgress } from '@/features/narrative/chapters';
import { useScrollStore } from '@/store/scrollStore';

const BOWL_URL = '/models/wooden_bowl.glb';
const DRACO_PATH = '/draco/';

/** Bowl scale at each breakpoint. Smaller on mobile so it fits the frame. */
const BOWL_SCALE_DESKTOP = 0.22;
const BOWL_SCALE_MOBILE = 0.14;

function bowlScaleForWidth(width: number): number {
  if (width < 640) return BOWL_SCALE_MOBILE;
  if (width < 1024) return (BOWL_SCALE_MOBILE + BOWL_SCALE_DESKTOP) / 2;
  return BOWL_SCALE_DESKTOP;
}

/**
 * Applies material tweaks once at load.
 *
 * The GLB ships a single base-colour texture with no normal or roughness
 * map. Metalness is forced to zero and roughness set high so the wood reads
 * as matte rather than polished plastic. Transparent is explicitly left
 * off: the material is opaque, and enabling transparency here would make
 * the bowl composite incorrectly with anything behind it.
 */
function prepareBowl(root: THREE.Object3D): void {
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
      material.roughness = 0.6;
      material.envMapIntensity = 0.9;
      material.side = THREE.DoubleSide;
      material.transparent = false;
      material.opacity = 1;
      material.depthWrite = true;
      material.needsUpdate = true;
    }
  });
}

/**
 * Y offset that brings the model's lowest vertex to the floor after scaling.
 */
function computeBaseOffset(root: THREE.Object3D, scale: number): number {
  const box = new THREE.Box3().setFromObject(root);
  return -box.min.y * scale;
}

export function BowlScene() {
  const gltf = useGLTF(BOWL_URL, DRACO_PATH);
  const bowlRef = useRef<THREE.Group>(null);
  const size = useThree((state) => state.size);

  const bowlScale = useMemo(() => bowlScaleForWidth(size.width), [size.width]);
  const bowlInstance = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  const baseOffset = useMemo(
    () => computeBaseOffset(bowlInstance, bowlScale),
    [bowlInstance, bowlScale],
  );

  useLayoutEffect(() => {
    prepareBowl(bowlInstance);
  }, [bowlInstance]);

  useFrame(() => {
    const group = bowlRef.current;
    if (!group) return;

    const progress = useScrollStore.getState().progress;
    const local = chapterProgress(progress, 'bowl');

    group.rotation.y = bowlOrbitYaw(local);
    group.position.y = baseOffset + bowlBobOffset(local);
  });

  return (
    <group ref={bowlRef} frustumCulled={false}>
      <primitive
        object={bowlInstance}
        position={[0, 0, 0]}
        scale={bowlScale}
      />
    </group>
  );
}

useGLTF.preload(BOWL_URL, DRACO_PATH);