"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Scene3DBoundary from "./Scene3DBoundary";
import useCanRender3D from "./useCanRender3D";

function OrbitRing({
  radius,
  count,
  speed,
  color,
  tilt,
}: {
  radius: number;
  count: number;
  speed: number;
  color: string;
  tilt: number;
}) {
  const ref = useRef<THREE.Group>(null);

  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pts.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return pts;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      {/* faint ring outline */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.01, radius + 0.01, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      {positions.map((p, idx) => (
        <mesh key={idx} position={p}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function OrbitScene() {
  return (
    <>
      <OrbitRing radius={2.6} count={7} speed={0.09} color="#00FF9D" tilt={0.5} />
      <OrbitRing radius={1.9} count={5} speed={-0.13} color="#00C8FF" tilt={-0.35} />
      <OrbitRing radius={1.2} count={4} speed={0.18} color="#00FF9D" tilt={0.9} />
    </>
  );
}

export default function SkillsOrbitField() {
  const canRender = useCanRender3D();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // On mobile screens, disable ambient orbit field to preserve WebGL memory for the 3D sphere
  if (!canRender || isMobile) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-25 md:opacity-35">
      <Scene3DBoundary>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
        >
          <OrbitScene />
        </Canvas>
      </Scene3DBoundary>
    </div>
  );
}
