import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function PoliticianEnemy({ level, faceTexture, faceTexture2 }: { level: number; faceTexture: THREE.Texture; faceTexture2: THREE.Texture }) {
  return (
    <>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 1, 0.7]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 1.4, -0.5]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial map={level >= 4 && level <= 6 ? faceTexture2 : faceTexture} />
      </mesh>
    </>
  );
}

function BossEnemy({ bossFaceTexture }: { bossFaceTexture: THREE.Texture }) {
  return (
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
  );
}

function GorillaEnemy({ faceTexture }: { faceTexture: THREE.Texture }) {
  return (
    <>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1.0, 0.8]} />
        <meshStandardMaterial color="#3d2914" />
      </mesh>
      <mesh position={[0, 1.4, -0.5]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial map={faceTexture} />
      </mesh>
      <mesh position={[-0.5, 0.3, 0]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshStandardMaterial color="#3d2914" />
      </mesh>
      <mesh position={[0.5, 0.3, 0]} castShadow>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshStandardMaterial color="#3d2914" />
      </mesh>
    </>
  );
}

function PenguinEnemy({ faceTexture }: { faceTexture: THREE.Texture }) {
  return (
    <>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 1.0, 0.7]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.5, -0.3]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.4, -0.5]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial map={faceTexture} />
      </mesh>
      <mesh position={[-0.45, 0.4, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.3, 0.12, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.45, 0.4, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.3, 0.12, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </>
  );
}

function ToucanEnemy({ faceTexture }: { faceTexture: THREE.Texture }) {
  return (
    <>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.2, 1.5, 1.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.7, -0.5]} castShadow>
        <boxGeometry args={[0.9, 1.1, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 2.0, -0.8]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.6, 32]} />
        <meshStandardMaterial map={faceTexture} />
      </mesh>
      <mesh position={[0, 1.6, -0.9]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.4, 0.3, 1.2]} />
        <meshStandardMaterial color="#ff6600" />
      </mesh>
      <mesh position={[0, 1.65, -1.4]}>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
        <meshStandardMaterial color="#ffff00" />
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
  );
}

export function Enemies() {
  const { enemies, level } = useArcadeGame();
  const faceTexture = useTexture("/textures/politician_face.jpg");
  const faceTexture2 = useTexture("/textures/politician_face_2.jpg");
  const bossFaceTexture = useTexture("/textures/boss_face.jpg");
  const oscarPuenteFace = useTexture("/textures/oscar_puente_face.jpg");
  const felixBolanosFace = useTexture("/textures/felix_bolanos_face.jpg");
  const yolandaDiazFace = useTexture("/textures/yolanda_diaz_face.png");
  
  return (
    <group>
      {enemies.map((enemy) => (
        <group key={enemy.id} position={[enemy.position.x, enemy.position.y, enemy.position.z]}>
          {enemy.type === "politician" && (
            <PoliticianEnemy level={level} faceTexture={faceTexture} faceTexture2={faceTexture2} />
          )}
          {enemy.type === "boss" && (
            <BossEnemy bossFaceTexture={bossFaceTexture} />
          )}
          {enemy.type === "gorilla" && (
            <GorillaEnemy faceTexture={oscarPuenteFace} />
          )}
          {enemy.type === "penguin" && (
            <PenguinEnemy faceTexture={felixBolanosFace} />
          )}
          {enemy.type === "toucan" && (
            <ToucanEnemy faceTexture={yolandaDiazFace} />
          )}
        </group>
      ))}
    </group>
  );
}
