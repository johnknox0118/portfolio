"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Wraps any WebGL/three.js layer. If it throws for any reason (no WebGL,
 * driver issue, context loss, etc.) it just renders nothing — the rest of
 * the existing site is completely unaffected.
 */
export default class Scene3DBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Fail silently in production; log for local debugging only.
    if (process.env.NODE_ENV !== "production") {
      console.warn("3D layer disabled:", error);
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
