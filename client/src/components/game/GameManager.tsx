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
  grenade = "grenade",
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
let grenadeCounter = 0;
const GRENADE_DISTANCE = 15;
const GRENADE_COOLDOWN = 2.0;
const EXPLOSION_RADIUS = 8;
const BOSS_ENRAGE_INTERVAL = 10; // Cada 10 segundos (para pruebas)
const BOSS_ENRAGE_DURATION = 2.5; // Duración del ataque especial

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
    lastGrenadeTime,
    grenades,
    grenadeCount,
    useGrenadeFromInventory,
    addGrenadeToInventory,
    addBullet,
    removeBullet,
    setScrollPosition,
    setLastShootTime,
    setLastGrenadeTime,
    addGrenade,
    updateGrenades,
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
    addDebris,
    updateDebris,
    addScorePopup,
    updateScorePopups,
  } = useArcadeGame();
  
  const [, getKeys] = useKeyboardControls<Controls>();
  const { playHit, playPlayerDamage, playEnemyScream, playBossEntrance, playGrenadeExplosion, playGrenadePickup, stopBossMusic } = useAudio();
  const enemySpawnTimer = useRef(0);
  const lastLevel = useRef(1);
  const frameCounter = useRef(0);
  const lastScrollUpdate = useRef(0);
  const levelEnemiesSpawned = useRef(0);
  const scooterSpawnedForLevel = useRef(0);
  const enemyPhraseTimer = useRef(0);
  
  useFrame((state, rawDelta) => {
    if (phase !== "playing") return;
    
    const delta = Math.min(rawDelta, 0.05);
    const currentTime = state.clock.getElapsedTime();
    
    frameCounter.current++;
    
    updateActivePowerUps(currentTime);
    
    updateDebris(delta);
    updateScorePopups(delta);
    
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
      // Siempre disparar hacia arriba (adelante en el juego)
      tempVec3A.set(0, 0, 1);
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
    
    const isThrowingGrenade = keys.grenade || touchControls.throwingGrenade;
    if (isThrowingGrenade && currentTime - lastGrenadeTime > GRENADE_COOLDOWN && grenadeCount > 0) {
      const canThrow = useGrenadeFromInventory();
      if (canThrow) {
        // Siempre lanzar granadas hacia arriba (adelante en el juego)
        const dx = 0;
        const dz = 1;
        
        grenadeCounter++;
        const grenadeId = `g${grenadeCounter}`;
        
        const startPos = { x: playerPosition.x, y: playerPosition.y + 0.5, z: playerPosition.z };
        const targetPos = { 
          x: playerPosition.x + dx * GRENADE_DISTANCE, 
          y: 0.3, 
          z: playerPosition.z + dz * GRENADE_DISTANCE 
        };
        
        addGrenade({
          id: grenadeId,
          position: { ...startPos },
          targetPosition: targetPos,
          startPosition: startPos,
          direction: { x: dx, y: 0, z: dz },
          progress: 0,
          exploding: false,
          explosionProgress: 0,
        });
        
        setLastGrenadeTime(currentTime);
        console.log("Grenade thrown!", grenadeId, "direction:", dx, dz);
      }
    }
    
    if (grenades.length > 0) {
      const updatedGrenades = grenades.map(grenade => {
        if (grenade.exploding) {
          const newExplosionProgress = grenade.explosionProgress + delta * 2;
          if (newExplosionProgress >= 1) {
            return null;
          }
          return { ...grenade, explosionProgress: newExplosionProgress };
        }
        
        const newProgress = grenade.progress + delta * 2;
        
        if (newProgress >= 1) {
          const explosionPos = grenade.targetPosition;
          
          const nearbyEnemies = enemies
            .map((enemy, idx) => ({
              enemy,
              idx,
              dist: vec3Distance(enemy.position, explosionPos)
            }))
            .filter(e => e.dist < EXPLOSION_RADIUS)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 6);
          
          if (nearbyEnemies.length > 0) {
            let scoreToAdd = 0;
            const killIds: string[] = [];
            const bossDamage: { id: string; damage: number }[] = [];
            
            const newDebris: Array<{id: string; position: {x: number; y: number; z: number}; velocity: {x: number; y: number; z: number}; color: string; size: number; lifetime: number}> = [];
            let debrisCounter = 0;
            
            nearbyEnemies.forEach(({ enemy }) => {
              // Scooter invulnerable durante 1.5s
              if (enemy.type === "scooter" && (currentTime - enemy.spawnTime) < 1.5) return;
              const isBoss = enemy.type === "boss" || enemy.type === "toucan";
              
              if (isBoss) {
                // Bosses reciben 3 puntos de daño por granada
                bossDamage.push({ id: enemy.id, damage: 3 });
                console.log("Grenade hit boss, dealing 3 damage");
              } else {
                // Enemigos normales mueren con la granada - crear debris
                killIds.push(enemy.id);
                
                // Crear trozos que salen disparados
                const colors = ["#dc2626", "#7f1d1d", "#991b1b", "#450a0a", "#fef08a"];
                for (let i = 0; i < 8; i++) {
                  debrisCounter++;
                  const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
                  const speed = 8 + Math.random() * 12;
                  newDebris.push({
                    id: `debris_${enemy.id}_${debrisCounter}`,
                    position: { 
                      x: enemy.position.x, 
                      y: enemy.position.y + 0.5 + Math.random() * 0.5, 
                      z: enemy.position.z 
                    },
                    velocity: {
                      x: Math.cos(angle) * speed,
                      y: 5 + Math.random() * 8,
                      z: Math.sin(angle) * speed,
                    },
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 0.15 + Math.random() * 0.2,
                    lifetime: 1.5 + Math.random() * 0.5,
                  });
                }
                
                let grenadeKillScore = 25;
                if (enemy.type === "scooter") {
                  grenadeKillScore = 200;
                  scoreToAdd += 200;
                  bulletCounter++;
                  addPowerUp({
                    id: `pu${bulletCounter}`,
                    position: { x: enemy.position.x, y: 0.5, z: enemy.position.z },
                    type: "tripleShot",
                    collected: false,
                  });
                  const deathUtt = new SpeechSynthesisUtterance("¡¡Tu racista!!");
                  deathUtt.lang = "es-ES";
                  deathUtt.rate = 1.2;
                  deathUtt.pitch = 0.8;
                  speechSynthesis.speak(deathUtt);
                } else if (enemy.isSpecial) {
                  grenadeKillScore = 75;
                  scoreToAdd += 75;
                } else {
                  grenadeKillScore = 25;
                  scoreToAdd += 25;
                }
                
                bulletCounter++;
                addScorePopup({
                  id: `sp${bulletCounter}`,
                  position: { x: enemy.position.x, y: enemy.position.y + 2, z: enemy.position.z },
                  points: grenadeKillScore,
                  lifetime: 1.2,
                  maxLifetime: 1.2,
                });
              }
            });
            
            // Añadir debris al estado
            if (newDebris.length > 0) {
              addDebris(newDebris);
            }
            
            if (scoreToAdd > 0) {
              addScore(scoreToAdd);
            }
            
            // Aplicar daño a bosses y matar enemigos normales
            mutateEnemies(currentEnemies => {
              const result: typeof currentEnemies = [];
              for (const e of currentEnemies) {
                if (killIds.includes(e.id)) continue;
                
                const dmg = bossDamage.find(b => b.id === e.id);
                if (dmg) {
                  const newHealth = e.health - dmg.damage;
                  if (newHealth <= 0) {
                    let bossKillScore = 0;
                    if (e.type === "boss") {
                      bossKillScore = 500;
                      addScore(500);
                      stopBossMusic();
                      setTimeout(() => {
                        clearBattlefield();
                        setScrollPosition(315);
                        setLevel(8);
                      }, 1500);
                    } else if (e.type === "toucan") {
                      bossKillScore = 750;
                      addScore(750);
                      stopBossMusic();
                      setTimeout(() => {
                        setPhase("victory");
                      }, 1500);
                    }
                    if (bossKillScore > 0) {
                      bulletCounter++;
                      addScorePopup({
                        id: `sp${bulletCounter}`,
                        position: { x: e.position.x, y: e.position.y + 3, z: e.position.z },
                        points: bossKillScore,
                        lifetime: 2.0,
                        maxLifetime: 2.0,
                      });
                    }
                    const isBoss1 = e.type === "boss";
                    const isBoss2 = e.type === "toucan";
                    const isZooPhase = level >= 8;
                    playEnemyScream(isBoss1, isZooPhase, isBoss2, level);
                    continue;
                  }
                  result.push({ ...e, health: newHealth });
                } else {
                  result.push(e);
                }
              }
              return result;
            });
            
            console.log("Grenade explosion hit", nearbyEnemies.length, "enemies!");
          }
          
          playGrenadeExplosion();
          
          return { 
            ...grenade, 
            progress: 1, 
            position: { ...explosionPos },
            exploding: true, 
            explosionProgress: 0 
          };
        }
        
        const t = newProgress;
        const arcHeight = 3;
        const y = grenade.startPosition.y + arcHeight * 4 * t * (1 - t);
        
        return {
          ...grenade,
          progress: newProgress,
          position: {
            x: grenade.startPosition.x + (grenade.targetPosition.x - grenade.startPosition.x) * t,
            y: y,
            z: grenade.startPosition.z + (grenade.targetPosition.z - grenade.startPosition.z) * t,
          }
        };
      }).filter(g => g !== null);
      
      updateGrenades(updatedGrenades);
    }
    
    const enemiesToSpawn: Array<{
      id: string;
      position: Vec3;
      health: number;
      type: "politician" | "boss" | "gorilla" | "penguin" | "toucan" | "scooter";
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
      enrageMode?: "jump" | "shake";
      chargeDirX?: number;
      chargeDirZ?: number;
      charging?: boolean;
      lastHitTime?: number;
      scooterPhraseTime?: number;
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
    
    if (level === 7 || level === 14) {
      enemyPhraseTimer.current += delta;
      if (enemyPhraseTimer.current > 8) {
        enemyPhraseTimer.current = 0;
        playEnemyScream(level === 7, false, level === 14, level);
      }
    }
    
    const maxEnemies = getMaxEnemiesForLevel(level);
    const remainingToSpawn = maxEnemies - levelEnemiesSpawned.current;
    const currentEnemyCount = enemies.filter(e => e.type !== "boss" && e.type !== "toucan" && e.type !== "scooter").length;
    
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
      playEnemyScream(false, false, false, level);
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
      playEnemyScream(false, true, false, level);
    }
    
    // Spawn scooter when regular enemies are cleared (not on boss levels)
    const isBossLevel = level === 7 || level === 14;
    const scooterCount = enemies.filter(e => e.type === "scooter").length;
    const enoughEnemiesSpawned = levelEnemiesSpawned.current >= 4;
    if (!isBossLevel && (isPhase1 || isPhase2) && enoughEnemiesSpawned && currentEnemyCount === 0 && scooterSpawnedForLevel.current !== level) {
      scooterSpawnedForLevel.current = level;
      bulletCounter++;
      const startX = level % 2 === 0 ? -10 : 10;
      enemiesToSpawn.push({
        id: `scooter${bulletCounter}`,
        position: { x: startX, y: 0.5, z: playerPosition.z + 8 },
        health: 2,
        scooterPhraseTime: currentTime,
        type: "scooter",
        shootTimer: 2.5,
        movePattern: "zigzag",
        spawnTime: currentTime,
        initialX: startX,
      });
      
      const scooterPhrases = [
        "¡¡Un segarro amego!!",
        "¡¡De las pagas cobro más que tú pringao!!",
      ];
      const lastP = useAudio.getState().lastPhrase;
      const available = scooterPhrases.filter(p => p !== lastP);
      const chosen = available[Math.floor(Math.random() * available.length)] || scooterPhrases[0];
      useAudio.setState({ lastPhrase: chosen, lastPhraseTime: Date.now() });
      const utterance = new SpeechSynthesisUtterance(chosen);
      utterance.lang = "es-ES";
      utterance.rate = 1.1;
      utterance.pitch = 0.9;
      speechSynthesis.speak(utterance);
      console.log(`SCOOTER SPAWNED level ${level}! Total scooters: ${scooterCount + 1}`);
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
      const enragedUpdates: Array<{ id: string; enraged: boolean; enragedProgress: number; lastEnrageTime?: number; enrageMode?: "jump" | "shake" }> = [];
      
      enemies = enemies.map(enemy => {
        // Actualizar animación de muerte
        if (enemy.dying) {
          const newDyingProgress = (enemy.dyingProgress || 0) + delta * 2;
          if (newDyingProgress >= 1) {
            enemiesToRemove.push(enemy.id);
            return enemy;
          }
          return { ...enemy, dyingProgress: newDyingProgress };
        }
        
        const age = currentTime - enemy.spawnTime;
        let newX = enemy.position.x;
        let newZ = enemy.position.z;
        
        // Scooter: traza dirección del jugador y carga en línea recta
        if (enemy.type === "scooter") {
          const chargeSpeed = 12;
          const approachSpeed = 8;
          const distToPlayerX = playerPosition.x - enemy.position.x;
          const distToPlayerZ = playerPosition.z - enemy.position.z;
          const distToPlayer = Math.sqrt(distToPlayerX * distToPlayerX + distToPlayerZ * distToPlayerZ);
          
          if (!enemy.charging) {
            // Fase de aproximación: ir rápido hacia posición delante del jugador
            const targetX = Math.sin(age * 1.5) * 5;
            const targetZ = playerPosition.z + 10;
            const dxTarget = targetX - enemy.position.x;
            const dzTarget = targetZ - enemy.position.z;
            const distTarget = Math.sqrt(dxTarget * dxTarget + dzTarget * dzTarget);
            if (distTarget > 0.5) {
              newX = enemy.position.x + (dxTarget / distTarget) * approachSpeed * delta;
              newZ = enemy.position.z + (dzTarget / distTarget) * approachSpeed * delta;
            } else {
              newX = targetX;
              newZ = targetZ;
            }
            
            // Iniciar carga cuando: está cerca de su posición objetivo, delante del jugador, y visible
            const nearTarget = distTarget < 3;
            const aheadOfPlayer = enemy.position.z > playerPosition.z + 5;
            const withinView = Math.abs(enemy.position.x) < 12;
            if (nearTarget && aheadOfPlayer && withinView && age > 1.5) {
              const dx = playerPosition.x - enemy.position.x;
              const dz = playerPosition.z - enemy.position.z;
              const mag = Math.sqrt(dx * dx + dz * dz);
              console.log("SCOOTER CARGA! dirección fijada hacia jugador");
              return {
                ...enemy,
                position: { x: newX, y: enemy.position.y, z: newZ },
                charging: true,
                chargeDirX: mag > 0.1 ? dx / mag : 0,
                chargeDirZ: mag > 0.1 ? dz / mag : -1,
                shootTimer: enemy.shootTimer - delta <= 0 ? 2.5 : enemy.shootTimer - delta,
              };
            }
          } else {
            // Fase de carga: seguir en LÍNEA RECTA con la dirección fijada
            const dirX = enemy.chargeDirX || 0;
            const dirZ = enemy.chargeDirZ || -1;
            newX = enemy.position.x + dirX * chargeSpeed * delta;
            newZ = enemy.position.z + dirZ * chargeSpeed * delta;
            
            // Si ya pasó de largo al jugador o se fue lejos, volver a aproximación
            const passedPlayer = enemy.position.z < playerPosition.z - 8;
            const tooFarSide = Math.abs(enemy.position.x) > 20;
            const tooFarAhead = enemy.position.z > playerPosition.z + 25;
            if (passedPlayer || tooFarSide || tooFarAhead) {
              return {
                ...enemy,
                position: { x: newX, y: enemy.position.y, z: newZ },
                charging: false,
                chargeDirX: 0,
                chargeDirZ: 0,
                shootTimer: enemy.shootTimer - delta <= 0 ? 2.5 : enemy.shootTimer - delta,
              };
            }
          }
          
          // Scooter dispara al jugador (cada 2.5 segundos)
          const newShootTimer = enemy.shootTimer - delta;
          if (newShootTimer <= 0 && enemyBulletCount < maxEnemyBullets) {
            const dx = playerPosition.x - newX;
            const dz = playerPosition.z - newZ;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 0.1) {
              bulletCounter++;
              enemyBulletsToAdd.push({
                id: `sb${bulletCounter}`,
                position: { x: newX, y: enemy.position.y + 1, z: newZ },
                direction: { x: dx / dist, y: 0, z: dz / dist },
                speed: 8,
                fromPlayer: false,
              });
            }
          }
          
          // Colisión con el jugador (atropello) - daña pero sigue su curso
          const lastHit = enemy.lastHitTime || 0;
          const hitCooldown = currentTime - lastHit > 2.0;
          let newLastHitTime = lastHit;
          if (distToPlayer < 1.8 && (currentTime - enemy.spawnTime) > 1.5 && hitCooldown) {
            playPlayerDamage();
            loseLife();
            newLastHitTime = currentTime;
            console.log("SCOOTER HIT PLAYER! -1 vida, sigue su curso");
          }
          
          let newScooterPhraseTime = enemy.scooterPhraseTime || enemy.spawnTime;
          if (currentTime - newScooterPhraseTime > 5) {
            newScooterPhraseTime = currentTime;
            const scooterPhrases = [
              "¡¡Un segarro amego!!",
              "¡¡De las pagas cobro más que tú pringao!!",
            ];
            const lastP = useAudio.getState().lastPhrase;
            const available = scooterPhrases.filter(p => p !== lastP);
            const chosen = available[Math.floor(Math.random() * available.length)] || scooterPhrases[0];
            useAudio.setState({ lastPhrase: chosen, lastPhraseTime: Date.now() });
            const utt = new SpeechSynthesisUtterance(chosen);
            utt.lang = "es-ES";
            utt.rate = 1.1;
            utt.pitch = 0.9;
            speechSynthesis.speak(utt);
          }
          
          return {
            ...enemy,
            position: { x: newX, y: enemy.position.y, z: newZ },
            shootTimer: newShootTimer <= 0 ? 2.5 : newShootTimer,
            lastHitTime: newLastHitTime,
            scooterPhraseTime: newScooterPhraseTime,
          };
        }
        
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
              const bossSpeed = enemy.type === "toucan" ? 4 : 3;
              
              // Lógica de Enrage para La Chiki (Boss 1)
              if (enemy.type === "boss") {
                const lastEnrage = enemy.lastEnrageTime || enemy.spawnTime;
                const timeSinceLastEnrage = currentTime - lastEnrage;
                
                if (enemy.enraged) {
                  // Actualizar progreso del enrage
                  const newProgress = (enemy.enragedProgress || 0) + delta / BOSS_ENRAGE_DURATION;
                  
                  if (newProgress >= 1) {
                    // Terminar enrage - resetear lastEnrageTime para próximo ciclo
                    enragedUpdates.push({ id: enemy.id, enraged: false, enragedProgress: 0, lastEnrageTime: currentTime });
                  } else {
                    // Mantener estado de enrage
                    // En modo shake, disparar balas continuamente durante el temblor
                    if (enemy.enrageMode === "shake" && Math.floor(newProgress * 10) > Math.floor((enemy.enragedProgress || 0) * 10)) {
                      const numBullets = 6;
                      for (let b = 0; b < numBullets; b++) {
                        const angle = (b / numBullets) * Math.PI * 2 + newProgress * Math.PI;
                        bulletCounter++;
                        enemyBulletsToAdd.push({
                          id: `shake${bulletCounter}`,
                          position: { x: enemy.position.x, y: enemy.position.y + 1, z: enemy.position.z },
                          direction: { x: Math.sin(angle), y: 0, z: Math.cos(angle) },
                          speed: 10,
                          fromPlayer: false,
                        });
                      }
                    }
                    enragedUpdates.push({ id: enemy.id, enraged: true, enragedProgress: newProgress, enrageMode: enemy.enrageMode });
                  }
                } else if (timeSinceLastEnrage >= BOSS_ENRAGE_INTERVAL) {
                  // Alternar entre modo jump y shake
                  const nextMode: "jump" | "shake" = enemy.enrageMode === "jump" ? "shake" : "jump";
                  
                  // Iniciar nuevo enrage
                  enragedUpdates.push({ id: enemy.id, enraged: true, enragedProgress: 0, lastEnrageTime: currentTime, enrageMode: nextMode });
                  
                  if (nextMode === "jump") {
                    // Modo salto: dispara ráfaga al inicio
                    const numBullets = 8;
                    for (let b = 0; b < numBullets; b++) {
                      const angle = (b / numBullets) * Math.PI * 2;
                      bulletCounter++;
                      enemyBulletsToAdd.push({
                        id: `rage${bulletCounter}`,
                        position: { x: enemy.position.x, y: enemy.position.y + 1, z: enemy.position.z },
                        direction: { x: Math.sin(angle), y: 0, z: Math.cos(angle) },
                        speed: 12,
                        fromPlayer: false,
                      });
                    }
                    
                    // Frase del modo salto
                    const utterance = new SpeechSynthesisUtterance("¡Me cago en la mar llena de fascistas!");
                    utterance.lang = "es-ES";
                    utterance.rate = 1.1;
                    utterance.pitch = 1.3;
                    speechSynthesis.speak(utterance);
                    console.log("LA CHIKI ENRAGED (JUMP)! ¡Me cago en la mar llena de fascistas!");
                  } else {
                    // Modo temblor: frase YO MOPONGOO dos veces
                    const utterance1 = new SpeechSynthesisUtterance("¡YO MOPONGOO!");
                    utterance1.lang = "es-ES";
                    utterance1.rate = 1.3;
                    utterance1.pitch = 1.5;
                    const utterance2 = new SpeechSynthesisUtterance("¡YO MOPONGOO!");
                    utterance2.lang = "es-ES";
                    utterance2.rate = 1.3;
                    utterance2.pitch = 1.5;
                    speechSynthesis.speak(utterance1);
                    speechSynthesis.speak(utterance2);
                    console.log("LA CHIKI ENRAGED (SHAKE)! ¡YO MOPONGOO! ¡YO MOPONGOO!");
                  }
                }
              }
              
              // Lógica de Enrage para Yolanda Díaz (Tucán - Boss 2)
              if (enemy.type === "toucan") {
                const lastEnrage = enemy.lastEnrageTime || enemy.spawnTime;
                const timeSinceLastEnrage = currentTime - lastEnrage;
                
                if (enemy.enraged) {
                  // Actualizar progreso del enrage
                  const newProgress = (enemy.enragedProgress || 0) + delta / BOSS_ENRAGE_DURATION;
                  
                  if (newProgress >= 1) {
                    // Terminar enrage
                    enragedUpdates.push({ id: enemy.id, enraged: false, enragedProgress: 0, lastEnrageTime: currentTime });
                  } else {
                    // Disparar balas en abanico durante el modo SUMAR
                    if (Math.floor(newProgress * 8) > Math.floor((enemy.enragedProgress || 0) * 8)) {
                      const numBullets = 5;
                      for (let b = 0; b < numBullets; b++) {
                        const angle = ((b - 2) / 4) * Math.PI * 0.6; // Abanico frontal
                        bulletCounter++;
                        enemyBulletsToAdd.push({
                          id: `sumar${bulletCounter}`,
                          position: { x: enemy.position.x, y: enemy.position.y + 1, z: enemy.position.z },
                          direction: { x: Math.sin(angle), y: 0, z: -Math.cos(angle) },
                          speed: 14,
                          fromPlayer: false,
                        });
                      }
                    }
                    enragedUpdates.push({ id: enemy.id, enraged: true, enragedProgress: newProgress });
                  }
                } else if (timeSinceLastEnrage >= BOSS_ENRAGE_INTERVAL) {
                  // Iniciar enrage SUMAR
                  enragedUpdates.push({ id: enemy.id, enraged: true, enragedProgress: 0, lastEnrageTime: currentTime });
                  
                  // Frase SUMAR dos veces
                  const utterance1 = new SpeechSynthesisUtterance("¡SUMAR!");
                  utterance1.lang = "es-ES";
                  utterance1.rate = 1.2;
                  utterance1.pitch = 1.4;
                  const utterance2 = new SpeechSynthesisUtterance("¡SUMAR!");
                  utterance2.lang = "es-ES";
                  utterance2.rate = 1.2;
                  utterance2.pitch = 1.4;
                  speechSynthesis.speak(utterance1);
                  speechSynthesis.speak(utterance2);
                  console.log("YOLANDA ENRAGED (SUMAR)! ¡SUMAR! ¡SUMAR!");
                }
              }
              
              // Movimiento horizontal orgánico
              const strafePhase = Math.sin(age * 1.2) * 6 + Math.sin(age * 0.5) * 3;
              
              // Seguir al jugador horizontalmente
              const followStrength = 0.15;
              newX += strafePhase * delta * 2;
              newX += dx * followStrength * delta * bossSpeed;
              
              // Boss siempre se mantiene por encima del jugador (a distancia fija)
              const targetZ = playerPosition.z + 12; // Siempre 12 unidades adelante del jugador
              const zDiff = targetZ - newZ;
              newZ += zDiff * delta * 2; // Suavemente acercarse a la posición objetivo
              
              newX = Math.max(-18, Math.min(18, newX));
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
            shootTimer: isBossType ? 1.2 : enemy.type === "gorilla" ? 1.5 + Math.random() : 2 + Math.random() * 2,
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
              // Scooter tiene 1.5s de invulnerabilidad al aparecer
              if (enemy.type === "scooter" && (currentTime - enemy.spawnTime) < 1.5) continue;
              const distance = vec3Distance(bullet.position, enemy.position);
              if (distance < 1 && !bulletsToRemove.includes(bullet.id)) {
                const damage = bullet.damage || 1;
                enemies[j] = { ...enemy, health: enemy.health - damage };
                bulletsToRemove.push(bullet.id);
                playHit();
                
                if (enemies[j].health <= 0 && !enemies[j].dying) {
                  enemies[j] = { ...enemies[j], dying: true, dyingProgress: 0 };
                  
                  let killScore = 0;
                  if (enemy.type === "boss") {
                    killScore = 500;
                    scoreToAdd += 500;
                    stopBossMusic();
                    setTimeout(() => {
                      clearBattlefield();
                      setScrollPosition(315);
                      setLevel(8);
                    }, 1500);
                  } else if (enemy.type === "toucan") {
                    killScore = 1000;
                    scoreToAdd += 1000;
                    stopBossMusic();
                    shouldEndGame = true;
                  } else if (enemy.type === "scooter") {
                    killScore = 200;
                    scoreToAdd += 200;
                    bulletCounter++;
                    addPowerUp({
                      id: `pu${bulletCounter}`,
                      position: { x: enemy.position.x, y: 0.5, z: enemy.position.z },
                      type: "tripleShot",
                      collected: false,
                    });
                    const deathUtt = new SpeechSynthesisUtterance("¡¡Tu racista!!");
                    deathUtt.lang = "es-ES";
                    deathUtt.rate = 1.2;
                    deathUtt.pitch = 0.8;
                    speechSynthesis.speak(deathUtt);
                  } else if (enemy.type === "gorilla" || enemy.type === "penguin") {
                    killScore = 150;
                    scoreToAdd += 150;
                  } else {
                    killScore = 100;
                    scoreToAdd += 100;
                  }
                  
                  bulletCounter++;
                  addScorePopup({
                    id: `sp${bulletCounter}`,
                    position: { x: enemy.position.x, y: enemy.position.y + 2, z: enemy.position.z },
                    points: killScore,
                    lifetime: 1.2,
                    maxLifetime: 1.2,
                  });
                  
                  // Special enemy drops reward
                  if (enemy.isSpecial) {
                    const roll = Math.random();
                    if (roll < 0.33) {
                      setLives(Math.min(lives + 1, 6));
                    } else if (roll < 0.66) {
                      addGrenadeToInventory(1);
                      playGrenadePickup();
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
      
      // Aplicar actualizaciones de enrage a los enemigos
      if (enragedUpdates.length > 0) {
        enemies = enemies.map(e => {
          const update = enragedUpdates.find(u => u.id === e.id);
          if (update) {
            return { 
              ...e, 
              enraged: update.enraged, 
              enragedProgress: update.enragedProgress,
              lastEnrageTime: update.lastEnrageTime !== undefined ? update.lastEnrageTime : e.lastEnrageTime,
              enrageMode: update.enrageMode !== undefined ? update.enrageMode : e.enrageMode
            };
          }
          return e;
        });
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
