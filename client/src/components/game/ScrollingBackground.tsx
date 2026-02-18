import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { playerWorldPosition } from "@/lib/stores/playerPositionRef";

const ALL_GROUND_TEXTURES = [
  "/textures/asphalt.jpg",
  "/textures/grass.jpg",
  "/textures/sand.jpg",
];

export function ScrollingBackground() {
  const groupRef = useRef<THREE.Group>(null);
  const level = useArcadeGame(s => s.level);
  
  const [asphaltTex, grassTex, sandTex] = useTexture(ALL_GROUND_TEXTURES);
  
  useMemo(() => {
    [asphaltTex, grassTex, sandTex].forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 8);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 4;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
    });
  }, [asphaltTex, grassTex, sandTex]);
  
  const texture = useMemo(() => {
    if (level === 1 || level === 3 || level === 5) return asphaltTex;
    if (level === 2 || level === 4 || level === 6) return grassTex;
    if (level === 7) return sandTex;
    if (level === 8 || level === 10 || level === 12 || level === 14) return grassTex;
    if (level === 9 || level === 11 || level === 13) return sandTex;
    return asphaltTex;
  }, [level, asphaltTex, grassTex, sandTex]);
  
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
