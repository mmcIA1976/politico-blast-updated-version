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

export function StreetProps() {
  const { level, setObstacles } = useArcadeGame();
  
  const props = useMemo(() => {
    const items: Array<{ type: 'lamp' | 'bench' | 'car' | 'planter' | 'fountain' | 'parkbench'; position: [number, number, number]; color?: string }> = [];
    
    if (level === 1 || level === 3 || level === 5 || level === 7) {
      for (let z = -10; z < 200; z += 6) {
        items.push({ type: 'lamp', position: [-15, 0, z] });
        items.push({ type: 'lamp', position: [15, 0, z] });
      }
      
      const carColors = ['#ff0000', '#0000ff', '#ffff00', '#ffffff', '#000000', '#00ff00'];
      for (let z = -5; z < 200; z += 12) {
        const side = z % 24 === 5 ? -12 : 12;
        const colorIndex = Math.floor(z / 12) % carColors.length;
        items.push({ type: 'car', position: [side, 0, z], color: carColors[colorIndex] });
      }
      
      for (let z = -2; z < 200; z += 15) {
        const side = z % 30 === 8 ? -13 : 13;
        items.push({ type: 'bench', position: [side, 0, z] });
      }
    } else if (level === 2 || level === 4 || level === 6) {
      for (let z = -10; z < 200; z += 8) {
        items.push({ type: 'planter', position: [-14, 0, z] });
        items.push({ type: 'planter', position: [14, 0, z] });
      }
      
      for (let z = 0; z < 200; z += 20) {
        items.push({ type: 'fountain', position: [0, 0, z] });
      }
      
      for (let z = -5; z < 200; z += 12) {
        const side = z % 24 === 5 ? -11 : 11;
        items.push({ type: 'parkbench', position: [side, 0, z] });
      }
      
      for (let z = 5; z < 200; z += 10) {
        const side = z % 20 === 5 ? -8 : 8;
        items.push({ type: 'planter', position: [side, 0, z] });
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
      }
      
      return {
        position: { x, y, z },
        size
      };
    });
    
    setObstacles(obstacles);
  }, [props, setObstacles]);
  
  if (level < 1 || level > 7) return null;
  
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
        }
        return null;
      })}
    </group>
  );
}
