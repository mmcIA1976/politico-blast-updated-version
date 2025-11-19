import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useArcadeGame, type Vec3 } from "@/lib/stores/useArcadeGame";
import { useAudio } from "@/lib/stores/useAudio";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  shoot = "shoot",
}

function vec3ToThree(v: Vec3): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.y, v.z);
}

function threeToVec3(v: THREE.Vector3): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}

function vec3Distance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
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
    mutatePowerUps,
    hasActivePowerUp,
    updateActivePowerUps,
  } = useArcadeGame();
  
  const [, getKeys] = useKeyboardControls<Controls>();
  const { playHit } = useAudio();
  const enemySpawnTimer = useRef(0);
  const bossSpawned = useRef(false);
  
  useFrame((state, delta) => {
    if (phase !== "playing") return;
    
    const currentTime = state.clock.getElapsedTime();
    updateActivePowerUps(currentTime);
    
    const keys = getKeys();
    if (keys.shoot && currentTime - lastShootTime > 0.3) {
      const direction = vec3ToThree(playerDirection);
      if (direction.length() === 0) {
        direction.set(0, 0, 1);
      }
      direction.normalize();
      const basePos = vec3ToThree(playerPosition).add(direction.clone().multiplyScalar(0.5));
      
      const hasTripleShot = hasActivePowerUp("tripleShot");
      
      if (hasTripleShot) {
        const angleSpread = Math.PI / 12;
        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
        
        [
          { angle: -angleSpread, offset: -0.4 },
          { angle: 0, offset: 0 },
          { angle: angleSpread, offset: 0.4 }
        ].forEach(({ angle, offset }) => {
          const bulletId = `bullet-${Date.now()}-${Math.random()}`;
          
          const rotatedDirection = direction.clone();
          rotatedDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
          
          const bulletPos = basePos.clone().add(perpendicular.clone().multiplyScalar(offset));
          
          addBullet({
            id: bulletId,
            position: threeToVec3(bulletPos),
            direction: threeToVec3(rotatedDirection),
            speed: 15,
            fromPlayer: true,
          });
        });
      } else {
        const bulletId = `bullet-${Date.now()}-${Math.random()}`;
        
        addBullet({
          id: bulletId,
          position: threeToVec3(basePos),
          direction: threeToVec3(direction),
          speed: 15,
          fromPlayer: true,
        });
      }
      
      setLastShootTime(currentTime);
    }
    
    const newScrollPosition = Math.max(scrollPosition, playerPosition.z);
    setScrollPosition(newScrollPosition);
    
    const enemiesToSpawn: Array<{
      id: string;
      position: Vec3;
      health: number;
      type: "politician" | "boss";
      shootTimer: number;
      movePattern: "straight" | "zigzag" | "circular" | "formation";
      spawnTime: number;
      initialX: number;
    }> = [];
    
    if (newScrollPosition > 50 && !bossSpawned.current) {
      const bossId = `boss-${Date.now()}`;
      enemiesToSpawn.push({
        id: bossId,
        position: { x: 0, y: 0.7, z: newScrollPosition + 15 },
        health: 20,
        type: "boss",
        shootTimer: 1,
        movePattern: "circular",
        spawnTime: currentTime,
        initialX: 0,
      });
      bossSpawned.current = true;
    } else if (newScrollPosition < 50) {
      enemySpawnTimer.current += delta;
      
      if (enemySpawnTimer.current > 3) {
        enemySpawnTimer.current = 0;
        
        const numEnemies = Math.min(2, Math.floor(newScrollPosition / 15) + 1);
        const patterns: Array<"straight" | "zigzag" | "circular" | "formation"> = ["straight", "zigzag", "circular", "formation"];
        const patternIndex = Math.floor(newScrollPosition / 10) % patterns.length;
        
        for (let i = 0; i < numEnemies; i++) {
          const enemyId = `enemy-${currentTime}-${i}`;
          const xPos = ((currentTime * 13 + i * 5) % 24) - 12;
          
          enemiesToSpawn.push({
            id: enemyId,
            position: { x: xPos, y: 0.5, z: newScrollPosition + 15 },
            health: 3,
            type: "politician",
            shootTimer: (currentTime % 3) + 1,
            movePattern: patterns[patternIndex],
            spawnTime: currentTime,
            initialX: xPos,
          });
        }
      }
    }
    
    const enemyBulletsToAdd: Array<{
      id: string;
      position: Vec3;
      direction: Vec3;
      speed: number;
      fromPlayer: boolean;
    }> = [];
    const bulletsToRemove: string[] = [];
    let scoreToAdd = 0;
    let shouldEndGame = false;
    
    mutatePowerUps((currentPowerUps) => {
      return currentPowerUps
        .map(powerUp => ({
          ...powerUp,
          position: {
            x: powerUp.position.x,
            y: powerUp.position.y,
            z: powerUp.position.z - delta * 2
          }
        }))
        .filter(p => p.position.z > -15);
    });
    
    mutateEnemies((currentEnemies) => {
      let enemies = [...currentEnemies, ...enemiesToSpawn];
      const enemiesToRemove: string[] = [];
      
      enemies = enemies.map(enemy => {
        const age = currentTime - enemy.spawnTime;
        let newPos = { ...enemy.position };
        
        switch (enemy.movePattern) {
          case "zigzag":
            newPos.x = enemy.initialX + Math.sin(age * 2) * 6;
            newPos.z -= delta * 1.5;
            break;
          case "circular":
            const radius = 4;
            const angularSpeed = 1.5;
            newPos.x = enemy.initialX + Math.cos(age * angularSpeed) * radius;
            newPos.z = 12 - age * 1.5 + Math.sin(age * angularSpeed) * radius;
            break;
          case "formation":
            const waveOffset = Math.sin(age * 2) * 2;
            newPos.x = enemy.initialX + waveOffset;
            newPos.z -= delta * 2;
            break;
          default:
            newPos.z -= delta * 2.5;
        }
        
        const newShootTimer = Math.max(0, enemy.shootTimer - delta);
        
        if (newShootTimer <= 0) {
          const directionToPlayer = vec3ToThree(playerPosition)
            .sub(vec3ToThree(enemy.position))
            .normalize();
          
          const bulletId = `enemy-bullet-${Date.now()}-${Math.random()}`;
          enemyBulletsToAdd.push({
            id: bulletId,
            position: { ...enemy.position },
            direction: threeToVec3(directionToPlayer),
            speed: 8,
            fromPlayer: false,
          });
          
          return {
            ...enemy,
            shootTimer: enemy.type === "boss" ? 0.8 : 2 + Math.random() * 2,
            position: newPos,
          };
        }
        return {
          ...enemy,
          shootTimer: newShootTimer,
          position: newPos,
        };
      });
      
      bullets.forEach(bullet => {
        if (bullet.fromPlayer) {
          enemies.forEach((enemy, index) => {
            if (!enemiesToRemove.includes(enemy.id)) {
              const distance = vec3Distance(bullet.position, enemy.position);
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
          const distance = vec3Distance(bullet.position, playerPosition);
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
