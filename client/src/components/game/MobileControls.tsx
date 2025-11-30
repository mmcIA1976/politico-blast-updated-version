import { useEffect, useState, useCallback, useRef } from "react";
import { useArcadeGame, type TouchControls as TouchControlsType } from "@/lib/stores/useArcadeGame";

export function MobileControls() {
  const { phase, setTouchControl } = useArcadeGame();
  const [isMobile, setIsMobile] = useState(false);
  const [activeControls, setActiveControls] = useState<Set<string>>(new Set());
  const activeTouches = useRef<Map<number, keyof TouchControlsType>>(new Map());
  
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
  
  const handlePointerDown = useCallback((control: keyof TouchControlsType, pointerId: number) => {
    activeTouches.current.set(pointerId, control);
    setTouchControl(control, true);
    setActiveControls(prev => new Set(prev).add(control));
  }, [setTouchControl]);
  
  const handlePointerUp = useCallback((control: keyof TouchControlsType, pointerId: number) => {
    activeTouches.current.delete(pointerId);
    setTouchControl(control, false);
    setActiveControls(prev => {
      const next = new Set(prev);
      next.delete(control);
      return next;
    });
  }, [setTouchControl]);
  
  const handlePointerLeave = useCallback((control: keyof TouchControlsType, pointerId: number) => {
    if (activeTouches.current.get(pointerId) === control) {
      activeTouches.current.delete(pointerId);
      setTouchControl(control, false);
      setActiveControls(prev => {
        const next = new Set(prev);
        next.delete(control);
        return next;
      });
    }
  }, [setTouchControl]);
  
  if (!isMobile || phase !== "playing") return null;
  
  const getButtonStyle = (control: keyof TouchControlsType) => {
    const isActive = activeControls.has(control);
    return {
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      backgroundColor: isActive ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.35)",
      border: isActive ? "3px solid rgba(255, 255, 255, 1)" : "2px solid rgba(255, 255, 255, 0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "22px",
      color: "white",
      userSelect: "none" as const,
      WebkitUserSelect: "none" as const,
      touchAction: "none" as const,
      WebkitTapHighlightColor: "transparent",
      outline: "none",
    };
  };
  
  const createButtonProps = (control: keyof TouchControlsType) => ({
    style: getButtonStyle(control),
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
        height: "220px",
        pointerEvents: "auto",
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        padding: "15px 20px",
        touchAction: "none",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "56px 56px 56px",
          gridTemplateRows: "56px 56px 56px",
          gap: "4px",
        }}
      >
        <div />
        <button {...createButtonProps("forward")}>▲</button>
        <div />
        
        <button {...createButtonProps("left")}>◄</button>
        <div />
        <button {...createButtonProps("right")}>►</button>
        
        <div />
        <button {...createButtonProps("back")}>▼</button>
        <div />
      </div>
      
      <button
        style={{
          width: "85px",
          height: "85px",
          borderRadius: "50%",
          fontSize: "13px",
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
