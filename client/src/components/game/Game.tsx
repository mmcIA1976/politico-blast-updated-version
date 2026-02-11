import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { KeyboardControls } from "@react-three/drei";
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
          frameloop="always"
        >
          <color attach="background" args={["#1a1a2e"]} />
          {!isMobile && <PerfOverlay />}
          
          <Lights />
          
          <Suspense fallback={null}>
            <ScrollingBackground />
            <StreetProps />
            <Player />
            <Bullets />
            <Grenades />
            <Debris />
            <FloatingScores />
            <Enemies />
            <PowerUps />
            <GameManager />
            <Camera />
          </Suspense>
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
