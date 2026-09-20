"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import {
  CUT_POINT,
  SAWDUST_LIFETIME,
  particleAge,
  sawingProgress,
} from "@/three/scenes/cutSequence";
import { chapterProgress } from "@/features/narrative/chapters";
import { useScrollStore } from "@/store/scrollStore";

const COUNT = 240;
const SEED = 0xa53f9e91;

/**
 * Deterministic pseudo-random generator. Replacing this with Math.random
 * would make the burst pattern non-reproducible across reloads and would
 * break the scrubbable guarantee that the same progress always produces the
 * same frame.
 */
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
  attribute vec3 aOffset;
  attribute vec3 aVelocity;
  attribute float aSize;

  uniform float uLocalProgress;
  uniform float uSawStart;
  uniform float uSawSpan;
  uniform float uLifetime;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    float birthLocal = uSawStart + aBirth * uSawSpan;
    float age = uLocalProgress - birthLocal;

    if (age < 0.0 || age > uLifetime) {
      gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      vAlpha = 0.0;
      return;
    }

    // Ballistic path. Gravity strength is a visual constant tuned so chips
    // fall roughly half a world unit before fading, matching the log scale.
    vec3 worldPos = position + aOffset;
    worldPos += aVelocity * age;
    worldPos.y -= 4.5 * age * age;

    vAlpha = 1.0 - smoothstep(uLifetime * 0.5, uLifetime, age);

    vec4 mv = modelViewMatrix * vec4(worldPos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (60.0 / max(-mv.z, 0.001));
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float mask = smoothstep(0.5, 0.05, d);
    if (mask < 0.01) discard;
    gl_FragColor = vec4(uColor, mask * vAlpha);
  }
`;

/**
 * Continuous sawdust emission during the sawing window.
 *
 * Each particle is assigned a normalised birth position within the sawing
 * window at construction. The vertex shader derives the particle's current
 * age from the chapter's local progress and culls it once past its lifetime.
 * Because age is a pure function of progress, the stream is fully reversible
 * and reproduces exactly on every scroll pass.
 */
export function SawdustStream() {
  const { geometry, material } = useMemo(() => {
    const rng = mulberry32(SEED);
    const geo = new THREE.BufferGeometry();

    const positions = new Float32Array(COUNT * 3);
    const births = new Float32Array(COUNT);
    const offsets = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    const [cx, cy, cz] = CUT_POINT;

    for (let i = 0; i < COUNT; i += 1) {
      positions[i * 3] = cx;
      positions[i * 3 + 1] = cy;
      positions[i * 3 + 2] = cz;

      births[i] = rng();

      // Small jitter around the cut point so particles do not all originate
      // from a single coordinate.
      offsets[i * 3] = (rng() - 0.5) * 0.12;
      offsets[i * 3 + 1] = (rng() - 0.5) * 0.05;
      offsets[i * 3 + 2] = (rng() - 0.5) * 0.28;

      // Outward burst biased upward so chips arc away from the blade and
      // then fall under the shader's gravity term.
      const angle = rng() * Math.PI * 2;
      const outwardSpeed = 0.35 + rng() * 0.65;
      velocities[i * 3] = Math.cos(angle) * outwardSpeed;
      velocities[i * 3 + 1] = 0.35 + rng() * 0.75;
      velocities[i * 3 + 2] = Math.sin(angle) * outwardSpeed;

      sizes[i] = 0.5 + rng() * 1.3;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aBirth", new THREE.BufferAttribute(births, 1));
    geo.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 3));
    geo.setAttribute("aVelocity", new THREE.BufferAttribute(velocities, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    // The shader works in sawing-window coordinates, so the birth times
    // already stored are in that space. The span uniform carries the length
    // of the sawing window in local-progress units.
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uLocalProgress: { value: 0 },
        uSawStart: { value: 0.32 },
        uSawSpan: { value: 0.5 },
        uLifetime: { value: SAWDUST_LIFETIME },
        uPixelRatio: {
          value:
            typeof window !== "undefined"
              ? Math.min(window.devicePixelRatio, 2)
              : 1,
        },
        uColor: { value: new THREE.Color("#c8a060") },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame(() => {
    const globalProgress = useScrollStore.getState().progress;
    const local = chapterProgress(globalProgress, "cut");
    material.uniforms.uLocalProgress!.value = local;
    // Silences the unused import warning on sawingProgress without changing
    // behavior: the value is only informational here.
    void sawingProgress(local);
    void particleAge(local, 0);
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
