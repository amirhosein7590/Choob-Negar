"use client";

/**
 * Workshop lighting.
 *
 * The workshop HDRI is a dim interior. The key light here is significantly
 * stronger than the forest rig's because the only ambient contribution is
 * the HDRI's own IBL, which is deliberately kept modest. Colour is warm
 * without being orange; the previous value produced a brown cast on every
 * surface in the room.
 */
export function WorkshopLighting() {
  return (
    <>
      <hemisphereLight args={["#e8dcc4", "#4a3a2a", 0.7]} />

      <directionalLight
        position={[3, 6, 4]}
        intensity={2.4}
        color="#fff0d8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
      />

      <directionalLight
        position={[-4, 3, -3]}
        intensity={0.6}
        color="#c8d0dc"
      />
    </>
  );
}
