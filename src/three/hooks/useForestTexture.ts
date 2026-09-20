"use client";

import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getKTX2Loader } from "@/three/loaders/ktx2Loader";

const cache = new Map<string, THREE.Texture>();

interface Options {
  readonly srgb?: boolean;
  readonly repeat?: readonly [number, number];
}

/**
 * Loads a KTX2 texture with optional sRGB and tiling configuration.
 *
 * Textures are cached by absolute path so a texture shared across meshes is
 * decoded and uploaded to the GPU exactly once. Because KTX2 decoding is
 * asynchronous, the hook returns null until the texture is ready; consumers
 * are expected to gate rendering on a non-null value.
 */
export function useForestTexture(
  path: string,
  options: Options = {},
): THREE.Texture | null {
  const { srgb = false, repeat } = options;
  const gl = useThree((state) => state.gl);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const key = `${path}|${srgb ? "srgb" : "linear"}|${repeat?.join(",") ?? "1,1"}`;
    const cached = cache.get(key);
    if (cached) {
      setTexture(cached);
      return;
    }

    const loader = getKTX2Loader(gl);
    let cancelled = false;

    loader.load(path, (loaded) => {
      if (cancelled) {
        loaded.dispose();
        return;
      }

      if (srgb) {
        loaded.colorSpace = THREE.SRGBColorSpace;
      } else {
        loaded.colorSpace = THREE.NoColorSpace;
      }
      loaded.wrapS = THREE.RepeatWrapping;
      loaded.wrapT = THREE.RepeatWrapping;
      loaded.anisotropy = gl.capabilities.getMaxAnisotropy();
      loaded.generateMipmaps = false;

      if (repeat) {
        loaded.repeat.set(repeat[0], repeat[1]);
      }

      cache.set(key, loaded);
      setTexture(loaded);
    });

    return () => {
      cancelled = true;
    };
  }, [gl, path, srgb, repeat]);

  return texture;
}
