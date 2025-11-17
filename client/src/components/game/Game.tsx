import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls } from "@react-three/drei";
import { Player } from "./Player";
import { Bullets } from "./Bullets";
import { Enemies } from "./Enemies";
import { ScrollingBackground } from "./ScrollingBackground";
import { GameManager } from "./GameManager";
import { Lights } from "./Lights";
import { Camera } from "./Camera";
import { HUD } from "./HUD";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  shoot = "shoot",
}

const keyMap = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.back, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.shoot, keys: ["Space"] },
];

export function Game() {
  return (
    <>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{
            position: [0, 12, -5],
            fov: 60,
            near: 0.1,
            far: 1000,
          }}
          gl={{
            antialias: true,
            powerPreference: "default",
          }}
        >
          <color attach="background" args={["#87ceeb"]} />
          
          <Lights />
          
          <Suspense fallback={null}>
            <ScrollingBackground />
            <Player />
            <Bullets />
            <Enemies />
            <GameManager />
            <Camera />
          </Suspense>
        </Canvas>
        
        <HUD />
      </KeyboardControls>
    </>
  );
}
