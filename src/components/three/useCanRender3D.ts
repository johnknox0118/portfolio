"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only when it's safe/sensible to mount a WebGL canvas:
 * - browser supports WebGL
 * - user hasn't requested reduced motion
 * - (optionally) skips very small / low-power viewports if needed later
 *
 * Any component using this should render its normal (non-3D) fallback
 * (or nothing) until/unless this returns true, so the existing design
 * is never blocked or altered while we wait to confirm 3D is safe.
 */
let cachedCanRender: boolean | null = null;

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedCanRender !== null) return cachedCanRender;

  try {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      cachedCanRender = false;
      return false;
    }

    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl", { powerPreference: "low-power" }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    const supported = Boolean(gl);
    if (gl) {
      const loseExt = gl.getExtension("WEBGL_lose_context");
      if (loseExt) {
        loseExt.loseContext();
      }
    }

    cachedCanRender = supported;
    return supported;
  } catch {
    cachedCanRender = false;
    return false;
  }
}

export default function useCanRender3D() {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    setCanRender(checkWebGLSupport());
  }, []);

  return canRender;
}
