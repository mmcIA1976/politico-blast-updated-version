import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function Debris() {
  const debris = useArcadeGame((state) => state.debris);
  
  return (
    <group>
      {debris.map((d) => (
        <mesh key={d.id} position={[d.position.x, d.position.y, d.position.z]}>
          <boxGeometry args={[d.size, d.size, d.size]} />
          <meshStandardMaterial color={d.color} />
        </mesh>
      ))}
    </group>
  );
}
