"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import useCanRender3D from "./three/useCanRender3D";

interface SkillsSphereProps {
  skills?: any[];
}

const DEFAULT_SKILLS = [
  "Python",
  "Cybersecurity",
  "JavaScript",
  "Next.js",
  "Linux",
  "SQL",
  "Git & GitHub",
  "Full Stack",
  "Flask",
  "HTML5 & CSS3",
  "Power BI",
  "Excel",
  "Network Security",
  "API Design",
  "Prisma ORM",
  "Supabase",
];

// Generates points evenly distributed on a sphere surface
function getSpherePoints(count: number, radius: number) {
  if (count <= 0) return [];
  if (count === 1) return [new THREE.Vector3(0, 0, radius)];
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
}

// Helper to create a crisp 2D canvas texture for skill labels with dynamic sizing & status LED
function createTextTexture(text: string, color: string = "#00FF9D", isMobile: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = isMobile ? 256 : 512;
  canvas.height = isMobile ? 65 : 130;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = isMobile ? 0.5 : 1.0;
    // Auto-fit font size based on text length
    const rawFontSize = text.length > 15 ? 26 : text.length > 11 ? 30 : 34;
    const fontSize = Math.round(rawFontSize * scale);
    ctx.font = `bold ${fontSize}px 'Oxanium', 'Orbitron', monospace, sans-serif`;

    // Calculate dynamic pill dimensions with generous breathing room
    const textWidth = ctx.measureText(text).width;
    const paddingX = Math.round(36 * scale);
    const pillW = Math.min(canvas.width - 16, Math.max(Math.round(190 * scale), textWidth + paddingX * 2 + Math.round(28 * scale)));
    const pillH = Math.round(88 * scale);
    const x = (canvas.width - pillW) / 2;
    const y = (canvas.height - pillH) / 2;
    const r = pillH / 2;

    // Sleek frosted cyber glass background
    ctx.fillStyle = "rgba(4, 15, 30, 0.90)";
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + pillW - r, y);
    ctx.arc(x + pillW - r, y + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x + r, y + pillH);
    ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fill();

    // Delicate neon border with controlled glow
    ctx.lineWidth = isMobile ? 1.5 : 2.0;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = isMobile ? 5 : 10;
    ctx.stroke();

    // Status LED beacon dot on the left
    const ledRadius = Math.round(5.5 * scale);
    const ledX = x + Math.round(24 * scale);
    const ledY = y + pillH / 2;
    ctx.fillStyle = color;
    ctx.shadowBlur = isMobile ? 6 : 12;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(ledX, ledY, ledRadius, 0, Math.PI * 2);
    ctx.fill();

    // Crisp white Orbitron label text
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = color;
    ctx.shadowBlur = isMobile ? 3 : 6;
    ctx.fillText(text, ledX + Math.round(16 * scale), y + pillH / 2 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export default function SkillsSphere3D({ skills }: SkillsSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canRender = useCanRender3D();
  const isVisibleRef = useRef(true);
  const lastRotationRef = useRef({ x: 0, y: 0 });
  const [isMobileScreen, setIsMobileScreen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const check = () => setIsMobileScreen(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Extract all unique skill names from data or fallback to defaults
  // On mobile screens, clamp to top 16 skills to ensure clean layout & 75% less texture RAM
  const skillNames = useMemo(() => {
    const maxSkills = isMobileScreen ? 16 : 36;
    if (skills && Array.isArray(skills) && skills.length > 0) {
      const extracted = skills
        .map((s: any) => {
          if (!s) return "";
          if (typeof s === "string") return s.trim();
          return (s.name || s.title || "").trim();
        })
        .filter((name): name is string => Boolean(name && name.length > 0));

      // Deduplicate while preserving order and casing
      const seen = new Set<string>();
      const unique: string[] = [];
      for (const name of extracted) {
        const lower = name.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          unique.push(name);
        }
      }

      if (unique.length > 0) {
        return unique.slice(0, maxSkills);
      }
    }
    return DEFAULT_SKILLS.slice(0, maxSkills);
  }, [skills, isMobileScreen]);

  // Serialization key to detect skill additions, deletions, or edits
  const skillNamesKey = useMemo(() => skillNames.join("||"), [skillNames]);

  // Viewport intersection observer: pauses RAF without tearing down WebGL scene
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Three.js Scene Setup & Lifecycle
  useEffect(() => {
    if (!canRender || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const isMobile = width < 640 || isMobileScreen;
    const skillCount = skillNames.length;
    // Dynamic sphere radius scaling to ensure comfortable spacing as skills increase
    const baseRadius = isMobile ? 1.95 : 2.3;
    const sphereRadius =
      skillCount > 22
        ? baseRadius * 1.15
        : skillCount > 15
        ? baseRadius * 1.06
        : baseRadius;

    // Track resources for clean disposal
    const texturesToDispose: THREE.Texture[] = [];
    const materialsToDispose: THREE.Material[] = [];
    const geometriesToDispose: THREE.BufferGeometry[] = [];

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = isMobile ? sphereRadius * 3.75 : sphereRadius * 3.15;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: isMobile ? "low-power" : "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5));

    // Clear any previous canvas element before mounting new one
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    renderer.domElement.style.touchAction = "pan-y";
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    // Seamlessly preserve previous rotation angles so adding new skills doesn't reset orientation
    group.rotation.x = lastRotationRef.current.x;
    group.rotation.y = lastRotationRef.current.y;
    scene.add(group);

    // 1. Inner Luminous Core (translucent dark glass with deep interior blue glow)
    const coreGeo = new THREE.SphereGeometry(
      sphereRadius * 0.58,
      isMobile ? 16 : 32,
      isMobile ? 16 : 32
    );
    geometriesToDispose.push(coreGeo);
    const coreMat = new THREE.MeshStandardMaterial({
      color: "#041528",
      roughness: 0.25,
      metalness: 0.75,
      transparent: true,
      opacity: 0.85,
    });
    materialsToDispose.push(coreMat);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Subtle inner glowing light source
    const innerLight = new THREE.PointLight("#00C8FF", 1.8, sphereRadius * 3.0);
    innerLight.position.set(0, 0, 0);
    group.add(innerLight);

    const ambientLight = new THREE.AmbientLight("#0a2540", 1.0);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight("#00FF9D", 1.4);
    dirLight1.position.set(4, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight("#00C8FF", 1.2);
    dirLight2.position.set(-4, -5, -3);
    scene.add(dirLight2);

    // 2. Geodesic Cyber Wireframe Shell
    const wireGeo = new THREE.IcosahedronGeometry(sphereRadius * 0.98, isMobile ? 1 : 2);
    geometriesToDispose.push(wireGeo);
    const wireMat = new THREE.MeshBasicMaterial({
      color: "#00C8FF",
      wireframe: true,
      transparent: true,
      opacity: 0.10,
    });
    materialsToDispose.push(wireMat);
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    // 3. Constellation Network Line Connections
    const points = getSpherePoints(skillNames.length, sphereRadius);
    const linePositions: number[] = [];
    const maxConnectDist = sphereRadius * (points.length > 20 ? 0.85 : points.length > 14 ? 0.92 : 0.98);
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = points[i].distanceTo(points[j]);
        if (d < maxConnectDist) {
          linePositions.push(
            points[i].x, points[i].y, points[i].z,
            points[j].x, points[j].y, points[j].z
          );
        }
      }
    }
    const meshLineGeo = new THREE.BufferGeometry();
    meshLineGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );
    geometriesToDispose.push(meshLineGeo);
    const meshLineMat = new THREE.LineBasicMaterial({
      color: "#00C8FF",
      transparent: true,
      opacity: 0.24,
    });
    materialsToDispose.push(meshLineMat);
    const meshLines = new THREE.LineSegments(meshLineGeo, meshLineMat);
    group.add(meshLines);

    // 4. Dual Rotating Orbital Gyro-Rings
    const ring1Geo = new THREE.TorusGeometry(sphereRadius * 1.12, 0.009, 6, isMobile ? 48 : 96);
    geometriesToDispose.push(ring1Geo);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: "#00FF9D",
      transparent: true,
      opacity: 0.32,
    });
    materialsToDispose.push(ring1Mat);
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 7;
    group.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(sphereRadius * 1.18, 0.009, 6, isMobile ? 48 : 96);
    geometriesToDispose.push(ring2Geo);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: "#00C8FF",
      transparent: true,
      opacity: 0.26,
    });
    materialsToDispose.push(ring2Mat);
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 6;
    group.add(ring2);

    // Orbiting Data Packets (bright micro-nodes traveling along rings)
    const packetGeo = new THREE.SphereGeometry(0.042, 8, 8);
    geometriesToDispose.push(packetGeo);
    const packet1Mat = new THREE.MeshBasicMaterial({ color: "#00FF9D" });
    materialsToDispose.push(packet1Mat);
    const packet1 = new THREE.Mesh(packetGeo, packet1Mat);
    group.add(packet1);

    const packet2Mat = new THREE.MeshBasicMaterial({ color: "#00C8FF" });
    materialsToDispose.push(packet2Mat);
    const packet2 = new THREE.Mesh(packetGeo, packet2Mat);
    group.add(packet2);

    // 5. Floating Ambient Cyber Particles (Starfield Dust)
    const particleCount = isMobile ? 22 : 75;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const pR = sphereRadius * (0.85 + Math.random() * 0.65);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePositions[i * 3] = pR * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = pR * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = pR * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    geometriesToDispose.push(particleGeo);
    const particleMat = new THREE.PointsMaterial({
      color: "#00e5ff",
      size: 0.038,
      transparent: true,
      opacity: 0.50,
    });
    materialsToDispose.push(particleMat);
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    group.add(particlePoints);

    // 6. Skill Nodes & High-DPI Billboard Sprites
    const sprites: THREE.Sprite[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.045, 8, 8);
    geometriesToDispose.push(nodeGeo);

    skillNames.forEach((name, idx) => {
      const p = points[idx];
      const color = idx % 2 === 0 ? "#00FF9D" : "#00C8FF";

      // Small glowing anchor node at the vertex
      const nodeMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
      materialsToDispose.push(nodeMat);
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.copy(p);
      group.add(node);

      // High-DPI dynamic text sprite (with 256x65 resolution on mobile)
      const texture = createTextTexture(name, color, isMobile);
      texturesToDispose.push(texture);

      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      materialsToDispose.push(spriteMat);

      const sprite = new THREE.Sprite(spriteMat);
      const spritePos = p.clone().multiplyScalar(1.08);
      sprite.position.copy(spritePos);
      const scaleMultiplier = skillCount > 24 ? 0.86 : skillCount > 18 ? 0.92 : 1.0;
      const spriteScaleW = (isMobile ? 1.45 : 1.70) * scaleMultiplier;
      sprite.scale.set(spriteScaleW, spriteScaleW * (65 / 256), 1);
      group.add(sprite);
      sprites.push(sprite);
    });

    // Mouse & Touch Drag Interaction
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0;
    let velY = 0;
    const baseAutoRotY = 0.0028;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      velX = 0;
      velY = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevX;
      const deltaY = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      velX = deltaX * 0.0045;
      velY = deltaY * 0.0045;

      group.rotation.y += velX;
      group.rotation.x += velY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 600;
      const newH = container.clientHeight || 450;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", onResize);

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Animation Loop
    let animId: number;
    let elapsed = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisibleRef.current || document.hidden) return;
      elapsed += 0.015;

      if (!isDragging) {
        velX *= 0.95;
        velY *= 0.95;
        group.rotation.y += velX + baseAutoRotY;
        group.rotation.x += velY;
        group.rotation.x = THREE.MathUtils.clamp(group.rotation.x, -0.65, 0.65);
      }

      // Record orientation for seamless continuity on skill updates
      lastRotationRef.current.x = group.rotation.x;
      lastRotationRef.current.y = group.rotation.y;

      // Orbit data packets along rings
      const r1 = sphereRadius * 1.12;
      packet1.position.set(
        Math.cos(elapsed * 1.2) * r1,
        Math.sin(elapsed * 1.2) * Math.cos(Math.PI / 3) * r1,
        Math.sin(elapsed * 1.2) * Math.sin(Math.PI / 3) * r1
      );

      const r2 = sphereRadius * 1.18;
      packet2.position.set(
        Math.cos(-elapsed * 0.95) * r2,
        Math.sin(-elapsed * 0.95) * Math.cos(-Math.PI / 4) * r2,
        Math.sin(-elapsed * 0.95) * Math.sin(-Math.PI / 4) * r2
      );

      // Slowly rotate particle dust for organic atmospheric shimmer
      particlePoints.rotation.y = elapsed * 0.06;
      particlePoints.rotation.x = elapsed * 0.03;

      // Clean Backface Culling & Depth Occlusion for Skill Badges
      // Completely eliminates overlapping text chaos from labels on the back
      const tempWorldPos = new THREE.Vector3();
      sprites.forEach((sprite) => {
        sprite.getWorldPosition(tempWorldPos);

        const normalizedDepth = tempWorldPos.z / sphereRadius;

        if (normalizedDepth > 0.20) {
          // Front hemisphere: fully visible, sharp and prominent
          const factor = (normalizedDepth - 0.20) / 0.80;
          (sprite.material as THREE.SpriteMaterial).opacity = THREE.MathUtils.lerp(0.65, 1.0, factor);
        } else if (normalizedDepth > -0.15) {
          // Edge transition: soft, elegant fade
          const factor = (normalizedDepth + 0.15) / 0.35;
          (sprite.material as THREE.SpriteMaterial).opacity = THREE.MathUtils.lerp(0.06, 0.65, factor);
        } else {
          // Back hemisphere: virtually invisible so front text is 100% readable
          (sprite.material as THREE.SpriteMaterial).opacity = 0.03;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", onResize);

      if (container.contains(dom)) {
        container.removeChild(dom);
      }

      renderer.dispose();
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      texturesToDispose.forEach((t) => t.dispose());
    };
  }, [canRender, skillNamesKey]);

  // High-Performance Mobile & Reduced-Motion Knowledge Matrix
  if (!canRender) {
    return (
      <div className="w-full py-4 flex flex-col items-center gap-3 select-none">
        <div className="flex flex-wrap gap-2 justify-center items-center max-w-2xl px-2">
          {skillNames.map((name, i) => (
            <div
              key={i}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${
                i % 2 === 0
                  ? "bg-[#040F1E]/90 border-cyber-green/40 text-cyber-green shadow-[0_0_12px_rgba(0,255,157,0.12)]"
                  : "bg-[#040F1E]/90 border-cyber-blue/40 text-cyber-blue shadow-[0_0_12px_rgba(0,200,255,0.12)]"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? "bg-cyber-green" : "bg-cyber-blue"} animate-pulse`} />
              <span className="font-semibold text-white tracking-wide text-[11px]">{name}</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] font-mono text-gray-400 tracking-wider flex items-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping" />
          <span className="text-cyber-green font-semibold">VERIFIED TECHNICAL MATRIX</span>
          <span className="text-gray-500">//</span>
          <span className="text-gray-400">{skillNames.length} SKILLS ACTIVE</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col items-center justify-center my-6 select-none">
      {/* 3D Canvas Container without native OS tooltip */}
      <div
        ref={containerRef}
        className="w-full h-[380px] sm:h-[440px] md:h-[500px] max-w-4xl relative cursor-grab active:cursor-grabbing touch-pan-y"
      />
      <div className="text-[11px] font-mono text-gray-400 tracking-wider flex items-center gap-2 mt-2 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping" />
        <span className="text-cyber-green font-semibold">INTERACTIVE 3D KNOWLEDGE SPHERE</span>
        <span className="text-gray-500">//</span>
        <span className="text-gray-400">DRAG TO ROTATE &amp; EXPLORE</span>
      </div>
    </div>
  );
}
