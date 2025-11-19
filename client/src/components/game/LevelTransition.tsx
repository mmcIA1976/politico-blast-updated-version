import { useState, useEffect, useRef } from "react";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function LevelTransition() {
  const { level } = useArcadeGame();
  const [showTransition, setShowTransition] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(1);
  const prevLevelRef = useRef(1);

  useEffect(() => {
    if (level !== prevLevelRef.current && level > 1) {
      setDisplayLevel(level);
      setShowTransition(true);
      prevLevelRef.current = level;

      const timer = setTimeout(() => {
        setShowTransition(false);
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    } else if (level === 1) {
      prevLevelRef.current = 1;
      setShowTransition(false);
    }
  }, [level]);

  if (!showTransition) return null;

  const getLevelName = (lvl: number) => {
    switch (lvl) {
      case 2: return "NIVEL 2 - MADRID";
      case 3: return "NIVEL 3 - BARCELONA";
      case 4: return "NIVEL 4 - VALENCIA";
      case 5: return "NIVEL 5 - SEVILLA";
      case 6: return "NIVEL 6 - BILBAO";
      case 7: return "NIVEL 7 - JEFE FINAL";
      default: return `NIVEL ${lvl}`;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        pointerEvents: "none",
        animation: "levelFadeInOut 2s ease-in-out",
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#ffd700",
          textShadow: `
            0 0 5px #ffd700,
            0 0 10px #ffd700,
            0 0 15px #ff8c00,
            0 0 20px #ff8c00
          `,
          letterSpacing: "0.15em",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          WebkitTextStroke: "1px #000",
        }}
      >
        {getLevelName(displayLevel)}
      </div>
      <style>
        {`
          @keyframes levelFadeInOut {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
            }
            25% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            75% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
            }
          }
        `}
      </style>
    </div>
  );
}
