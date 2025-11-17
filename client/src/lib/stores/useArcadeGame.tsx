import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import * as THREE from "three";

export type GamePhase = "menu" | "playing" | "paused" | "ended" | "victory";

export interface Bullet {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  fromPlayer: boolean;
}

export interface Enemy {
  id: string;
  position: THREE.Vector3;
  health: number;
  type: "politician" | "boss";
  shootTimer: number;
  movePattern?: string;
}

interface ArcadeGameState {
  phase: GamePhase;
  lives: number;
  score: number;
  level: number;
  scrollPosition: number;
  playerPosition: THREE.Vector3;
  playerDirection: THREE.Vector3;
  bullets: Bullet[];
  enemies: Enemy[];
  lastShootTime: number;
  
  setPhase: (phase: GamePhase) => void;
  setLives: (lives: number) => void;
  addScore: (points: number) => void;
  setScore: (score: number) => void;
  setLevel: (level: number) => void;
  setScrollPosition: (position: number) => void;
  setPlayerPosition: (position: THREE.Vector3) => void;
  setPlayerDirection: (direction: THREE.Vector3) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (id: string) => void;
  updateBullets: (bullets: Bullet[]) => void;
  mutateEnemies: (mutator: (enemies: Enemy[]) => Enemy[]) => void;
  setLastShootTime: (time: number) => void;
  loseLife: () => void;
  restart: () => void;
}

const initialPlayerPosition = new THREE.Vector3(0, 0, -5);
const initialPlayerDirection = new THREE.Vector3(0, 0, 1);

export const useArcadeGame = create<ArcadeGameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    lives: 3,
    score: 0,
    level: 1,
    scrollPosition: 0,
    playerPosition: initialPlayerPosition.clone(),
    playerDirection: initialPlayerDirection.clone(),
    bullets: [],
    enemies: [],
    lastShootTime: 0,
    
    setPhase: (phase) => set({ phase }),
    
    setLives: (lives) => set({ lives }),
    
    addScore: (points) => set((state) => ({ score: state.score + points })),
    
    setScore: (score) => set({ score }),
    
    setLevel: (level) => set({ level }),
    
    setScrollPosition: (position) => set({ scrollPosition: position }),
    
    setPlayerPosition: (position) => set({ playerPosition: position }),
    
    setPlayerDirection: (direction) => set({ playerDirection: direction }),
    
    addBullet: (bullet) => set((state) => ({ bullets: [...state.bullets, bullet] })),
    
    removeBullet: (id) => set((state) => ({
      bullets: state.bullets.filter(b => b.id !== id)
    })),
    
    updateBullets: (bullets) => set({ bullets }),
    
    mutateEnemies: (mutator) => set((state) => ({
      enemies: mutator(state.enemies)
    })),
    
    setLastShootTime: (time) => set({ lastShootTime: time }),
    
    loseLife: () => set((state) => {
      const newLives = state.lives - 1;
      if (newLives <= 0) {
        return { lives: 0, phase: "ended" as GamePhase };
      }
      return { lives: newLives };
    }),
    
    restart: () => set({
      phase: "menu",
      lives: 3,
      score: 0,
      level: 1,
      scrollPosition: 0,
      playerPosition: initialPlayerPosition.clone(),
      playerDirection: initialPlayerDirection.clone(),
      bullets: [],
      enemies: [],
      lastShootTime: 0,
    }),
  }))
);
