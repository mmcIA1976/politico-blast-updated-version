import { useMemo } from "react";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

function GrenadeModel({ position, exploding, explosionProgress }: { 
  position: { x: number; y: number; z: number }; 
  exploding: boolean;
  explosionProgress: number;
}) {
  if (exploding) {
    const scale = 1 + explosionProgress * 8;
    const opacity = 1 - explosionProgress;
    
    return (
      <group position={[position.x, position.y, position.z]}>
        <mesh scale={[scale, scale, scale]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial 
            color="#ff4400" 
            transparent 
            opacity={opacity * 0.8}
          />
        </mesh>
        <mesh scale={[scale * 0.7, scale * 0.7, scale * 0.7]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial 
            color="#ffaa00" 
            transparent 
            opacity={opacity}
          />
        </mesh>
        <mesh scale={[scale * 0.4, scale * 0.4, scale * 0.4]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={opacity}
          />
        </mesh>
        <pointLight 
          color="#ff6600" 
          intensity={opacity * 50} 
          distance={15}
        />
      </group>
    );
  }
  
  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial 
          color="#2d5016" 
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
        <meshStandardMaterial 
          color="#444444" 
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
}

export function Grenades() {
  const grenades = useArcadeGame((state) => state.grenades);
  
  const grenadeElements = useMemo(() => {
    return grenades.map((grenade) => (
      <GrenadeModel
        key={grenade.id}
        position={grenade.position}
        exploding={grenade.exploding}
        explosionProgress={grenade.explosionProgress}
      />
    ));
  }, [grenades]);
  
  return <>{grenadeElements}</>;
}
