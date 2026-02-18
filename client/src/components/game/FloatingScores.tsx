import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { Text, Billboard } from "@react-three/drei";
import { useMemo } from "react";

const MAX_VISIBLE_POPUPS = 15;

export function FloatingScores() {
  const scorePopups = useArcadeGame((state) => state.scorePopups);
  
  // Limitar cantidad de popups visibles para mejorar rendimiento
  const visiblePopups = useMemo(() => 
    scorePopups.slice(-MAX_VISIBLE_POPUPS), 
    [scorePopups]
  );

  return (
    <group>
      {visiblePopups.map((popup) => {
        const progress = 1 - popup.lifetime / popup.maxLifetime;
        const opacity = progress < 0.7 ? 1 : 1 - ((progress - 0.7) / 0.3);
        const scale = 1 + progress * 0.5;

        // Si points es 0, mostrar "ARMOR x2" (blindaje de caseta)
        // Si points es -1, mostrar "POWER UP!"
        const isArmorText = popup.points === 0;
        const isPowerUpText = popup.points === -1;
        const displayText = isArmorText ? "ARMOR x2" : (isPowerUpText ? "POWER UP!" : `+${popup.points}`);
        const textColor = isArmorText ? "#00bfff" : (isPowerUpText ? "#00ff00" : "#ff0000");
        const fontSize = (isArmorText || isPowerUpText) ? 1.2 : 0.8;
        const textScale = (isArmorText || isPowerUpText) ? (1 + progress * 0.8) : scale;
        
        return (
          <Billboard
            key={popup.id}
            position={[popup.position.x, popup.position.y, popup.position.z]}
          >
            <Text
              fontSize={fontSize * textScale}
              color={textColor}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              outlineWidth={isPowerUpText ? 0.1 : 0.06}
              outlineColor="#000000"
              fillOpacity={opacity}
              outlineOpacity={opacity}
              letterSpacing={isPowerUpText ? 0.05 : 0}
            >
              {displayText}
            </Text>
          </Billboard>
        );
      })}
    </group>
  );
}
