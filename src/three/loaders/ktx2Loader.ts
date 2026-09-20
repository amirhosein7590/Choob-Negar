import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import type * as THREE from "three";

const TRANSCODER_PATH = "/basis/";

let instance: KTX2Loader | null = null;

/**
 * Returns a shared KTX2Loader bound to the given renderer.
 *
 * KTX2Loader probes renderer capabilities once at construction time to pick
 * the best GPU-native compression format. Reusing a single instance avoids
 * repeating that probe on every texture load.
 */
export function getKTX2Loader(gl: THREE.WebGLRenderer): KTX2Loader {
  if (instance) return instance;

  instance = new KTX2Loader()
    .setTranscoderPath(TRANSCODER_PATH)
    .detectSupport(gl);

  return instance;
}
