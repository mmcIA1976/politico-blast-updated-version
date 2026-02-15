import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame, type Bullet, type PlayerBulletStyle } from "@/lib/stores/useArcadeGame";
import { playerWorldPosition } from "@/lib/stores/playerPositionRef";

const PLAYER_BULLET_COLORS: Record<PlayerBulletStyle, string> = {
  default: "#ff1b2d",
  triple: "#4dc4ff",
  power: "#ff8a00",
};

const PLAYER_STYLES: PlayerBulletStyle[] = ["default", "triple", "power"];
const MAX_PLAYER_BULLETS_PER_STYLE = 120;

function EnemyBullet({ bullet }: { bullet: Bullet }) {
  if (bullet.id.startsWith("banana")) {
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
  
  if (bullet.id.startsWith("rose")) {
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
  const { bullets, updateBullets, isLevelTransitioning } = useArcadeGame();
  const frameCounter = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const playerBuckets = useMemo(
    () => ({
      default: [] as Bullet[],
      triple: [] as Bullet[],
      power: [] as Bullet[],
    }),
    []
  );
  const refs: Record<PlayerBulletStyle, React.RefObject<THREE.InstancedMesh>> = {
    default: useRef<THREE.InstancedMesh>(null),
    triple: useRef<THREE.InstancedMesh>(null),
    power: useRef<THREE.InstancedMesh>(null),
  };
  
  useFrame((_, rawDelta) => {
    // Pausar durante transiciones de nivel
    if (isLevelTransitioning) return;
    
    const delta = Math.min(rawDelta, 0.05);
    frameCounter.current++;
    
    // Optimización: solo actualizar cada 2 frames
    if (frameCounter.current % 2 !== 0) return;
    
    if (bullets.length === 0) return;
    
    const playerZ = playerWorldPosition.z;
    let needsUpdate = false;
    const updatedBullets: Bullet[] = [];
    
    for (let i = 0; i < bullets.length; i++) {
      const bullet = bullets[i];
      const newX = bullet.position.x + bullet.direction.x * bullet.speed * delta;
      const newY = bullet.position.y + bullet.direction.y * bullet.speed * delta;
      const newZ = bullet.position.z + bullet.direction.z * bullet.speed * delta;
      
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
  
  useEffect(() => {
    playerBuckets.default.length = 0;
    playerBuckets.triple.length = 0;
    playerBuckets.power.length = 0;
    
    for (let i = 0; i < bullets.length; i++) {
      const bullet = bullets[i];
      if (bullet.fromPlayer) {
        const style = bullet.style ?? "default";
        playerBuckets[style].push(bullet);
      }
    }
    
    PLAYER_STYLES.forEach((style) => {
      const mesh = refs[style].current;
      if (!mesh) return;
      const bucket = playerBuckets[style];
      const count = Math.min(bucket.length, MAX_PLAYER_BULLETS_PER_STYLE);
      for (let i = 0; i < count; i++) {
        const b = bucket[i];
        dummy.position.set(b.position.x, b.position.y, b.position.z);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      for (let i = count; i < MAX_PLAYER_BULLETS_PER_STYLE; i++) {
        dummy.position.set(0, -999, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [bullets, dummy, playerBuckets]);
  
  const enemyBullets = useMemo(() => bullets.filter((b) => !b.fromPlayer), [bullets]);
  
  return (
    <group>
      {PLAYER_STYLES.map((style) => (
        <instancedMesh
          key={style}
          ref={refs[style]}
          args={[undefined as any, undefined as any, MAX_PLAYER_BULLETS_PER_STYLE]}
          frustumCulled={false}
        >
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial
            color={PLAYER_BULLET_COLORS[style]}
            emissive={PLAYER_BULLET_COLORS[style]}
            emissiveIntensity={0.7}
            toneMapped={false}
          />
        </instancedMesh>
      ))}
      {enemyBullets.map((bullet) => (
        <group key={bullet.id} position={[bullet.position.x, bullet.position.y, bullet.position.z]}>
          <EnemyBullet bullet={bullet} />
        </group>
      ))}
    </group>
  );
}
