import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function SoundManager() {
  const { setHitSound, setSuccessSound, setBackgroundMusic, isMuted, backgroundMusic } = useAudio();
  const { phase } = useArcadeGame();
  
  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    hitAudio.volume = 0.3;
    setHitSound(hitAudio);
    
    const successAudio = new Audio("/sounds/success.mp3");
    successAudio.volume = 0.4;
    setSuccessSound(successAudio);
    
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.volume = 0.2;
    bgMusic.loop = true;
    setBackgroundMusic(bgMusic);
  }, [setHitSound, setSuccessSound, setBackgroundMusic]);
  
  useEffect(() => {
    if (!backgroundMusic) return;
    
    if (phase === "playing" && !isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    } else {
      backgroundMusic.pause();
    }
  }, [phase, isMuted, backgroundMusic]);
  
  return null;
}
