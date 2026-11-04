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

/**
 * Base drift in em/s, so the rows keep the same pace relative to the type at every size: row 1 moves
 * left, row 2 moves right. A new name comes into view every few seconds, slow enough to read.
 */
const ROW_SPEEDS = [-1.6, 1.8];
/**
 * Type of the names, shared by the marquee and its reduced-motion fallback. The rows clip their
 * overflow, so the line height has to leave room for descenders.
 */
const NAME_TYPE = "text-2xl leading-tight md:text-5xl short:text-3xl lg:text-6xl";

/** Collaborations: velocity-reactive client marquee (SPEC.md §3.11). Reused on /projects. */
export function Collaborations({ id = "collaborations" }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="relative w-full overflow-hidden bg-white py-20 text-black md:py-32 short:py-12">
      <div className="container relative z-10 mx-auto mb-10 px-6 md:mb-24 short:mb-8">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-eyebrow font-black uppercase tracking-eyebrow text-accent md:mb-8 short:mb-3"
          >
            {collaborations.eyebrow}
          </motion.p>
          <motion.h2
            id={`${id}-title`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex text-5xl font-medium leading-[0.85] text-black md:text-9xl md:leading-none short:text-6xl"
          >
            {collaborations.title}
            <span className="font-light italic text-black/40">{collaborations.titleAccent}</span>
          </motion.h2>
        </div>
      </div>

      <div className="relative flex flex-col gap-5 border-y border-black/5 bg-black/[0.02] py-8 md:gap-10 md:py-12 short:gap-4 short:py-6">
        {collaborations.rows.map((row, i) => (
          <MarqueeRow key={i} items={row} speed={ROW_SPEEDS[i % ROW_SPEEDS.length]} />
        ))}
      </div>

      <div className="container mx-auto mt-10 px-6 md:mt-24 short:mt-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-balance text-center text-eyebrow font-black uppercase leading-loose tracking-ultra text-black/40"
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
  const fontSize = useRef(16);
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
      fontSize.current = parseFloat(getComputedStyle(track).fontSize) || 16;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const x = useTransform(baseX, (v) => (period.current ? wrap(-period.current, 0, v) : 0));

  useAnimationFrame((_, delta) => {
    if (reduceMotion || !period.current) return;
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    const moveBy = direction.current * speed * fontSize.current * (delta / 1000) * (1 + Math.abs(factor));
    baseX.set(baseX.get() + moveBy);
  });

  const itemClass =
    "cursor-default whitespace-nowrap font-medium tracking-tight text-black/70 transition-colors duration-500 group-hover:text-accent";

  // Without motion the names would sit cut off at the edge, so they wrap onto lines instead.
  if (reduceMotion) {
    return (
      <ul className={`flex flex-wrap justify-center gap-x-[1em] gap-y-2 px-6 ${NAME_TYPE}`}>
        {items.map((item) => (
          <li key={item} className={itemClass}>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  // A small accent dot after every name marks where one ends and the next begins.
  const separated = `${itemClass} flex items-center after:mx-[0.7em] after:size-[0.18em] after:rounded-full after:bg-accent after:content-['']`;

  return (
    <div className="group flex overflow-hidden">
      <motion.div ref={trackRef} style={{ x }} className={`flex flex-none items-center ${NAME_TYPE}`}>
        <ul className="contents">
          {items.map((item) => (
            <li key={item} className={separated}>
              {item}
            </li>
          ))}
        </ul>
        {items.map((item) => (
          <span key={`copy-${item}`} aria-hidden className={separated}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
