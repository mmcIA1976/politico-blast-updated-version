import { useMemo } from "react";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";
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
  const { level, scrollPosition } = useArcadeGame();
  
  const props = useMemo(() => {
    const items: Array<{ type: 'lamp' | 'bench' | 'car'; position: [number, number, number]; color?: string }> = [];
    
    if (level === 1 || level === 2) {
      for (let z = 0; z < 50; z += 6) {
        items.push({ type: 'lamp', position: [-15, 0, z] });
        items.push({ type: 'lamp', position: [15, 0, z] });
      }
      
      const carColors = ['#ff0000', '#0000ff', '#ffff00', '#ffffff', '#000000', '#00ff00'];
      for (let z = 5; z < 50; z += 12) {
        const side = z % 24 === 5 ? -12 : 12;
        const colorIndex = Math.floor(z / 12) % carColors.length;
        items.push({ type: 'car', position: [side, 0, z], color: carColors[colorIndex] });
      }
      
      for (let z = 8; z < 50; z += 15) {
        const side = z % 30 === 8 ? -13 : 13;
        items.push({ type: 'bench', position: [side, 0, z] });
      }
    }
    
    return items;
  }, [level]);
  
  if (level !== 1 && level !== 2) return null;
  
  return (
    <group position={[0, 0, scrollPosition]}>
      {props.map((prop, index) => {
        if (prop.type === 'lamp') {
          return <StreetLamp key={`lamp-${index}`} position={prop.position} />;
        } else if (prop.type === 'bench') {
          return <Bench key={`bench-${index}`} position={prop.position} />;
        } else if (prop.type === 'car') {
          return <Car key={`car-${index}`} position={prop.position} color={prop.color || '#ff0000'} />;
        }
        return null;
      })}
    </group>
  );
}
