import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame, type Vec3 } from "@/lib/stores/useArcadeGame";
import { useAudio } from "@/lib/stores/useAudio";

function PowerUpMesh({ type }: { type: "tripleShot" | "speedBoost" | "powerShot" | "rapidFire" | "grenade" }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
    }
  });
  
  const getColor = () => {
    if (type === "tripleShot") return "#ff0000";
    if (type === "speedBoost") return "#00ff00";
    if (type === "rapidFire") return "#ffff00";
    if (type === "grenade") return "#2d5016";
    return "#ff6600";
  };
  
  if (type === "grenade") {
    return (
      <group ref={meshRef as any}>
        <mesh castShadow>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial 
            color="#2d5016"
            emissive="#2d5016"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </group>
    );
  }
  
  return (
    <mesh ref={meshRef} rotation={[0, Math.PI / 4, 0]}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial 
        color={getColor()}
        emissive={getColor()}
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
    addPowerUp,
    addGrenadeToInventory,
    level
  } = useArcadeGame();
  const { playGrenadePickup } = useAudio();
  
  const spawnTimer = useRef(0);
  const grenadeSpawnTimer = useRef(0);
  const lastSpawnPosition = useRef(0);
  const lastGrenadeSpawnPosition = useRef(0);
  const nextPowerUpType = useRef<"tripleShot" | "speedBoost" | "powerShot" | "rapidFire">("tripleShot");
  const nextPowerUpX = useRef(0);
  const powerUpRotation = useRef(0);
  
  useFrame((state, delta) => {
    spawnTimer.current += delta;
    grenadeSpawnTimer.current += delta;
    
    const isBossLevel = level === 7 || level === 14;
    
    const currentPowerUpCount = powerUps.filter(p => p.type !== "grenade" && !p.collected).length;
    const currentGrenadeCount = powerUps.filter(p => p.type === "grenade" && !p.collected).length;
    
    const powerUpLimitReached = isBossLevel && currentPowerUpCount >= 3;
    const grenadeLimitReached = isBossLevel && currentGrenadeCount >= 2;
    
    const shouldSpawnPowerUp = isBossLevel
      ? (!powerUpLimitReached && spawnTimer.current > 15)
      : (spawnTimer.current > 15 && scrollPosition - lastSpawnPosition.current > 10);
    
    if (shouldSpawnPowerUp) {
      spawnTimer.current = 0;
      lastSpawnPosition.current = scrollPosition;
      
      const spawnX = isBossLevel
        ? ((state.clock.getElapsedTime() * 137) % 36) - 18
        : nextPowerUpX.current;
      const spawnZ = isBossLevel
        ? 265 + ((state.clock.getElapsedTime() * 53) % 80)
        : scrollPosition + 15;
      
      addPowerUp({
        id: `powerup-${state.clock.getElapsedTime()}-${scrollPosition}`,
        position: { x: spawnX, y: 0.5, z: spawnZ },
        type: nextPowerUpType.current,
        collected: false,
      });
      
      const types: Array<"tripleShot" | "speedBoost" | "powerShot" | "rapidFire"> = ["tripleShot", "speedBoost", "powerShot", "rapidFire"];
      powerUpRotation.current = (powerUpRotation.current + 1) % types.length;
      nextPowerUpType.current = types[powerUpRotation.current];
      nextPowerUpX.current = ((state.clock.getElapsedTime() * 137) % 24) - 12;
    }
    
    const shouldSpawnGrenade = isBossLevel
      ? (!grenadeLimitReached && grenadeSpawnTimer.current > 20)
      : (grenadeSpawnTimer.current > 25 && scrollPosition - lastGrenadeSpawnPosition.current > 20);
    
    if (shouldSpawnGrenade) {
      grenadeSpawnTimer.current = 0;
      lastGrenadeSpawnPosition.current = scrollPosition;
      
      const grenadeX = isBossLevel
        ? ((state.clock.getElapsedTime() * 97) % 30) - 15
        : ((state.clock.getElapsedTime() * 97) % 20) - 10;
      const grenadeZ = isBossLevel
        ? 270 + ((state.clock.getElapsedTime() * 71) % 70)
        : scrollPosition + 18;
      
      addPowerUp({
        id: `grenade-${state.clock.getElapsedTime()}-${scrollPosition}`,
        position: { x: grenadeX, y: 0.5, z: grenadeZ },
        type: "grenade",
        collected: false,
      });
    }
    
    powerUps.forEach(powerUp => {
      if (!powerUp.collected) {
        const distance = vec3Distance(powerUp.position, playerPosition);
        
        if (distance < 1) {
          if (powerUp.type === "grenade") {
            addGrenadeToInventory(1);
            playGrenadePickup();
            removePowerUp(powerUp.id);
          } else {
            let duration = 10;
            if (powerUp.type === "tripleShot") duration = 10;
            else if (powerUp.type === "speedBoost") duration = 8;
            else if (powerUp.type === "powerShot") duration = 12;
            else if (powerUp.type === "rapidFire") duration = 8;
            
            activatePowerUp(powerUp.type, duration, state.clock.getElapsedTime());
            removePowerUp(powerUp.id);
          }
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
              color={
                powerUp.type === "tripleShot" ? "#ffff00" : 
                powerUp.type === "speedBoost" ? "#ffffff" : 
                powerUp.type === "rapidFire" ? "#ff00ff" :
                powerUp.type === "grenade" ? "#88ff88" :
                "#ff9900"
              }
              emissive={
                powerUp.type === "tripleShot" ? "#ffff00" : 
                powerUp.type === "speedBoost" ? "#ffffff" : 
                powerUp.type === "rapidFire" ? "#ff00ff" :
                powerUp.type === "grenade" ? "#88ff88" :
                "#ff9900"
              }
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
