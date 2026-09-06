"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Scene3DBoundary from "./Scene3DBoundary";
import useCanRender3D from "./useCanRender3D";

// Generates points distributed on a sphere surface (Fibonacci spiral)
function useSpherePoints(count: number, radius: number) {
  return useMemo(() => {
    const points: THREE.Vector3[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
    }
    return points;
  }, [count, radius]);
}

interface GlobeInnerProps {
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  isVisible: boolean;
  isMobile?: boolean;
}

function NetworkGlobeScene({ pointerRef, isVisible, isMobile = false }: GlobeInnerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const nodes = useSpherePoints(isMobile ? 24 : 48, 2.2);

  // Connect nearby nodes to form a cybersecurity mesh
  const linePositions = useMemo(() => {
    const positions: number[] = [];
    const maxDist = isMobile ? 1.35 : 1.18;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < maxDist) {
          positions.push(
            nodes[i].x, nodes[i].y, nodes[i].z,
            nodes[j].x, nodes[j].y, nodes[j].z
          );
        }
      }
    }
    return new Float32Array(positions);
  }, [nodes, isMobile]);

  // Target rotation for subtle scoped pointer parallax
  const targetRotation = useRef({ x: 0, y: 0 });
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (!isVisible || !groupRef.current || document.hidden) return;
    elapsedRef.current += delta;

    // Slow continuous ambient rotation
    groupRef.current.rotation.y += delta * 0.1;

    // Subtle pointer parallax response (interpolated smoothly)
    targetRotation.current.y = pointerRef.current.x * 0.35;
    targetRotation.current.x = -pointerRef.current.y * 0.25;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotation.current.x + Math.sin(elapsedRef.current * 0.2) * 0.05,
      0.05
    );

    // Pulse core slightly
    if (coreRef.current) {
      coreRef.current.rotation.y -= delta * 0.05;
      const scale = 1 + Math.sin(elapsedRef.current * 1.5) * 0.02;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#00FF9D" />
      <pointLight position={[-5, -5, -5]} intensity={1.0} color="#00C8FF" />

      {/* Transparent Glass-like Inner Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.5, isMobile ? 16 : 24, isMobile ? 16 : 24]} />
        <meshStandardMaterial
          color="#071828"
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Outer Wireframe Geodesic Shell */}
      <mesh>
        <icosahedronGeometry args={[2.2, isMobile ? 1 : 2]} />
        <meshBasicMaterial
          color="#00FF9D"
          wireframe
          transparent
          opacity={0.14}
        />
      </mesh>

      {/* Network Connection Lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00C8FF" transparent opacity={0.38} />
      </lineSegments>

      {/* Glowing Nodes */}
      {nodes.map((p, idx) => (
        <mesh key={idx} position={p}>
          <sphereGeometry args={[0.038, 8, 8]} />
          <meshBasicMaterial
            color={idx % 3 === 0 ? "#00C8FF" : "#00FF9D"}
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroNetworkGlobe() {
  const canRender = useCanRender3D();
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Viewport visibility detection (pause rendering when scrolled past hero)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Scoped pointer handler ONLY when pointer moves over the globe container
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerRef.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
  };

  // WebGL Fallback if 3D is disabled or unsupported
  if (!canRender) {
    return (
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-40">
        <div className="w-80 h-80 rounded-full border border-cyber-green/20 bg-cyber-dark/40 flex items-center justify-center backdrop-blur-md">
          <div className="w-64 h-64 rounded-full border border-dashed border-cyber-blue/30 animate-spin" style={{ animationDuration: '30s' }} />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none [&_*]:pointer-events-none z-0 opacity-85"
    >
      {(!isMobile || isVisible) && (
        <Scene3DBoundary>
          <Canvas
            style={{ pointerEvents: "none" }}
            camera={{ position: [0, 0, 6.2], fov: 45 }}
            dpr={isMobile ? 1 : [1, 1.5]}
            gl={{ alpha: true, antialias: !isMobile, powerPreference: isMobile ? "low-power" : "high-performance" }}
          >
            <NetworkGlobeScene pointerRef={pointerRef} isVisible={isVisible} isMobile={isMobile} />
          </Canvas>
        </Scene3DBoundary>
      )}
    </div>
  );
}
