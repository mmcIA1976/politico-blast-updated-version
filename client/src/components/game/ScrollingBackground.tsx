import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function ScrollingBackground() {
  const groupRef = useRef<THREE.Group>(null);
  const { scrollPosition, level } = useArcadeGame();
  
  const texturePath = useMemo(() => {
    if (level === 1 || level === 2) return "/textures/asphalt.png";
    if (level === 3 || level === 4) return "/textures/grass.png";
    if (level === 5 || level === 6) return "/textures/asphalt.png";
    if (level === 7) return "/textures/grass.png";
    return "/textures/grass.png";
  }, [level]);
  
  const texture = useTexture(texturePath);
  
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
  }, [texture]);
  
  useFrame(() => {
    const { playerPosition } = useArcadeGame.getState();
    if (texture) {
      texture.offset.y = -playerPosition.z * 0.1;
    }
    if (groupRef.current) {
      groupRef.current.position.z = playerPosition.z;
    }
  });
  
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 60]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
}
