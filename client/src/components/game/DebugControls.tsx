import { useEffect } from "react";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function DebugControls() {
  const { setLevel, setScrollPosition, clearBattlefield, phase } = useArcadeGame();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      
      const levelMap: Record<string, { level: number; scroll: number }> = {
        "Digit1": { level: 1, scroll: 0 },
        "Digit2": { level: 2, scroll: 50 },
        "Digit3": { level: 3, scroll: 95 },
        "Digit4": { level: 4, scroll: 140 },
        "Digit5": { level: 5, scroll: 185 },
        "Digit6": { level: 6, scroll: 230 },
        "Digit7": { level: 7, scroll: 275 },
        "Digit8": { level: 8, scroll: 320 },
        "Digit9": { level: 9, scroll: 365 },
        "Digit0": { level: 14, scroll: 590 },
        "Minus": { level: 10, scroll: 410 },
        "Equal": { level: 11, scroll: 455 },
        "BracketLeft": { level: 12, scroll: 500 },
        "BracketRight": { level: 13, scroll: 545 },
      };

      if (levelMap[e.code]) {
        const { level, scroll } = levelMap[e.code];
        console.log(`DEBUG: Jumping to level ${level}`);
        clearBattlefield();
        setScrollPosition(scroll);
        setLevel(level);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, setLevel, setScrollPosition, clearBattlefield]);

  return null;
}
