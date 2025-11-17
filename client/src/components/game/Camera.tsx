import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function Camera() {
  const { camera } = useThree();
  const { playerPosition, phase } = useArcadeGame();
  
  useFrame(() => {
    if (phase !== "playing") return;
    
    const targetPosition = new THREE.Vector3(
      playerPosition.x * 0.25,
      12,
      playerPosition.z - 6
    );
    
    camera.position.lerp(targetPosition, 0.15);
    camera.lookAt(playerPosition.x * 0.15, 0, playerPosition.z + 5);
  });
  
  return null;
}
