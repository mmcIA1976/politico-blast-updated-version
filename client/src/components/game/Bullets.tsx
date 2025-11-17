import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function Bullets() {
  const { bullets, updateBullets, removeBullet } = useArcadeGame();
  
  useFrame((state, delta) => {
    const updatedBullets = bullets.map(bullet => {
      const newPosition = bullet.position.clone();
      newPosition.add(bullet.direction.clone().multiplyScalar(bullet.speed * delta));
      
      return {
        ...bullet,
        position: newPosition
      };
    }).filter(bullet => {
      const pos = bullet.position;
      return Math.abs(pos.x) < 20 && Math.abs(pos.z) < 30 && Math.abs(pos.y) < 20;
    });
    
    updateBullets(updatedBullets);
  });
  
  return (
    <group>
      {bullets.map((bullet) => (
        <mesh key={bullet.id} position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial 
            color={bullet.fromPlayer ? "#ffff00" : "#ff0000"} 
            emissive={bullet.fromPlayer ? "#ffff00" : "#ff0000"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
