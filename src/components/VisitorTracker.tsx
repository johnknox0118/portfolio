"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<{ path: string; time: number }>({ path: "", time: 0 });

  useEffect(() => {
    // Only exclude the admin dashboard itself (/admin/dashboard) and internal /api routes
    if (!pathname || pathname.startsWith("/admin/dashboard") || pathname.startsWith("/api")) {
      return;
    }

    // Debounce duplicate tracking on the same path within 10 seconds
    const now = Date.now();
    if (lastTracked.current.path === pathname && now - lastTracked.current.time < 10000) {
      return;
    }
    lastTracked.current = { path: pathname, time: now };

    const payload = JSON.stringify({
      page: pathname === "/" ? "/" : pathname,
      referer: typeof document !== "undefined" ? document.referrer : "",
    });

    try {
      fetch("/api/public/track-visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch((err) => {
        console.warn("Visitor telemetry note:", err);
      });
    } catch {
      // Silent catch
    }
  }, [pathname]);

  return null;
}
