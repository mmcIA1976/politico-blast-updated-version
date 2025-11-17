import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function ScrollingBackground() {
  const groupRef = useRef<THREE.Group>(null);
  const { scrollPosition, level } = useArcadeGame();
  
  const texturePath = useMemo(() => {
    if (level <= 2) return "/textures/asphalt.png";
    if (level <= 4) return "/textures/grass.png";
    return "/textures/asphalt.png";
  }, [level]);
  
  const texture = useTexture(texturePath);
  
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
  }, [texture]);
  
  useFrame(() => {
    if (texture) {
      texture.offset.y = scrollPosition * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
}
