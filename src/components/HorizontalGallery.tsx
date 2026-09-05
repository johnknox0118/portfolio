"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface HorizontalGalleryProps {
  children: React.ReactNode;
  className?: string;
  itemCount?: number;
}

export default function HorizontalGallery({
  children,
  className = "",
  itemCount = 0,
}: HorizontalGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [canScrollHorizontally, setCanScrollHorizontally] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const isWide = window.innerWidth >= 1024;
      const finePointer = window.matchMedia("(pointer: fine)").matches;
      setIsDesktop(isWide && finePointer);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  useEffect(() => {
    if (!isDesktop || !containerRef.current || !trackRef.current) return;

    const container = containerRef.current;
    const track = trackRef.current;

    // Check if reduced motion is requested
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setCanScrollHorizontally(false);
      return;
    }

    const scrollWidth = track.scrollWidth;
    const clientWidth = window.innerWidth;
    const distanceToScroll = scrollWidth - clientWidth + 160;

    // Only pin if there is enough content to scroll horizontally
    if (distanceToScroll <= 60) {
      setCanScrollHorizontally(false);
      return;
    }

    setCanScrollHorizontally(true);

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: -distanceToScroll,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top 18%",
          end: () => `+=${distanceToScroll * 0.9}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, container);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [isDesktop, itemCount]);

  const handleManualScroll = (direction: "left" | "right") => {
    if (!trackRef.current) return;
    const shift = 400;
    trackRef.current.scrollBy({
      left: direction === "right" ? shift : -shift,
      behavior: "smooth",
    });
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Desktop Horizontal Gallery Controls */}
      {isDesktop && canScrollHorizontally && (
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2 font-mono text-[10px] text-cyber-blue uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cyber-blue animate-ping inline-block" />
            <span>HORIZONTAL STREAM // SCROLL VERTICALLY TO NAVIGATE</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleManualScroll("left")}
              aria-label="Scroll credentials left"
              className="p-1.5 rounded-lg border border-white/10 bg-[#07111F]/80 text-gray-400 hover:text-white hover:border-cyber-green transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleManualScroll("right")}
              aria-label="Scroll credentials right"
              className="p-1.5 rounded-lg border border-white/10 bg-[#07111F]/80 text-gray-400 hover:text-white hover:border-cyber-green transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Track Container */}
      <div
        ref={trackRef}
        className={
          isDesktop && canScrollHorizontally
            ? "flex gap-6 w-max items-stretch pb-6 will-change-transform"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        }
      >
        {children}
      </div>
    </div>
  );
}
