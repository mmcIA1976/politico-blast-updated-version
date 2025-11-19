import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export function Enemies() {
  const { enemies, level } = useArcadeGame();
  const faceTexture = useTexture("/textures/politician_face.jpg");
  const faceTexture2 = useTexture("/textures/politician_face_2.jpg");
  const bossFaceTexture = useTexture("/textures/boss_face.jpg");
  
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
              
              <mesh position={[0, 1.3, -0.4]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[0.8, 32]} />
                <meshStandardMaterial map={level >= 4 && level <= 6 ? faceTexture2 : faceTexture} />
              </mesh>
            </>
          ) : (
            <>
              <mesh position={[0, 0.7, 0]} castShadow>
                <boxGeometry args={[1.2, 1.5, 1.2]} />
                <meshStandardMaterial color="#ef4444" />
              </mesh>
              
              <mesh position={[0, 2.0, -0.8]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[1.6, 32]} />
                <meshStandardMaterial map={bossFaceTexture} />
              </mesh>
              
              <mesh position={[-0.8, 3.0, -0.5]}>
                <coneGeometry args={[0.25, 0.6, 8]} />
                <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
              </mesh>
              
              <mesh position={[0.8, 3.0, -0.5]}>
                <coneGeometry args={[0.25, 0.6, 8]} />
                <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}
