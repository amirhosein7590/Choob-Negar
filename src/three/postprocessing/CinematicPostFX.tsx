"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";

/**
 * Post-processing chain, tuned for the narrative.
 *
 * Film-grain noise was removed: on low-end GPUs the noise pass alone costs
 * more than the bloom and vignette combined, and its visual contribution to
 * a scene this dark is negligible. Multisampling is reduced to 2 to halve
 * the resolve cost without a perceptible quality loss at this resolution.
 */
export function CinematicPostFX() {
  return (
    <EffectComposer multisampling={2} enableNormalPass={false}>
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
        resolution={256}
        middleGrey={0.38}
        maxLuminance={8}
        averageLuminance={1}
        adaptationRate={1}
      />
      <Bloom
        intensity={0.2}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.4}
        mipmapBlur
        radius={0.7}
      />
      <Vignette
        offset={0.3}
        darkness={0.55}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
