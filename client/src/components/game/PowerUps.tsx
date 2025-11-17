import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame, type Vec3 } from "@/lib/stores/useArcadeGame";

function PowerUpMesh({ type }: { type: "tripleShot" | "speedBoost" }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
    }
  });
  
  return (
    <mesh ref={meshRef} rotation={[0, Math.PI / 4, 0]}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial 
        color={type === "tripleShot" ? "#ff0000" : "#00ff00"}
        emissive={type === "tripleShot" ? "#ff0000" : "#00ff00"}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

function vec3Distance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function PowerUps() {
  const { 
    powerUps, 
    removePowerUp, 
    activatePowerUp,
    playerPosition,
    scrollPosition,
    addPowerUp 
  } = useArcadeGame();
  
  const spawnTimer = useRef(0);
  const lastSpawnPosition = useRef(0);
  const nextPowerUpType = useRef<"tripleShot" | "speedBoost">("tripleShot");
  const nextPowerUpX = useRef(0);
  
  useFrame((state, delta) => {
    spawnTimer.current += delta;
    
    if (spawnTimer.current > 15 && scrollPosition - lastSpawnPosition.current > 10) {
      spawnTimer.current = 0;
      lastSpawnPosition.current = scrollPosition;
      
      addPowerUp({
        id: `powerup-${state.clock.getElapsedTime()}-${scrollPosition}`,
        position: { x: nextPowerUpX.current, y: 0.5, z: scrollPosition + 15 },
        type: nextPowerUpType.current,
        collected: false,
      });
      
      nextPowerUpType.current = nextPowerUpType.current === "tripleShot" ? "speedBoost" : "tripleShot";
      nextPowerUpX.current = ((state.clock.getElapsedTime() * 137) % 24) - 12;
    }
    
    powerUps.forEach(powerUp => {
      if (!powerUp.collected) {
        const distance = vec3Distance(powerUp.position, playerPosition);
        
        if (distance < 1) {
          const duration = powerUp.type === "tripleShot" ? 10 : 8;
          activatePowerUp(powerUp.type, duration, state.clock.getElapsedTime());
          removePowerUp(powerUp.id);
        }
      }
    });
  });
  
  return (
    <group>
      {powerUps.map((powerUp) => (
        <group 
          key={powerUp.id} 
          position={[powerUp.position.x, powerUp.position.y, powerUp.position.z]}
        >
          <PowerUpMesh type={powerUp.type} />
          
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial 
              color={powerUp.type === "tripleShot" ? "#ffff00" : "#ffffff"}
              emissive={powerUp.type === "tripleShot" ? "#ffff00" : "#ffffff"}
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
