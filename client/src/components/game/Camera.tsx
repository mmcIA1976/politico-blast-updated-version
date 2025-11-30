import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function Camera() {
  const { camera } = useThree();
  const { playerPosition, phase, level } = useArcadeGame();
  const smoothPositionRef = useRef(new THREE.Vector3(0, 15, -10));
  
  useFrame((state, delta) => {
    if (phase !== "playing") return;
    
    const clampedDelta = Math.min(delta, 0.05);
    
    const cameraHeight = level === 7 ? 20 : 16;
    const cameraOffset = level === 7 ? -14 : -11;
    
    const targetPosition = new THREE.Vector3(
      playerPosition.x * 0.85,
      cameraHeight,
      playerPosition.z + cameraOffset
    );
    
    smoothPositionRef.current.lerp(targetPosition, 0.08 + clampedDelta * 2);
    
    camera.position.copy(smoothPositionRef.current);
    camera.lookAt(playerPosition.x * 0.75, 0, playerPosition.z + 2);
  });
  
  return null;
}
