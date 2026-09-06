"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface ScrollEventData {
  scroll: number;
  velocity: number;
  direction: number;
}

export type ScrollCallback = (data: ScrollEventData) => void;

export interface ScrollContextValue {
  lenisRef: React.RefObject<Lenis | null>;
  directionRef: React.MutableRefObject<number>;
  velocityRef: React.MutableRefObject<number>;
  velocityMultiplierRef: React.MutableRefObject<number>;
  scrollTo: (target: string | HTMLElement | number, options?: { offset?: number; duration?: number }) => void;
  addScrollListener: (cb: ScrollCallback) => () => void;
}

const ScrollContext = createContext<ScrollContextValue | null>(null);

export const useScrollContext = () => useContext(ScrollContext);

let globalScrollTo: ((target: string | HTMLElement | number, options?: { offset?: number; duration?: number }) => void) | null = null;

export function smoothScrollTo(
  target: string | HTMLElement | number,
  options?: { offset?: number; duration?: number }
) {
  if (globalScrollTo) {
    globalScrollTo(target, options);
  } else if (typeof window !== "undefined") {
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    } else {
      const elem = typeof target === "string" ? document.querySelector(target) : target;
      if (elem) {
        const computedStyle = window.getComputedStyle(elem);
        const scrollMargin = parseFloat(computedStyle.scrollMarginTop) || 80;
        const top = elem.getBoundingClientRect().top + window.pageYOffset - scrollMargin + (options?.offset ?? 0);
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  }
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const directionRef = useRef<number>(1); // +1 = down, -1 = up
  const velocityRef = useRef<number>(0);
  const velocityMultiplierRef = useRef<number>(1.0);
  const listenersRef = useRef<Set<ScrollCallback>>(new Set());

  const addScrollListener = (cb: ScrollCallback) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  };

  const scrollTo = (target: string | HTMLElement | number, options?: { offset?: number; duration?: number }) => {
    if (typeof target === "number") {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, {
          offset: options?.offset ?? 0,
          duration: options?.duration ?? 1.0,
        });
      } else if (typeof window !== "undefined") {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target as any, {
        offset: options?.offset ?? 0,
        duration: options?.duration ?? 1.0,
      });
    } else if (typeof window !== "undefined") {
      const elem = typeof target === "string" ? document.querySelector(target) : target;
      if (elem) {
        const computedStyle = window.getComputedStyle(elem);
        const scrollMargin = parseFloat(computedStyle.scrollMarginTop) || 80;
        const top = elem.getBoundingClientRect().top + window.pageYOffset - scrollMargin + (options?.offset ?? 0);
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const isTouchOnly = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(pointer: fine)").matches;

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: isTouchOnly ? 0 : 1.0,
      syncTouch: false,
    });

    lenisRef.current = lenis;
    globalScrollTo = scrollTo;
    if (typeof window !== "undefined") {
      (window as any).__portfolioScrollTo = scrollTo;
      (window as any).__portfolioLenis = lenis;
    }

    let lastNativeScrollY = typeof window !== "undefined" ? window.scrollY : 0;

    // Track scroll velocity, direction, and sync with GSAP ScrollTrigger
    const handleScroll = (e: any) => {
      const vel = typeof e?.velocity === "number" ? e.velocity : 0;
      const dir = typeof e?.direction === "number" ? e.direction : vel >= 0 ? 1 : -1;
      const scrollPos = typeof e?.scroll === "number" ? e.scroll : window.scrollY;

      directionRef.current = dir !== 0 ? dir : directionRef.current;
      velocityRef.current = vel;

      // Velocity multiplier: clamp smoothly between 1.0 and 1.25 (Animation #65)
      const absSpeed = Math.abs(vel);
      velocityMultiplierRef.current = Math.min(1.25, Math.max(1.0, 1.0 + absSpeed * 0.012));

      ScrollTrigger.update();

      // Notify high-performance listeners without React re-render overhead
      if (listenersRef.current.size > 0) {
        const data: ScrollEventData = { scroll: scrollPos, velocity: vel, direction: directionRef.current };
        listenersRef.current.forEach((cb) => {
          try {
            cb(data);
          } catch {
            // Ignore subscriber errors
          }
        });
      }
    };

    // Native scroll listener fallback for mobile touch devices
    const handleNativeScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastNativeScrollY;
      lastNativeScrollY = currentY;
      handleScroll({
        scroll: currentY,
        velocity: delta,
        direction: delta >= 0 ? 1 : -1,
      });
    };

    lenis.on("scroll", handleScroll);
    if (isTouchOnly) {
      window.addEventListener("scroll", handleNativeScroll, { passive: true });
    }

    // Native hardware display-sync requestAnimationFrame loop
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Support smooth internal anchor jumps
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        if (href === "#top-portal" || href === "#top") {
          e.preventDefault();
          scrollTo(0, { duration: 1.0 });
          return;
        }
        const elem = document.querySelector(href);
        if (elem) {
          e.preventDefault();
          scrollTo(elem as HTMLElement, {
            offset: 0,
            duration: 1.0,
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { passive: false });

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      if (isTouchOnly) {
        window.removeEventListener("scroll", handleNativeScroll);
      }
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      globalScrollTo = null;
      if (typeof window !== "undefined") {
        delete (window as any).__portfolioScrollTo;
        delete (window as any).__portfolioLenis;
      }
    };
  }, []);

  return (
    <ScrollContext.Provider
      value={{
        lenisRef,
        directionRef,
        velocityRef,
        velocityMultiplierRef,
        scrollTo,
        addScrollListener,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}
