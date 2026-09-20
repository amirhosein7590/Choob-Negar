"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { Sky, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { CameraRig } from "@/three/rig/CameraRig";
import { WorldEnvironment } from "@/three/environment/WorldEnvironment";
import { SceneSwitcher } from "@/three/scenes/SceneSwitcher";
import { WindDriver } from "@/three/scenes/WindDriver";
import { ScrollInvalidator } from "@/three/canvas/ScrollInvalidator";
import { FogDriver } from "@/three/canvas/FogDriver";
import { CinematicPostFX } from "@/three/postprocessing/CinematicPostFX";
import { skyVisible } from "@/three/environment/workshopTransition";
import { useScrollStore } from "@/store/scrollStore";
import { DPR_RANGE } from "@/lib/constants";

const SKY_SUN_POSITION: readonly [number, number, number] = [40, 80, 30];
const SKY_REVEAL_FALLBACK_MS = 6000;

/**
 * Root WebGL surface.
 *
 * The canvas is mounted immediately and its background is set to a dark
 * colour at creation. The Sky mesh is only added once the initial asset set
 * has finished loading, which prevents the bright blue sky from flashing
 * before the forest geometry appears behind it.
 *
 * A fallback timer reveals the Sky regardless of load progress after a
 * fixed delay, so a slow loader cannot keep the scene in its dark opening
 * state forever.
 */
export function SceneRoot() {
  const [showSky, setShowSky] = useState(false);
  const { active, progress } = useProgress();

  // World switch: forest shows Sky, workshop hides it.
  const [isWorkshop, setIsWorkshop] = useState(false);

  useEffect(() => {
    const apply = (value: number) => {
      setIsWorkshop(!skyVisible(value));
    };
    apply(useScrollStore.getState().progress);
    return useScrollStore.subscribe((state) => state.progress, apply);
  }, []);

  // Reveal Sky when assets are loaded, or after a fallback delay.
  useEffect(() => {
    if (showSky) return;
    if (!active && progress >= 100) {
      setShowSky(true);
      return;
    }
    const timer = window.setTimeout(
      () => setShowSky(true),
      SKY_REVEAL_FALLBACK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, progress, showSky]);

  const skyVisibleNow = showSky && !isWorkshop;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        frameloop="always"
        dpr={DPR_RANGE as unknown as [number, number]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        camera={{
          position: [6.5, 2.4, 7.2],
          fov: 38,
          near: 0.15,
          far: 500,
        }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.NoToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          // Dark neutral background, not null. With alpha: false a null
          // background renders as black; using the same dark tone as the
          // page body keeps the pre-load frame from reading as a void.
          scene.background = new THREE.Color("#0a0705");
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        {skyVisibleNow ? (
          <Sky
            distance={450000}
            sunPosition={[
              SKY_SUN_POSITION[0],
              SKY_SUN_POSITION[1],
              SKY_SUN_POSITION[2],
            ]}
            turbidity={1.8}
            rayleigh={0.4}
            mieCoefficient={0.002}
            mieDirectionalG={0.85}
          />
        ) : null}

        <Suspense fallback={null}>
          <WorldEnvironment />
        </Suspense>

        <Suspense fallback={null}>
          <SceneSwitcher />
        </Suspense>

        <WindDriver />

        <fogExp2 attach="fog" args={["#6a7a8a", 0.014]} />
        <FogDriver />

        <CameraRig />
        <ScrollInvalidator />

        <CinematicPostFX />
      </Canvas>
    </div>
  );
}
