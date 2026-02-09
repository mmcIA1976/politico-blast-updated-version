import { useEffect, useState, useCallback, useRef } from "react";
import { useArcadeGame, type TouchControls as TouchControlsType } from "@/lib/stores/useArcadeGame";

type DiagonalControl = "forward-left" | "forward-right" | "back-left" | "back-right";
type DpadControl = "forward" | "back" | "left" | "right" | DiagonalControl;

const DPAD_CONTROLS: DpadControl[] = [
  "forward-left", "forward", "forward-right",
  "left", "right",
  "back-left", "back", "back-right",
];

function setDpadDirection(control: DpadControl | null, setTouchControl: (key: keyof TouchControlsType, value: boolean) => void) {
  setTouchControl("forward", false);
  setTouchControl("back", false);
  setTouchControl("left", false);
  setTouchControl("right", false);

  if (!control) return;

  if (control === "forward") setTouchControl("forward", true);
  else if (control === "back") setTouchControl("back", true);
  else if (control === "left") setTouchControl("left", true);
  else if (control === "right") setTouchControl("right", true);
  else if (control === "forward-left") { setTouchControl("forward", true); setTouchControl("left", true); }
  else if (control === "forward-right") { setTouchControl("forward", true); setTouchControl("right", true); }
  else if (control === "back-left") { setTouchControl("back", true); setTouchControl("left", true); }
  else if (control === "back-right") { setTouchControl("back", true); setTouchControl("right", true); }
}

export function MobileControls() {
  const { phase, setTouchControl } = useArcadeGame();
  const [isMobile, setIsMobile] = useState(false);
  const activeDpadRef = useRef<DpadControl | null>(null);
  const dpadButtonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const shootingRef = useRef(false);
  const grenadeRef = useRef(false);
  const [renderTick, setRenderTick] = useState(0);
  const lastRenderRef = useRef(0);

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
      setTouchControl("throwingGrenade", false);
    };
  }, [setTouchControl]);

  const scheduleRender = useCallback(() => {
    const now = performance.now();
    if (now - lastRenderRef.current > 50) {
      lastRenderRef.current = now;
      setRenderTick(n => n + 1);
    }
  }, []);

  const findDpadControlAtPoint = useCallback((x: number, y: number): DpadControl | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return null;
    const control = el.getAttribute("data-dpad");
    if (control && DPAD_CONTROLS.includes(control as DpadControl)) {
      return control as DpadControl;
    }
    return null;
  }, []);

  const handleDpadTouch = useCallback((x: number, y: number) => {
    const control = findDpadControlAtPoint(x, y);
    if (control !== activeDpadRef.current) {
      activeDpadRef.current = control;
      setDpadDirection(control, setTouchControl);
      scheduleRender();
    }
  }, [findDpadControlAtPoint, setTouchControl, scheduleRender]);

  const handleDpadEnd = useCallback(() => {
    activeDpadRef.current = null;
    setDpadDirection(null, setTouchControl);
    scheduleRender();
  }, [setTouchControl, scheduleRender]);

  const onDpadTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) handleDpadTouch(touch.clientX, touch.clientY);
  }, [handleDpadTouch]);

  const onDpadTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) handleDpadTouch(touch.clientX, touch.clientY);
  }, [handleDpadTouch]);

  const onDpadTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleDpadEnd();
  }, [handleDpadEnd]);

  if (!isMobile || phase !== "playing") return null;

  const isDpadActive = (control: DpadControl) => activeDpadRef.current === control;

  const getDpadButtonStyle = (control: DpadControl, size: "normal" | "small" = "normal") => {
    const active = isDpadActive(control);
    const btnSize = size === "small" ? "44px" : "52px";
    const fontSize = size === "small" ? "16px" : "20px";
    
    return {
      width: btnSize,
      height: btnSize,
      borderRadius: "50%",
      backgroundColor: active ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.35)",
      border: active ? "3px solid rgba(255, 255, 255, 1)" : "2px solid rgba(255, 255, 255, 0.6)",
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
      pointerEvents: "none" as const,
    };
  };

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
          touchAction: "none",
        }}
        onTouchStart={onDpadTouchStart}
        onTouchMove={onDpadTouchMove}
        onTouchEnd={onDpadTouchEnd}
        onTouchCancel={onDpadTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        <button data-dpad="forward-left" style={getDpadButtonStyle("forward-left", "small")}>↖</button>
        <button data-dpad="forward" style={getDpadButtonStyle("forward")}>▲</button>
        <button data-dpad="forward-right" style={getDpadButtonStyle("forward-right", "small")}>↗</button>
        
        <button data-dpad="left" style={getDpadButtonStyle("left")}>◄</button>
        <div style={{ width: "52px", height: "52px" }} />
        <button data-dpad="right" style={getDpadButtonStyle("right")}>►</button>
        
        <button data-dpad="back-left" style={getDpadButtonStyle("back-left", "small")}>↙</button>
        <button data-dpad="back" style={getDpadButtonStyle("back")}>▼</button>
        <button data-dpad="back-right" style={getDpadButtonStyle("back-right", "small")}>↘</button>
      </div>
      
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          style={{
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            fontSize: "24px",
            fontWeight: "bold",
            backgroundColor: grenadeRef.current ? "rgba(80, 200, 80, 0.9)" : "rgba(50, 150, 50, 0.6)",
            border: grenadeRef.current ? "4px solid rgba(180, 255, 180, 1)" : "3px solid rgba(100, 200, 100, 0.8)",
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
            grenadeRef.current = true;
            setTouchControl("throwingGrenade", true);
            scheduleRender();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            grenadeRef.current = false;
            setTouchControl("throwingGrenade", false);
            scheduleRender();
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            grenadeRef.current = false;
            setTouchControl("throwingGrenade", false);
            scheduleRender();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            grenadeRef.current = false;
            setTouchControl("throwingGrenade", false);
            scheduleRender();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          💣
        </button>
        
        <button
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            fontSize: "12px",
            fontWeight: "bold",
            backgroundColor: shootingRef.current ? "rgba(255, 80, 80, 0.9)" : "rgba(255, 50, 50, 0.6)",
            border: shootingRef.current ? "4px solid rgba(255, 180, 180, 1)" : "3px solid rgba(255, 100, 100, 0.8)",
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
            shootingRef.current = true;
            setTouchControl("shooting", true);
            scheduleRender();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            shootingRef.current = false;
            setTouchControl("shooting", false);
            scheduleRender();
          }}
          onPointerCancel={(e) => {
            e.preventDefault();
            shootingRef.current = false;
            setTouchControl("shooting", false);
            scheduleRender();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            shootingRef.current = false;
            setTouchControl("shooting", false);
            scheduleRender();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          FUEGO
        </button>
      </div>
    </div>
  );
}
