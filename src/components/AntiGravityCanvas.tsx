"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AntiGravityMouseContext } from "./three/AntiGravityMouseContext";

interface AntiGravityCanvasProps {
  children?: React.ReactNode;
}

export default function AntiGravityCanvas({ children }: AntiGravityCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Motion values for mouse 3D tilt & parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid inertia
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  // Transforms for mouse light overlay and subtle card tilt
  const lightX = useTransform(smoothX, [-0.5, 0.5], ["30%", "70%"]);
  const lightY = useTransform(smoothY, [-0.5, 0.5], ["30%", "70%"]);

  useEffect(() => {
    // Check user preference for reduced motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    // Mouse movement tracker normalized to [-0.5, 0.5]
    const handleMouseMove = (e: MouseEvent) => {
      if (motionQuery.matches) return;
      const { innerWidth, innerHeight } = window;
      const normX = e.clientX / innerWidth - 0.5;
      const normY = e.clientY / innerHeight - 0.5;
      mouseX.set(normX);
      mouseY.set(normY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Layer 1 & 3: Canvas Particle System (Background Stars & Micro-Particles)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = window.innerWidth < 768;

    const handleResize = () => {
      if (!canvas) return;
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      // On mobile devices, ignore small height changes caused by browser navigation bar collapsing
      if (Math.abs(width - newW) > 10 || Math.abs(height - newH) > 120) {
        width = canvas.width = newW;
        height = canvas.height = newH;
      }
    };
    window.addEventListener("resize", handleResize);

    // Particle pool: optimized for mobile to save GPU memory
    const particleCount = isMobile ? 12 : Math.min(Math.floor((width * height) / 18000), 50);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      color: Math.random() > 0.4 ? "#00FF9D" : "#00C8FF",
    }));

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Render drifting stars / particles
      particles.forEach((p) => {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        if (!isMobile) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      motionQuery.removeEventListener("change", handleMotionChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouseX, mouseY, reducedMotion]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#07111F]">
      {/* LAYER 1 & 3: Background Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-70 translate-z-0"
      />

      {/* LAYER 2: Animated Cyber Grid Backdrop */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,255,157,0.15),rgba(255,255,255,0))]" />
      <div className="fixed inset-0 pointer-events-none z-[1] bg-[linear-gradient(to_right,#1f293d0a_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* LAYER 4, 5: Children Floating UI Layer */}
      <div className="relative z-10">
        <AntiGravityMouseContext.Provider value={{ smoothX, smoothY, reducedMotion }}>
          {children}
        </AntiGravityMouseContext.Provider>
      </div>
    </div>
  );
}
