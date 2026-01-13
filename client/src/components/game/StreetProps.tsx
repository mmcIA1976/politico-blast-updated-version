import { useMemo, useEffect } from "react";
import { useArcadeGame, type Obstacle } from "@/lib/stores/useArcadeGame";
import * as THREE from "three";

function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={0.8} 
        />
      </mesh>
      
      <pointLight position={[0, 3.2, 0]} intensity={2} distance={8} color="#ffd700" />
    </group>
  );
}

function Bench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[0, 0.6, -0.2]}>
        <boxGeometry args={[1.2, 0.5, 0.08]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[-0.5, 0.15, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.4]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
      
      <mesh position={[0.5, 0.15, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.4]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
    </group>
  );
}

function Planter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.0, 0.6, 1.0]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      <mesh position={[0.3, 1.0, 0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ff69b4" emissive="#ff69b4" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[-0.3, 1.0, 0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ff1493" emissive="#ff1493" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[0.3, 1.0, -0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[-0.3, 1.0, -0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ff4500" emissive="#ff4500" emissiveIntensity={0.5} />
      </mesh>
      
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ff69b4" emissive="#ff69b4" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Fountain({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.4, 16]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.1, 16]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
      </mesh>
      
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 16]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i * Math.PI * 2) / 8;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.3, 1.3 + Math.random() * 0.5, Math.sin(angle) * 0.3]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.8} />
          </mesh>
        );
      })}
      
      <pointLight position={[0, 1.5, 0]} intensity={1} distance={5} color="#87ceeb" />
    </group>
  );
}

function BigFountain({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[4, 4.5, 0.6, 24]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 0.15, 24]} />
        <meshStandardMaterial color="#4a90d9" transparent opacity={0.7} />
      </mesh>
      
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.3, 16]} />
        <meshStandardMaterial color="#d4d4d4" />
      </mesh>
      
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 16]} />
        <meshStandardMaterial color="#4a90d9" transparent opacity={0.7} />
      </mesh>
      
      <mesh position={[0, 2.3, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.6, 12]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>
      
      <pointLight position={[0, 2, 0]} intensity={2} distance={10} color="#87ceeb" />
    </group>
  );
}

function ParkBench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.1, 0.6]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      
      <mesh position={[0, 0.7, -0.25]}>
        <boxGeometry args={[1.5, 0.6, 0.1]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
      
      <mesh position={[-0.6, 0.15, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.5]} />
        <meshStandardMaterial color="#2F4F2F" />
      </mesh>
      
      <mesh position={[0.6, 0.15, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.5]} />
        <meshStandardMaterial color="#2F4F2F" />
      </mesh>
      
      <mesh position={[-0.75, 0.5, -0.25]}>
        <boxGeometry args={[0.1, 0.6, 0.1]} />
        <meshStandardMaterial color="#2F4F2F" />
      </mesh>
      
      <mesh position={[0.75, 0.5, -0.25]}>
        <boxGeometry args={[0.1, 0.6, 0.1]} />
        <meshStandardMaterial color="#2F4F2F" />
      </mesh>
    </group>
  );
}

function Car({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.5, 2.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <mesh position={[0, 0.7, -0.3]}>
        <boxGeometry args={[1.4, 0.5, 1.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <mesh position={[-0.6, 0.15, 0.8]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      <mesh position={[0.6, 0.15, 0.8]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      <mesh position={[-0.6, 0.15, -0.8]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      <mesh position={[0.6, 0.15, -0.8]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      <mesh position={[0, 0.9, -0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 0.4]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function ZooCage({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3, 0.1, 3]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
      
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
        <mesh key={`bar-front-${i}`} position={[x, 1, 1.4]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      ))}
      
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
        <mesh key={`bar-back-${i}`} position={[x, 1, -1.4]}>
          <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      ))}
      
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[3.2, 0.1, 3.2]} />
        <meshStandardMaterial color="#5a5a5a" />
      </mesh>
    </group>
  );
}

function ZooRock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#6b6b6b" flatShading />
      </mesh>
      <mesh position={[0.5, 0.25, 0.3]}>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#7a7a7a" flatShading />
      </mesh>
    </group>
  );
}

function ZooPond({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.5, 24]} />
        <meshStandardMaterial color="#4a90d9" transparent opacity={0.8} />
      </mesh>
      
      <mesh position={[0, 0.08, 0]}>
        <torusGeometry args={[2.5, 0.15, 8, 24]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

function TropicalPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i * Math.PI * 2) / 5;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.3, 0.9, Math.sin(angle) * 0.3]} rotation={[0.5, angle, 0]}>
            <coneGeometry args={[0.25, 0.8, 4]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        );
      })}
    </group>
  );
}

function ZooAnimal({ position, animalType }: { position: [number, number, number]; animalType: 'lion' | 'penguin' | 'elephant' }) {
  const getColor = () => {
    if (animalType === 'lion') return '#d4a574';
    if (animalType === 'penguin') return '#1a1a1a';
    return '#808080';
  };
  
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.8]} />
        <meshStandardMaterial color={getColor()} />
      </mesh>
      
      <mesh position={[0, 0.8, 0.3]}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color={getColor()} />
      </mesh>
      
      {animalType === 'penguin' && (
        <mesh position={[0, 0.4, 0.01]}>
          <boxGeometry args={[0.35, 0.4, 0.1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
      
      {animalType === 'lion' && (
        <mesh position={[0, 0.85, 0.3]}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial color="#c4944a" />
        </mesh>
      )}
    </group>
  );
}

function BossArenaTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      
      <mesh position={[0, 3.5, 0]}>
        <sphereGeometry args={[1.5, 12, 12]} />
        <meshStandardMaterial color="#2E7D32" />
      </mesh>
    </group>
  );
}

function RedFlag({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      
      <mesh position={[0.5, 2.5, 0]}>
        <boxGeometry args={[1.0, 0.7, 0.05]} />
        <meshStandardMaterial color="#cc0000" emissive="#cc0000" emissiveIntensity={0.3} />
      </mesh>
      
      <mesh position={[0.5, 2.5, 0.03]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>
    </group>
  );
}

export function StreetProps() {
  const { level, setObstacles } = useArcadeGame();
  
  const props = useMemo(() => {
    const items: Array<{ 
      type: 'lamp' | 'bench' | 'car' | 'planter' | 'fountain' | 'parkbench' | 'bigfountain' | 'zoocage' | 'zoorock' | 'zoopond' | 'tropicalplant' | 'zooanimal' | 'bossarenatree' | 'redflag'; 
      position: [number, number, number]; 
      color?: string;
      animalType?: 'lion' | 'penguin' | 'elephant';
    }> = [];
    
    const maxZ = (level === 7 || level === 14) ? 260 : 280;
    
    const getZooOffset = () => {
      if (level === 8) return 315;
      if (level === 9) return 360;
      if (level === 10) return 405;
      if (level === 11) return 450;
      if (level === 12) return 495;
      if (level === 13) return 540;
      if (level === 14) return 585;
      return 0;
    };
    const zooOffset = getZooOffset();
    
    if (level === 7) {
      for (let z = -10; z < 260; z += 20) {
        items.push({ type: 'lamp', position: [-25, 0, z] });
        items.push({ type: 'lamp', position: [25, 0, z] });
      }
      
      items.push({ type: 'bigfountain', position: [0, 0, 295] });
      
      items.push({ type: 'parkbench', position: [-18, 0, 285] });
      items.push({ type: 'parkbench', position: [18, 0, 285] });
      items.push({ type: 'parkbench', position: [-18, 0, 305] });
      items.push({ type: 'parkbench', position: [18, 0, 305] });
      items.push({ type: 'parkbench', position: [-18, 0, 330] });
      items.push({ type: 'parkbench', position: [18, 0, 330] });
      items.push({ type: 'parkbench', position: [-18, 0, 355] });
      items.push({ type: 'parkbench', position: [18, 0, 355] });
      
      items.push({ type: 'planter', position: [-22, 0, 280] });
      items.push({ type: 'planter', position: [22, 0, 280] });
      items.push({ type: 'planter', position: [-22, 0, 310] });
      items.push({ type: 'planter', position: [22, 0, 310] });
      items.push({ type: 'planter', position: [-22, 0, 340] });
      items.push({ type: 'planter', position: [22, 0, 340] });
      items.push({ type: 'planter', position: [-22, 0, 365] });
      items.push({ type: 'planter', position: [22, 0, 365] });
      
      for (let z = 320; z < 370; z += 20) {
        items.push({ type: 'lamp', position: [-25, 0, z] });
        items.push({ type: 'lamp', position: [25, 0, z] });
      }
    } else if (level === 1 || level === 3 || level === 5) {
      for (let z = -10; z < maxZ; z += 10) {
        items.push({ type: 'lamp', position: [-15, 0, z] });
        items.push({ type: 'lamp', position: [15, 0, z] });
      }
      
      const carColors = ['#ff0000', '#0000ff', '#ffff00', '#ffffff', '#000000', '#00ff00'];
      for (let z = -5; z < maxZ; z += 20) {
        const side = z % 40 === 5 ? -12 : 12;
        const colorIndex = Math.floor(z / 20) % carColors.length;
        items.push({ type: 'car', position: [side, 0, z], color: carColors[colorIndex] });
      }
      
      for (let z = -2; z < maxZ; z += 25) {
        const side = z % 50 === 8 ? -13 : 13;
        items.push({ type: 'bench', position: [side, 0, z] });
      }
    } else if (level === 2 || level === 4 || level === 6) {
      for (let z = -10; z < maxZ; z += 12) {
        items.push({ type: 'planter', position: [-14, 0, z] });
        items.push({ type: 'planter', position: [14, 0, z] });
      }
      
      for (let z = 0; z < maxZ; z += 30) {
        items.push({ type: 'fountain', position: [0, 0, z] });
      }
      
      for (let z = -5; z < maxZ; z += 18) {
        const side = z % 36 === 5 ? -11 : 11;
        items.push({ type: 'parkbench', position: [side, 0, z] });
      }
      
      for (let z = 5; z < maxZ; z += 16) {
        const side = z % 32 === 5 ? -8 : 8;
        items.push({ type: 'planter', position: [side, 0, z] });
      }
    } else if (level === 8 || level === 10 || level === 12) {
      for (let z = -5; z < 50; z += 12) {
        items.push({ type: 'zoocage', position: [-14, 0, zooOffset + z] });
        items.push({ type: 'zoocage', position: [14, 0, zooOffset + z] });
      }
      
      for (let z = 5; z < 50; z += 15) {
        items.push({ type: 'zoorock', position: [-8, 0, zooOffset + z] });
        items.push({ type: 'zoorock', position: [8, 0, zooOffset + z] });
      }
      
      for (let z = 0; z < 50; z += 20) {
        items.push({ type: 'zooanimal', position: [-14, 0, zooOffset + z + 3], animalType: 'lion' });
        items.push({ type: 'zooanimal', position: [14, 0, zooOffset + z + 3], animalType: 'elephant' });
      }
      
      for (let z = -10; z < 55; z += 8) {
        items.push({ type: 'tropicalplant', position: [-18, 0, zooOffset + z] });
        items.push({ type: 'tropicalplant', position: [18, 0, zooOffset + z] });
      }
    } else if (level === 9 || level === 11 || level === 13) {
      for (let z = 5; z < 50; z += 18) {
        items.push({ type: 'zoopond', position: [0, 0, zooOffset + z] });
      }
      
      for (let z = 0; z < 50; z += 12) {
        items.push({ type: 'zooanimal', position: [-8, 0, zooOffset + z], animalType: 'penguin' });
        items.push({ type: 'zooanimal', position: [8, 0, zooOffset + z], animalType: 'penguin' });
      }
      
      for (let z = -5; z < 55; z += 8) {
        items.push({ type: 'tropicalplant', position: [-16, 0, zooOffset + z] });
        items.push({ type: 'tropicalplant', position: [16, 0, zooOffset + z] });
      }
      
      for (let z = 10; z < 50; z += 15) {
        items.push({ type: 'zoorock', position: [-12, 0, zooOffset + z] });
        items.push({ type: 'zoorock', position: [12, 0, zooOffset + z] });
      }
    } else if (level === 14) {
      // Boss 2 arena - decorations around z=295 where the boss spawns
      const bossArenaOffset = 255;
      
      for (let z = -10; z < 110; z += 12) {
        items.push({ type: 'bossarenatree', position: [-25, 0, bossArenaOffset + z] });
        items.push({ type: 'bossarenatree', position: [25, 0, bossArenaOffset + z] });
      }
      
      for (let z = -5; z < 110; z += 18) {
        items.push({ type: 'redflag', position: [-20, 0, bossArenaOffset + z] });
        items.push({ type: 'redflag', position: [20, 0, bossArenaOffset + z] });
      }
      
      for (let z = 0; z < 100; z += 15) {
        items.push({ type: 'zoocage', position: [-16, 0, bossArenaOffset + z] });
        items.push({ type: 'zoocage', position: [16, 0, bossArenaOffset + z] });
      }
      
      items.push({ type: 'zoopond', position: [0, 0, bossArenaOffset + 95] });
      
      for (let z = 5; z < 100; z += 20) {
        items.push({ type: 'zoorock', position: [-12, 0, bossArenaOffset + z] });
        items.push({ type: 'zoorock', position: [12, 0, bossArenaOffset + z] });
      }
      
      for (let z = -8; z < 115; z += 10) {
        items.push({ type: 'tropicalplant', position: [-22, 0, bossArenaOffset + z] });
        items.push({ type: 'tropicalplant', position: [22, 0, bossArenaOffset + z] });
      }
    }
    
    return items;
  }, [level]);
  
  useEffect(() => {
    const obstacles: Obstacle[] = props.map(prop => {
      const [x, y, z] = prop.position;
      let size = { x: 1, y: 1, z: 1 };
      
      switch (prop.type) {
        case 'lamp':
          size = { x: 0.3, y: 3.5, z: 0.3 };
          break;
        case 'bench':
          size = { x: 1.2, y: 1, z: 0.6 };
          break;
        case 'car':
          size = { x: 1.5, y: 1, z: 3 };
          break;
        case 'planter':
          size = { x: 1, y: 1.2, z: 1 };
          break;
        case 'fountain':
          size = { x: 3, y: 1.5, z: 3 };
          break;
        case 'parkbench':
          size = { x: 1.5, y: 1, z: 0.7 };
          break;
        case 'bigfountain':
          size = { x: 8, y: 3, z: 8 };
          break;
        case 'zoocage':
          size = { x: 3, y: 2, z: 3 };
          break;
        case 'zoorock':
          size = { x: 1.2, y: 0.8, z: 1.2 };
          break;
        case 'zoopond':
          size = { x: 5, y: 0.2, z: 5 };
          break;
        case 'tropicalplant':
          size = { x: 0.6, y: 1.2, z: 0.6 };
          break;
        case 'zooanimal':
          size = { x: 0.8, y: 1, z: 1 };
          break;
        case 'bossarenatree':
          size = { x: 1, y: 4, z: 1 };
          break;
      }
      
      return {
        position: { x, y, z },
        size
      };
    });
    
    setObstacles(obstacles);
  }, [props, setObstacles]);
  
  if (level < 1 || level > 14) return null;
  
  return (
    <group>
      {props.map((prop, index) => {
        if (prop.type === 'lamp') {
          return <StreetLamp key={`lamp-${index}`} position={prop.position} />;
        } else if (prop.type === 'bench') {
          return <Bench key={`bench-${index}`} position={prop.position} />;
        } else if (prop.type === 'car') {
          return <Car key={`car-${index}`} position={prop.position} color={prop.color || '#ff0000'} />;
        } else if (prop.type === 'planter') {
          return <Planter key={`planter-${index}`} position={prop.position} />;
        } else if (prop.type === 'fountain') {
          return <Fountain key={`fountain-${index}`} position={prop.position} />;
        } else if (prop.type === 'parkbench') {
          return <ParkBench key={`parkbench-${index}`} position={prop.position} />;
        } else if (prop.type === 'bigfountain') {
          return <BigFountain key={`bigfountain-${index}`} position={prop.position} />;
        } else if (prop.type === 'zoocage') {
          return <ZooCage key={`zoocage-${index}`} position={prop.position} />;
        } else if (prop.type === 'zoorock') {
          return <ZooRock key={`zoorock-${index}`} position={prop.position} />;
        } else if (prop.type === 'zoopond') {
          return <ZooPond key={`zoopond-${index}`} position={prop.position} />;
        } else if (prop.type === 'tropicalplant') {
          return <TropicalPlant key={`tropicalplant-${index}`} position={prop.position} />;
        } else if (prop.type === 'zooanimal') {
          return <ZooAnimal key={`zooanimal-${index}`} position={prop.position} animalType={prop.animalType || 'lion'} />;
        } else if (prop.type === 'bossarenatree') {
          return <BossArenaTree key={`bossarenatree-${index}`} position={prop.position} />;
        } else if (prop.type === 'redflag') {
          return <RedFlag key={`redflag-${index}`} position={prop.position} />;
        }
        return null;
      })}
    </group>
  );
}
