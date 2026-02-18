import React, { useState, useEffect } from "react";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";
import { useAudio } from "@/lib/stores/useAudio";

export function HUD() {
  const lives = useArcadeGame(s => s.lives);
  const score = useArcadeGame(s => s.score);
  const level = useArcadeGame(s => s.level);
  const phase = useArcadeGame(s => s.phase);
  const setPhase = useArcadeGame(s => s.setPhase);
  const restart = useArcadeGame(s => s.restart);
  const activePowerUps = useArcadeGame(s => s.activePowerUps);
  const grenadeCount = useArcadeGame(s => s.grenadeCount);
  const armorCharges = useArcadeGame(s => s.armorCharges);
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
        justifyContent: "flex-end",
        background: "#000",
        color: "white",
        fontFamily: "'Inter', sans-serif",
        zIndex: 1000,
        overflow: "hidden",
      }}>
        <img
          src="/textures/menu_hero.png"
          alt="Commando Politico"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
          }}
        />
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.92) 80%)",
        }} />

        <div style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingBottom: isMobile ? "30px" : "50px",
          padding: isMobile ? "0 16px 30px" : "0 20px 50px",
          boxSizing: "border-box",
        }}>
          <h1 style={{
            fontSize: isMobile ? "2rem" : "3.5rem",
            fontWeight: 900,
            color: "#ffdd00",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: isMobile ? "2px" : "6px",
            textShadow: "3px 3px 0 #c00, 6px 6px 0 rgba(0,0,0,0.5), 0 0 30px rgba(255,200,0,0.4)",
            margin: "0 0 6px 0",
            lineHeight: 1.1,
          }}>
            COMMANDO POLITICO
          </h1>
          <p style={{
            fontSize: isMobile ? "0.8rem" : "1.1rem",
            color: "#ffaa00",
            textAlign: "center",
            margin: "0 0 16px 0",
            fontWeight: 600,
            letterSpacing: "1px",
            textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
          }}>
            ¡Defiende las calles de los politicos corruptos!
          </p>

          <div style={{
            background: "rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 200, 0, 0.3)",
            borderRadius: "10px",
            padding: isMobile ? "10px 16px" : "14px 28px",
            marginBottom: isMobile ? "16px" : "24px",
            maxWidth: "420px",
            width: "100%",
            boxSizing: "border-box",
            backdropFilter: "blur(4px)",
          }}>
            <div style={{
              fontSize: isMobile ? "0.7rem" : "0.85rem",
              textAlign: "center",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "8px",
              color: "#ffdd00",
            }}>
              CONTROLES
            </div>
            {isMobile ? (
              <div style={{ fontSize: "0.8rem", textAlign: "center", lineHeight: 1.8 }}>
                <div><span style={{ color: "#ffdd00" }}>D-PAD</span> - Mover al personaje</div>
                <div><span style={{ color: "#ff4444" }}>FUEGO</span> - Disparar</div>
                <div><span style={{ color: "#44cc44" }}>GRANADA</span> - Lanzar granada</div>
              </div>
            ) : (
              <div style={{ fontSize: "0.9rem", textAlign: "center", lineHeight: 1.8 }}>
                <div><span style={{ color: "#ffdd00" }}>WASD / Flechas</span> - Mover</div>
                <div><span style={{ color: "#ff4444" }}>Espacio</span> - Disparar</div>
                <div><span style={{ color: "#44cc44" }}>G</span> - Lanzar granada</div>
              </div>
            )}
          </div>

          <button
            onClick={() => setPhase("playing")}
            style={{
              padding: isMobile ? "14px 40px" : "16px 60px",
              fontSize: isMobile ? "1.3rem" : "1.6rem",
              fontWeight: 900,
              background: "linear-gradient(180deg, #ff4444 0%, #cc0000 100%)",
              color: "white",
              border: "3px solid #ffdd00",
              borderRadius: "12px",
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: "3px",
              textShadow: "2px 2px 0 rgba(0,0,0,0.5)",
              boxShadow: "0 6px 20px rgba(255,0,0,0.4), 0 0 40px rgba(255,200,0,0.15)",
              transition: "transform 0.1s, box-shadow 0.1s",
            }}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
            }}
            onPointerUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            COMENZAR
          </button>
        </div>
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
