import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useArcadeGame, type Vec3, type ActivePowerUp } from "@/lib/stores/useArcadeGame";
import { updatePlayerWorldPosition, updatePlayerWorldDirection } from "@/lib/stores/playerPositionRef";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  shoot = "shoot",
}

const POWER_UP_COLORS: Record<string, THREE.Color> = {
  speedBoost: new THREE.Color(0x00ff00),
  powerShot: new THREE.Color(0xff0000),
  rapidFire: new THREE.Color(0xff8800),
  tripleShot: new THREE.Color(0x0088ff),
};

const HALO_CONFIG: Record<string, { radius: number; speed: number; yOffset: number }> = {
  speedBoost: { radius: 1.3, speed: 2, yOffset: -0.2 },
  powerShot: { radius: 1.3, speed: -2.5, yOffset: -0.1 },
  rapidFire: { radius: 1.3, speed: 3, yOffset: 0.0 },
  tripleShot: { radius: 1.3, speed: -3.5, yOffset: 0.1 },
};

const DEFAULT_COLOR = new THREE.Color(0xffffff);

function PowerUpHalo({ powerUp, playerMeshRef }: { powerUp: ActivePowerUp; playerMeshRef: React.RefObject<THREE.Mesh> }) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const config = HALO_CONFIG[powerUp.type] || { radius: 1.0, speed: 2, yOffset: 0 };
  const color = POWER_UP_COLORS[powerUp.type] || DEFAULT_COLOR;

  useFrame((state, delta) => {
    if (!groupRef.current || !lightRef.current || !ringRef.current) return;

    if (playerMeshRef.current) {
      groupRef.current.position.copy(playerMeshRef.current.position);
    }

    const now = state.clock.getElapsedTime();
    const remaining = powerUp.expiresAt - now;
    const total = powerUp.duration;
    const ratio = Math.max(0, Math.min(1, remaining / total));

    if (ratio <= 0) {
      lightRef.current.visible = false;
      ringRef.current.visible = false;
      return;
    }

    const blinkThreshold = total * 0.25;
    let intensity = ratio;

    if (remaining < blinkThreshold && remaining > 0) {
      const blinkSpeed = remaining < blinkThreshold * 0.5 ? 12 : 6;
      const blink = Math.sin(now * blinkSpeed * Math.PI) * 0.5 + 0.5;
      intensity = ratio * blink;
    }

    lightRef.current.color.copy(color);
    lightRef.current.intensity = intensity * 2.5;
    lightRef.current.visible = true;

    const mat = ringRef.current.material as THREE.MeshStandardMaterial;
    mat.emissive.copy(color);
    mat.emissiveIntensity = intensity * 2.5;
    mat.opacity = intensity * 0.7;
    ringRef.current.visible = true;
    ringRef.current.rotation.x = Math.PI / 2;
    ringRef.current.rotation.z += delta * config.speed;
  });

  return (
    <group ref={groupRef}>
      <pointLight
        ref={lightRef}
        position={[0, 0.5, 0]}
        distance={6}
        decay={2}
        visible={false}
      />
      <mesh ref={ringRef} position={[0, config.yOffset, 0]} visible={false}>
        <torusGeometry args={[config.radius, 0.08, 8, 32]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#ffffff"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function checkCollision(pos: Vec3, obstacles: Array<{ position: Vec3; size: Vec3 }>): boolean {
  const playerSize = { x: 0.8, y: 1, z: 0.8 };
  
  for (const obstacle of obstacles) {
    const dx = Math.abs(pos.x - obstacle.position.x);
    const dz = Math.abs(pos.z - obstacle.position.z);
    
    if (dx < (playerSize.x + obstacle.size.x) / 2 && 
        dz < (playerSize.z + obstacle.size.z) / 2) {
      return true;
    }
  }
  
  return false;
}

export function Player() {
  const meshRef = useRef<THREE.Mesh>(null);
  const localPos = useRef({ x: 0, y: 0.5, z: 0 });
  const localDir = useRef({ x: 0, y: 0, z: 1 });
  const frameCount = useRef(0);
  const lastSyncedZ = useRef(0);
  
  const { phase, hasActivePowerUp, activePowerUps, obstacles, setPlayerPosition, setPlayerDirection, playerPosition, lives, level } = useArcadeGame();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  useEffect(() => {
    const distanceFromLocal = Math.abs(playerPosition.z - localPos.current.z);
    if (distanceFromLocal > 10) {
      localPos.current = { ...playerPosition };
      updatePlayerWorldPosition(playerPosition.x, playerPosition.y, playerPosition.z);
      if (meshRef.current) {
        meshRef.current.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
      }
    }
  }, [playerPosition.z, lives]);
  
  useFrame((state, delta) => {
    if (phase !== "playing" || !meshRef.current) return;
    
    const dt = Math.min(delta, 0.05);
    
    const keys = getKeys();
    const { touchControls } = useArcadeGame.getState();
    
    const playerScale = (level === 7 || level === 14) ? 1.4 : 1;
    meshRef.current.scale.set(playerScale, playerScale, playerScale);
    
    const baseSpeed = 7;
    const speedMultiplier = hasActivePowerUp("speedBoost") ? 1.4 : 1;
    const speed = baseSpeed * speedMultiplier;
    
    let dx = 0;
    let dz = 0;
    
    const forward = keys.forward || touchControls.forward;
    const back = keys.back || touchControls.back;
    const left = keys.left || touchControls.left;
    const right = keys.right || touchControls.right;
    
    if (forward) dz = 1;
    if (back) dz = -1;
    if (left) dx = 1;
    if (right) dx = -1;
    
    if (forward && left) { dx = 1; dz = 1; }
    if (forward && right) { dx = -1; dz = 1; }
    if (back && left) { dx = 1; dz = -1; }
    if (back && right) { dx = -1; dz = -1; }
    
    const hasMovement = dx !== 0 || dz !== 0;
    
    if (hasMovement) {
      const length = Math.sqrt(dx * dx + dz * dz);
      dx /= length;
      dz /= length;
      
      localDir.current = { x: dx, y: 0, z: dz };
      updatePlayerWorldDirection(dx, 0, dz);
      
      let newX = localPos.current.x + dx * speed * dt;
      let newZ = localPos.current.z + dz * speed * dt;
      
      if (level === 7 || level === 14) {
        newX = Math.max(-28, Math.min(28, newX));
        newZ = Math.max(255, Math.min(360, newZ));
      } else {
        newX = Math.max(-18, Math.min(18, newX));
        newZ = Math.max(-5, newZ);
      }
      
      const testPos: Vec3 = { x: newX, y: localPos.current.y, z: newZ };
      
      if (!checkCollision(testPos, obstacles)) {
        localPos.current.x = newX;
        localPos.current.z = newZ;
      }
    }
    
    meshRef.current.position.x = localPos.current.x;
    meshRef.current.position.y = localPos.current.y;
    meshRef.current.position.z = localPos.current.z;
    
    updatePlayerWorldPosition(localPos.current.x, localPos.current.y, localPos.current.z);
    
    frameCount.current++;
    if (frameCount.current % 5 === 0) {
      setPlayerPosition({ ...localPos.current });
      if (hasMovement) {
        setPlayerDirection({ ...localDir.current });
      }
    }
    
  });
  
  return (
    <>
      <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#1e40af" />
        
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ffcc99" />
        </mesh>
        
        <mesh position={[-0.3, 0, 0.3]} rotation={[0, 0, Math.PI / 6]}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color="#ffcc99" />
        </mesh>
        
        <mesh position={[0.3, 0, 0.3]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color="#ffcc99" />
        </mesh>
        
        <group position={[0, 0.5, -0.41]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.5, 0.15, 0.02]} />
            <meshStandardMaterial color="#c60b1e" />
          </mesh>
          
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.15, 0.02]} />
            <meshStandardMaterial color="#ffc400" />
          </mesh>
          
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.5, 0.15, 0.02]} />
            <meshStandardMaterial color="#c60b1e" />
          </mesh>
        </group>
      </mesh>
      
      {activePowerUps.map((pu) => (
        <PowerUpHalo key={pu.type} powerUp={pu} playerMeshRef={meshRef} />
      ))}
    </>
  );
}
