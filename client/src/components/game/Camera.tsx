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
    
    const cameraHeight = level === 7 ? 20 : 16;
    const cameraOffset = level === 7 ? -14 : -11;
    
    const targetCamX = playerWorldPosition.x * 0.8;
    const targetCamY = cameraHeight;
    const targetCamZ = playerWorldPosition.z + cameraOffset;
    
    smoothCamPos.current.x += (targetCamX - smoothCamPos.current.x) * 0.08;
    smoothCamPos.current.y += (targetCamY - smoothCamPos.current.y) * 0.08;
    smoothCamPos.current.z += (targetCamZ - smoothCamPos.current.z) * 0.08;
    
    const targetLookX = playerWorldPosition.x * 0.6;
    const targetLookY = 0;
    const targetLookZ = playerWorldPosition.z + 3;
    
    smoothLookAt.current.x += (targetLookX - smoothLookAt.current.x) * 0.1;
    smoothLookAt.current.y += (targetLookY - smoothLookAt.current.y) * 0.1;
    smoothLookAt.current.z += (targetLookZ - smoothLookAt.current.z) * 0.1;
    
    camera.position.copy(smoothCamPos.current);
    camera.lookAt(smoothLookAt.current);
  });
  
  return null;
}
