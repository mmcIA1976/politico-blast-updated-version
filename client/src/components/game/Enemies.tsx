import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

function PoliticianEnemy({ level, faceTexture, faceTexture2, isSpecial }: { level: number; faceTexture: THREE.Texture; faceTexture2: THREE.Texture; isSpecial?: boolean }) {
  const bodyColor = isSpecial ? "#ffd700" : "#ef4444";
  return (
    <>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 1, 0.7]} />
        <meshStandardMaterial color={bodyColor} emissive={isSpecial ? "#ffd700" : "#000000"} emissiveIntensity={isSpecial ? 0.4 : 0} />
      </mesh>
      <mesh position={[0, 1.4, -0.5]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial map={level >= 4 && level <= 6 ? faceTexture2 : faceTexture} />
      </mesh>
      {isSpecial && (
        <pointLight position={[0, 1, 0]} intensity={2} distance={4} color="#ffd700" />
      )}
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

function GorillaEnemy({ faceTexture, isSpecial }: { faceTexture: THREE.Texture; isSpecial?: boolean }) {
  const bodyColor = isSpecial ? "#ffd700" : "#3d2914";
  const headColor = isSpecial ? "#e6c200" : "#2a1d0d";
  return (
    <>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.0, 1.2, 0.9]} />
        <meshStandardMaterial color={bodyColor} emissive={isSpecial ? "#ffd700" : "#000000"} emissiveIntensity={isSpecial ? 0.4 : 0} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color={headColor} />
      </mesh>
      <mesh position={[0, 1.8, -0.4]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial map={faceTexture} />
      </mesh>
      <mesh position={[-0.65, 0.4, 0]} castShadow>
        <boxGeometry args={[0.35, 1.0, 0.35]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.65, 0.4, 0]} castShadow>
        <boxGeometry args={[0.35, 1.0, 0.35]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[-0.3, -0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.3]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.3, -0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.3]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {isSpecial && (
        <pointLight position={[0, 1, 0]} intensity={2} distance={4} color="#ffd700" />
      )}
    </>
  );
}

function PenguinEnemy({ faceTexture, isSpecial }: { faceTexture: THREE.Texture; isSpecial?: boolean }) {
  const bodyColor = isSpecial ? "#ffd700" : "#1a1a1a";
  return (
    <>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.5]} />
        <meshStandardMaterial color={bodyColor} emissive={isSpecial ? "#ffd700" : "#000000"} emissiveIntensity={isSpecial ? 0.4 : 0} />
      </mesh>
      <mesh position={[0, 0.5, -0.2]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0, 1.5, -0.3]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial map={faceTexture} />
      </mesh>
      <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, -0.4]} castShadow>
        <boxGeometry args={[0.35, 0.12, 0.2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, 0.4]} castShadow>
        <boxGeometry args={[0.35, 0.12, 0.2]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[-0.15, -0.15, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.25]} />
        <meshStandardMaterial color="#ff8c00" />
      </mesh>
      <mesh position={[0.15, -0.15, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.25]} />
        <meshStandardMaterial color="#ff8c00" />
      </mesh>
      {isSpecial && (
        <pointLight position={[0, 1, 0]} intensity={2} distance={4} color="#ffd700" />
      )}
    </>
  );
}

function ToucanEnemy({ faceTexture }: { faceTexture: THREE.Texture }) {
  return (
    <>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.4, 1.6, 1.2]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.8, -0.5]} castShadow>
        <boxGeometry args={[1.0, 1.2, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 2.5, -0.6]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial map={faceTexture} />
      </mesh>
      <mesh position={[0, 1.8, -1.0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.5, 0.35, 1.4]} />
        <meshStandardMaterial color="#ff6600" />
      </mesh>
      <mesh position={[0, 1.85, -1.6]}>
        <boxGeometry args={[0.35, 0.25, 0.25]} />
        <meshStandardMaterial color="#ffff00" />
      </mesh>
      <mesh position={[-0.9, 0.6, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.25, 1.2, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.9, 0.6, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.25, 1.2, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-1.0, 3.8, -0.4]}>
        <coneGeometry args={[0.3, 0.7, 8]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[1.0, 3.8, -0.4]}>
        <coneGeometry args={[0.3, 0.7, 8]} />
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
  const oscarPuenteFace = useTexture("/textures/oscar_puente_face.png");
  const felixBolanosFace = useTexture("/textures/felix_bolanos_face.jpg");
  const yolandaDiazFace = useTexture("/textures/yolanda_diaz_face.png");
  
  return (
    <group>
      {enemies.map((enemy) => {
        // Calcular rotación para animación de muerte (caer hacia adelante, cara hacia arriba)
        const dyingRotation = enemy.dying ? (enemy.dyingProgress || 0) * (Math.PI / 2) : 0;
        const dyingY = enemy.dying ? -(enemy.dyingProgress || 0) * 0.8 : 0;
        
        return (
          <group 
            key={enemy.id} 
            position={[enemy.position.x, enemy.position.y + dyingY, enemy.position.z]}
            rotation={[dyingRotation, 0, 0]}
          >
            {enemy.type === "politician" && (
              <PoliticianEnemy level={level} faceTexture={faceTexture} faceTexture2={faceTexture2} isSpecial={enemy.isSpecial} />
            )}
            {enemy.type === "boss" && (
              <BossEnemy bossFaceTexture={bossFaceTexture} />
            )}
            {enemy.type === "gorilla" && (
              <GorillaEnemy faceTexture={oscarPuenteFace} isSpecial={enemy.isSpecial} />
            )}
            {enemy.type === "penguin" && (
              <PenguinEnemy faceTexture={felixBolanosFace} isSpecial={enemy.isSpecial} />
            )}
            {enemy.type === "toucan" && (
              <ToucanEnemy faceTexture={yolandaDiazFace} />
            )}
          </group>
        );
      })}
    </group>
  );
}
