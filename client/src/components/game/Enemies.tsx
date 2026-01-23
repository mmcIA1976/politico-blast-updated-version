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

function BossEnemy({ bossFaceTexture, enraged, enragedProgress, enrageMode }: { bossFaceTexture: THREE.Texture; enraged?: boolean; enragedProgress?: number; enrageMode?: "jump" | "shake" }) {
  // Cuando está enraged: color rojo brillante
  const bodyColor = enraged ? "#ff0000" : "#ef4444";
  const emissiveColor = enraged ? "#ff0000" : "#000000";
  const emissiveIntensity = enraged ? 1.5 : 0;
  
  // Animación según el modo de furia
  let offsetY = 0;
  let offsetX = 0;
  let shakeRotation = 0;
  
  if (enraged && enragedProgress !== undefined) {
    if (enrageMode === "jump") {
      // Modo salto: sube y baja
      offsetY = Math.sin(enragedProgress * Math.PI) * 3;
    } else if (enrageMode === "shake") {
      // Modo temblor: vibra rápidamente y se mueve de lado a lado
      offsetX = Math.sin(enragedProgress * Math.PI * 8) * 2; // Movimiento lateral rápido
      shakeRotation = Math.sin(enragedProgress * Math.PI * 20) * 0.15; // Temblor
    }
  }
  
  return (
    <group position={[offsetX, offsetY, 0]} rotation={[0, 0, shakeRotation]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.2, 1.5, 1.2]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, 2.0, -0.8]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.6, 32]} />
        <meshStandardMaterial map={bossFaceTexture} emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.3} />
      </mesh>
      <mesh position={[-0.8, 3.0, -0.5]}>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={enraged ? 1.5 : 0.5} />
      </mesh>
      <mesh position={[0.8, 3.0, -0.5]}>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={enraged ? 1.5 : 0.5} />
      </mesh>
      {enraged && (
        <pointLight position={[0, 2, 0]} intensity={5} distance={10} color="#ff0000" />
      )}
    </group>
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

function ToucanEnemy({ faceTexture, enraged, enragedProgress }: { faceTexture: THREE.Texture; enraged?: boolean; enragedProgress?: number }) {
  // Colores cuando está enraged
  const bodyColor = enraged ? "#ff0000" : "#1a1a1a";
  const emissiveColor = enraged ? "#ff0000" : "#000000";
  const emissiveIntensity = enraged ? 0.8 : 0;
  
  // Generar posiciones de tucanes fantasma para el modo SUMAR
  const ghostPositions = enraged && enragedProgress !== undefined ? [
    { x: -3, z: 0, opacity: 0.6 },
    { x: 3, z: 0, opacity: 0.6 },
    { x: -1.5, z: -2, opacity: 0.4 },
    { x: 1.5, z: -2, opacity: 0.4 },
  ] : [];
  
  const renderToucanBody = (isGhost: boolean, opacity: number = 1) => (
    <>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.4, 1.6, 1.2]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} transparent={isGhost} opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.8, -0.5]} castShadow>
        <boxGeometry args={[1.0, 1.2, 0.2]} />
        <meshStandardMaterial color="#ffffff" transparent={isGhost} opacity={opacity} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <sphereGeometry args={[0.7, 12, 12]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} transparent={isGhost} opacity={opacity} />
      </mesh>
      <mesh position={[0, 2.5, -0.6]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[2.0, 32]} />
        <meshStandardMaterial map={faceTexture} transparent={isGhost} opacity={opacity} emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.3} />
      </mesh>
      <mesh position={[0, 1.8, -1.0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.5, 0.35, 1.4]} />
        <meshStandardMaterial color="#ff6600" transparent={isGhost} opacity={opacity} />
      </mesh>
      <mesh position={[0, 1.85, -1.6]}>
        <boxGeometry args={[0.35, 0.25, 0.25]} />
        <meshStandardMaterial color="#ffff00" transparent={isGhost} opacity={opacity} />
      </mesh>
      <mesh position={[-0.9, 0.6, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.25, 1.2, 0.6]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} transparent={isGhost} opacity={opacity} />
      </mesh>
      <mesh position={[0.9, 0.6, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.25, 1.2, 0.6]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} transparent={isGhost} opacity={opacity} />
      </mesh>
      <mesh position={[-1.0, 3.8, -0.4]}>
        <coneGeometry args={[0.3, 0.7, 8]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={enraged ? 1.5 : 0.5} transparent={isGhost} opacity={opacity} />
      </mesh>
      <mesh position={[1.0, 3.8, -0.4]}>
        <coneGeometry args={[0.3, 0.7, 8]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={enraged ? 1.5 : 0.5} transparent={isGhost} opacity={opacity} />
      </mesh>
    </>
  );
  
  return (
    <group>
      {renderToucanBody(false)}
      {enraged && (
        <pointLight position={[0, 2, 0]} intensity={5} distance={10} color="#ff0000" />
      )}
      {ghostPositions.map((pos, i) => (
        <group key={i} position={[pos.x, 0, pos.z]}>
          {renderToucanBody(true, pos.opacity)}
        </group>
      ))}
    </group>
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
              <BossEnemy bossFaceTexture={bossFaceTexture} enraged={enemy.enraged} enragedProgress={enemy.enragedProgress} enrageMode={enemy.enrageMode} />
            )}
            {enemy.type === "gorilla" && (
              <GorillaEnemy faceTexture={oscarPuenteFace} isSpecial={enemy.isSpecial} />
            )}
            {enemy.type === "penguin" && (
              <PenguinEnemy faceTexture={felixBolanosFace} isSpecial={enemy.isSpecial} />
            )}
            {enemy.type === "toucan" && (
              <ToucanEnemy faceTexture={yolandaDiazFace} enraged={enemy.enraged} enragedProgress={enemy.enragedProgress} />
            )}
          </group>
        );
      })}
    </group>
  );
}
