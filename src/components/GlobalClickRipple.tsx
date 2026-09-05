"use client";

import { useEffect, useState, useCallback } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function GlobalClickRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback((e: MouseEvent | TouchEvent) => {
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    } else {
      return;
    }

    const newRipple: Ripple = {
      id: Date.now() + Math.random(),
      x: clientX,
      y: clientY,
    };

    setRipples((prev) => [...prev.slice(-5), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 320);
  }, []);

  useEffect(() => {
    window.addEventListener("pointerdown", handleClick, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", handleClick);
    };
  }, [handleClick]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-click-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
