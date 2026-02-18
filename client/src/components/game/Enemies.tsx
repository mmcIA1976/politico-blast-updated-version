import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// Función para calcular el color según el porcentaje de vida
function getHealthColor(healthPercent: number): string {
  if (healthPercent > 0.66) return "#ffff00"; // Amarillo (>66% vida)
  if (healthPercent > 0.33) return "#ff8800"; // Naranja (33-66% vida)
  return "#ff0000"; // Rojo (<33% vida)
}

function PoliticianEnemy({ level, faceTexture, faceTexture2, isSpecial, health, maxHealth }: { level: number; faceTexture: THREE.Texture; faceTexture2: THREE.Texture; isSpecial?: boolean; health: number; maxHealth: number }) {
  const healthPercent = health / maxHealth;
  const hitColor = getHealthColor(healthPercent);
  const showHitEffect = health < maxHealth; // Mostrar efecto si ha recibido daño
  
  const bodyColor = isSpecial ? "#ffd700" : "#ef4444";
  const emissiveColor = showHitEffect ? hitColor : (isSpecial ? "#ffd700" : "#000000");
  const emissiveIntensity = showHitEffect ? 0.8 : (isSpecial ? 0.4 : 0);
  
  return (
    <>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 1, 0.7]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, 1.4, -0.5]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial map={level >= 4 && level <= 6 ? faceTexture2 : faceTexture} emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.3} />
      </mesh>
      {(isSpecial || showHitEffect) && (
        <pointLight position={[0, 1, 0]} intensity={showHitEffect ? 3 : 2} distance={4} color={showHitEffect ? hitColor : "#ffd700"} />
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

function GorillaEnemy({ faceTexture, isSpecial, health, maxHealth }: { faceTexture: THREE.Texture; isSpecial?: boolean; health: number; maxHealth: number }) {
  const healthPercent = health / maxHealth;
  const hitColor = getHealthColor(healthPercent);
  const showHitEffect = health < maxHealth;
  
  const bodyColor = isSpecial ? "#ffd700" : "#3d2914";
  const headColor = isSpecial ? "#e6c200" : "#2a1d0d";
  const emissiveColor = showHitEffect ? hitColor : (isSpecial ? "#ffd700" : "#000000");
  const emissiveIntensity = showHitEffect ? 0.8 : (isSpecial ? 0.4 : 0);
  
  return (
    <>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.0, 1.2, 0.9]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color={headColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      <mesh position={[0, 1.8, -0.4]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial map={faceTexture} emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.3} />
      </mesh>
      <mesh position={[-0.65, 0.4, 0]} castShadow>
        <boxGeometry args={[0.35, 1.0, 0.35]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0.65, 0.4, 0]} castShadow>
        <boxGeometry args={[0.35, 1.0, 0.35]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[-0.3, -0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.3]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0.3, -0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.3]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {(isSpecial || showHitEffect) && (
        <pointLight position={[0, 1, 0]} intensity={showHitEffect ? 3 : 2} distance={4} color={showHitEffect ? hitColor : "#ffd700"} />
      )}
    </>
  );
}

function PenguinEnemy({ faceTexture, isSpecial, health, maxHealth }: { faceTexture: THREE.Texture; isSpecial?: boolean; health: number; maxHealth: number }) {
  const healthPercent = health / maxHealth;
  const hitColor = getHealthColor(healthPercent);
  const showHitEffect = health < maxHealth;
  
  const bodyColor = isSpecial ? "#ffd700" : "#1a1a1a";
  const emissiveColor = showHitEffect ? hitColor : (isSpecial ? "#ffd700" : "#000000");
  const emissiveIntensity = showHitEffect ? 0.8 : (isSpecial ? 0.4 : 0);
  
  return (
    <>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.5]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, 0.5, -0.2]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.5} />
      </mesh>
      <mesh position={[0, 1.5, -0.3]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial map={faceTexture} emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.3} />
      </mesh>
      <mesh position={[-0.4, 0.5, 0]} rotation={[0, 0, -0.4]} castShadow>
        <boxGeometry args={[0.35, 0.12, 0.2]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, 0.4]} castShadow>
        <boxGeometry args={[0.35, 0.12, 0.2]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[-0.15, -0.15, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.25]} />
        <meshStandardMaterial color="#ff8c00" emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.3} />
      </mesh>
      <mesh position={[0.15, -0.15, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.25]} />
        <meshStandardMaterial color="#ff8c00" emissive={emissiveColor} emissiveIntensity={emissiveIntensity * 0.3} />
      </mesh>
      {(isSpecial || showHitEffect) && (
        <pointLight position={[0, 1, 0]} intensity={showHitEffect ? 3 : 2} distance={4} color={showHitEffect ? hitColor : "#ffd700"} />
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

function BoothEnemy({ health, maxHealth }: { health: number; maxHealth: number }) {
  const flagRef = useRef<THREE.Group>(null);
  const healthPercent = health / maxHealth;
  const hitColor = getHealthColor(healthPercent);
  const showHitEffect = health < maxHealth;
  const emissiveIntensity = showHitEffect ? 0.6 : 0;
  
  useFrame((state) => {
    if (flagRef.current) {
      // Animación de ondulación de la bandera
      const time = state.clock.getElapsedTime();
      flagRef.current.rotation.z = Math.sin(time * 3) * 0.3;
    }
  });
  
  return (
    <group>
      {/* Estructura de la caseta */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2.5, 1.2, 2.0]} />
        <meshStandardMaterial color="#e53935" emissive={showHitEffect ? hitColor : "#000000"} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[2.7, 0.4, 2.2]} />
        <meshStandardMaterial color="#b71c1c" emissive={showHitEffect ? hitColor : "#000000"} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {showHitEffect && (
        <pointLight position={[0, 1.5, 0]} intensity={4} distance={6} color={hitColor} />
      )}
      <mesh position={[0, 2.2, 0]}>
        <planeGeometry args={[3, 1.2]} />
        <meshStandardMaterial color="#a30000" />
      </mesh>
      <mesh position={[0, 2.25, 0.01]}>
        <circleGeometry args={[0.4, 24]} />
        <meshStandardMaterial color="#ff1744" />
      </mesh>
      <mesh position={[-0.5, 2.25, 0.02]}>
        <circleGeometry args={[0.2, 24]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.5, 2.25, 0.02]}>
        <circleGeometry args={[0.2, 24]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.1, 0]}> 
        <boxGeometry args={[2.6, 0.2, 2.1]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      
      {/* Asta de la bandera */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Bandera roja ondeando */}
      <group ref={flagRef} position={[0.4, 3.0, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.5]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff0000"
            emissiveIntensity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Luz para hacer la bandera más visible */}
        <pointLight position={[0, 0, 0]} intensity={1.5} distance={3} color="#ff0000" />
      </group>
    </group>
  );
}

function ScooterEnemy({ health, maxHealth }: { health: number; maxHealth: number }) {
  const healthPercent = health / maxHealth;
  const hitColor = getHealthColor(healthPercent);
  const showHitEffect = health < maxHealth;
  const emissiveIntensity = showHitEffect ? 0.6 : 0;
  
  return (
    <group>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.6, 0.1, 2.0]} />
        <meshStandardMaterial color="#cc0000" emissive={showHitEffect ? hitColor : "#000000"} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.08, 1.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.1, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0, 0.1, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0, 0.6, 0.7]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[0, 0.95, 0.85]}>
        <boxGeometry args={[0.5, 0.06, 0.06]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[0, 0.7, -0.2]}>
        <boxGeometry args={[0.5, 0.8, 0.4]} />
        <meshStandardMaterial color="#8B4513" emissive={showHitEffect ? hitColor : "#000000"} emissiveIntensity={emissiveIntensity} />
      </mesh>
      <mesh position={[0, 1.3, -0.2]}>
        <sphereGeometry args={[0.3, 10, 10]} />
        <meshStandardMaterial color="#8B4513" emissive={showHitEffect ? hitColor : "#000000"} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {showHitEffect && (
        <pointLight position={[0, 0.7, 0]} intensity={3} distance={4} color={hitColor} />
      )}
      <mesh position={[0, 1.35, -0.35]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh position={[-0.35, 0.85, 0.1]} rotation={[0.5, 0, -0.3]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.35, 0.85, 0.1]} rotation={[0.5, 0, 0.3]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.15, 0.35, -0.2]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.15, 0.35, -0.2]}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

export function Enemies() {
  const enemies = useArcadeGame(s => s.enemies);
  const level = useArcadeGame(s => s.level);
  const [faceTexture, faceTexture2, bossFaceTexture, oscarPuenteFace, felixBolanosFace, yolandaDiazFace] = useTexture([
    "/textures/politician_face.jpg",
    "/textures/politician_face_2.png",
    "/textures/boss_face.png",
    "/textures/oscar_puente_face.png",
    "/textures/felix_bolanos_face.jpg",
    "/textures/yolanda_diaz_face.png",
  ]);
  
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
              <PoliticianEnemy level={level} faceTexture={faceTexture} faceTexture2={faceTexture2} isSpecial={enemy.isSpecial} health={enemy.health} maxHealth={enemy.maxHealth} />
            )}
            {enemy.type === "boss" && (
              <BossEnemy bossFaceTexture={bossFaceTexture} enraged={enemy.enraged} enragedProgress={enemy.enragedProgress} enrageMode={enemy.enrageMode} />
            )}
            {enemy.type === "gorilla" && (
              <GorillaEnemy faceTexture={oscarPuenteFace} isSpecial={enemy.isSpecial} health={enemy.health} maxHealth={enemy.maxHealth} />
            )}
            {enemy.type === "penguin" && (
              <PenguinEnemy faceTexture={felixBolanosFace} isSpecial={enemy.isSpecial} health={enemy.health} maxHealth={enemy.maxHealth} />
            )}
            {enemy.type === "toucan" && (
              <ToucanEnemy faceTexture={yolandaDiazFace} enraged={enemy.enraged} enragedProgress={enemy.enragedProgress} />
            )}
            {enemy.type === "scooter" && (
              <ScooterEnemy health={enemy.health} maxHealth={enemy.maxHealth} />
            )}
            {enemy.type === "booth" && (
              <BoothEnemy health={enemy.health} maxHealth={enemy.maxHealth} />
            )}
          </group>
        );
      })}
    </group>
  );
}
