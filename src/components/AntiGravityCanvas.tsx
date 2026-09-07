"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { AntiGravityMouseContext } from "./three/AntiGravityMouseContext";
import { useTheme } from "./ThemeProvider";

interface AntiGravityCanvasProps {
  children?: React.ReactNode;
}

interface MeshNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  colorKey: "primary" | "secondary" | "accent";
  isHub: boolean;
  pulsePhase: number;
  pulseSpeed: number;
  flare: number;
}

interface DataPacket {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
  colorKey: "primary" | "secondary" | "accent";
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export default function AntiGravityCanvas({ children }: AntiGravityCanvasProps) {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Keep live theme reference so animation frame always accesses latest colors without re-init
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // Motion values for child 3D tilt & parallax (preserves useAntiGravityMouse contract)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 45, damping: 26 });
  const smoothY = useSpring(mouseY, { stiffness: 45, damping: 26 });

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setupCanvasSize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setupCanvasSize();

    const isMobile = width < 768;

    // Pointer state with smooth interpolation
    const pointer = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
      down: false,
    };

    const handlePointerMove = (e: PointerEvent) => {
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;

      // Update framer-motion values for 3D tilt
      const normX = e.clientX / window.innerWidth - 0.5;
      const normY = e.clientY / window.innerHeight - 0.5;
      mouseX.set(normX);
      mouseY.set(normY);
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.targetX = -1000;
      pointer.targetY = -1000;
    };

    // Shockwaves pool
    const shockwaves: Shockwave[] = [];

    const handlePointerDown = (e: PointerEvent) => {
      pointer.down = true;
      pointer.targetX = e.clientX;
      pointer.targetY = e.clientY;
      pointer.active = true;

      // Spawn dynamic digital shockwave on click
      if (shockwaves.length < 5) {
        shockwaves.push({
          x: e.clientX,
          y: e.clientY,
          radius: 10,
          maxRadius: isMobile ? 140 : 220,
          alpha: 0.9,
          speed: isMobile ? 3.8 : 5.2,
        });
      }
    };

    const handlePointerUp = () => {
      pointer.down = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    const handleResize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      // On mobile, ignore small height changes from address bar collapse
      if (Math.abs(width - newW) > 10 || Math.abs(height - newH) > 120) {
        setupCanvasSize();
      }
    };
    window.addEventListener("resize", handleResize);

    // ==========================================
    // 1. Initialize Neural Mesh Nodes
    // ==========================================
    const nodeCount = isMobile ? 28 : Math.min(Math.floor((width * height) / 16000), 85);
    const nodes: MeshNode[] = Array.from({ length: nodeCount }, (_, i) => {
      const isHub = i % 8 === 0;
      const speedScale = motionQuery.matches ? 0.08 : 1;
      const baseVx = ((Math.random() - 0.5) * 0.55 + (Math.random() > 0.5 ? 0.15 : -0.15)) * speedScale;
      const baseVy = ((Math.random() - 0.5) * 0.55 + (Math.random() > 0.5 ? 0.15 : -0.15)) * speedScale;
      const colorKeys: ("primary" | "secondary" | "accent")[] = ["primary", "secondary", "accent"];

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        radius: isHub ? Math.random() * 1.2 + 3.2 : Math.random() * 1.2 + 1.6,
        colorKey: isHub ? "primary" : colorKeys[i % 3],
        isHub,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.025 + Math.random() * 0.03,
        flare: 0,
      };
    });

    // ==========================================
    // 2. Initialize Traveling Data Packets
    // ==========================================
    const packetCount = isMobile ? 3 : 7;
    const packets: DataPacket[] = Array.from({ length: packetCount }, () => ({
      fromIndex: Math.floor(Math.random() * nodeCount),
      toIndex: Math.floor(Math.random() * nodeCount),
      progress: Math.random(),
      speed: 0.008 + Math.random() * 0.012,
      colorKey: Math.random() > 0.4 ? "primary" : "secondary",
    }));

    // ==========================================
    // 3. Main High-Performance Render Loop
    // ==========================================
    const MAX_LINE_DIST = isMobile ? 85 : 130;
    const CURSOR_BEAM_DIST = isMobile ? 120 : 185;
    const CURSOR_REPEL_DIST = isMobile ? 65 : 95;

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const t = themeRef.current;
      const pRgb = t.primaryRgb || "0, 255, 157";
      const sRgb = t.secondaryRgb || "0, 200, 255";
      const aRgb = t.accentRgb || "0, 229, 255";

      const getColorRgb = (key: "primary" | "secondary" | "accent") => {
        if (key === "secondary") return sRgb;
        if (key === "accent") return aRgb;
        return pRgb;
      };

      ctx.clearRect(0, 0, width, height);

      // Smooth pointer position
      if (pointer.active) {
        pointer.x += (pointer.targetX - pointer.x) * 0.22;
        pointer.y += (pointer.targetY - pointer.y) * 0.22;
      }

      // ----------------------------------------
      // A. Ambient Cursor Spotlight Glow
      // ----------------------------------------
      if (pointer.active && pointer.x > 0 && pointer.y > 0) {
        const spotRadius = isMobile ? 140 : 200;
        const grad = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          spotRadius
        );
        grad.addColorStop(0, `rgba(${pRgb}, 0.12)`);
        grad.addColorStop(0.45, `rgba(${sRgb}, 0.04)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, spotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ----------------------------------------
      // B. Background Tactical Grid Crosshairs
      // ----------------------------------------
      if (!isMobile) {
        const gridStep = 150;
        ctx.strokeStyle = `rgba(${sRgb}, 0.07)`;
        ctx.lineWidth = 1;
        const crossSize = 3.5;

        for (let gx = (gridStep / 2); gx < width; gx += gridStep) {
          for (let gy = (gridStep / 2); gy < height; gy += gridStep) {
            ctx.beginPath();
            ctx.moveTo(gx - crossSize, gy);
            ctx.lineTo(gx + crossSize, gy);
            ctx.moveTo(gx, gy - crossSize);
            ctx.lineTo(gx, gy + crossSize);
            ctx.stroke();
          }
        }
      }

      // ----------------------------------------
      // C. Update Nodes Positions & Physics
      // ----------------------------------------
      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];

        // Natural ambient drift
        n.x += n.vx;
        n.y += n.vy;

        // Wrap around canvas boundaries smoothly
        const pad = 20;
        if (n.x < -pad) n.x = width + pad;
        if (n.x > width + pad) n.x = -pad;
        if (n.y < -pad) n.y = height + pad;
        if (n.y > height + pad) n.y = -pad;

        // Pulse animation
        n.pulsePhase += n.pulseSpeed;

        // Decay flare
        if (n.flare > 0) {
          n.flare = Math.max(0, n.flare - 0.035);
        }

        // Return velocity gently towards base drift
        n.vx = n.vx * 0.98 + n.baseVx * 0.02;
        n.vy = n.vy * 0.98 + n.baseVy * 0.02;

        // Interactive Cursor Repulsion Physics
        if (pointer.active) {
          const dx = n.x - pointer.x;
          const dy = n.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CURSOR_REPEL_DIST && dist > 0.1) {
            const force = (1 - dist / CURSOR_REPEL_DIST) * (isMobile ? 0.4 : 0.85);
            const angle = Math.atan2(dy, dx);
            n.vx += Math.cos(angle) * force;
            n.vy += Math.sin(angle) * force;
            n.flare = Math.min(1, n.flare + 0.15);
          }
        }
      }

      // ----------------------------------------
      // D. Update & Draw Shockwaves
      // ----------------------------------------
      for (let sIdx = shockwaves.length - 1; sIdx >= 0; sIdx--) {
        const sw = shockwaves[sIdx];
        sw.radius += sw.speed;
        sw.alpha -= sw.speed / (sw.maxRadius * 1.3);

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(sIdx, 1);
          continue;
        }

        // Excite nodes that the shockwave wave-front touches
        for (let i = 0; i < nodeCount; i++) {
          const n = nodes[i];
          const dx = n.x - sw.x;
          const dy = n.y - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - sw.radius) < 18) {
            n.flare = 1.0;
            const angle = Math.atan2(dy, dx);
            n.vx += Math.cos(angle) * 0.8;
            n.vy += Math.sin(angle) * 0.8;
          }
        }

        // Draw Shockwave Ring
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${pRgb}, ${sw.alpha * 0.75})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 8), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${sRgb}, ${sw.alpha * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ----------------------------------------
      // E. Draw Inter-Node Constellation Lines
      // ----------------------------------------
      for (let i = 0; i < nodeCount; i++) {
        const nA = nodes[i];

        for (let j = i + 1; j < nodeCount; j++) {
          const nB = nodes[j];
          const dx = nA.x - nB.x;
          const dy = nA.y - nB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MAX_LINE_DIST) {
            const lineFactor = 1 - dist / MAX_LINE_DIST;
            const flareBonus = Math.max(nA.flare, nB.flare) * 0.35;
            const alpha = Math.min(0.85, lineFactor * 0.24 + flareBonus);

            ctx.beginPath();
            ctx.moveTo(nA.x, nA.y);
            ctx.lineTo(nB.x, nB.y);
            ctx.strokeStyle = `rgba(${getColorRgb(nA.colorKey)}, ${alpha})`;
            ctx.lineWidth = lineFactor > 0.7 ? 1.2 : 0.85;
            ctx.stroke();
          }
        }
      }

      // ----------------------------------------
      // F. Draw Data Packets Traveling on Lines
      // ----------------------------------------
      for (let pIdx = 0; pIdx < packets.length; pIdx++) {
        const pkt = packets[pIdx];
        pkt.progress += pkt.speed;

        const nA = nodes[pkt.fromIndex];
        const nB = nodes[pkt.toIndex];

        // Check if nodes are currently connected
        const dx = nB.x - nA.x;
        const dy = nB.y - nA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (pkt.progress >= 1 || dist > MAX_LINE_DIST * 1.25) {
          // Reset packet to a connected pair
          pkt.fromIndex = pkt.toIndex;
          let bestNeighbor = Math.floor(Math.random() * nodeCount);
          let found = false;

          for (let cand = 0; cand < nodeCount; cand++) {
            if (cand === pkt.fromIndex) continue;
            const cDx = nodes[cand].x - nodes[pkt.fromIndex].x;
            const cDy = nodes[cand].y - nodes[pkt.fromIndex].y;
            if (Math.sqrt(cDx * cDx + cDy * cDy) < MAX_LINE_DIST) {
              bestNeighbor = cand;
              found = true;
              break;
            }
          }

          pkt.toIndex = found ? bestNeighbor : Math.floor(Math.random() * nodeCount);
          pkt.progress = 0;
          pkt.speed = 0.009 + Math.random() * 0.012;
          pkt.colorKey = Math.random() > 0.4 ? "primary" : "secondary";
          continue;
        }

        // Draw packet
        const px = nA.x + dx * pkt.progress;
        const py = nA.y + dy * pkt.progress;
        const packetColor = getColorRgb(pkt.colorKey);

        ctx.beginPath();
        ctx.arc(px, py, 2.0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${packetColor}, 0.95)`;
        if (!isMobile) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${packetColor}, 0.9)`;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ----------------------------------------
      // G. Draw Interactive Cursor Laser Beams
      // ----------------------------------------
      if (pointer.active && pointer.x > 0 && pointer.y > 0) {
        let connectedCount = 0;

        for (let i = 0; i < nodeCount; i++) {
          const n = nodes[i];
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CURSOR_BEAM_DIST) {
            connectedCount++;
            const beamFactor = 1 - dist / CURSOR_BEAM_DIST;
            const beamAlpha = beamFactor * 0.85;

            // Gradient laser beam from node color to primary color at cursor
            const beamGrad = ctx.createLinearGradient(n.x, n.y, pointer.x, pointer.y);
            beamGrad.addColorStop(0, `rgba(${getColorRgb(n.colorKey)}, ${beamAlpha * 0.7})`);
            beamGrad.addColorStop(1, `rgba(${pRgb}, ${beamAlpha})`);

            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.strokeStyle = beamGrad;
            ctx.lineWidth = 1.2 + beamFactor * 0.8;
            ctx.stroke();

            // Flare the connected node
            n.flare = Math.max(n.flare, beamFactor * 0.8);
          }
        }

        // Cursor Reticle Center Point & Ring
        if (connectedCount > 0) {
          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${pRgb}, 0.9)`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, 10, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${sRgb}, 0.45)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // ----------------------------------------
      // H. Draw Neural Nodes (with breathing glow)
      // ----------------------------------------
      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];
        const color = getColorRgb(n.colorKey);
        const pulse = Math.sin(n.pulsePhase) * 0.25 + 0.75;
        const currentRadius = (n.radius + n.flare * 1.5) * (n.isHub ? 1.1 : 1.0);
        const baseAlpha = Math.min(1, (n.isHub ? 0.95 : 0.75) * pulse + n.flare * 0.5);

        // Outer Hub Radar Ring
        if (n.isHub) {
          const ringRadius = currentRadius * (1.8 + Math.sin(n.pulsePhase * 0.8) * 0.4);
          ctx.beginPath();
          ctx.arc(n.x, n.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${color}, ${0.28 * pulse})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Node Glow Halo
        if (!isMobile && (n.isHub || n.flare > 0.2)) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${color}, ${baseAlpha})`;
        } else {
          ctx.shadowBlur = 0;
        }

        // Node Solid Core
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${baseAlpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      motionQuery.removeEventListener("change", handleMotionChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[var(--cyber-bg,#07111F)] transition-colors duration-400"
    >
      {/* Interactive Neural Mesh Grid Canvas (Fixed Background Layer) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 translate-z-0 will-change-transform"
      />

      {/* Children Content Layer with Mouse Context Provider for 3D Cards */}
      <div className="relative z-10">
        <AntiGravityMouseContext.Provider value={{ smoothX, smoothY, reducedMotion }}>
          {children}
        </AntiGravityMouseContext.Provider>
      </div>
    </div>
  );
}
