"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { site } from "@/content/site";

const { collaborations } = site;

/** Base drift in px/s (measured): row 1 moves left, row 2 moves right. */
const ROW_SPEEDS = [-25, 28];

/** Collaborations: velocity-reactive client marquee (SPEC.md §3.11). Reused on /projects. */
export function Collaborations({ id = "collaborations" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative w-full overflow-hidden bg-white py-32 text-black">
      <div className="container relative z-10 mx-auto mb-32 px-6">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 text-eyebrow font-black uppercase tracking-eyebrow text-accent"
          >
            {collaborations.eyebrow}
          </motion.p>
          <motion.h2
            id={`${id}-title`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex text-5xl font-medium leading-[0.85] text-black md:text-9xl md:leading-none"
          >
            {collaborations.title}
            <span className="font-light italic text-black/40">{collaborations.titleAccent}</span>
          </motion.h2>
        </div>
      </div>

      <div className="relative flex flex-col gap-16 border-y border-black/5 bg-black/[0.02] py-12">
        {collaborations.rows.map((row, i) => (
          <MarqueeRow key={i} items={row} speed={ROW_SPEEDS[i % ROW_SPEEDS.length]} />
        ))}
      </div>

      <div className="container mx-auto mt-32 px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center text-eyebrow font-black uppercase tracking-ultra text-black/40"
        >
          {collaborations.footnote}
        </motion.p>
      </div>
    </section>
  );
}

function MarqueeRow({ items, speed }: { items: string[]; speed: number }) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const period = useRef(0);
  const baseX = useMotionValue(0);
  const direction = useRef(1);

  // Scroll velocity speeds the row up and flips its direction while scrolling up.
  const { scrollY } = useScroll();
  const smoothVelocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  // The track holds two copies of the list, so it repeats every half of its width.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      period.current = track.scrollWidth / 2;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const x = useTransform(baseX, (v) => (period.current ? wrap(-period.current, 0, v) : 0));

  useAnimationFrame((_, delta) => {
    if (reduceMotion || !period.current) return;
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    const moveBy = direction.current * speed * (delta / 1000) * (1 + Math.abs(factor));
    baseX.set(baseX.get() + moveBy);
  });

  const itemClass =
    "cursor-default whitespace-nowrap text-5xl font-medium tracking-tighter text-black/30 transition-all duration-500 group-hover:text-accent md:text-7xl";

  return (
    <div className="group flex overflow-hidden">
      <motion.div ref={trackRef} style={{ x }} className="flex flex-none items-center gap-24 px-12">
        <ul className="contents">
          {items.map((item) => (
            <li key={item} className={itemClass}>
              {item}
            </li>
          ))}
        </ul>
        {items.map((item) => (
          <span key={`copy-${item}`} aria-hidden className={itemClass}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
