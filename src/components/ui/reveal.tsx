"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const TAGS = {
  div: motion.div,
  section: motion.section,
  p: motion.p,
  li: motion.li,
} as const;

/** Fade + slide in once when scrolled into view. Lets server pages opt into motion. */
export function Reveal({
  children,
  as = "div",
  x = 0,
  y = 20,
  delay = 0,
  className,
}: {
  children: ReactNode;
  as?: keyof typeof TAGS;
  x?: number;
  y?: number;
  delay?: number;
  className?: string;
}) {
  const Tag = TAGS[as];
  return (
    <Tag
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}
