"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { cutAmount } from "@/three/scenes/latheSequence";
import { chapterProgress } from "@/features/narrative/chapters";
import { useScrollStore } from "@/store/scrollStore";
import { clamp, lerp, smoothstep } from "@/lib/math";

const TOOL_LENGTH = 0.32;
const TOOL_WIDTH = 0.035;

/**
 * The turning tool. It approaches from the side of the blank, then rides
 * down the outer profile as the shape is cut, ending near the base of the
 * bowl where a woodturner would finish the foot.
 */
export function LatheTool() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const progress = useScrollStore.getState().progress;
    const local = chapterProgress(progress, "lathe");
    const cut = cutAmount(local);

    // The tool rides the outer surface: height falls from near the top of
    // the blank toward the bottom of the bowl as the cut proceeds.
    const y = lerp(0.36, 0.14, smoothstep(cut));
    const r = lerp(0.32, 0.3, cut);

    group.position.set(r, y, 0);
    group.rotation.set(0, 0, -0.35);

    // Visible only while the cut is actively happening.
    const appear = smoothstep(clamp((local - 0.1) / 0.05, 0, 1));
    const disappear = 1 - smoothstep(clamp((local - 0.86) / 0.05, 0, 1));
    const visibility = Math.min(appear, disappear);
    group.visible = visibility > 0.01;
    group.scale.setScalar(visibility);
  });

  return (
    <group ref={groupRef} frustumCulled={false}>
      <mesh position={[0, TOOL_LENGTH / 2, 0]} castShadow>
        <boxGeometry args={[TOOL_WIDTH, TOOL_LENGTH, TOOL_WIDTH * 0.6]} />
        <meshStandardMaterial
          color="#a8a8b0"
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>

      <mesh position={[-0.02, 0, 0]} castShadow>
        <boxGeometry args={[0.028, 0.05, 0.035]} />
        <meshStandardMaterial
          color="#d8d8e0"
          metalness={0.95}
          roughness={0.12}
        />
      </mesh>
    </group>
  );
}
