"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  Variants,
  MotionValue,
} from "framer-motion";

interface CascadeContextValue {
  scrollYProgress: MotionValue<number>;
  prefersReducedMotion: boolean;
}

const CascadeContext = createContext<CascadeContextValue | null>(null);

interface CascadeGridProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  threshold?: number;
}

export const containerVariants = (staggerDelay = 0.15): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.08,
    },
  },
});

export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    z: -320,
    scale: 0.58,
    y: 50,
    rotateX: 24,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    z: 0,
    scale: 1,
    y: 0,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function CascadeGrid({
  children,
  className = "",
}: CascadeGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Track scroll progress as user moves through the section
  // "start 96%" = begins flying forward as soon as top approaches lower viewport
  // "center 55%" = smoothly locks into front focus by mid-screen
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 96%", "center 55%"],
  });

  return (
    <CascadeContext.Provider
      value={{
        scrollYProgress,
        prefersReducedMotion,
      }}
    >
      <div
        ref={containerRef}
        className={`relative ${className}`}
        style={{
          perspective: 1200,
          transformStyle: "preserve-3d",
        }}
      >
        {React.Children.map(children, (child, idx) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              index: (child.props as any).index ?? idx,
            });
          }
          return child;
        })}
      </div>
    </CascadeContext.Provider>
  );
}

interface CascadeCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function CascadeCard({
  children,
  className = "",
  index = 0,
}: CascadeCardProps) {
  const context = useContext(CascadeContext);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobMq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mobMq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mobMq.addEventListener("change", handler);
    return () => mobMq.removeEventListener("change", handler);
  }, []);

  const fallbackProgress = useMotionValue(1);
  const rawProgress = context?.scrollYProgress ?? fallbackProgress;

  // Staggered emergence curves based on card index (Card 0 -> Card 1 -> Card 2)
  const startProgress = Math.min(0.32, index * 0.14);
  const endProgress = Math.min(1.0, 0.65 + index * 0.16);

  // 3D Backward-to-Front Depth Mapping
  // Starts deep in Z-space (-320px) scaled down (0.58) and surges into the foreground (0px, 1.0)
  const targetZ = useTransform(rawProgress, [startProgress, endProgress], [-320, 0]);
  const targetScale = useTransform(rawProgress, [startProgress, endProgress], [0.58, 1]);
  const targetY = useTransform(rawProgress, [startProgress, endProgress], [50, 0]);
  const targetRotateX = useTransform(rawProgress, [startProgress, endProgress], [24, 0]);
  const targetOpacity = useTransform(
    rawProgress,
    [startProgress, startProgress + 0.18, endProgress],
    [0, 0.75, 1]
  );
  const targetBlur = useTransform(rawProgress, [startProgress, endProgress], [10, 0]);

  // Spring physics for authentic physical inertia and fluid hydraulic feel
  const springConfig = { damping: 24, stiffness: 140, mass: 0.85 };
  const z = useSpring(targetZ, springConfig);
  const scale = useSpring(targetScale, springConfig);
  const y = useSpring(targetY, springConfig);
  const rotateX = useSpring(targetRotateX, springConfig);
  const opacity = useSpring(targetOpacity, { damping: 20, stiffness: 160 });
  const blur = useSpring(targetBlur, { damping: 20, stiffness: 160 });

  const filter = useTransform(blur, (val) =>
    val > 0.15 ? `blur(${val.toFixed(1)}px)` : "none"
  );

  // Floor depth shadow that grows and intensifies as the card approaches the front plane
  const shadowOpacity = useTransform(scale, [0.58, 1], [0, 0.45]);
  const shadowScale = useTransform(scale, [0.58, 1], [0.45, 1]);

  if (context?.prefersReducedMotion || isMobile) {
    return <div className={`relative h-full ${className}`}>{children}</div>;
  }

  // Accent glows for floor reflection
  const glowColors = [
    "rgba(0, 255, 157, 0.4)",  // Green for Certifications
    "rgba(0, 200, 255, 0.4)",  // Cyan for Projects
    "rgba(168, 85, 247, 0.4)",  // Purple for CGPA
  ];
  const activeGlow = glowColors[index % glowColors.length];

  return (
    <div
      className={`relative h-full ${className}`}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        style={{
          z,
          scale,
          y,
          rotateX,
          opacity,
          filter,
          transformStyle: "preserve-3d",
          willChange: "transform, opacity, filter",
        }}
        className="h-full relative"
      >
        {/* Soft 3D Grounding Floor Shadow */}
        <motion.div
          style={{
            opacity: shadowOpacity,
            scale: shadowScale,
            background: `radial-gradient(ellipse at center, ${activeGlow} 0%, transparent 70%)`,
          }}
          className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 w-[85%] h-8 blur-md -z-10"
        />

        {/* Card Content with preserved NeonBorderCard */}
        {children}
      </motion.div>
    </div>
  );
}
