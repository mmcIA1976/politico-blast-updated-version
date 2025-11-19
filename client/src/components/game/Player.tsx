import { useRef, useEffect } from "react";
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

export function Player() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { playerPosition, setPlayerPosition, setPlayerDirection, phase, hasActivePowerUp } = useArcadeGame();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  useFrame((state, delta) => {
    if (phase !== "playing" || !meshRef.current) return;
    
    const keys = getKeys();
    const baseSpeed = 7;
    const speedMultiplier = hasActivePowerUp("speedBoost") ? 1.5 : 1;
    const speed = baseSpeed * speedMultiplier;
    const movement = new THREE.Vector3();
    
    if (keys.forward) movement.z += 1;
    if (keys.back) movement.z -= 1;
    if (keys.left) movement.x += 1;
    if (keys.right) movement.x -= 1;
    
    if (movement.length() > 0) {
      movement.normalize();
      const dirVec3: Vec3 = { x: movement.x, y: movement.y, z: movement.z };
      setPlayerDirection(dirVec3);
      
      const newPosition: Vec3 = {
        x: playerPosition.x + movement.x * speed * delta,
        y: playerPosition.y,
        z: playerPosition.z + movement.z * speed * delta
      };
      
      newPosition.x = Math.max(-12, Math.min(12, newPosition.x));
      newPosition.z = Math.max(-5, newPosition.z);
      
      setPlayerPosition(newPosition);
      meshRef.current.position.set(newPosition.x, newPosition.y, newPosition.z);
    } else {
      meshRef.current.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
    }
  });
  
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
    }
  }, [playerPosition]);
  
  return (
    <mesh ref={meshRef} position={[playerPosition.x, 0.5, playerPosition.z]} castShadow>
      <boxGeometry args={[0.8, 1, 0.8]} />
      <meshStandardMaterial color="#ff6b6b" />
      
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
    </mesh>
  );
}
