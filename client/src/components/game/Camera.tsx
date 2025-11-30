import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { playerWorldPosition } from "@/lib/stores/playerPositionRef";

export function Camera() {
  const { camera } = useThree();
  const { phase, level } = useArcadeGame();
  
  const smoothCamPos = useRef(new THREE.Vector3(0, 16, -11));
  const smoothLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  useFrame(() => {
    if (phase !== "playing") return;
    
    const cameraHeight = level === 7 ? 22 : 16;
    const cameraOffset = level === 7 ? -16 : -11;
    const maxLateralBound = level === 7 ? 28 : 18;
    
    const clampedPlayerX = Math.max(-maxLateralBound, Math.min(maxLateralBound, playerWorldPosition.x));
    
    const targetCamX = clampedPlayerX;
    const targetCamY = cameraHeight;
    const targetCamZ = playerWorldPosition.z + cameraOffset;
    
    smoothCamPos.current.x += (targetCamX - smoothCamPos.current.x) * 0.12;
    smoothCamPos.current.y += (targetCamY - smoothCamPos.current.y) * 0.08;
    smoothCamPos.current.z += (targetCamZ - smoothCamPos.current.z) * 0.12;
    
    const targetLookX = clampedPlayerX;
    const targetLookY = 0;
    const targetLookZ = playerWorldPosition.z + 5;
    
    smoothLookAt.current.x += (targetLookX - smoothLookAt.current.x) * 0.15;
    smoothLookAt.current.y += (targetLookY - smoothLookAt.current.y) * 0.1;
    smoothLookAt.current.z += (targetLookZ - smoothLookAt.current.z) * 0.15;
    
    camera.position.copy(smoothCamPos.current);
    camera.lookAt(smoothLookAt.current);
  });
  
  return null;
}
