import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { playerWorldPosition } from "@/lib/stores/playerPositionRef";

const loader = new THREE.TextureLoader();
const textureCache: Record<string, THREE.Texture> = {};

function loadTexture(path: string): Promise<THREE.Texture> {
  if (textureCache[path]) return Promise.resolve(textureCache[path]);
  return new Promise((resolve) => {
    loader.load(path, (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 8);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 4;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      textureCache[path] = tex;
      resolve(tex);
    });
  });
}

loadTexture("/textures/asphalt.jpg");
loadTexture("/textures/grass.jpg");
loadTexture("/textures/sand.jpg");

export function ScrollingBackground() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const level = useArcadeGame(s => s.level);
  
  const [textures, setTextures] = useState<{
    asphalt: THREE.Texture | null;
    grass: THREE.Texture | null;
    sand: THREE.Texture | null;
  }>({ asphalt: null, grass: null, sand: null });
  
  useEffect(() => {
    let mounted = true;
    Promise.all([
      loadTexture("/textures/asphalt.jpg"),
      loadTexture("/textures/grass.jpg"),
      loadTexture("/textures/sand.jpg"),
    ]).then(([asphalt, grass, sand]) => {
      if (mounted) setTextures({ asphalt, grass, sand });
    });
    return () => { mounted = false; };
  }, []);
  
  const texture = useMemo(() => {
    if (!textures.asphalt) return null;
    if (level === 1 || level === 3 || level === 5) return textures.asphalt;
    if (level === 2 || level === 4 || level === 6) return textures.grass;
    if (level === 7) return textures.sand;
    if (level === 8 || level === 10 || level === 12 || level === 14) return textures.grass;
    if (level === 9 || level === 11 || level === 13) return textures.sand;
    return textures.asphalt;
  }, [level, textures]);
  
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
        <meshStandardMaterial ref={materialRef} map={texture} color={groundColor || "#555555"} />
      </mesh>
    </group>
  );
}
