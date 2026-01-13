import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  backgroundMusic2: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  currentPhase: number;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setBackgroundMusic2: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setCurrentPhase: (phase: number) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playPlayerDamage: () => void;
  playEnemyScream: (isBoss?: boolean, isZooPhase?: boolean, isBoss2?: boolean) => void;
  playBossEntrance: (isBoss2?: boolean) => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  backgroundMusic2: null,
  hitSound: null,
  successSound: null,
  isMuted: false,
  currentPhase: 1,
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setBackgroundMusic2: (music) => set({ backgroundMusic2: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  
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
  
  playEnemyScream: (isBoss = false, isZooPhase = false, isBoss2 = false) => {
    const { isMuted } = get();
    if (isMuted) {
      console.log("Enemy scream skipped (muted)");
      return;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      let phrases: string[];
      
      if (isBoss2) {
        phrases = [
          "¡¡Subir los impuestos a los ricos es bonito!!",
          "¡¡La izquierda es feminista!!",
          "¡¡Viva el comunismo!!"
        ];
      } else if (isBoss) {
        phrases = [
          "¡¡Vas a saber lo que es hacienda!!",
          "¡¡Te voy a crujir a impuestos!!",
          "¡¡Tu dinero es mío fascista!!",
          "¡¡La chiki siempre gana!!",
          "¡¡Paga tus impuestos facha!!",
          "¡¡Hacienda somos todos!!"
        ];
      } else if (isZooPhase) {
        phrases = [
          "¡Eso es bulo!",
          "¡¡Basta de bulos!!",
          "¡¡Si no van los trenes pedalea!!",
          "¡¡Los trenes no van por culpa de Franco!!",
          "¡¡El poder legislativo me lo paso por el ombligo!!",
          "¡¡La culpa es del PP!!",
          "¡¡Eso es desinformación de la ultraderecha!!",
          "¡¡Renfe funciona perfectamente!!",
          "¡¡Vox es el nuevo fascismo!!",
          "¡¡Los bulos de la derecha!!",
          "¡¡Eso lo dice la fachosfera!!"
        ];
      } else {
        phrases = [
          "¡La ultra derecha nos ataca!",
          "¡¡Detener a los fascistas!!"
        ];
      }
      
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      
      const painSound = isZooPhase ? "¡uuyy!" : "aaayyyyy";
      const painScream = new SpeechSynthesisUtterance(painSound);
      painScream.lang = 'es-ES';
      painScream.rate = isBoss ? 0.8 : 1.0;
      painScream.pitch = isBoss ? 0.8 : 1.5;
      painScream.volume = 0.8;
      
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
  
  playBossEntrance: (isBoss2 = false) => {
    const { isMuted } = get();
    if (isMuted) {
      console.log("Boss entrance skipped (muted)");
      return;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const boss1Phrases = [
        "¡¡Soy la chiki, María Jesús Montero!!",
        "¡¡Te voy a subir los impuestos quiero tu dinero!!",
        "¡¡Hacienda viene a por ti facha!!"
      ];
      const phrase = isBoss2 
        ? "¡¡Soy Yolanda Díaz y vengo a por ti fascista!!"
        : boss1Phrases[Math.floor(Math.random() * boss1Phrases.length)];
      
      const utterance1 = new SpeechSynthesisUtterance(phrase);
      utterance1.lang = 'es-ES';
      utterance1.rate = isBoss2 ? 1.1 : 1.0;
      utterance1.pitch = isBoss2 ? 1.2 : 0.8;
      utterance1.volume = 0.9;
      
      const utterance2 = new SpeechSynthesisUtterance(phrase);
      utterance2.lang = 'es-ES';
      utterance2.rate = isBoss2 ? 1.1 : 1.0;
      utterance2.pitch = isBoss2 ? 1.2 : 0.8;
      utterance2.volume = 0.9;
      
      window.speechSynthesis.speak(utterance1);
      
      utterance1.onend = () => {
        window.speechSynthesis.speak(utterance2);
      };
    }
  }
}));
