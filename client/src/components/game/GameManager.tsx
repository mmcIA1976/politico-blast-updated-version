import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { useAudio } from "@/lib/stores/useAudio";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  shoot = "shoot",
}

export function GameManager() {
  const {
    phase,
    playerPosition,
    playerDirection,
    bullets,
    scrollPosition,
    lastShootTime,
    addBullet,
    removeBullet,
    setScrollPosition,
    setLastShootTime,
    addScore,
    loseLife,
    setPhase,
    level,
    setLevel,
    mutateEnemies,
  } = useArcadeGame();
  
  const [, getKeys] = useKeyboardControls<Controls>();
  const { playHit } = useAudio();
  const enemySpawnTimer = useRef(0);
  const bossSpawned = useRef(false);
  
  useFrame((state, delta) => {
    if (phase !== "playing") return;
    
    const currentTime = state.clock.getElapsedTime();
    
    const keys = getKeys();
    if (keys.shoot && currentTime - lastShootTime > 0.3) {
      const bulletId = `bullet-${Date.now()}-${Math.random()}`;
      const direction = playerDirection.clone().normalize();
      
      const bullet = {
        id: bulletId,
        position: playerPosition.clone().add(direction.clone().multiplyScalar(0.5)),
        direction: direction,
        speed: 15,
        fromPlayer: true,
      };
      
      addBullet(bullet);
      setLastShootTime(currentTime);
    }
    
    const newScrollPosition = scrollPosition + delta * 2;
    setScrollPosition(newScrollPosition);
    
    const enemiesToSpawn: Array<{
      id: string;
      position: THREE.Vector3;
      health: number;
      type: "politician" | "boss";
      shootTimer: number;
    }> = [];
    
    if (newScrollPosition > 50 && !bossSpawned.current) {
      const bossId = `boss-${Date.now()}`;
      enemiesToSpawn.push({
        id: bossId,
        position: new THREE.Vector3(0, 0.7, 10),
        health: 20,
        type: "boss",
        shootTimer: 1,
      });
      bossSpawned.current = true;
    } else if (newScrollPosition < 50) {
      enemySpawnTimer.current += delta;
      
      if (enemySpawnTimer.current > 2) {
        enemySpawnTimer.current = 0;
        
        const numEnemies = Math.min(3, Math.floor(newScrollPosition / 10) + 1);
        
        for (let i = 0; i < numEnemies; i++) {
          const enemyId = `enemy-${Date.now()}-${Math.random()}`;
          const xPos = (Math.random() - 0.5) * 14;
          
          enemiesToSpawn.push({
            id: enemyId,
            position: new THREE.Vector3(xPos, 0.5, 12),
            health: 3,
            type: "politician",
            shootTimer: Math.random() * 2 + 1,
          });
        }
      }
    }
    
    const enemyBulletsToAdd: Array<{
      id: string;
      position: THREE.Vector3;
      direction: THREE.Vector3;
      speed: number;
      fromPlayer: boolean;
    }> = [];
    const bulletsToRemove: string[] = [];
    let scoreToAdd = 0;
    let shouldEndGame = false;
    
    mutateEnemies((currentEnemies) => {
      let enemies = [...currentEnemies, ...enemiesToSpawn];
      const enemiesToRemove: string[] = [];
      
      enemies = enemies.map(enemy => {
        const newShootTimer = Math.max(0, enemy.shootTimer - delta);
        
        if (newShootTimer <= 0) {
          const directionToPlayer = new THREE.Vector3()
            .subVectors(playerPosition, enemy.position)
            .normalize();
          
          const bulletId = `enemy-bullet-${Date.now()}-${Math.random()}`;
          enemyBulletsToAdd.push({
            id: bulletId,
            position: enemy.position.clone(),
            direction: directionToPlayer,
            speed: 8,
            fromPlayer: false,
          });
          
          return {
            ...enemy,
            shootTimer: enemy.type === "boss" ? 0.8 : 2 + Math.random() * 2,
          };
        }
        return {
          ...enemy,
          shootTimer: newShootTimer,
        };
      });
      
      bullets.forEach(bullet => {
        if (bullet.fromPlayer) {
          enemies.forEach((enemy, index) => {
            if (!enemiesToRemove.includes(enemy.id)) {
              const distance = bullet.position.distanceTo(enemy.position);
              if (distance < 1 && !bulletsToRemove.includes(bullet.id)) {
                enemies[index] = { ...enemy, health: enemy.health - 1 };
                bulletsToRemove.push(bullet.id);
                playHit();
                
                if (enemies[index].health <= 0) {
                  scoreToAdd += enemy.type === "boss" ? 500 : 100;
                  if (enemy.type === "boss") {
                    shouldEndGame = true;
                  }
                  enemiesToRemove.push(enemy.id);
                }
              }
            }
          });
        } else {
          const distance = bullet.position.distanceTo(playerPosition);
          if (distance < 0.6 && !bulletsToRemove.includes(bullet.id)) {
            bulletsToRemove.push(bullet.id);
            loseLife();
            playHit();
          }
        }
      });
      
      return enemies.filter(e => !enemiesToRemove.includes(e.id));
    });
    
    enemyBulletsToAdd.forEach(bullet => addBullet(bullet));
    bulletsToRemove.forEach(id => removeBullet(id));
    
    if (scoreToAdd > 0) {
      addScore(scoreToAdd);
    }
    
    if (shouldEndGame) {
      setPhase("victory");
    }
    
    if (scrollPosition > 20 && level === 1) {
      setLevel(2);
    } else if (scrollPosition > 35 && level === 2) {
      setLevel(3);
    }
  });
  
  return null;
}
