import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { playerWorldPosition } from "@/lib/stores/playerPositionRef";

export function ScrollingBackground() {
  const groupRef = useRef<THREE.Group>(null);
  const { level } = useArcadeGame();
  
  const texturePath = useMemo(() => {
    if (level === 1) return "/textures/asphalt.png";
    if (level === 2) return "/textures/grass.png";
    if (level === 3) return "/textures/asphalt.png";
    if (level === 4) return "/textures/grass.png";
    if (level === 5) return "/textures/asphalt.png";
    if (level === 6) return "/textures/grass.png";
    if (level === 7) return "/textures/sand.jpg";
    if (level === 8 || level === 10 || level === 12) return "/textures/grass.png";
    if (level === 9 || level === 11 || level === 13) return "/textures/sand.jpg";
    if (level === 14) return "/textures/grass.png";
    return "/textures/asphalt.png";
  }, [level]);
  
  const groundColor = useMemo(() => {
    if (level === 8) return "#4a7c2a";
    if (level === 9) return "#c2b280";
    if (level === 10) return "#3d6b24";
    if (level === 11) return "#d4c490";
    if (level === 12) return "#2d5a1a";
    if (level === 13) return "#b8a870";
    if (level === 14) return "#1a4a10";
    return undefined;
  }, [level]);
  
  const texture = useTexture(texturePath);
  
  useMemo(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 12);
  }, [texture]);
  
  useFrame(() => {
    if (texture) {
      texture.offset.y = -playerWorldPosition.z * 0.08;
    }
    if (groupRef.current) {
      groupRef.current.position.z = playerWorldPosition.z;
    }
  });
  
  const planeSize = useMemo(() => {
    if (level === 7 || level === 14) return [100, 160];
    return [80, 120];
  }, [level]);
  
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={planeSize as [number, number]} />
        <meshStandardMaterial map={texture} color={groundColor} />
      </mesh>
    </group>
  );
}
