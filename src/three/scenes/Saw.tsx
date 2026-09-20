"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sawPose } from "@/three/scenes/cutSequence";
import { chapterProgress } from "@/features/narrative/chapters";
import { useScrollStore } from "@/store/scrollStore";

const BLADE_LENGTH = 2.4;
const BLADE_BODY_HEIGHT = 0.12;
const TOOTH_DEPTH = 0.035;
const TOOTH_COUNT = 22;
const BLADE_THICKNESS = 0.014;

const HANDLE_LENGTH = 0.34;
const HANDLE_HEIGHT = 0.15;
const HANDLE_THICKNESS = 0.055;

/**
 * Builds the blade profile as an extruded 2D shape.
 *
 * Drawing the teeth into the profile rather than bolting separate meshes
 * onto a rectangle produces one continuous surface with correct normals and
 * a single draw call. The shape is authored in the XY plane with the length
 * along X and teeth pointing toward -Y.
 */
function createBladeGeometry(): THREE.ExtrudeGeometry {
  const half = BLADE_LENGTH / 2;
  const toothSpan = BLADE_LENGTH / TOOTH_COUNT;

  const shape = new THREE.Shape();
  shape.moveTo(half, 0);
  shape.lineTo(-half, 0);
  shape.lineTo(-half, -BLADE_BODY_HEIGHT);

  for (let i = 0; i < TOOTH_COUNT; i += 1) {
    const baseX = -half + i * toothSpan;
    const tipX = baseX + toothSpan * 0.5;
    const endX = baseX + toothSpan;
    shape.lineTo(tipX, -BLADE_BODY_HEIGHT - TOOTH_DEPTH);
    shape.lineTo(endX, -BLADE_BODY_HEIGHT);
  }

  shape.lineTo(half, 0);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: BLADE_THICKNESS,
    bevelEnabled: false,
    curveSegments: 1,
  });

  // Centre vertically and rotate so the blade length runs along Z. After the
  // rotation, teeth point down along world -Y and the blade thickness is
  // along world X.
  geometry.translate(
    0,
    (BLADE_BODY_HEIGHT + TOOTH_DEPTH) / 2,
    -BLADE_THICKNESS / 2,
  );
  geometry.rotateY(Math.PI / 2);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

/**
 * Procedural hand saw.
 *
 * The blade is a single extruded mesh with teeth built into the profile.
 * The handle is a separate wooden block mounted at the +Z end of the blade,
 * which is the trailing end as the saw moves through the cut.
 *
 * The entire transform is read from sawPose each frame, so the saw is a
 * pure function of scroll progress and behaves identically when the scroll
 * is reversed.
 */
export function Saw() {
  const groupRef = useRef<THREE.Group>(null);
  const bladeGeometry = useMemo(createBladeGeometry, []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const globalProgress = useScrollStore.getState().progress;
    const local = chapterProgress(globalProgress, "cut");
    const pose = sawPose(local);

    group.visible = pose.visible;
    if (!pose.visible) return;

    group.position.set(pose.position[0], pose.position[1], pose.position[2]);
    group.rotation.set(pose.rotation[0], pose.rotation[1], pose.rotation[2]);
    group.scale.setScalar(pose.scale);
  });

  return (
    <group ref={groupRef} frustumCulled={false}>
      <mesh geometry={bladeGeometry} castShadow frustumCulled={false}>
        <meshStandardMaterial
          color="#c4c4cc"
          roughness={0.22}
          metalness={0.9}
          envMapIntensity={1.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[
          0,
          BLADE_BODY_HEIGHT * 0.4,
          BLADE_LENGTH / 2 + HANDLE_LENGTH / 2,
        ]}
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[HANDLE_THICKNESS, HANDLE_HEIGHT, HANDLE_LENGTH]} />
        <meshStandardMaterial color="#5a3f2a" roughness={0.82} metalness={0} />
      </mesh>
    </group>
  );
}
