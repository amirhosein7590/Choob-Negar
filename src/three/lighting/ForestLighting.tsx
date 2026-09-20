"use client";

export const SUN_DIRECTION: readonly [number, number, number] = [-15, 15, -20];

/**
 * Directional lighting plus a soft hemisphere fill.
 *
 * The hemisphere light was reintroduced after the tone mapping pass changed
 * the overall balance: the key light alone leaves every surface facing away
 * from the sun in near-total darkness. The hemisphere term is deliberately
 * cool on top and warm on the ground to mimic sky bounce without tinting
 * the whole image blue.
 */
export function ForestLighting() {
  return (
    <>
      <hemisphereLight args={["#b8c8e0", "#5a4a38", 0.55]} />

      <directionalLight
        position={SUN_DIRECTION}
        intensity={2.4}
        color="#ffe8c8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0002}
        shadow-normalBias={0.04}
      />

      <directionalLight
        position={[12, 8, 14]}
        intensity={0.55}
        color="#c8d4e8"
      />
    </>
  );
}
