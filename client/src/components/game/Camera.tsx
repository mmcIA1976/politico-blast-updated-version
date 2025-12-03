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
  const initialized = useRef(false);
  
  useFrame((_, delta) => {
    if (phase !== "playing") return;
    
    const smoothDelta = Math.min(delta, 0.05);
    const smoothFactor = 1 - Math.pow(0.001, smoothDelta);
    
    const cameraHeight = 16;
    const cameraOffset = -11;
    const maxLateralBound = level === 7 ? 28 : 18;
    
    const clampedPlayerX = Math.max(-maxLateralBound, Math.min(maxLateralBound, playerWorldPosition.x));
    
    const targetCamX = clampedPlayerX;
    const targetCamY = cameraHeight;
    const targetCamZ = playerWorldPosition.z + cameraOffset;
    
    if (!initialized.current) {
      smoothCamPos.current.set(targetCamX, targetCamY, targetCamZ);
      smoothLookAt.current.set(clampedPlayerX, 0, playerWorldPosition.z + 5);
      initialized.current = true;
    }
    
    smoothCamPos.current.x += (targetCamX - smoothCamPos.current.x) * smoothFactor;
    smoothCamPos.current.y += (targetCamY - smoothCamPos.current.y) * smoothFactor * 0.5;
    smoothCamPos.current.z += (targetCamZ - smoothCamPos.current.z) * smoothFactor;
    
    const targetLookX = clampedPlayerX;
    const targetLookY = 0;
    const targetLookZ = playerWorldPosition.z + 5;
    
    smoothLookAt.current.x += (targetLookX - smoothLookAt.current.x) * smoothFactor;
    smoothLookAt.current.y += (targetLookY - smoothLookAt.current.y) * smoothFactor;
    smoothLookAt.current.z += (targetLookZ - smoothLookAt.current.z) * smoothFactor;
    
    camera.position.copy(smoothCamPos.current);
    camera.lookAt(smoothLookAt.current);
  });
  
  return null;
}
