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
    const isInputElement = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (el as HTMLElement).isContentEditable ||
        Boolean(el.closest("input, textarea, [contenteditable='true']"))
      );
    };

    // 1. Intercept clipboard copy & cut events outside inputs
    const handleCopy = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      if (!isInputElement(activeEl) && !isInputElement(e.target as Element)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      if (!isInputElement(activeEl) && !isInputElement(e.target as Element)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 2. Prevent keyboard selection & copy shortcuts outside form inputs
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      const activeEl = document.activeElement;
      const key = e.key.toLowerCase();

      // Block Ctrl+C (Copy), Ctrl+A (Select All), Ctrl+X (Cut), Ctrl+U (View Source), Ctrl+S (Save)
      if (key === "c" || key === "a" || key === "x" || key === "u" || key === "s") {
        if (!isInputElement(activeEl) && !isInputElement(e.target as Element)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // 3. Prevent text selection dragging (selectstart) outside inputs
    const handleSelectStart = (e: Event) => {
      if (!isInputElement(e.target as Element)) {
        e.preventDefault();
      }
    };

    // 4. Prevent dragging of images, links, media, or text selections
    const handleDragStart = (e: DragEvent) => {
      if (!isInputElement(e.target as Element)) {
        e.preventDefault();
      }
    };

    // 5. Block right-click context menu across site (except inside inputs for normal paste)
    const handleContextMenu = (e: MouseEvent) => {
      if (!isInputElement(e.target as Element)) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("selectstart", handleSelectStart, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("selectstart", handleSelectStart, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, []);

  return null;
}
