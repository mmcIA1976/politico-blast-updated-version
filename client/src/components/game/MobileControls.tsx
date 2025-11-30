import { useEffect, useState } from "react";
import { useArcadeGame, type TouchControls as TouchControlsType } from "@/lib/stores/useArcadeGame";

export function MobileControls() {
  const { phase, setTouchControl, touchControls } = useArcadeGame();
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
    return () => {
      setTouchControl("forward", false);
      setTouchControl("back", false);
      setTouchControl("left", false);
      setTouchControl("right", false);
      setTouchControl("shooting", false);
    };
  }, [setTouchControl]);
  
  if (!isMobile || phase !== "playing") return null;
  
  const handleTouchStart = (control: keyof TouchControlsType) => {
    setTouchControl(control, true);
  };
  
  const handleTouchEnd = (control: keyof TouchControlsType) => {
    setTouchControl(control, false);
  };
  
  const getButtonStyle = (control: keyof TouchControlsType) => ({
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: touchControls[control] ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.3)",
    border: touchControls[control] ? "3px solid rgba(255, 255, 255, 0.9)" : "2px solid rgba(255, 255, 255, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "white",
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    touchAction: "none" as const,
    transition: "background-color 0.1s, border 0.1s",
  });
  
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "200px",
        pointerEvents: "auto",
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        padding: "20px",
        touchAction: "none",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "60px 60px 60px",
          gridTemplateRows: "60px 60px 60px",
          gap: "5px",
        }}
      >
        <div />
        <button
          style={getButtonStyle("forward")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("forward"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("forward"); }}
          onTouchCancel={(e) => { e.preventDefault(); handleTouchEnd("forward"); }}
          onMouseDown={() => handleTouchStart("forward")}
          onMouseUp={() => handleTouchEnd("forward")}
          onMouseLeave={() => handleTouchEnd("forward")}
        >
          ▲
        </button>
        <div />
        
        <button
          style={getButtonStyle("left")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("left"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("left"); }}
          onTouchCancel={(e) => { e.preventDefault(); handleTouchEnd("left"); }}
          onMouseDown={() => handleTouchStart("left")}
          onMouseUp={() => handleTouchEnd("left")}
          onMouseLeave={() => handleTouchEnd("left")}
        >
          ◄
        </button>
        <div />
        <button
          style={getButtonStyle("right")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("right"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("right"); }}
          onTouchCancel={(e) => { e.preventDefault(); handleTouchEnd("right"); }}
          onMouseDown={() => handleTouchStart("right")}
          onMouseUp={() => handleTouchEnd("right")}
          onMouseLeave={() => handleTouchEnd("right")}
        >
          ►
        </button>
        
        <div />
        <button
          style={getButtonStyle("back")}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart("back"); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("back"); }}
          onTouchCancel={(e) => { e.preventDefault(); handleTouchEnd("back"); }}
          onMouseDown={() => handleTouchStart("back")}
          onMouseUp={() => handleTouchEnd("back")}
          onMouseLeave={() => handleTouchEnd("back")}
        >
          ▼
        </button>
        <div />
      </div>
      
      <button
        style={{
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          fontSize: "14px",
          fontWeight: "bold",
          backgroundColor: touchControls.shooting ? "rgba(255, 100, 100, 0.8)" : "rgba(255, 50, 50, 0.5)",
          border: touchControls.shooting ? "4px solid rgba(255, 150, 150, 1)" : "3px solid rgba(255, 100, 100, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          userSelect: "none" as const,
          WebkitUserSelect: "none" as const,
          touchAction: "none" as const,
          transition: "background-color 0.1s, border 0.1s",
        }}
        onTouchStart={(e) => { e.preventDefault(); handleTouchStart("shooting"); }}
        onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd("shooting"); }}
        onTouchCancel={(e) => { e.preventDefault(); handleTouchEnd("shooting"); }}
        onMouseDown={() => handleTouchStart("shooting")}
        onMouseUp={() => handleTouchEnd("shooting")}
        onMouseLeave={() => handleTouchEnd("shooting")}
      >
        FUEGO
      </button>
    </div>
  );
}
