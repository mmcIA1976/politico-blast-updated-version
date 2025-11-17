import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function Enemies() {
  const { enemies } = useArcadeGame();
  
  return (
    <group>
      {enemies.map((enemy) => (
        <group key={enemy.id} position={[enemy.position.x, enemy.position.y, enemy.position.z]}>
          {enemy.type === "politician" ? (
            <>
              <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[0.7, 1, 0.7]} />
                <meshStandardMaterial color="#3b82f6" />
              </mesh>
              
              <mesh position={[0, 1.1, 0]}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color="#ffd700" />
              </mesh>
              
              <mesh position={[0, 1.3, 0.2]}>
                <boxGeometry args={[0.2, 0.1, 0.05]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
            </>
          ) : (
            <>
              <mesh position={[0, 0.7, 0]} castShadow>
                <boxGeometry args={[1.2, 1.5, 1.2]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
              
              <mesh position={[0, 1.6, 0]}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial color="#ffd700" />
              </mesh>
              
              <mesh position={[-0.5, 1.8, 0]}>
                <coneGeometry args={[0.15, 0.4, 8]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
              
              <mesh position={[0.5, 1.8, 0]}>
                <coneGeometry args={[0.15, 0.4, 8]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}
