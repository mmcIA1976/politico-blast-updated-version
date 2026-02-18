import { create } from "zustand";

interface SpeechRequest {
  id: number;
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  backgroundMusic2: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  bossMusic: HTMLAudioElement | null;
  explosionSound: HTMLAudioElement | null;
  isMuted: boolean;
  currentPhase: number;
  lastPhrase: string;
  lastPhraseTime: number;
  speechQueue: SpeechRequest[];
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setBackgroundMusic2: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setExplosionSound: (sound: HTMLAudioElement) => void;
  setCurrentPhase: (phase: number) => void;
  stopBossMusic: () => void;
  enqueueSpeech: (request: Omit<SpeechRequest, "id">) => void;
  dequeueSpeech: () => SpeechRequest | undefined;
  clearSpeechQueue: () => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playPlayerDamage: () => void;
  playEnemyScream: (isBoss?: boolean, isZooPhase?: boolean, isBoss2?: boolean, level?: number) => void;
  playBossEntrance: (isBoss2?: boolean) => void;
  playGrenadeExplosion: () => void;
  playGrenadePickup: () => void;
  playPowerUpPickup: () => void;
  playBoothDestruction: () => void;
}

let speechCounter = 0;

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  backgroundMusic2: null,
  hitSound: null,
  successSound: null,
  bossMusic: null,
  explosionSound: null,
  isMuted: false,
  currentPhase: 1,
  lastPhrase: "",
  lastPhraseTime: 0,
  speechQueue: [],
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setBackgroundMusic2: (music) => set({ backgroundMusic2: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setExplosionSound: (sound) => set({ explosionSound: sound }),
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  
  stopBossMusic: () => {
    const { bossMusic } = get();
    if (bossMusic) {
      bossMusic.pause();
      bossMusic.currentTime = 0;
    }
  },
  
  enqueueSpeech: (request) => {
    const { isMuted } = get();
    if (isMuted) return;
    speechCounter += 1;
    set((state) => ({ speechQueue: [...state.speechQueue, { id: speechCounter, lang: "es-ES", ...request }] }));
  },
  
  dequeueSpeech: () => {
    const { speechQueue } = get();
    if (speechQueue.length === 0) return undefined;
    const [next, ...rest] = speechQueue;
    set({ speechQueue: rest });
    return next;
  },
  
  clearSpeechQueue: () => {
    set({ speechQueue: [] });
  },
  
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
      soundClone.volume = 0.9;
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
    const { explosionSound, isMuted } = get();
    if (isMuted) return;
    
    // Reproducir sonido de explosión a volumen alto (optimización: sin speech synthesis)
    if (explosionSound) {
      const soundClone = explosionSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 1.0; // Volumen alto
      soundClone.playbackRate = 1.2; // Más rápido para impacto
      soundClone.play().catch(error => {
        console.log("Player damage sound play prevented:", error);
      });
      console.log("PLAYER HIT - Playing explosion sound");
    }
  },
  
  playEnemyScream: (isBoss = false, isZooPhase = false, isBoss2 = false, level = 0) => {
    const { isMuted, lastPhrase, lastPhraseTime, enqueueSpeech } = get();
    if (isMuted) return;
    
    const now = Date.now();
    const cooldown = isBoss || isBoss2 ? 4000 : 6000;
    if (now - lastPhraseTime < cooldown) return;
    
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
    } else if (level === 8) {
      phrases = [
        "¡¡A ver si te atreves a subirte a un tren!!",
        "¡¡Renfe está en sus mejores momentos!!",
        "¡¡Aquí en el Senado no se puede legislar!!",
        "¡¡Pedro Sánchez es el puto amo!!",
        "¡¡Si no van los trenes pedalea!!",
        "¡¡Los trenes no van por culpa de Franco!!",
        "¡¡Renfe funciona perfectamente!!"
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
    } else if (level === 1) {
      phrases = [
        "¡¡No os metáis con Jésica, que es muy trabajadora!!",
        "¡¡Jésica es inocente!!",
        "¡¡Yo no sabía nada de los ERE!!",
        "¡La ultra derecha nos ataca!",
        "¡¡Detener a los fascistas!!"
      ];
    } else if (level === 2) {
      phrases = [
        "¡¡Los medios mienten!!",
        "¡¡Eso es bulo de la derecha!!",
        "¡La ultra derecha nos ataca!",
        "¡¡Detener a los fascistas!!"
      ];
    } else if (level === 3) {
      phrases = [
        "¡¡Pedro es nuestro líder!!",
        "¡¡Viva el PSOE!!",
        "¡La ultra derecha nos ataca!",
        "¡¡Detener a los fascistas!!"
      ];
    } else {
      phrases = [
        "¡La ultra derecha nos ataca!",
        "¡¡Detener a los fascistas!!",
        "¡¡No pasarán!!",
        "¡¡Viva la república!!"
      ];
    }
    
    const available = phrases.filter(p => p !== lastPhrase);
    const chosen = available[Math.floor(Math.random() * available.length)] || phrases[0];
    
    set({ lastPhrase: chosen, lastPhraseTime: now });
    
    enqueueSpeech({
      text: chosen,
      rate: isBoss ? 1.0 : 1.3,
      pitch: isBoss ? 0.9 : 1.2,
      volume: 0.7,
    });
  },
  
  playBossEntrance: (isBoss2 = false) => {
    const { isMuted, backgroundMusic, backgroundMusic2 } = get();
    if (isMuted) {
      console.log("Boss entrance skipped (muted)");
      return;
    }
    
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
    if (backgroundMusic2) {
      backgroundMusic2.pause();
    }
    
    let bossAudio = get().bossMusic;
    if (!bossAudio) {
      bossAudio = new Audio("/sounds/commando_boss.mp3");
      bossAudio.loop = true;
      bossAudio.volume = 0.10;
      set({ bossMusic: bossAudio });
    }
    bossAudio.currentTime = 0;
    bossAudio.volume = 0.10;
    bossAudio.play().catch(e => console.log("Boss music play prevented:", e));
    
    const boss1Phrases = [
      "¡¡Soy la chiki, María Jesús Montero!!",
      "¡¡Te voy a subir los impuestos quiero tu dinero!!",
      "¡¡Hacienda viene a por ti facha!!"
    ];
    const phrase = isBoss2 
      ? "¡¡Soy Yolanda Díaz y vengo a por ti fascista!!"
      : boss1Phrases[Math.floor(Math.random() * boss1Phrases.length)];
    
    const request = {
      text: phrase,
      rate: isBoss2 ? 1.1 : 1.0,
      pitch: isBoss2 ? 1.2 : 0.8,
      volume: 0.9,
    };
    get().enqueueSpeech(request);
    get().enqueueSpeech(request);
  },
  
  playGrenadeExplosion: () => {
    const { isMuted, enqueueSpeech } = get();
    if (isMuted) return;
    enqueueSpeech({ text: "¡¡BOOM!!", rate: 0.6, pitch: 0.4, volume: 1.0 });
  },
  
  playGrenadePickup: () => {
    const { isMuted, enqueueSpeech } = get();
    if (isMuted) return;
    enqueueSpeech({ text: "¡Granada!", rate: 1.3, pitch: 1.4, volume: 0.8 });
  },
  
  playPowerUpPickup: () => {
    const { successSound, isMuted } = get();
    if (isMuted) return;
    
    // Usar el sonido de éxito (campana) para power-up
    if (successSound) {
      const soundClone = successSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.8;
      soundClone.playbackRate = 1.2; // Ligeramente más rápido
      soundClone.play().catch(error => {
        console.log("Power-up sound play prevented:", error);
      });
    }
  },
  
  playBoothDestruction: () => {
    const { explosionSound, isMuted } = get();
    if (isMuted) return;
    
    // Reproducir sonido de explosión real
    if (explosionSound) {
      const soundClone = explosionSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.8;
      soundClone.play().catch(error => {
        console.log("Explosion sound play prevented:", error);
      });
      console.log("BOOTH DESTROYED - Playing explosion.mp3");
    }
  }
}));
