import React, { useEffect, useRef } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function SoundManager() {
  const { setHitSound, setSuccessSound, setBackgroundMusic, setBackgroundMusic2, isMuted, backgroundMusic, backgroundMusic2, currentPhase, setCurrentPhase, bossMusic, stopBossMusic } = useAudio();
  const { phase, level } = useArcadeGame();
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const playbackRateRef = useRef<number>(1.0);
  
  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    hitAudio.volume = 0.4;
    setHitSound(hitAudio);
    
    const successAudio = new Audio("/sounds/success.mp3");
    successAudio.volume = 0.4;
    setSuccessSound(successAudio);
    
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.volume = 0.2;
    bgMusic.loop = true;
    setBackgroundMusic(bgMusic);
    
    const bgMusic2 = new Audio("/sounds/background.mp3");
    bgMusic2.volume = 0.25;
    bgMusic2.loop = true;
    bgMusic2.playbackRate = 1.3;
    setBackgroundMusic2(bgMusic2);
  }, [setHitSound, setSuccessSound, setBackgroundMusic, setBackgroundMusic2]);
  
  useEffect(() => {
    const newPhase = level >= 8 ? 2 : 1;
    if (newPhase !== currentPhase) {
      setCurrentPhase(newPhase);
    }
  }, [level, currentPhase, setCurrentPhase]);
  
  useEffect(() => {
    if (!backgroundMusic || !backgroundMusic2) return;
    
    const isBossLevel = level === 7 || level === 14;
    
    if (phase === "playing" && !isMuted) {
      if (isBossLevel) {
        backgroundMusic.pause();
        backgroundMusic2.pause();
      } else {
        if (bossMusic) {
          bossMusic.pause();
          bossMusic.currentTime = 0;
        }
        if (currentPhase === 1) {
          backgroundMusic2.pause();
          backgroundMusic2.currentTime = 0;
          backgroundMusic.play().catch(error => {
            console.log("Background music play prevented:", error);
          });
        } else {
          backgroundMusic.pause();
          backgroundMusic.currentTime = 0;
          backgroundMusic2.play().catch(error => {
            console.log("Background music 2 play prevented:", error);
          });
        }
      }
    } else {
      backgroundMusic.pause();
      backgroundMusic2.pause();
      if (bossMusic) {
        bossMusic.pause();
      }
    }
  }, [phase, isMuted, backgroundMusic, backgroundMusic2, currentPhase, level, bossMusic]);
  
  return null;
}
