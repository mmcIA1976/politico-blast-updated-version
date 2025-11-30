import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useArcadeGame, type Vec3 } from "@/lib/stores/useArcadeGame";

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
  const localPosition = useRef<Vec3>({ x: 0, y: 0.5, z: 0 });
  const frameCount = useRef(0);
  const lastDirection = useRef<Vec3>({ x: 0, y: 0, z: 1 });
  
  const { phase, hasActivePowerUp, obstacles, setPlayerPosition, setPlayerDirection, playerPosition } = useArcadeGame();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  if (localPosition.current.x === 0 && localPosition.current.z === 0 && playerPosition.z !== 0) {
    localPosition.current = { ...playerPosition };
  }
  
  useFrame((_, delta) => {
    if (phase !== "playing" || !meshRef.current) return;
    
    const clampedDelta = Math.min(Math.max(delta, 0.008), 0.033);
    
    const keys = getKeys();
    const { touchControls, level } = useArcadeGame.getState();
    
    const baseSpeed = 10;
    const speedMultiplier = hasActivePowerUp("speedBoost") ? 1.5 : 1;
    const speed = baseSpeed * speedMultiplier;
    
    let dx = 0;
    let dz = 0;
    
    if (keys.forward || touchControls.forward) dz = 1;
    if (keys.back || touchControls.back) dz = -1;
    if (keys.left || touchControls.left) dx = 1;
    if (keys.right || touchControls.right) dx = -1;
    
    if (keys.forward || touchControls.forward) {
      if (keys.left || touchControls.left) { dx = 1; dz = 1; }
      if (keys.right || touchControls.right) { dx = -1; dz = 1; }
    }
    if (keys.back || touchControls.back) {
      if (keys.left || touchControls.left) { dx = 1; dz = -1; }
      if (keys.right || touchControls.right) { dx = -1; dz = -1; }
    }
    
    const hasMovement = dx !== 0 || dz !== 0;
    
    if (hasMovement) {
      const length = Math.sqrt(dx * dx + dz * dz);
      dx /= length;
      dz /= length;
      
      lastDirection.current = { x: dx, y: 0, z: dz };
      
      const newX = localPosition.current.x + dx * speed * clampedDelta;
      const newZ = localPosition.current.z + dz * speed * clampedDelta;
      
      let clampedX: number;
      let clampedZ: number;
      
      if (level === 7) {
        clampedX = Math.max(-18, Math.min(18, newX));
        clampedZ = Math.max(270, Math.min(340, newZ));
      } else {
        clampedX = Math.max(-18, Math.min(18, newX));
        clampedZ = Math.max(-5, newZ);
      }
      
      const testPos: Vec3 = { x: clampedX, y: localPosition.current.y, z: clampedZ };
      
      if (!checkCollision(testPos, obstacles)) {
        localPosition.current.x = clampedX;
        localPosition.current.z = clampedZ;
      }
    }
    
    meshRef.current.position.x = localPosition.current.x;
    meshRef.current.position.y = localPosition.current.y;
    meshRef.current.position.z = localPosition.current.z;
    
    frameCount.current++;
    if (frameCount.current % 3 === 0) {
      setPlayerPosition({ ...localPosition.current });
      if (hasMovement) {
        setPlayerDirection({ ...lastDirection.current });
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
    </mesh>
  );
}
