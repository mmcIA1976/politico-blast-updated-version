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
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const { playerPosition, setPlayerPosition, setPlayerDirection, phase, hasActivePowerUp, obstacles } = useArcadeGame();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  useFrame((state, delta) => {
    if (phase !== "playing" || !meshRef.current) return;
    
    const clampedDelta = Math.min(delta, 0.05);
    
    const keys = getKeys();
    const { touchControls, level } = useArcadeGame.getState();
    const baseSpeed = 8.4;
    const speedMultiplier = hasActivePowerUp("speedBoost") ? 1.5 : 1;
    const speed = baseSpeed * speedMultiplier;
    
    const targetVelocity = new THREE.Vector3(0, 0, 0);
    
    if (keys.forward || touchControls.forward) targetVelocity.z += 1;
    if (keys.back || touchControls.back) targetVelocity.z -= 1;
    if (keys.left || touchControls.left) targetVelocity.x += 1;
    if (keys.right || touchControls.right) targetVelocity.x -= 1;
    
    if (targetVelocity.length() > 0) {
      targetVelocity.normalize();
    }
    
    velocityRef.current.lerp(targetVelocity, 0.25);
    
    if (velocityRef.current.length() > 0.01) {
      const dirVec3: Vec3 = { x: velocityRef.current.x, y: 0, z: velocityRef.current.z };
      setPlayerDirection(dirVec3);
      
      const newPosition: Vec3 = {
        x: playerPosition.x + velocityRef.current.x * speed * clampedDelta,
        y: playerPosition.y,
        z: playerPosition.z + velocityRef.current.z * speed * clampedDelta
      };
      
      if (level === 7) {
        newPosition.x = Math.max(-18, Math.min(18, newPosition.x));
        newPosition.z = Math.max(270, Math.min(340, newPosition.z));
      } else {
        newPosition.x = Math.max(-18, Math.min(18, newPosition.x));
        newPosition.z = Math.max(-5, newPosition.z);
      }
      
      if (!checkCollision(newPosition, obstacles)) {
        setPlayerPosition(newPosition);
      }
    }
    
    meshRef.current.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
  });
  
  return (
    <mesh ref={meshRef} position={[playerPosition.x, 0.5, playerPosition.z]} castShadow>
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
