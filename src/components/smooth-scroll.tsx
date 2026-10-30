"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { cancelFrame, frame, useReducedMotion } from "framer-motion";

/**
 * Site-wide Lenis smooth scrolling.
 *
 * Lenis is driven from Framer Motion's frame loop so scroll-linked motion values
 * and Lenis update in the same frame. Disabled entirely for reduced-motion users.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    function update({ timestamp }: { timestamp: number }) {
      lenisRef.current?.lenis?.raf(timestamp);
    }

    frame.update(update, true);
    return () => cancelFrame(update);
  }, [reduceMotion]);

  if (reduceMotion) return children;

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, anchors: true }}>
      {children}
    </ReactLenis>
  );
}
