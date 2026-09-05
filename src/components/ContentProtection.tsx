"use client";

import { useEffect } from "react";

/**
 * Enterprise Content & Media Anti-Theft Protection
 * - Prevents copying of page text via keyboard (Ctrl+C / Cmd+C / contextmenu)
 * - Allows full normal typing, selecting, and editing in <input> and <textarea>
 * - Prevents image dragging and right-click image saving
 * - Preserves programmatic clipboard functions (e.g. ATS Resume Copy button)
 */
export default function ContentProtection() {
  useEffect(() => {
    // 1. Intercept clipboard copy event
    const handleCopy = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable);

      // If copying outside form inputs, block it
      if (!isInput) {
        e.preventDefault();
      }
    };

    // 2. Prevent Ctrl+C / Cmd+C shortcuts on body content
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
        const activeEl = document.activeElement;
        const isInput =
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            (activeEl as HTMLElement).isContentEditable);

        if (!isInput) {
          e.preventDefault();
        }
      }
    };

    // 3. Prevent dragging of images, links, or media
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "IMG" || target?.closest("img") || target?.tagName === "A") {
        e.preventDefault();
      }
    };

    // 4. Prevent right-click context menu on images and protected visual assets
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "IMG" ||
        target?.closest("img") ||
        target?.tagName === "PICTURE" ||
        target?.tagName === "CANVAS"
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return null;
}
