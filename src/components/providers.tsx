"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { SmoothScroll } from "./smooth-scroll";

/** Client-side providers shared by every page. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    // "user" skips transform and layout animations for prefers-reduced-motion users.
    <MotionConfig reducedMotion="user">
      <SmoothScroll>{children}</SmoothScroll>
    </MotionConfig>
  );
}
