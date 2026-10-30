"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const TAGS = {
  div: motion.div,
  section: motion.section,
  p: motion.p,
  li: motion.li,
} as const;

/** Fade + slide (or scale) in once when scrolled into view. Lets server pages opt into motion. */
export function Reveal({
  children,
  as = "div",
  x = 0,
  y = 20,
  scale = 1,
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: keyof typeof TAGS;
  x?: number;
  y?: number;
  scale?: number;
  delay?: number;
  className?: string;
}) {
  const Tag = TAGS[as];
  return (
    <Tag
      initial={{ opacity: 0, x, y, scale }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}
