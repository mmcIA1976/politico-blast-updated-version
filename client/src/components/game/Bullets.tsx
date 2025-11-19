import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame, type Vec3 } from "@/lib/stores/useArcadeGame";
import { useTexture } from "@react-three/drei";

export function Bullets() {
  const { bullets, updateBullets, removeBullet, playerPosition } = useArcadeGame();
  const roseTexture = useTexture("/textures/rose_bullet.png");
  
  useFrame((state, delta) => {
    const updatedBullets = bullets.map(bullet => {
      const newPosition: Vec3 = {
        x: bullet.position.x + bullet.direction.x * bullet.speed * delta,
        y: bullet.position.y + bullet.direction.y * bullet.speed * delta,
        z: bullet.position.z + bullet.direction.z * bullet.speed * delta
      };
      
      return {
        ...bullet,
        position: newPosition
      };
    }).filter(bullet => {
      const pos = bullet.position;
      const distanceFromPlayer = Math.abs(pos.z - playerPosition.z);
      return Math.abs(pos.x) < 20 && distanceFromPlayer < 50 && Math.abs(pos.y) < 20;
    });
    
    updateBullets(updatedBullets);
  });
  
  return (
    <group>
      {bullets.map((bullet) => (
        <group key={bullet.id} position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
          {bullet.fromPlayer ? (
            <mesh>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial 
                color="#ffff00"
                emissive="#ffff00"
                emissiveIntensity={1.0}
              />
            </mesh>
          ) : (
            <sprite scale={[0.8, 0.8, 0.8]}>
              <spriteMaterial 
                map={roseTexture}
                transparent={true}
              />
            </sprite>
          )}
        </group>
      ))}
    </group>
  );
}
