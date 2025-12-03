import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playPlayerDamage: () => void;
  playEnemyScream: (isBoss?: boolean) => void;
  playBossEntrance: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: false,
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.8;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  playPlayerDamage: () => {
    const { isMuted } = get();
    if (isMuted) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const painSound = new SpeechSynthesisUtterance("¡Puto rojo!");
      painSound.lang = 'es-ES';
      painSound.rate = 1.3;
      painSound.pitch = 1.1;
      painSound.volume = 1.0;
      
      window.speechSynthesis.speak(painSound);
    }
  },
  
  playEnemyScream: (isBoss = false) => {
    const { isMuted } = get();
    if (isMuted) {
      console.log("Enemy scream skipped (muted)");
      return;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      let phrases: string[];
      
      if (isBoss) {
        phrases = ["¡¡Vas a saber lo que es hacienda!!"];
      } else {
        phrases = [
          "¡La ultra derecha nos ataca!",
          "¡¡Detener a los fascistas!!"
        ];
      }
      
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      
      // Primero el grito de dolor
      const painScream = new SpeechSynthesisUtterance("aaayyyyy");
      painScream.lang = 'es-ES';
      painScream.rate = isBoss ? 0.8 : 1.0;
      painScream.pitch = isBoss ? 0.8 : 1.5;
      painScream.volume = 0.8;
      
      // Luego la frase política
      const utterance = new SpeechSynthesisUtterance(randomPhrase);
      utterance.lang = 'es-ES';
      utterance.rate = isBoss ? 1.0 : 1.3;
      utterance.pitch = isBoss ? 0.9 : 1.2;
      utterance.volume = 0.7;
      
      window.speechSynthesis.speak(painScream);
      
      painScream.onend = () => {
        window.speechSynthesis.speak(utterance);
      };
    }
  },
  
  playBossEntrance: () => {
    const { isMuted } = get();
    if (isMuted) {
      console.log("Boss entrance skipped (muted)");
      return;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const phrase = "¡¡Te voy a subir los impuestos quiero tu dinero!!";
      
      const utterance1 = new SpeechSynthesisUtterance(phrase);
      utterance1.lang = 'es-ES';
      utterance1.rate = 1.0;
      utterance1.pitch = 0.8;
      utterance1.volume = 0.9;
      
      const utterance2 = new SpeechSynthesisUtterance(phrase);
      utterance2.lang = 'es-ES';
      utterance2.rate = 1.0;
      utterance2.pitch = 0.8;
      utterance2.volume = 0.9;
      
      window.speechSynthesis.speak(utterance1);
      
      utterance1.onend = () => {
        window.speechSynthesis.speak(utterance2);
      };
    }
  }
}));
