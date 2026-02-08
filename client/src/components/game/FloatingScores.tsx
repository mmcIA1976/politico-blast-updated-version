import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { Text, Billboard } from "@react-three/drei";

export function FloatingScores() {
  const scorePopups = useArcadeGame((state) => state.scorePopups);

  return (
    <group>
      {scorePopups.map((popup) => {
        const progress = 1 - popup.lifetime / popup.maxLifetime;
        const opacity = progress < 0.7 ? 1 : 1 - ((progress - 0.7) / 0.3);
        const scale = 1 + progress * 0.5;

        return (
          <Billboard
            key={popup.id}
            position={[popup.position.x, popup.position.y, popup.position.z]}
          >
            <Text
              fontSize={0.8 * scale}
              color="#ff0000"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              outlineWidth={0.06}
              outlineColor="#000000"
              fillOpacity={opacity}
              outlineOpacity={opacity}
            >
              +{popup.points}
            </Text>
          </Billboard>
        );
      })}
    </group>
  );
}
