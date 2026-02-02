import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import * as THREE from "three";

export type GamePhase = "menu" | "playing" | "paused" | "ended" | "victory";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Bullet {
  id: string;
  position: Vec3;
  direction: Vec3;
  speed: number;
  fromPlayer: boolean;
  damage?: number;
}

export interface Grenade {
  id: string;
  position: Vec3;
  targetPosition: Vec3;
  startPosition: Vec3;
  direction: Vec3;
  progress: number;
  exploding: boolean;
  explosionProgress: number;
}

export interface Enemy {
  id: string;
  position: Vec3;
  health: number;
  type: "politician" | "boss" | "gorilla" | "penguin" | "toucan";
  shootTimer: number;
  movePattern: "straight" | "zigzag" | "circular" | "formation";
  spawnTime: number;
  initialX: number;
  isSpecial?: boolean;
  dying?: boolean;
  dyingProgress?: number;
  enraged?: boolean;
  enragedProgress?: number;
  lastEnrageTime?: number;
  enrageMode?: "jump" | "shake"; // Alternar entre salto y temblor
}

export interface PowerUp {
  id: string;
  position: Vec3;
  type: "tripleShot" | "speedBoost" | "powerShot" | "rapidFire" | "grenade";
  collected: boolean;
}

export interface ActivePowerUp {
  type: "tripleShot" | "speedBoost" | "powerShot" | "rapidFire";
  expiresAt: number;
  startedAt: number;
  duration: number;
}

export interface Obstacle {
  position: Vec3;
  size: Vec3;
}

export interface Debris {
  id: string;
  position: Vec3;
  velocity: Vec3;
  color: string;
  size: number;
  lifetime: number;
}

export interface TouchControls {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  shooting: boolean;
  throwingGrenade: boolean;
}

interface ArcadeGameState {
  phase: GamePhase;
  lives: number;
  score: number;
  level: number;
  scrollPosition: number;
  playerPosition: Vec3;
  playerDirection: Vec3;
  bullets: Bullet[];
  enemies: Enemy[];
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
  obstacles: Obstacle[];
  lastShootTime: number;
  lastGrenadeTime: number;
  grenades: Grenade[];
  grenadeCount: number;
  touchControls: TouchControls;
  
  setPhase: (phase: GamePhase) => void;
  setTouchControl: (control: keyof TouchControls, value: boolean) => void;
  setLives: (lives: number) => void;
  addScore: (points: number) => void;
  setScore: (score: number) => void;
  setLevel: (level: number) => void;
  setScrollPosition: (position: number) => void;
  setPlayerPosition: (position: Vec3) => void;
  setPlayerDirection: (direction: Vec3) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (id: string) => void;
  updateBullets: (bullets: Bullet[]) => void;
  mutateEnemies: (mutator: (enemies: Enemy[]) => Enemy[]) => void;
  addPowerUp: (powerUp: PowerUp) => void;
  removePowerUp: (id: string) => void;
  mutatePowerUps: (mutator: (powerUps: PowerUp[]) => PowerUp[]) => void;
  activatePowerUp: (type: "tripleShot" | "speedBoost" | "powerShot" | "rapidFire", duration: number, currentTime: number) => void;
  updateActivePowerUps: (currentTime: number) => void;
  hasActivePowerUp: (type: "tripleShot" | "speedBoost" | "powerShot" | "rapidFire") => boolean;
  getTimeRemaining: (type: "tripleShot" | "speedBoost" | "powerShot" | "rapidFire", currentTime: number) => number;
  setObstacles: (obstacles: Obstacle[]) => void;
  setLastShootTime: (time: number) => void;
  setLastGrenadeTime: (time: number) => void;
  addGrenade: (grenade: Grenade) => void;
  removeGrenade: (id: string) => void;
  updateGrenades: (grenades: Grenade[]) => void;
  useGrenadeFromInventory: () => boolean;
  addGrenadeToInventory: (count?: number) => void;
  loseLife: () => void;
  restart: () => void;
  clearBattlefield: () => void;
  debris: Debris[];
  addDebris: (debris: Debris[]) => void;
  updateDebris: (delta: number) => void;
}

const initialPlayerPosition: Vec3 = { x: 0, y: 0, z: -5 };
const initialPlayerDirection: Vec3 = { x: 0, y: 0, z: 1 };

export const useArcadeGame = create<ArcadeGameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    lives: 4,
    score: 0,
    level: 1,
    scrollPosition: 0,
    playerPosition: { ...initialPlayerPosition },
    playerDirection: { ...initialPlayerDirection },
    bullets: [],
    enemies: [],
    powerUps: [],
    activePowerUps: [],
    obstacles: [],
    lastShootTime: 0,
    lastGrenadeTime: 0,
    grenades: [],
    grenadeCount: 3,
    touchControls: { forward: false, back: false, left: false, right: false, shooting: false, throwingGrenade: false },
    debris: [],
    
    setPhase: (phase) => set({ phase }),
    
    setTouchControl: (control, value) => set((state) => ({
      touchControls: { ...state.touchControls, [control]: value }
    })),
    
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
    
    addPowerUp: (powerUp) => set((state) => ({ 
      powerUps: [...state.powerUps, powerUp] 
    })),
    
    removePowerUp: (id) => set((state) => ({
      powerUps: state.powerUps.filter(p => p.id !== id)
    })),
    
    mutatePowerUps: (mutator) => set((state) => ({
      powerUps: mutator(state.powerUps)
    })),
    
    activatePowerUp: (type, duration, currentTime) => set((state) => {
      const existingIndex = state.activePowerUps.findIndex(p => p.type === type);
      let newActivePowerUps;
      
      if (existingIndex >= 0) {
        newActivePowerUps = [...state.activePowerUps];
        newActivePowerUps[existingIndex] = { 
          type, 
          startedAt: currentTime,
          duration: duration,
          expiresAt: currentTime + duration 
        };
      } else {
        newActivePowerUps = [...state.activePowerUps, { 
          type, 
          startedAt: currentTime,
          duration: duration,
          expiresAt: currentTime + duration 
        }];
      }
      
      return { activePowerUps: newActivePowerUps };
    }),
    
    updateActivePowerUps: (currentTime) => set((state) => ({
      activePowerUps: state.activePowerUps.filter(p => currentTime < p.expiresAt)
    })),
    
    hasActivePowerUp: (type) => {
      const state = get();
      return state.activePowerUps.some(p => p.type === type);
    },
    
    getTimeRemaining: (type, currentTime) => {
      const state = get();
      const powerUp = state.activePowerUps.find(p => p.type === type);
      if (!powerUp) return 0;
      return Math.max(0, powerUp.expiresAt - currentTime);
    },
    
    setObstacles: (obstacles) => set({ obstacles }),
    
    setLastShootTime: (time) => set({ lastShootTime: time }),
    
    setLastGrenadeTime: (time) => set({ lastGrenadeTime: time }),
    
    addGrenade: (grenade) => set((state) => ({ grenades: [...state.grenades, grenade] })),
    
    removeGrenade: (id) => set((state) => ({
      grenades: state.grenades.filter(g => g.id !== id)
    })),
    
    updateGrenades: (grenades) => set({ grenades }),
    
    useGrenadeFromInventory: () => {
      const state = get();
      if (state.grenadeCount > 0) {
        set({ grenadeCount: state.grenadeCount - 1 });
        return true;
      }
      return false;
    },
    
    addGrenadeToInventory: (count = 1) => set((state) => ({
      grenadeCount: Math.min(6, state.grenadeCount + count)
    })),
    
    loseLife: () => set((state) => {
      const newLives = state.lives - 1;
      if (newLives <= 0) {
        return { lives: 0, phase: "ended" as GamePhase };
      }
      return { lives: newLives };
    }),
    
    restart: () => set({
      phase: "menu",
      lives: 4,
      score: 0,
      level: 1,
      scrollPosition: 0,
      playerPosition: { ...initialPlayerPosition },
      playerDirection: { ...initialPlayerDirection },
      bullets: [],
      enemies: [],
      powerUps: [],
      activePowerUps: [],
      obstacles: [],
      lastShootTime: 0,
      lastGrenadeTime: 0,
      grenades: [],
      grenadeCount: 3,
      touchControls: { forward: false, back: false, left: false, right: false, shooting: false, throwingGrenade: false },
      debris: [],
    }),
    
    clearBattlefield: () => set({
      bullets: [],
      enemies: [],
      powerUps: [],
      grenades: [],
      debris: [],
    }),
    
    addDebris: (newDebris) => set((state) => ({
      debris: [...state.debris, ...newDebris]
    })),
    
    updateDebris: (delta) => set((state) => ({
      debris: state.debris
        .map(d => ({
          ...d,
          position: {
            x: d.position.x + d.velocity.x * delta,
            y: Math.max(0, d.position.y + d.velocity.y * delta),
            z: d.position.z + d.velocity.z * delta,
          },
          velocity: {
            x: d.velocity.x * 0.98,
            y: d.velocity.y - 15 * delta, // Gravedad
            z: d.velocity.z * 0.98,
          },
          lifetime: d.lifetime - delta,
        }))
        .filter(d => d.lifetime > 0)
    })),
  }))
);
