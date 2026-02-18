import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { KeyboardControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Player } from "./Player";
import { Bullets } from "./Bullets";
import { Grenades } from "./Grenades";
import { Debris } from "./Debris";
import { FloatingScores } from "./FloatingScores";
import { Enemies } from "./Enemies";
import { PowerUps } from "./PowerUps";
import { ScrollingBackground } from "./ScrollingBackground";
import { StreetProps } from "./StreetProps";
import { GameManager } from "./GameManager";
import { Lights } from "./Lights";
import { Camera } from "./Camera";
import { HUD } from "./HUD";
import { BossHealthBar } from "./BossHealthBar";
import { LevelTransition } from "./LevelTransition";
import { MobileControls } from "./MobileControls";
import { DebugControls } from "./DebugControls";
import { PerfOverlay } from "./PerfOverlay";
import { SpeechManager } from "./SpeechManager";
import { LevelSky } from "./LevelSky";

useTexture.preload("/textures/asphalt.jpg");
useTexture.preload("/textures/grass.jpg");
useTexture.preload("/textures/sand.jpg");
useTexture.preload("/textures/politician_face.jpg");
useTexture.preload("/textures/politician_face_2.png");
useTexture.preload("/textures/boss_face.png");
useTexture.preload("/textures/oscar_puente_face.png");
useTexture.preload("/textures/felix_bolanos_face.jpg");
useTexture.preload("/textures/yolanda_diaz_face.png");

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  shoot = "shoot",
  grenade = "grenade",
}

const keyMap = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.back, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.shoot, keys: ["Space"] },
  { name: Controls.grenade, keys: ["KeyG"] },
];

const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 1024;
};

export function Game() {
  const isMobile = useMemo(() => isMobileDevice(), []);
  
  const dpr = useMemo(() => {
    if (isMobile) return [1, 1.5] as [number, number];
    return [1, 2] as [number, number];
  }, [isMobile]);
  
  return (
    <>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows={!isMobile}
          dpr={dpr}
          camera={{
            position: [0, 12, -5],
            fov: 60,
            near: 0.1,
            far: 500,
          }}
          gl={{
            antialias: !isMobile,
            powerPreference: "high-performance",
            stencil: false,
            depth: true,
          }}
          scene={{ background: new THREE.Color("#f5a26c") }}
          frameloop="always"
          style={{ background: "#f5a26c" }}
        >
          <LevelSky />
          {!isMobile && <PerfOverlay />}
          
          <Lights />
          
          <Suspense fallback={
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
              <planeGeometry args={[80, 120]} />
              <meshStandardMaterial color="#555555" />
            </mesh>
          }>
            <ScrollingBackground />
          </Suspense>
          
          <StreetProps />
          <Player />
          <Bullets />
          <Grenades />
          <Debris />
          <FloatingScores />
          
          <Suspense fallback={null}>
            <Enemies />
          </Suspense>
          
          <PowerUps />
          <GameManager />
          <Camera />
        </Canvas>
        
        <HUD />
        <BossHealthBar />
        <LevelTransition />
        <MobileControls />
        <DebugControls />
        <SpeechManager />
      </KeyboardControls>
    </>
  );
}
