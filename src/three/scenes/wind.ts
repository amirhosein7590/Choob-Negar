import * as THREE from "three";

export const windUniforms = {
  uWindTime: { value: 0 },
  uWindStrength: { value: 0.06 },
};

const WIND_PARS = /* glsl */ `
  uniform float uWindTime;
  uniform float uWindStrength;
  uniform float uWindMinY;
  uniform float uWindHeight;
`;

const WIND_VERTEX = /* glsl */ `
  float windH = clamp((position.y - uWindMinY) / max(uWindHeight, 0.0001), 0.0, 1.0);
  float windAmount = smoothstep(0.35, 0.95, windH);

  float windWaveA = sin(uWindTime * 0.6 + position.x * 0.3 + position.z * 0.4);
  float windWaveB = sin(uWindTime * 1.3 + position.x * 0.9 + position.z * 0.7);
  float windCombined = (windWaveA + windWaveB * 0.35) * uWindStrength * windAmount;

  float windFlutter = sin(uWindTime * 3.4 + position.x * 4.0 + position.y * 3.0)
                    * uWindStrength * windAmount * 0.3;

  transformed.x += windCombined + windFlutter;
  transformed.z += windCombined * 0.45 + windFlutter * 0.6;
`;

/**
 * Monotonic counter used to give each material instance a unique shader
 * cache key. Without this, three.js reuses a program compiled for a previous
 * material instance, which produces stale uniforms after a remount cycle.
 * The counter is incremented per call so no two materials ever share a
 * cache key. The memory cost is a program per material, which for the tree
 * scene is a handful of programs.
 */
let programKeyCounter = 0;

export function applyWindToMaterial(
  material: THREE.Material,
  minY: number,
  height: number,
): void {
  if (!(material instanceof THREE.MeshStandardMaterial)) return;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = windUniforms.uWindTime;
    shader.uniforms.uWindStrength = windUniforms.uWindStrength;
    shader.uniforms.uWindMinY = { value: minY };
    shader.uniforms.uWindHeight = { value: height };

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${WIND_PARS}`)
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\n${WIND_VERTEX}`,
      );
  };

  programKeyCounter += 1;
  const key = `wind-standard-v3-${programKeyCounter}`;
  material.customProgramCacheKey = () => key;
  material.needsUpdate = true;
}
