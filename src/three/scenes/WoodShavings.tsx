"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { CUT_END, CUT_START } from "@/three/scenes/latheSequence";
import { chapterProgress } from "@/features/narrative/chapters";
import { useScrollStore } from "@/store/scrollStore";

const COUNT = 200;
const SEED = 0x1a2b3c4d;
const LIFETIME = 0.14;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VERTEX_SHADER = /* glsl */ `
  attribute float aBirth;
  attribute vec3 aOrigin;
  attribute vec3 aVelocity;
  attribute float aSize;

  uniform float uLocalProgress;
  uniform float uCutStart;
  uniform float uCutSpan;
  uniform float uLifetime;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    float birthLocal = uCutStart + aBirth * uCutSpan;
    float age = uLocalProgress - birthLocal;

    if (age < 0.0 || age > uLifetime) {
      gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      vAlpha = 0.0;
      return;
    }

    vec3 worldPos = aOrigin + aVelocity * age;
    worldPos.y -= 3.8 * age * age;

    vAlpha = 1.0 - smoothstep(uLifetime * 0.4, uLifetime, age);

    vec4 mv = modelViewMatrix * vec4(worldPos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (55.0 / max(-mv.z, 0.001));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float mask = smoothstep(0.5, 0.08, d);
    if (mask < 0.01) discard;
    gl_FragColor = vec4(uColor, mask * vAlpha);
  }
`;

/**
 * Continuous stream of wood shavings from the cutting tool.
 *
 * Particles are seeded once; each carries a birth position within the cut
 * window, an emission point on a ring around the tool's path, and an initial
 * velocity. The vertex shader derives the particle's age from chapter-local
 * progress and culls it once past its lifetime. The whole stream is a pure
 * function of scroll, so scrubbing reverses it exactly.
 */
export function WoodShavings() {
  const { geometry, material } = useMemo(() => {
    const rng = mulberry32(SEED);
    const geo = new THREE.BufferGeometry();

    const origins = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const births = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i += 1) {
      births[i] = rng();

      // Emission point along the tool's path: y drifts from high to low as
      // the cut advances, matching the visible tool motion.
      const toolY = 0.36 - births[i]! * 0.22;
      const toolR = 0.3 + rng() * 0.05;
      const angle = rng() * Math.PI * 2;

      origins[i * 3] = Math.cos(angle) * toolR;
      origins[i * 3 + 1] = toolY + (rng() - 0.5) * 0.04;
      origins[i * 3 + 2] = Math.sin(angle) * toolR;

      // Shavings flick outward with a downward bias.
      const speed = 0.35 + rng() * 0.55;
      velocities[i * 3] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = 0.15 + rng() * 0.35;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;

      sizes[i] = 0.5 + rng() * 1.2;
    }

    geo.setAttribute("aOrigin", new THREE.BufferAttribute(origins, 3));
    geo.setAttribute("aVelocity", new THREE.BufferAttribute(velocities, 3));
    geo.setAttribute("aBirth", new THREE.BufferAttribute(births, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    // Position is unused but required by three.js.
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3),
    );

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uLocalProgress: { value: 0 },
        uCutStart: { value: CUT_START },
        uCutSpan: { value: CUT_END - CUT_START },
        uLifetime: { value: LIFETIME },
        uPixelRatio: {
          value:
            typeof window !== "undefined"
              ? Math.min(window.devicePixelRatio, 2)
              : 1,
        },
        uColor: { value: new THREE.Color("#c8a26a") },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame(() => {
    const progress = useScrollStore.getState().progress;
    const local = chapterProgress(progress, "lathe");
    material.uniforms.uLocalProgress!.value = local;
  });

  return (
    <points
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={20}
    />
  );
}
