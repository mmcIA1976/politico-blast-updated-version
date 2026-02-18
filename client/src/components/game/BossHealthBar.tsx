import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function BossHealthBar() {
  const { enemies, level } = useArcadeGame();
  
  const boss = enemies.find(e => e.type === "boss" || e.type === "toucan");
  
  if (!boss) return null;
  
  const isToucan = boss.type === "toucan";
  const maxHealth = isToucan ? 20 : 15;
  const healthPercentage = (boss.health / maxHealth) * 100;
  const bossName = isToucan ? "YOLANDA DÍAZ" : "MARÍA JESÚS MONTERO (LA CHIKI)";
  
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
