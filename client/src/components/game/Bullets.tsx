import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame, type Vec3 } from "@/lib/stores/useArcadeGame";

function Rose3D() {
  return (
    <group>
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#e30613" emissive="#e30613" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[0.1, 0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[-0.1, 0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#c62828" emissive="#c62828" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[0.1, -0.05, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[-0.1, -0.05, 0]}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function Bullets() {
  const { bullets, updateBullets, removeBullet, playerPosition } = useArcadeGame();
  
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
            <Rose3D />
          )}
        </group>
      ))}
    </group>
  );
}
