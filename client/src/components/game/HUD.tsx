import { useState, useEffect } from "react";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { useAudio } from "@/lib/stores/useAudio";

export function HUD() {
  const { lives, score, level, phase, setPhase, restart, activePowerUps, grenadeCount, armorCharges } = useArcadeGame();
  const { isMuted, toggleMute } = useAudio();
  const [, setTick] = useState(0);
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
  
  useEffect(() => {
    if (activePowerUps.length > 0) {
      const interval = setInterval(() => {
        setTick(t => t + 1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activePowerUps.length > 0]);
  
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
        padding: "20px",
        boxSizing: "border-box",
      }}>
        <h1 style={{ 
          fontSize: isMobile ? "1.8rem" : "3rem", 
          marginBottom: "1rem", 
          color: "#ffff00",
          textAlign: "center",
        }}>
          COMMANDO POLÍTICO
        </h1>
        <p style={{ 
          fontSize: isMobile ? "0.9rem" : "1.2rem", 
          marginBottom: "1.5rem", 
          textAlign: "center", 
          maxWidth: "600px",
          padding: "0 10px",
        }}>
          ¡Defiéndete de los políticos corruptos en las calles de España!
        </p>
        <div style={{ marginBottom: "1.5rem", textAlign: "center", fontSize: isMobile ? "0.85rem" : "1rem" }}>
          {isMobile ? (
            <>
              <p style={{ marginBottom: "0.5rem" }}>👆 Usa los controles en pantalla</p>
              <p>🔴 Pulsa FUEGO para disparar</p>
            </>
          ) : (
            <>
              <p style={{ marginBottom: "0.5rem" }}>🎮 WASD o Flechas - Mover</p>
              <p style={{ marginBottom: "0.5rem" }}>🔫 Espacio - Disparar</p>
              <p>💣 G - Lanzar granada</p>
            </>
          )}
        </div>
        <button
          onClick={() => setPhase("playing")}
          style={{
            padding: isMobile ? "0.8rem 1.5rem" : "1rem 2rem",
            fontSize: isMobile ? "1.2rem" : "1.5rem",
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
        padding: "20px",
        boxSizing: "border-box",
      }}>
        <h1 style={{ fontSize: isMobile ? "2rem" : "3rem", marginBottom: "1rem", color: "#ff0000" }}>
          GAME OVER
        </h1>
        <p style={{ fontSize: isMobile ? "1.1rem" : "1.5rem", marginBottom: "2rem" }}>
          Puntuación Final: {score}
        </p>
        <button
          onClick={() => restart()}
          style={{
            padding: isMobile ? "0.8rem 1.5rem" : "1rem 2rem",
            fontSize: isMobile ? "1.2rem" : "1.5rem",
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
        padding: "20px",
        boxSizing: "border-box",
      }}>
        <h1 style={{ fontSize: isMobile ? "2rem" : "3rem", marginBottom: "1rem", color: "#00ff00" }}>
          ¡VICTORIA!
        </h1>
        <p style={{ fontSize: isMobile ? "1.1rem" : "1.5rem", marginBottom: "2rem", textAlign: "center" }}>
          ¡Has derrotado al jefe final! Puntuación: {score}
        </p>
        <button
          onClick={() => restart()}
          style={{
            padding: isMobile ? "0.8rem 1.5rem" : "1rem 2rem",
            fontSize: isMobile ? "1.2rem" : "1.5rem",
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
    <>
      <div style={{
        position: "fixed",
        top: isMobile ? "10px" : "20px",
        left: isMobile ? "10px" : "20px",
        background: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: isMobile ? "8px 12px" : "15px 25px",
        borderRadius: "8px",
        fontFamily: "Inter, sans-serif",
        fontSize: isMobile ? "0.85rem" : "1.2rem",
        zIndex: 100,
      }}>
        <div style={{ marginBottom: isMobile ? "4px" : "8px" }}>
          ❤️ {lives}
        </div>
        <div style={{ marginBottom: isMobile ? "4px" : "8px" }}>
          ⭐ {score}
        </div>
        <div style={{ marginBottom: isMobile ? "4px" : "8px" }}>
          📍 {level}
        </div>
        <div>
          💣 {grenadeCount}
        </div>
        <div>
          🛡️ {armorCharges}
        </div>
      </div>
      
      <button
        onClick={toggleMute}
        style={{
          position: "fixed",
          top: isMobile ? "10px" : "20px",
          right: isMobile ? "10px" : "20px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: isMobile ? "6px 10px" : "10px 15px",
          borderRadius: "8px",
          border: "2px solid white",
          cursor: "pointer",
          fontSize: isMobile ? "1.2rem" : "1.5rem",
          zIndex: 100,
        }}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
      
      {activePowerUps.length > 0 && (
        <div style={{
          position: "fixed",
          top: isMobile ? "55px" : "80px",
          right: isMobile ? "10px" : "20px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: isMobile ? "8px 12px" : "15px 25px",
          borderRadius: "8px",
          fontFamily: "Inter, sans-serif",
          fontSize: isMobile ? "0.75rem" : "1rem",
          zIndex: 100,
        }}>
          <div style={{ fontWeight: "bold", marginBottom: isMobile ? "4px" : "8px" }}>
            💪 POWER-UPS:
          </div>
          {activePowerUps.map((powerUp, index) => {
            let icon = "⚡";
            let label = isMobile ? "Veloz" : "Velocidad";
            
            if (powerUp.type === "tripleShot") {
              icon = "🔥";
              label = isMobile ? "Triple" : "Disparo Triple";
            } else if (powerUp.type === "powerShot") {
              icon = "💥";
              label = isMobile ? "Potente" : "Potente x2";
            }
            
            return (
              <div key={index} style={{ marginBottom: "4px" }}>
                {icon} {label}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
