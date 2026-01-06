import { useRef } from "react";
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

const tempVec3A = new THREE.Vector3();
const tempVec3B = new THREE.Vector3();
const tempVec3C = new THREE.Vector3();

function vec3Distance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

let bulletCounter = 0;
let enemySpawnCounter = 0;

// Max enemies per level (not boss levels)
const getMaxEnemiesForLevel = (level: number): number => {
  if (level === 1) return 12;
  if (level === 2) return 15;
  if (level === 3) return 18;
  if (level === 4) return 20;
  if (level === 5) return 22;
  if (level === 6) return 25;
  if (level === 8) return 15;
  if (level === 9) return 18;
  if (level === 10) return 20;
  if (level === 11) return 22;
  if (level === 12) return 25;
  if (level === 13) return 28;
  return 0;
};

export function GameManager() {
  const {
    phase,
    playerPosition,
    bullets,
    scrollPosition,
    lastShootTime,
    addBullet,
    removeBullet,
    setScrollPosition,
    setLastShootTime,
    addScore,
    loseLife,
    setLives,
    lives,
    setPhase,
    level,
    setLevel,
    mutateEnemies,
    mutatePowerUps,
    addPowerUp,
    hasActivePowerUp,
    updateActivePowerUps,
    clearBattlefield,
    enemies,
  } = useArcadeGame();
  
  const [, getKeys] = useKeyboardControls<Controls>();
  const { playHit, playPlayerDamage, playEnemyScream, playBossEntrance } = useAudio();
  const enemySpawnTimer = useRef(0);
  const lastLevel = useRef(1);
  const frameCounter = useRef(0);
  const lastScrollUpdate = useRef(0);
  const levelEnemiesSpawned = useRef(0);
  
  useFrame((state, rawDelta) => {
    if (phase !== "playing") return;
    
    const delta = Math.min(rawDelta, 0.05);
    const currentTime = state.clock.getElapsedTime();
    
    frameCounter.current++;
    
    if (frameCounter.current % 3 === 0) {
      updateActivePowerUps(currentTime);
    }
    
    const newScrollPosition = Math.max(scrollPosition, playerPosition.z);
    if (Math.abs(newScrollPosition - lastScrollUpdate.current) > 0.5) {
      setScrollPosition(newScrollPosition);
      lastScrollUpdate.current = newScrollPosition;
    }
    
    const keys = getKeys();
    const { touchControls } = useArcadeGame.getState();
    const isShooting = keys.shoot || touchControls.shooting;
    
    const hasRapidFire = hasActivePowerUp("rapidFire");
    const shootInterval = hasRapidFire ? 0.12 : 0.5;
    
    if (isShooting && currentTime - lastShootTime > shootInterval) {
      const moveForward = keys.forward || touchControls.forward;
      const moveBack = keys.back || touchControls.back;
      const moveLeft = keys.left || touchControls.left;
      const moveRight = keys.right || touchControls.right;
      
      let dx = 0;
      let dz = 1;
      
      if (moveForward) dz = 1;
      if (moveBack) dz = -1;
      if (moveLeft) dx = 1;
      if (moveRight) dx = -1;
      
      tempVec3A.set(dx, 0, dz).normalize();
      tempVec3B.set(playerPosition.x, playerPosition.y, playerPosition.z);
      tempVec3B.addScaledVector(tempVec3A, 0.5);
      
      const hasTripleShot = hasActivePowerUp("tripleShot");
      const hasPowerShot = hasActivePowerUp("powerShot");
      const bulletDamage = hasPowerShot ? 2 : 1;
      
      if (hasTripleShot) {
        const angleSpread = Math.PI / 12;
        tempVec3C.set(-tempVec3A.z, 0, tempVec3A.x).normalize();
        
        const offsets = [-0.4, 0, 0.4];
        const angles = [-angleSpread, 0, angleSpread];
        
        for (let i = 0; i < 3; i++) {
          bulletCounter++;
          const bulletId = `b${bulletCounter}`;
          
          const rotDir = tempVec3A.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angles[i]);
          const bulletPos = tempVec3B.clone().addScaledVector(tempVec3C, offsets[i]);
          
          addBullet({
            id: bulletId,
            position: { x: bulletPos.x, y: bulletPos.y, z: bulletPos.z },
            direction: { x: rotDir.x, y: rotDir.y, z: rotDir.z },
            speed: 30,
            fromPlayer: true,
            damage: bulletDamage,
          });
        }
      } else {
        bulletCounter++;
        const bulletId = `b${bulletCounter}`;
        
        addBullet({
          id: bulletId,
          position: { x: tempVec3B.x, y: tempVec3B.y, z: tempVec3B.z },
          direction: { x: tempVec3A.x, y: tempVec3A.y, z: tempVec3A.z },
          speed: 30,
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
      type: "politician" | "boss" | "gorilla" | "penguin" | "toucan";
      shootTimer: number;
      movePattern: "straight" | "zigzag" | "circular" | "formation";
      spawnTime: number;
      initialX: number;
      isSpecial?: boolean;
    }> = [];
    
    // Reset enemy counter when level changes
    if (lastLevel.current !== level) {
      levelEnemiesSpawned.current = 0;
    }
    
    if (level === 7 && lastLevel.current !== 7) {
      clearBattlefield();
      bulletCounter++;
      enemiesToSpawn.push({
        id: `boss${bulletCounter}`,
        position: { x: 0, y: 0.7, z: 295 },
        health: 15,
        type: "boss",
        shootTimer: 1.5,
        movePattern: "circular",
        spawnTime: currentTime,
        initialX: 0,
      });
      playBossEntrance();
    }
    
    if (level === 14 && lastLevel.current !== 14) {
      clearBattlefield();
      bulletCounter++;
      enemiesToSpawn.push({
        id: `boss2${bulletCounter}`,
        position: { x: 0, y: 0.8, z: 295 },
        health: 20,
        type: "toucan",
        shootTimer: 1.2,
        movePattern: "circular",
        spawnTime: currentTime,
        initialX: 0,
      });
      playBossEntrance(true);
    }
    
    lastLevel.current = level;
    
    const isPhase1 = level >= 1 && level < 7;
    const isPhase2 = level >= 8 && level < 14;
    
    if (isPhase1 || isPhase2) {
      enemySpawnTimer.current += delta;
    }
    
    const maxEnemies = getMaxEnemiesForLevel(level);
    const remainingToSpawn = maxEnemies - levelEnemiesSpawned.current;
    const currentEnemyCount = enemies.filter(e => e.type !== "boss" && e.type !== "toucan").length;
    
    if (isPhase1 && enemySpawnTimer.current > 2.5 && remainingToSpawn > 0 && currentEnemyCount < 8) {
      enemySpawnTimer.current = 0;
      
      let numEnemies = Math.min(3, remainingToSpawn);
      let enemyHealth = 1;
      
      if (level >= 3) enemyHealth = 2;
      if (level >= 5) enemyHealth = 3;
      
      const patterns: Array<"straight" | "zigzag" | "circular" | "formation"> = ["straight", "zigzag", "circular", "formation"];
      const patternIndex = Math.floor(newScrollPosition / 10) % patterns.length;
      
      for (let i = 0; i < numEnemies; i++) {
        bulletCounter++;
        enemySpawnCounter++;
        levelEnemiesSpawned.current++;
        const xPos = ((currentTime * 13 + i * 5) % 24) - 12;
        const isSpecial = enemySpawnCounter % 15 === 0;
        
        enemiesToSpawn.push({
          id: `e${bulletCounter}`,
          position: { x: xPos, y: 0.5, z: newScrollPosition + 15 },
          health: isSpecial ? enemyHealth + 1 : enemyHealth,
          type: "politician",
          shootTimer: (currentTime % 3) + 1,
          movePattern: patterns[patternIndex],
          spawnTime: currentTime,
          initialX: xPos,
          isSpecial,
        });
      }
    }
    
    if (isPhase2 && enemySpawnTimer.current > 2.5 && remainingToSpawn > 0 && currentEnemyCount < 8) {
      enemySpawnTimer.current = 0;
      
      let numEnemies = Math.min(3, remainingToSpawn);
      let enemyHealth = 2;
      
      if (level >= 10) enemyHealth = 3;
      if (level >= 12) enemyHealth = 4;
      
      const patterns: Array<"straight" | "zigzag" | "circular" | "formation"> = ["straight", "zigzag", "circular", "formation"];
      const patternIndex = Math.floor(newScrollPosition / 10) % patterns.length;
      
      for (let i = 0; i < numEnemies; i++) {
        bulletCounter++;
        enemySpawnCounter++;
        levelEnemiesSpawned.current++;
        const xPos = ((currentTime * 13 + i * 5) % 24) - 12;
        const enemyType = i % 2 === 0 ? "gorilla" : "penguin";
        const isSpecial = enemySpawnCounter % 15 === 0;
        
        enemiesToSpawn.push({
          id: `z${bulletCounter}`,
          position: { x: xPos, y: 0.5, z: newScrollPosition + 15 },
          health: isSpecial ? enemyHealth + 1 : enemyHealth,
          type: enemyType,
          shootTimer: (currentTime % 3) + 1,
          movePattern: patterns[patternIndex],
          spawnTime: currentTime,
          initialX: xPos,
          isSpecial,
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
    
    let enemyBulletCount = 0;
    for (let i = 0; i < bullets.length; i++) {
      if (!bullets[i].fromPlayer) enemyBulletCount++;
    }
    const maxEnemyBullets = (level === 7 || level === 14) ? 8 : 15;
    
    if (frameCounter.current % 2 === 0) {
      mutatePowerUps((currentPowerUps) => {
        let changed = false;
        const result = [];
        for (let i = 0; i < currentPowerUps.length; i++) {
          const p = currentPowerUps[i];
          const newZ = p.position.z - delta * 2;
          if (newZ > -15) {
            if (newZ !== p.position.z) changed = true;
            result.push({
              ...p,
              position: { x: p.position.x, y: p.position.y, z: newZ }
            });
          } else {
            changed = true;
          }
        }
        return changed ? result : currentPowerUps;
      });
    }
    
    mutateEnemies((currentEnemies) => {
      let enemies = enemiesToSpawn.length > 0 ? [...currentEnemies, ...enemiesToSpawn] : currentEnemies;
      const enemiesToRemove: string[] = [];
      
      enemies = enemies.map(enemy => {
        const age = currentTime - enemy.spawnTime;
        let newX = enemy.position.x;
        let newZ = enemy.position.z;
        
        switch (enemy.movePattern) {
          case "zigzag":
            newX = enemy.initialX + Math.sin(age * 2) * 6;
            newZ -= delta * 1.5;
            break;
          case "circular":
            if (enemy.type === "boss" || enemy.type === "toucan") {
              const dx = playerPosition.x - enemy.position.x;
              const dz = playerPosition.z - enemy.position.z;
              const distanceToPlayer = Math.sqrt(dx * dx + dz * dz);
              const bossSpeed = enemy.type === "toucan" ? 5 : 4;
              
              // Organic movement patterns - multiple sine waves for fluid motion
              const strafePhase = Math.sin(age * 1.5) * 8 + Math.sin(age * 0.7) * 4;
              const verticalPhase = Math.cos(age * 0.9) * 6 + Math.sin(age * 1.3) * 3;
              
              // Lazy horizontal follow - boss orbits around more than chases directly
              const followStrength = 0.08; // Much weaker follow
              newX += strafePhase * delta * 2;
              newX += dx * followStrength * delta * bossSpeed;
              
              // Vertical movement - boss moves independently with occasional pursuit
              const pursuitCycle = Math.sin(age * 0.5);
              if (pursuitCycle > 0.5 && distanceToPlayer > 12) {
                // Occasional pursuit phase
                newZ += (dz / (distanceToPlayer || 1)) * delta * bossSpeed * 0.4;
              } else {
                // Normal floating/patrol movement
                newZ += verticalPhase * delta * 0.8;
              }
              
              // Keep boss generally ahead but allow player to pass
              const minZ = playerPosition.z - 15; // Player can get well behind boss
              const maxZ = playerPosition.z + 25;
              
              // Soft boundary push instead of hard clamp
              if (newZ < minZ + 5) {
                newZ += delta * 3; // Gently push forward
              }
              if (newZ > maxZ - 5) {
                newZ -= delta * 2; // Gently push back
              }
              
              newX = Math.max(-22, Math.min(22, newX));
              newZ = Math.max(minZ, Math.min(maxZ, newZ));
            } else {
              newX = enemy.initialX + Math.cos(age * 1.5) * 4;
              newZ = 12 - age * 1.5 + Math.sin(age * 1.5) * 4;
            }
            break;
          case "formation":
            newX = enemy.initialX + Math.sin(age * 2) * 2;
            newZ -= delta * 2;
            break;
          default:
            newZ -= delta * 2.5;
        }
        
        const isBossType = enemy.type === "boss" || enemy.type === "toucan";
        if (newZ < playerPosition.z - 8 && !isBossType) {
          enemiesToRemove.push(enemy.id);
          return enemy;
        }
        
        const newShootTimer = Math.max(0, enemy.shootTimer - delta);
        
        const isAheadOfPlayer = newZ > playerPosition.z - 3;
        
        if (newShootTimer <= 0 && isAheadOfPlayer) {
          if (enemyBulletCount + enemyBulletsToAdd.length < maxEnemyBullets) {
            const dirX = playerPosition.x - enemy.position.x;
            const dirZ = playerPosition.z - enemy.position.z;
            const mag = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
            
            bulletCounter++;
            let bulletId = `eb${bulletCounter}`;
            if (enemy.type === "gorilla") bulletId = `banana${bulletCounter}`;
            else if (enemy.type === "penguin") bulletId = `rose${bulletCounter}`;
            
            enemyBulletsToAdd.push({
              id: bulletId,
              position: { x: enemy.position.x, y: enemy.position.y, z: enemy.position.z },
              direction: { x: dirX / mag, y: 0, z: dirZ / mag },
              speed: enemy.type === "gorilla" ? 10 : 8,
              fromPlayer: false,
            });
          }
          
          const isBossType = enemy.type === "boss" || enemy.type === "toucan";
          return {
            ...enemy,
            shootTimer: isBossType ? 0.6 : enemy.type === "gorilla" ? 1.5 + Math.random() : 2 + Math.random() * 2,
            position: { x: newX, y: enemy.position.y, z: newZ },
          };
        }
        
        return {
          ...enemy,
          shootTimer: newShootTimer,
          position: { x: newX, y: enemy.position.y, z: newZ },
        };
      });
      
      for (let i = 0; i < bullets.length; i++) {
        const bullet = bullets[i];
        if (bullet.fromPlayer) {
          for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if (!enemiesToRemove.includes(enemy.id)) {
              const distance = vec3Distance(bullet.position, enemy.position);
              if (distance < 1 && !bulletsToRemove.includes(bullet.id)) {
                const damage = bullet.damage || 1;
                enemies[j] = { ...enemy, health: enemy.health - damage };
                bulletsToRemove.push(bullet.id);
                playHit();
                const isBoss1 = enemy.type === "boss";
                const isBoss2 = enemy.type === "toucan";
                const isZooPhase = level >= 8;
                playEnemyScream(isBoss1, isZooPhase, isBoss2);
                
                if (enemies[j].health <= 0) {
                  if (enemy.type === "boss") {
                    scoreToAdd += 500;
                    setTimeout(() => {
                      clearBattlefield();
                      setScrollPosition(315);
                      setLevel(8);
                    }, 500);
                  } else if (enemy.type === "toucan") {
                    scoreToAdd += 1000;
                    shouldEndGame = true;
                  } else if (enemy.type === "gorilla" || enemy.type === "penguin") {
                    scoreToAdd += 150;
                  } else {
                    scoreToAdd += 100;
                  }
                  
                  // Special enemy drops reward
                  if (enemy.isSpecial) {
                    const giveLife = Math.random() > 0.5;
                    if (giveLife) {
                      setLives(Math.min(lives + 1, 6));
                    } else {
                      const powerUpTypes: Array<"tripleShot" | "speedBoost" | "powerShot" | "rapidFire"> = ["tripleShot", "speedBoost", "powerShot", "rapidFire"];
                      const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                      bulletCounter++;
                      addPowerUp({
                        id: `pu${bulletCounter}`,
                        position: { x: enemy.position.x, y: 0.5, z: enemy.position.z },
                        type: randomType,
                        collected: false,
                      });
                    }
                  }
                  
                  enemiesToRemove.push(enemy.id);
                }
              }
            }
          }
        } else {
          const dx = bullet.position.x - playerPosition.x;
          const dz = bullet.position.z - playerPosition.z;
          const distance2D = Math.sqrt(dx * dx + dz * dz);
          if (distance2D < 1.0 && !bulletsToRemove.includes(bullet.id)) {
            bulletsToRemove.push(bullet.id);
            loseLife();
            playPlayerDamage();
          }
        }
      }
      
      if (enemiesToRemove.length > 0) {
        return enemies.filter(e => !enemiesToRemove.includes(e.id));
      }
      return enemies;
    });
    
    for (let i = 0; i < enemyBulletsToAdd.length; i++) {
      addBullet(enemyBulletsToAdd[i]);
    }
    for (let i = 0; i < bulletsToRemove.length; i++) {
      removeBullet(bulletsToRemove[i]);
    }
    
    if (scoreToAdd > 0) {
      addScore(scoreToAdd);
    }
    
    if (shouldEndGame) {
      setPhase("victory");
    }
    
    if (scrollPosition > 45 && level === 1) setLevel(2);
    else if (scrollPosition > 90 && level === 2) setLevel(3);
    else if (scrollPosition > 135 && level === 3) setLevel(4);
    else if (scrollPosition > 180 && level === 4) setLevel(5);
    else if (scrollPosition > 225 && level === 5) setLevel(6);
    else if (scrollPosition > 270 && level === 6) setLevel(7);
    else if (scrollPosition > 360 && level === 8) setLevel(9);
    else if (scrollPosition > 405 && level === 9) setLevel(10);
    else if (scrollPosition > 450 && level === 10) setLevel(11);
    else if (scrollPosition > 495 && level === 11) setLevel(12);
    else if (scrollPosition > 540 && level === 12) setLevel(13);
    else if (scrollPosition > 585 && level === 13) setLevel(14);
  });
  
  return null;
}
