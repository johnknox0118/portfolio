"use client";

import React, { ReactNode } from "react";

interface StickyCardSectionProps {
  children: ReactNode;
  className?: string;
}

export default function StickyCardSection({
  children,
  className = "",
}: StickyCardSectionProps) {
  return (
    <div className={`relative w-full space-y-6 md:space-y-8 ${className}`}>
      {children}
    </div>
  );
}

export function StickyCardItem({
  children,
  index = 0,
  topOffset = 110,
  className = "",
}: {
  children: ReactNode;
  index?: number;
  topOffset?: number;
  className?: string;
}) {
  return (
    <div
      style={{
        // Desktop only: sticks with progressive offset and stacking z-index
        top: `calc(${topOffset}px + ${index * 24}px)`,
        zIndex: 10 + index,
      }}
      className={`relative md:sticky shadow-[0_-4px_20px_rgba(0,0,0,0.4)] ${className}`}
    >
      {children}
    </div>
  );
}
