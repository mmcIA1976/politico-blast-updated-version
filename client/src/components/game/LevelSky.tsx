import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

const SKY_SEQUENCE = [
  "#4f6fae", // amanecer azul anaranjado
  "#8fd3ff", // mediodía
  "#314068", // atardecer
  "#050914", // noche
];

export function LevelSky() {
  const level = useArcadeGame((state) => state.level);
  const { scene } = useThree();
  const currentColor = useRef(new THREE.Color(SKY_SEQUENCE[0]));
  const targetColor = useRef(new THREE.Color(SKY_SEQUENCE[0]));

  useEffect(() => {
    if (!scene.background) {
      scene.background = currentColor.current.clone();
    }
  }, [scene]);

  useEffect(() => {
    const idx = ((level - 1) % SKY_SEQUENCE.length + SKY_SEQUENCE.length) % SKY_SEQUENCE.length;
    targetColor.current.set(SKY_SEQUENCE[idx]);
  }, [level]);

  useFrame(() => {
    currentColor.current.lerp(targetColor.current, 0.03);
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(currentColor.current);
    } else {
      scene.background = currentColor.current.clone();
    }
  });

  return null;
}
