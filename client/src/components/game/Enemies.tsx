import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function Enemies() {
  const { enemies } = useArcadeGame();
  const faceTexture = useTexture("/textures/politician_face.jpg");
  
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
              
              <mesh position={[0, 1.1, 0.36]}>
                <planeGeometry args={[0.6, 0.7]} />
                <meshStandardMaterial map={faceTexture} side={THREE.DoubleSide} />
              </mesh>
            </>
          ) : (
            <>
              <mesh position={[0, 0.7, 0]} castShadow>
                <boxGeometry args={[1.2, 1.5, 1.2]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
              
              <mesh position={[0, 1.6, 0.61]}>
                <planeGeometry args={[1.0, 1.2]} />
                <meshStandardMaterial map={faceTexture} side={THREE.DoubleSide} />
              </mesh>
              
              <mesh position={[-0.5, 2.3, 0]}>
                <coneGeometry args={[0.15, 0.4, 8]} />
                <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
              </mesh>
              
              <mesh position={[0.5, 2.3, 0]}>
                <coneGeometry args={[0.15, 0.4, 8]} />
                <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}
