import { useArcadeGame } from "@/lib/stores/useArcadeGame";

export function HUD() {
  const { lives, score, level, phase, setPhase, restart } = useArcadeGame();
  
  if (phase === "menu") {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        fontFamily: "Inter, sans-serif",
        zIndex: 1000,
      }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#ffff00" }}>
          COMMANDO POLÍTICO
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem", textAlign: "center", maxWidth: "600px" }}>
          ¡Defiéndete de los políticos corruptos en las calles de España!
        </p>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <p style={{ marginBottom: "0.5rem" }}>🎮 WASD o Flechas - Mover</p>
          <p>🔫 Espacio - Disparar</p>
        </div>
        <button
          onClick={() => setPhase("playing")}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.5rem",
            background: "#ff6b6b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          COMENZAR
        </button>
      </div>
    );
  }
  
  if (phase === "ended") {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        fontFamily: "Inter, sans-serif",
        zIndex: 1000,
      }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#ff0000" }}>
          GAME OVER
        </h1>
        <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
          Puntuación Final: {score}
        </p>
        <button
          onClick={() => restart()}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.5rem",
            background: "#ff6b6b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          REINTENTAR
        </button>
      </div>
    );
  }
  
  if (phase === "victory") {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        fontFamily: "Inter, sans-serif",
        zIndex: 1000,
      }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#00ff00" }}>
          ¡VICTORIA!
        </h1>
        <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
          ¡Has derrotado al jefe final! Puntuación: {score}
        </p>
        <button
          onClick={() => restart()}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.5rem",
            background: "#ff6b6b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          JUGAR DE NUEVO
        </button>
      </div>
    );
  }
  
  return (
    <div style={{
      position: "fixed",
      top: "20px",
      left: "20px",
      background: "rgba(0, 0, 0, 0.7)",
      color: "white",
      padding: "15px 25px",
      borderRadius: "8px",
      fontFamily: "Inter, sans-serif",
      fontSize: "1.2rem",
      zIndex: 100,
    }}>
      <div style={{ marginBottom: "8px" }}>
        ❤️ Vidas: {lives}
      </div>
      <div style={{ marginBottom: "8px" }}>
        ⭐ Puntos: {score}
      </div>
      <div>
        📍 Nivel: {level}
      </div>
    </div>
  );
}
