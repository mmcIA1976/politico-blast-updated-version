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
  
  const { phase, hasActivePowerUp, activePowerUps, obstacles, setPlayerPosition, setPlayerDirection, playerPosition, lives } = useArcadeGame();
  const [, getKeys] = useKeyboardControls<Controls>();
  const haloRef = useRef<THREE.PointLight>(null);
  const haloRingRef = useRef<THREE.Mesh>(null);
  
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
    const { touchControls, level } = useArcadeGame.getState();
    
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
    
    const currentAP = useArcadeGame.getState().activePowerUps;
    const now = state.clock.getElapsedTime();
    
    const powerUpColors: Record<string, THREE.Color> = {
      speedBoost: new THREE.Color(0x00ff00),
      powerShot: new THREE.Color(0xff0000),
      rapidFire: new THREE.Color(0xff8800),
      tripleShot: new THREE.Color(0x0088ff),
    };
    
    const priority = ["powerShot", "tripleShot", "rapidFire", "speedBoost"];
    let dominantPU: ActivePowerUp | null = null;
    for (const t of priority) {
      const found = currentAP.find(p => p.type === t);
      if (found) { dominantPU = found; break; }
    }
    
    if (haloRef.current && haloRingRef.current) {
      if (dominantPU) {
        const remaining = dominantPU.expiresAt - now;
        const total = dominantPU.duration;
        const ratio = Math.max(0, Math.min(1, remaining / total));
        
        const blinkThreshold = total * 0.25;
        let intensity = ratio;
        
        if (remaining < blinkThreshold && remaining > 0) {
          const blinkSpeed = remaining < blinkThreshold * 0.5 ? 12 : 6;
          const blink = Math.sin(now * blinkSpeed * Math.PI) * 0.5 + 0.5;
          intensity = ratio * blink;
        }
        
        const color = powerUpColors[dominantPU.type] || new THREE.Color(0xffffff);
        haloRef.current.color.copy(color);
        haloRef.current.intensity = intensity * 3;
        haloRef.current.visible = true;
        
        const ringMat = haloRingRef.current.material as THREE.MeshStandardMaterial;
        ringMat.emissive.copy(color);
        ringMat.emissiveIntensity = intensity * 2;
        ringMat.opacity = intensity * 0.6;
        haloRingRef.current.visible = true;
        haloRingRef.current.rotation.x = Math.PI / 2;
        haloRingRef.current.rotation.z += delta * 2;
      } else {
        haloRef.current.visible = false;
        haloRingRef.current.visible = false;
      }
    }
  });
  
  return (
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
      
      <pointLight
        ref={haloRef}
        position={[0, 0.5, 0]}
        distance={5}
        decay={2}
        visible={false}
      />
      
      <mesh ref={haloRingRef} position={[0, -0.3, 0]} visible={false}>
        <torusGeometry args={[1.0, 0.08, 8, 32]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#ffffff"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </mesh>
  );
}
