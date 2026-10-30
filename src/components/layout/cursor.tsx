"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useFinePointer } from "@/lib/use-media-query";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, [data-cursor='hover']";

/**
 * Custom cursor (SPEC.md §2.2): a teal difference-blend blob that trails the pointer
 * on a spring, plus a white dot that tracks it exactly. Fine pointers only.
 */
export function Cursor() {
  const finePointer = useFinePointer();
  return finePointer ? <CursorLayers /> : null;
}

function CursorLayers() {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const hover = useMotionValue(0);

  const spring = reduceMotion
    ? { duration: 0 }
    : { stiffness: 500, damping: 28, mass: 0.5 };
  const blobX = useSpring(x, spring);
  const blobY = useSpring(y, spring);
  const blobScale = useSpring(1, { stiffness: 300, damping: 20 });
  const dotOpacity = useSpring(1, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      x.set(event.clientX);
      y.set(event.clientY);
      const overInteractive = event.target instanceof Element && event.target.closest(INTERACTIVE) !== null;
      if (overInteractive !== (hover.get() === 1)) {
        hover.set(overInteractive ? 1 : 0);
        blobScale.set(overInteractive ? 2.5 : 1);
        dotOpacity.set(overInteractive ? 0 : 1);
      }
    };
    const onLeave = () => {
      x.set(-100);
      y.set(-100);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [x, y, hover, blobScale, dotOpacity]);

  return (
    <>
      <motion.div
        aria-hidden
        style={{ x: blobX, y: blobY, scale: blobScale }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent mix-blend-difference"
      />
      <motion.div
        aria-hidden
        style={{ x, y, opacity: dotOpacity }}
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
      />
    </>
  );
}
