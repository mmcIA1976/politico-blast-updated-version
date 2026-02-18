import { useState, useEffect } from "react";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function BossHealthBar() {
  const enemies = useArcadeGame((s) => s.enemies);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 1024
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const boss = enemies.find(e => e.type === "boss" || e.type === "toucan");

  if (!boss) return null;

  const isToucan = boss.type === "toucan";
  const maxHealth = isToucan ? 20 : 15;
  const healthPercentage = (boss.health / maxHealth) * 100;
  const bossName = isToucan ? "YOLANDA DÍAZ" : "LA CHIKI";

  if (isMobile) {
    return (
      <div style={{
        position: "fixed",
        top: "6px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "180px",
        zIndex: 500,
        background: "rgba(0, 0, 0, 0.75)",
        padding: "4px 8px",
        borderRadius: "6px",
        border: "1px solid #ffd700",
        pointerEvents: "none",
        touchAction: "none",
      }}>
        <div style={{
          color: "#ffd700",
          fontSize: "10px",
          fontWeight: "bold",
          textAlign: "center",
          letterSpacing: "1px",
          marginBottom: "2px",
        }}>
          {bossName}
        </div>
        <div style={{
          width: "100%",
          height: "10px",
          background: "#333",
          borderRadius: "3px",
          overflow: "hidden",
          border: "1px solid #666"
        }}>
          <div style={{
            width: `${healthPercentage}%`,
            height: "100%",
            background: healthPercentage > 50 ? "#ef4444" : healthPercentage > 25 ? "#f59e0b" : "#dc2626",
            transition: "width 0.3s ease",
          }}></div>
        </div>
        <div style={{
          color: "#fff",
          fontSize: "9px",
          marginTop: "1px",
          textAlign: "center"
        }}>
          {boss.health}/{maxHealth}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: "80px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "400px",
      maxWidth: "90vw",
      zIndex: 500,
      background: "rgba(0, 0, 0, 0.8)",
      padding: "12px 20px",
      borderRadius: "8px",
      border: "2px solid #ffd700",
      pointerEvents: "none",
      touchAction: "none",
    }}>
      <div style={{
        color: "#ffd700",
        fontSize: "16px",
        fontWeight: "bold",
        marginBottom: "8px",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: "2px"
      }}>
        {bossName}
      </div>
      <div style={{
        width: "100%",
        height: "24px",
        background: "#333",
        borderRadius: "4px",
        overflow: "hidden",
        border: "2px solid #666"
      }}>
        <div style={{
          width: `${healthPercentage}%`,
          height: "100%",
          background: healthPercentage > 50 ? "#ef4444" : healthPercentage > 25 ? "#f59e0b" : "#dc2626",
          transition: "width 0.3s ease",
          boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)"
        }}></div>
      </div>
      <div style={{
        color: "#fff",
        fontSize: "14px",
        marginTop: "4px",
        textAlign: "center"
      }}>
        {boss.health} / {maxHealth} HP
      </div>
    </div>
  );
}
