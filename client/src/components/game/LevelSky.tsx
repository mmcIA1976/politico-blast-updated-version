import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

const SKY_SEQUENCE = [
  "#f5a26c", // amanecer
  "#8fd3ff", // mediodía
  "#314068", // atardecer
  "#050914", // noche
];

const BAND_POSITIONS = [-28, 28];
const BAND_SIZE: [number, number] = [40, 60];

export function LevelSky() {
  const level = useArcadeGame((state) => state.level);
  const currentColor = useRef(new THREE.Color(SKY_SEQUENCE[0]));
  const targetColor = useRef(new THREE.Color(SKY_SEQUENCE[0]));
  const attachColor = useMemo(() => currentColor.current.clone(), []);
  const bandMaterials = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    const idx = ((level - 1) % SKY_SEQUENCE.length + SKY_SEQUENCE.length) % SKY_SEQUENCE.length;
    targetColor.current.set(SKY_SEQUENCE[idx]);
  }, [level]);

  useFrame(() => {
    currentColor.current.lerp(targetColor.current, 0.02);
    attachColor.copy(currentColor.current);
    bandMaterials.current.forEach((mat) => {
      mat.color.copy(currentColor.current);
      mat.emissive.copy(currentColor.current);
    });
  });

  return (
    <>
      <color attach="background" args={[attachColor]} />
      {BAND_POSITIONS.map((x, idx) => (
        <mesh key={idx} position={[x, 8, 0]} rotation={[0, x > 0 ? -Math.PI / 2.2 : Math.PI / 2.2, 0]}>
          <planeGeometry args={BAND_SIZE} />
          <meshStandardMaterial
            transparent
            opacity={0.75}
            emissiveIntensity={0.2}
            ref={(mat) => {
              if (mat) bandMaterials.current[idx] = mat;
            }}
          />
        </mesh>
      ))}
    </>
  );
}
