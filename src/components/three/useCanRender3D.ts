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
export default function useCanRender3D() {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    let supported = false;
    try {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (!reducedMotion) {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        supported = !!gl;
      }
    } catch {
      supported = false;
    }
    setCanRender(supported);
  }, []);

  return canRender;
}
