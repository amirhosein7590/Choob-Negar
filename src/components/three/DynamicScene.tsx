"use client";

import dynamic from "next/dynamic";

/**
 * Client-only loader for the WebGL surface.
 *
 * A client component is required because `next/dynamic` with `ssr: false`
 * cannot be called from a server component in the App Router. Isolating the
 * dynamic import here keeps the page itself as a server component.
 */
const SceneRoot = dynamic(
  () => import("@/three/canvas/SceneRoot").then((mod) => mod.SceneRoot),
  {
    ssr: false,
    loading: () => null,
  },
);

export function DynamicScene() {
  return <SceneRoot />;
}
