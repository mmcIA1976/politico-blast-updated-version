import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function Camera() {
  const { camera } = useThree();
  const { playerPosition, phase, level } = useArcadeGame();
  
  useFrame(() => {
    if (phase !== "playing") return;
    
    const cameraHeight = level === 7 ? 18 : 15;
    const cameraOffset = level === 7 ? -12 : -10;
    
    const targetPosition = new THREE.Vector3(
      playerPosition.x * 0.7,
      cameraHeight,
      playerPosition.z + cameraOffset
    );
    
    camera.position.lerp(targetPosition, 0.12);
    camera.lookAt(playerPosition.x * 0.6, 0, playerPosition.z);
  });
  
  return null;
}
