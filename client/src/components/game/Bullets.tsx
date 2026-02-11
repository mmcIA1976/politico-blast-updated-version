import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame, type Bullet, type PlayerBulletStyle } from "@/lib/stores/useArcadeGame";
import { playerWorldPosition } from "@/lib/stores/playerPositionRef";

const PLAYER_BULLET_COLORS: Record<PlayerBulletStyle, string> = {
  default: "#ff1b2d",
  triple: "#4dc4ff",
  power: "#ff8a00",
};

function SimpleBullet({ isPlayer, isBanana, isRose, style }: { isPlayer: boolean; isBanana: boolean; isRose: boolean; style?: PlayerBulletStyle }) {
  if (isPlayer) {
    const bulletStyle = style ?? "default";
    const color = PLAYER_BULLET_COLORS[bulletStyle];
    return (
      <mesh>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} toneMapped={false} />
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
  
  if (isRose) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#ff0040" />
        </mesh>
        <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 6, 0, 0]}>
          <coneGeometry args={[0.12, 0.15, 6]} />
          <meshBasicMaterial color="#ff0040" />
        </mesh>
        <mesh position={[0, 0, -0.15]} rotation={[-Math.PI / 6, 0, 0]}>
          <coneGeometry args={[0.12, 0.15, 6]} />
          <meshBasicMaterial color="#ff0040" />
        </mesh>
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <coneGeometry args={[0.12, 0.15, 6]} />
          <meshBasicMaterial color="#ff0040" />
        </mesh>
        <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
          <coneGeometry args={[0.12, 0.15, 6]} />
          <meshBasicMaterial color="#ff0040" />
        </mesh>
        <mesh position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
          <meshBasicMaterial color="#228B22" />
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
      
      // Player bullets can travel further in all directions
      const maxDistanceBehind = bullet.fromPlayer ? 25 : 5;
      const maxDistanceAhead = bullet.fromPlayer ? 50 : 20;
      const isBehindPlayer = newZ < playerZ - maxDistanceBehind;
      const tooFarAhead = newZ > playerZ + maxDistanceAhead;
      
      if (Math.abs(newX) < 40 && !isBehindPlayer && !tooFarAhead && Math.abs(newY) < 20) {
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
          <SimpleBullet 
            isPlayer={bullet.fromPlayer} 
            isBanana={bullet.id.startsWith("banana")} 
            isRose={bullet.id.startsWith("rose")}
            style={bullet.style}
          />
        </group>
      ))}
    </group>
  );
}
