import React, { useEffect, useState, useCallback, useRef } from "react";
import { useArcadeGame, type TouchControls as TouchControlsType } from "@/lib/stores/useArcadeGame";

type DpadControl = "forward" | "back" | "left" | "right" | "forward-left" | "forward-right" | "back-left" | "back-right";

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

function getDpadControlFromPosition(relX: number, relY: number): DpadControl | null {
  const col = relX < 0.33 ? 0 : relX < 0.66 ? 1 : 2;
  const row = relY < 0.33 ? 0 : relY < 0.66 ? 1 : 2;

  if (row === 0 && col === 0) return "forward-left";
  if (row === 0 && col === 1) return "forward";
  if (row === 0 && col === 2) return "forward-right";
  if (row === 1 && col === 0) return "left";
  if (row === 1 && col === 2) return "right";
  if (row === 2 && col === 0) return "back-left";
  if (row === 2 && col === 1) return "back";
  if (row === 2 && col === 2) return "back-right";
  return null;
}

export function MobileControls() {
  const phase = useArcadeGame((s) => s.phase);
  const setTouchControl = useArcadeGame((s) => s.setTouchControl);
  const [isMobile, setIsMobile] = useState(false);
  const activeDpadRef = useRef<DpadControl | null>(null);
  const dpadContainerRef = useRef<HTMLDivElement>(null);
  const dpadTouchIdRef = useRef<number | null>(null);
  const shootTouchIdRef = useRef<number | null>(null);
  const grenadeTouchIdRef = useRef<number | null>(null);
  const shootingRef = useRef(false);
  const grenadeRef = useRef(false);
  const [renderTick, setRenderTick] = useState(0);
  const lastRenderRef = useRef(0);
  const setTouchControlRef = useRef(setTouchControl);
  setTouchControlRef.current = setTouchControl;

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
      setTouchControlRef.current("forward", false);
      setTouchControlRef.current("back", false);
      setTouchControlRef.current("left", false);
      setTouchControlRef.current("right", false);
      setTouchControlRef.current("shooting", false);
      setTouchControlRef.current("throwingGrenade", false);
    };
  }, []);

  const scheduleRender = useCallback(() => {
    const now = performance.now();
    if (now - lastRenderRef.current > 50) {
      lastRenderRef.current = now;
      setRenderTick(n => n + 1);
    }
  }, []);

  const resolveDpadTouch = useCallback((clientX: number, clientY: number) => {
    const container = dpadContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;

    if (relX < -0.15 || relX > 1.15 || relY < -0.15 || relY > 1.15) {
      if (activeDpadRef.current !== null) {
        activeDpadRef.current = null;
        setDpadDirection(null, setTouchControlRef.current);
        scheduleRender();
      }
      return;
    }

    const clamped = getDpadControlFromPosition(
      Math.max(0, Math.min(1, relX)),
      Math.max(0, Math.min(1, relY))
    );

    if (clamped !== activeDpadRef.current) {
      activeDpadRef.current = clamped;
      setDpadDirection(clamped, setTouchControlRef.current);
      scheduleRender();
    }
  }, [scheduleRender]);

  const findTouchById = useCallback((touches: React.TouchList, id: number): React.Touch | null => {
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].identifier === id) return touches[i];
    }
    return null;
  }, []);

  const onDpadTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (dpadTouchIdRef.current === null) {
        dpadTouchIdRef.current = t.identifier;
        resolveDpadTouch(t.clientX, t.clientY);
      }
    }
  }, [resolveDpadTouch]);

  const onDpadTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (dpadTouchIdRef.current === null) return;
    const t = findTouchById(e.touches, dpadTouchIdRef.current);
    if (t) resolveDpadTouch(t.clientX, t.clientY);
  }, [resolveDpadTouch, findTouchById]);

  const onDpadTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === dpadTouchIdRef.current) {
        dpadTouchIdRef.current = null;
        activeDpadRef.current = null;
        setDpadDirection(null, setTouchControlRef.current);
        scheduleRender();
        break;
      }
    }
  }, [scheduleRender]);

  const onShootTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (shootTouchIdRef.current === null && e.changedTouches.length > 0) {
      shootTouchIdRef.current = e.changedTouches[0].identifier;
      shootingRef.current = true;
      setTouchControlRef.current("shooting", true);
      scheduleRender();
    }
  }, [scheduleRender]);

  const onShootTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === shootTouchIdRef.current) {
        shootTouchIdRef.current = null;
        shootingRef.current = false;
        setTouchControlRef.current("shooting", false);
        scheduleRender();
        break;
      }
    }
  }, [scheduleRender]);

  const onGrenadeTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (grenadeTouchIdRef.current === null && e.changedTouches.length > 0) {
      grenadeTouchIdRef.current = e.changedTouches[0].identifier;
      grenadeRef.current = true;
      setTouchControlRef.current("throwingGrenade", true);
      scheduleRender();
    }
  }, [scheduleRender]);

  const onGrenadeTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === grenadeTouchIdRef.current) {
        grenadeTouchIdRef.current = null;
        grenadeRef.current = false;
        setTouchControlRef.current("throwingGrenade", false);
        scheduleRender();
        break;
      }
    }
  }, [scheduleRender]);

  useEffect(() => {
    if (!isMobile || phase !== "playing") return;

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      let activeTouchIds: number[] = [];
      for (let i = 0; i < e.touches.length; i++) {
        activeTouchIds.push(e.touches[i].identifier);
      }

      if (dpadTouchIdRef.current !== null && !activeTouchIds.includes(dpadTouchIdRef.current)) {
        dpadTouchIdRef.current = null;
        activeDpadRef.current = null;
        setDpadDirection(null, setTouchControlRef.current);
      }
      if (shootTouchIdRef.current !== null && !activeTouchIds.includes(shootTouchIdRef.current)) {
        shootTouchIdRef.current = null;
        shootingRef.current = false;
        setTouchControlRef.current("shooting", false);
      }
      if (grenadeTouchIdRef.current !== null && !activeTouchIds.includes(grenadeTouchIdRef.current)) {
        grenadeTouchIdRef.current = null;
        grenadeRef.current = false;
        setTouchControlRef.current("throwingGrenade", false);
      }
    };

    document.addEventListener("touchend", handleGlobalTouchEnd, { passive: true });
    document.addEventListener("touchcancel", handleGlobalTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchend", handleGlobalTouchEnd);
      document.removeEventListener("touchcancel", handleGlobalTouchEnd);
    };
  }, [isMobile, phase]);

  if (!isMobile || phase !== "playing") return null;

  const isDpadActive = (control: DpadControl) => activeDpadRef.current === control;

  const dpadBtnStyle = (control: DpadControl, size: "normal" | "small" = "normal"): React.CSSProperties => {
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
      userSelect: "none",
      WebkitUserSelect: "none",
      touchAction: "none",
      WebkitTapHighlightColor: "transparent",
      outline: "none",
      pointerEvents: "none",
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
        zIndex: 1100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        padding: "12px 15px",
        touchAction: "none",
      }}
    >
      <div
        ref={dpadContainerRef}
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
        <div style={dpadBtnStyle("forward-left", "small")}>↖</div>
        <div style={dpadBtnStyle("forward")}>▲</div>
        <div style={dpadBtnStyle("forward-right", "small")}>↗</div>

        <div style={dpadBtnStyle("left")}>◄</div>
        <div style={{ width: "52px", height: "52px" }} />
        <div style={dpadBtnStyle("right")}>►</div>

        <div style={dpadBtnStyle("back-left", "small")}>↙</div>
        <div style={dpadBtnStyle("back")}>▼</div>
        <div style={dpadBtnStyle("back-right", "small")}>↘</div>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div
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
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "none",
            WebkitTapHighlightColor: "transparent",
            outline: "none",
          }}
          onTouchStart={onGrenadeTouchStart}
          onTouchEnd={onGrenadeTouchEnd}
          onTouchCancel={onGrenadeTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          💣
        </div>

        <div
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
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "none",
            WebkitTapHighlightColor: "transparent",
            outline: "none",
          }}
          onTouchStart={onShootTouchStart}
          onTouchEnd={onShootTouchEnd}
          onTouchCancel={onShootTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          FUEGO
        </div>
      </div>
    </div>
  );
}
