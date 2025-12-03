import { useEffect, useState, useCallback, useRef } from "react";
import { useArcadeGame, type TouchControls as TouchControlsType } from "@/lib/stores/useArcadeGame";

type DiagonalControl = "forward-left" | "forward-right" | "back-left" | "back-right";
type AllControls = keyof TouchControlsType | DiagonalControl;

export function MobileControls() {
  const { phase, setTouchControl } = useArcadeGame();
  const [isMobile, setIsMobile] = useState(false);
  const [activeControls, setActiveControls] = useState<Set<string>>(new Set());
  const activeTouches = useRef<Map<number, AllControls>>(new Map());
  
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
  
  const activateDiagonal = useCallback((diagonal: DiagonalControl) => {
    if (diagonal === "forward-left") {
      setTouchControl("forward", true);
      setTouchControl("left", true);
    } else if (diagonal === "forward-right") {
      setTouchControl("forward", true);
      setTouchControl("right", true);
    } else if (diagonal === "back-left") {
      setTouchControl("back", true);
      setTouchControl("left", true);
    } else if (diagonal === "back-right") {
      setTouchControl("back", true);
      setTouchControl("right", true);
    }
  }, [setTouchControl]);
  
  const deactivateDiagonal = useCallback((diagonal: DiagonalControl) => {
    if (diagonal === "forward-left") {
      setTouchControl("forward", false);
      setTouchControl("left", false);
    } else if (diagonal === "forward-right") {
      setTouchControl("forward", false);
      setTouchControl("right", false);
    } else if (diagonal === "back-left") {
      setTouchControl("back", false);
      setTouchControl("left", false);
    } else if (diagonal === "back-right") {
      setTouchControl("back", false);
      setTouchControl("right", false);
    }
  }, [setTouchControl]);
  
  const handlePointerDown = useCallback((control: AllControls, pointerId: number) => {
    activeTouches.current.set(pointerId, control);
    setActiveControls(prev => new Set(prev).add(control));
    
    if (control === "forward-left" || control === "forward-right" || 
        control === "back-left" || control === "back-right") {
      activateDiagonal(control);
    } else {
      setTouchControl(control as keyof TouchControlsType, true);
    }
  }, [setTouchControl, activateDiagonal]);
  
  const handlePointerUp = useCallback((control: AllControls, pointerId: number) => {
    activeTouches.current.delete(pointerId);
    setActiveControls(prev => {
      const next = new Set(prev);
      next.delete(control);
      return next;
    });
    
    if (control === "forward-left" || control === "forward-right" || 
        control === "back-left" || control === "back-right") {
      deactivateDiagonal(control);
    } else {
      setTouchControl(control as keyof TouchControlsType, false);
    }
  }, [setTouchControl, deactivateDiagonal]);
  
  const handlePointerLeave = useCallback((control: AllControls, pointerId: number) => {
    if (activeTouches.current.get(pointerId) === control) {
      handlePointerUp(control, pointerId);
    }
  }, [handlePointerUp]);
  
  if (!isMobile || phase !== "playing") return null;
  
  const getButtonStyle = (control: AllControls, size: "normal" | "small" = "normal") => {
    const isActive = activeControls.has(control);
    const btnSize = size === "small" ? "44px" : "52px";
    const fontSize = size === "small" ? "16px" : "20px";
    
    return {
      width: btnSize,
      height: btnSize,
      borderRadius: "50%",
      backgroundColor: isActive ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.35)",
      border: isActive ? "3px solid rgba(255, 255, 255, 1)" : "2px solid rgba(255, 255, 255, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize,
      color: "white",
      userSelect: "none" as const,
      WebkitUserSelect: "none" as const,
      touchAction: "none" as const,
      WebkitTapHighlightColor: "transparent",
      outline: "none",
    };
  };
  
  const createButtonProps = (control: AllControls, size: "normal" | "small" = "normal") => ({
    style: getButtonStyle(control, size),
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handlePointerDown(control, e.pointerId);
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      handlePointerUp(control, e.pointerId);
    },
    onPointerCancel: (e: React.PointerEvent) => {
      e.preventDefault();
      handlePointerUp(control, e.pointerId);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      e.preventDefault();
      handlePointerLeave(control, e.pointerId);
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
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
        padding: "12px 15px",
        touchAction: "none",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "44px 52px 44px",
          gridTemplateRows: "44px 52px 44px",
          gap: "3px",
        }}
      >
        <button {...createButtonProps("forward-left", "small")}>↖</button>
        <button {...createButtonProps("forward")}>▲</button>
        <button {...createButtonProps("forward-right", "small")}>↗</button>
        
        <button {...createButtonProps("left")}>◄</button>
        <div style={{ width: "52px", height: "52px" }} />
        <button {...createButtonProps("right")}>►</button>
        
        <button {...createButtonProps("back-left", "small")}>↙</button>
        <button {...createButtonProps("back")}>▼</button>
        <button {...createButtonProps("back-right", "small")}>↘</button>
      </div>
      
      <button
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          fontSize: "12px",
          fontWeight: "bold",
          backgroundColor: activeControls.has("shooting") ? "rgba(255, 80, 80, 0.9)" : "rgba(255, 50, 50, 0.6)",
          border: activeControls.has("shooting") ? "4px solid rgba(255, 180, 180, 1)" : "3px solid rgba(255, 100, 100, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          userSelect: "none" as const,
          WebkitUserSelect: "none" as const,
          touchAction: "none" as const,
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          handlePointerDown("shooting", e.pointerId);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          handlePointerUp("shooting", e.pointerId);
        }}
        onPointerCancel={(e) => {
          e.preventDefault();
          handlePointerUp("shooting", e.pointerId);
        }}
        onPointerLeave={(e) => {
          e.preventDefault();
          handlePointerLeave("shooting", e.pointerId);
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        FUEGO
      </button>
    </div>
  );
}
