"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import useCanRender3D from "./three/useCanRender3D";

export default function ContactNetworkOrb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canRender = useCanRender3D();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canRender || !containerRef.current) return;

    const container = containerRef.current;
    const size = Math.min(container.clientWidth || 180, 200);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Inner glowing core
    const coreGeo = new THREE.SphereGeometry(0.75, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: "#00FF9D",
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Outer Geodesic Orb
    const orbGeo = new THREE.IcosahedronGeometry(1.25, 1);
    const orbMat = new THREE.MeshBasicMaterial({
      color: "#00C8FF",
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    group.add(orbMesh);

    // Connecting nodes
    const nodeCount = 20;
    const nodeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const nodeMat1 = new THREE.MeshBasicMaterial({ color: "#00FF9D", transparent: true, opacity: 0.9 });
    const nodeMat2 = new THREE.MeshBasicMaterial({ color: "#00C8FF", transparent: true, opacity: 0.9 });

    const nodes: THREE.Vector3[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;
      const pos = new THREE.Vector3(
        Math.cos(theta) * r * 1.25,
        y * 1.25,
        Math.sin(theta) * r * 1.25
      );
      nodes.push(pos);

      const node = new THREE.Mesh(nodeGeo, i % 2 === 0 ? nodeMat1 : nodeMat2);
      node.position.copy(pos);
      group.add(node);
    }

    // Lines between nodes
    const linePositions: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.1) {
          linePositions.push(
            nodes[i].x, nodes[i].y, nodes[i].z,
            nodes[j].x, nodes[j].y, nodes[j].z
          );
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: "#00FF9D", transparent: true, opacity: 0.35 });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // Subtle pointer parallax
    let pointerX = 0;
    let pointerY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const handlePointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("mouseleave", handlePointerLeave);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      group.rotation.y += 0.008;
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, pointerY * 0.4, 0.05);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -pointerX * 0.4, 0.05);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("mouseleave", handlePointerLeave);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      coreGeo.dispose();
      orbGeo.dispose();
      nodeGeo.dispose();
      lineGeo.dispose();
      coreMat.dispose();
      orbMat.dispose();
      nodeMat1.dispose();
      nodeMat2.dispose();
      lineMat.dispose();
    };
  }, [canRender, isVisible]);

  if (!canRender) {
    return (
      <div className="w-20 h-20 rounded-full border border-cyber-green/30 bg-cyber-green/5 flex items-center justify-center">
        <span className="w-3 h-3 rounded-full bg-cyber-green animate-pulse" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-28 h-28 sm:w-36 sm:h-36 relative flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
      title="Contact Network Orb // Let's Connect"
    />
  );
}
