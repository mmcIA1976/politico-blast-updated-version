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

export function LevelSky() {
  const level = useArcadeGame((state) => state.level);
  const currentColor = useRef(new THREE.Color(SKY_SEQUENCE[0]));
  const targetColor = useRef(new THREE.Color(SKY_SEQUENCE[0]));
  const attachColor = useMemo(() => currentColor.current.clone(), []);

  useEffect(() => {
    const idx = ((level - 1) % SKY_SEQUENCE.length + SKY_SEQUENCE.length) % SKY_SEQUENCE.length;
    targetColor.current.set(SKY_SEQUENCE[idx]);
  }, [level]);

  useFrame(() => {
    currentColor.current.lerp(targetColor.current, 0.02);
    attachColor.copy(currentColor.current);
  });

  return <color attach="background" args={[attachColor]} />;
}
