import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame, type Bullet } from "@/lib/stores/useArcadeGame";
import { playerWorldPosition } from "@/lib/stores/playerPositionRef";

function SimpleBullet({ isPlayer, isBanana }: { isPlayer: boolean; isBanana: boolean }) {
  if (isPlayer) {
    return (
      <mesh>
        <sphereGeometry args={[0.2, 6, 6]} />
        <meshBasicMaterial color="#8B4513" />
      </mesh>
    );
  }
  
  if (isBanana) {
    return (
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh>
          <capsuleGeometry args={[0.15, 0.5, 4, 8]} />
          <meshBasicMaterial color="#ffdd00" />
        </mesh>
        <mesh position={[0.2, 0, 0]}>
          <boxGeometry args={[0.1, 0.18, 0.03]} />
          <meshBasicMaterial color="#8B4513" />
        </mesh>
      </group>
    );
  }
  
  return (
    <mesh>
      <sphereGeometry args={[0.25, 6, 6]} />
      <meshBasicMaterial color="#e30613" />
    </mesh>
  );
}

export function Bullets() {
  const { bullets, updateBullets } = useArcadeGame();
  const frameCounter = useRef(0);
  
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    frameCounter.current++;
    
    if (bullets.length === 0) return;
    
    const playerZ = playerWorldPosition.z;
    let needsUpdate = false;
    const updatedBullets: Bullet[] = [];
    
    for (let i = 0; i < bullets.length; i++) {
      const bullet = bullets[i];
      const newX = bullet.position.x + bullet.direction.x * bullet.speed * delta;
      const newY = bullet.position.y + bullet.direction.y * bullet.speed * delta;
      const newZ = bullet.position.z + bullet.direction.z * bullet.speed * delta;
      
      const distanceFromPlayer = Math.abs(newZ - playerZ);
      const maxDistance = bullet.fromPlayer ? 40 : 25;
      
      if (Math.abs(newX) < 35 && distanceFromPlayer < maxDistance && Math.abs(newY) < 20) {
        if (newX !== bullet.position.x || newY !== bullet.position.y || newZ !== bullet.position.z) {
          needsUpdate = true;
        }
        updatedBullets.push({
          ...bullet,
          position: { x: newX, y: newY, z: newZ }
        });
      } else {
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      updateBullets(updatedBullets);
    }
  });
  
  return (
    <group>
      {bullets.map((bullet) => (
        <group key={bullet.id} position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
          <SimpleBullet isPlayer={bullet.fromPlayer} isBanana={bullet.id.startsWith("banana")} />
        </group>
      ))}
    </group>
  );
}
