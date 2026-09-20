"use client";

import { ContactShadows } from "@react-three/drei";
import { WorkshopBackground } from "./WorkshopBackground";
import { WorkshopLighting } from "@/three/lighting/WorkshopLighting";

/**
 * The workshop world.
 *
 * There is no visible floor plane. A large flat plane reads as a brown slab
 * once the camera is low enough to graze it, which dominated the frame in
 * the previous version. ContactShadows provides the shadow under the blank
 * without introducing any geometry that the camera can see.
 */
export function WorkshopEnvironment() {
  return (
    <>
      <WorkshopLighting />
      <WorkshopBackground />
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.55}
        scale={3}
        blur={2.5}
        far={2}
        resolution={1024}
        color="#0a0604"
        frames={Infinity}
      />
    </>
  );
}
