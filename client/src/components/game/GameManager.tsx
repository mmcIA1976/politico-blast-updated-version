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
  const { playHit, playEnemyScream, playBossEntrance } = useAudio();
  const enemySpawnTimer = useRef(0);
  const bossSpawned = useRef(false);
  const lastLevel = useRef(1);
  
  useFrame((state, delta) => {
    if (phase !== "playing") return;
    
    const currentTime = state.clock.getElapsedTime();
    updateActivePowerUps(currentTime);
    
    const newScrollPosition = Math.max(scrollPosition, playerPosition.z);
    setScrollPosition(newScrollPosition);
    
    const keys = getKeys();
    const { touchControls } = useArcadeGame.getState();
    const isShooting = keys.shoot || touchControls.shooting;
    
    if (isShooting && currentTime - lastShootTime > 0.3) {
      const direction = new THREE.Vector3(0, 0, 1);
      
      const moveForward = keys.forward || touchControls.forward;
      const moveBack = keys.back || touchControls.back;
      const moveLeft = keys.left || touchControls.left;
      const moveRight = keys.right || touchControls.right;
      
      let dx = 0;
      let dz = 0;
      
      if (moveForward) dz += 1;
      if (moveBack) dz -= 1;
      if (moveLeft) dx += 1;
      if (moveRight) dx -= 1;
      
      if (dx !== 0 || dz !== 0) {
        direction.set(dx, 0, dz);
      }
      
      direction.normalize();
      const basePos = vec3ToThree(playerPosition).add(direction.clone().multiplyScalar(0.5));
      
      const hasTripleShot = hasActivePowerUp("tripleShot");
      const hasPowerShot = hasActivePowerUp("powerShot");
      const bulletDamage = hasPowerShot ? 2 : 1;
      
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
            damage: bulletDamage,
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
          damage: bulletDamage,
        });
      }
      
      playHit();
      setLastShootTime(currentTime);
    }
    
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
    
    if (level === 7 && lastLevel.current !== 7) {
      const bossId = `boss-${Date.now()}`;
      const bossZ = 295;
      enemiesToSpawn.push({
        id: bossId,
        position: { x: 0, y: 0.7, z: bossZ },
        health: 15,
        type: "boss",
        shootTimer: 1,
        movePattern: "circular",
        spawnTime: currentTime,
        initialX: 0,
      });
      bossSpawned.current = true;
      playBossEntrance();
    }
    
    lastLevel.current = level;
    
    if (level < 7) {
      enemySpawnTimer.current += delta;
    }
    
    if (level < 7 && enemySpawnTimer.current > 2) {
      enemySpawnTimer.current = 0;
      
      let numEnemies = 2;
      let enemyHealth = 1;
      
      if (level === 1) {
        numEnemies = 3;
        enemyHealth = 1;
      } else if (level === 2) {
        numEnemies = 4;
        enemyHealth = 1;
      } else if (level === 3) {
        numEnemies = 5;
        enemyHealth = 2;
      } else if (level === 4) {
        numEnemies = 5;
        enemyHealth = 2;
      } else if (level === 5) {
        numEnemies = 6;
        enemyHealth = 3;
      } else if (level >= 6) {
        numEnemies = 6;
        enemyHealth = 3;
      }
      
      const patterns: Array<"straight" | "zigzag" | "circular" | "formation"> = ["straight", "zigzag", "circular", "formation"];
      const patternIndex = Math.floor(newScrollPosition / 10) % patterns.length;
      
      for (let i = 0; i < numEnemies; i++) {
        const enemyId = `enemy-${currentTime}-${i}`;
        const xPos = ((currentTime * 13 + i * 5) % 24) - 12;
        
        enemiesToSpawn.push({
          id: enemyId,
          position: { x: xPos, y: 0.5, z: newScrollPosition + 15 },
          health: enemyHealth,
          type: "politician",
          shootTimer: (currentTime % 3) + 1,
          movePattern: patterns[patternIndex],
          spawnTime: currentTime,
          initialX: xPos,
        });
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
            if (enemy.type === "boss") {
              const distanceToPlayer = Math.sqrt(
                Math.pow(playerPosition.x - enemy.position.x, 2) + 
                Math.pow(playerPosition.z - enemy.position.z, 2)
              );
              
              const minDistance = 10;
              const maxDistance = 18;
              
              if (distanceToPlayer < minDistance) {
                const dx = enemy.position.x - playerPosition.x;
                const dz = enemy.position.z - playerPosition.z;
                const magnitude = Math.sqrt(dx * dx + dz * dz);
                newPos.x += (dx / magnitude) * delta * 3;
                newPos.z += (dz / magnitude) * delta * 3;
              } else if (distanceToPlayer > maxDistance) {
                const dx = playerPosition.x - enemy.position.x;
                const dz = playerPosition.z - enemy.position.z;
                const magnitude = Math.sqrt(dx * dx + dz * dz);
                newPos.x += (dx / magnitude) * delta * 4;
                newPos.z += (dz / magnitude) * delta * 4;
              } else {
                const radius = 4;
                const angularSpeed = 1.2;
                newPos.x += Math.cos(age * angularSpeed) * delta * 5;
              }
              
              newPos.x = Math.max(-25, Math.min(25, newPos.x));
              newPos.z = Math.max(270, Math.min(320, newPos.z));
            } else {
              const radius = 4;
              const angularSpeed = 1.5;
              newPos.x = enemy.initialX + Math.cos(age * angularSpeed) * radius;
              newPos.z = 12 - age * 1.5 + Math.sin(age * angularSpeed) * radius;
            }
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
            shootTimer: enemy.type === "boss" ? 0.5 : 2 + Math.random() * 2,
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
                const damage = bullet.damage || 1;
                enemies[index] = { ...enemy, health: enemy.health - damage };
                bulletsToRemove.push(bullet.id);
                playHit();
                playEnemyScream(enemy.type === "boss");
                
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
    
    if (scrollPosition > 45 && level === 1) {
      setLevel(2);
    } else if (scrollPosition > 90 && level === 2) {
      setLevel(3);
    } else if (scrollPosition > 135 && level === 3) {
      setLevel(4);
    } else if (scrollPosition > 180 && level === 4) {
      setLevel(5);
    } else if (scrollPosition > 225 && level === 5) {
      setLevel(6);
    } else if (scrollPosition > 270 && level === 6) {
      setLevel(7);
    }
  });
  
  return null;
}
