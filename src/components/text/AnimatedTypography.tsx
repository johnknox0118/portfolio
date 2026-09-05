"use client";

export { default as MorphingText } from "./MorphingText";
export { default as LetterFormationText } from "./LetterFormationText";
export { default as FlipText } from "./FlipText";
export { default as IAm3DText } from "./IAm3DText";

// Reusable stagger animation variants for supporting typography
export const textStaggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

export const textStaggerItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
