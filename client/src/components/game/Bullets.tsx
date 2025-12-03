import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame, type Vec3 } from "@/lib/stores/useArcadeGame";

function Rose3D() {
  return (
    <group scale={[1.2, 1.2, 1.2]}>
      {/* Centro de la rosa */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.05, 0.15, 8]} />
        <meshStandardMaterial color="#c62828" emissive="#c62828" emissiveIntensity={0.6} />
      </mesh>
      
      {/* Pétalos exteriores - 5 pétalos en forma de corazón */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * Math.PI * 2) / 5;
        const x = Math.cos(angle) * 0.18;
        const y = Math.sin(angle) * 0.18;
        return (
          <group key={i} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
            <mesh rotation={[0, 0, -Math.PI / 6]} position={[-0.05, 0, 0]}>
              <sphereGeometry args={[0.12, 8, 8, 0, Math.PI]} />
              <meshStandardMaterial color="#e30613" emissive="#e30613" emissiveIntensity={0.6} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 6]} position={[0.05, 0, 0]}>
              <sphereGeometry args={[0.12, 8, 8, 0, Math.PI]} />
              <meshStandardMaterial color="#e30613" emissive="#e30613" emissiveIntensity={0.6} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
      
      {/* Pétalos interiores - capa media */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * Math.PI * 2) / 5 + Math.PI / 5;
        const x = Math.cos(angle) * 0.1;
        const y = Math.sin(angle) * 0.1;
        return (
          <group key={`inner-${i}`} position={[x, y, 0.05]} rotation={[0, 0, angle]}>
            <mesh>
              <sphereGeometry args={[0.08, 8, 8, 0, Math.PI]} />
              <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.6} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
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
      
      if (bullet.fromPlayer) {
        return Math.abs(pos.x) < 25 && distanceFromPlayer < 40 && Math.abs(pos.y) < 20;
      } else {
        return Math.abs(pos.x) < 25 && distanceFromPlayer < 25 && Math.abs(pos.y) < 20;
      }
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
                color="#8B4513"
                emissive="#A0522D"
                emissiveIntensity={0.5}
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
