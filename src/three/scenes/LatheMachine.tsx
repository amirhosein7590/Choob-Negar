"use client";

/**
 * The lathe itself: chuck below, tailstock above, base plate.
 *
 * Simplification over a real lathe: the headstock and motor that would
 * normally sit beside the work are omitted. The camera's composition is
 * close to the blank, so only the parts that frame it are modelled.
 */
export function LatheMachine() {
  return (
    <group frustumCulled={false}>
      <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.12, 32]} />
        <meshStandardMaterial
          color="#3a3a42"
          metalness={0.85}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[0, -0.14, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 32]} />
        <meshStandardMaterial
          color="#25252a"
          metalness={0.7}
          roughness={0.55}
        />
      </mesh>

      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.16, 16]} />
        <meshStandardMaterial
          color="#3a3a42"
          metalness={0.85}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial
          color="#25252a"
          metalness={0.7}
          roughness={0.55}
        />
      </mesh>
    </group>
  );
}
