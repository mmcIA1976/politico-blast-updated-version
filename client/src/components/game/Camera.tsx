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
      playerPosition.x * 0.3,
      12,
      playerPosition.z - 8
    );
    
    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(playerPosition.x * 0.2, 0, playerPosition.z + 3);
  });
  
  return null;
}
