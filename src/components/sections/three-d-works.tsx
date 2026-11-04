"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { site } from "@/content/site";
import { SiteImage } from "@/components/ui/site-image";

const { threeDWorks } = site;
const items = threeDWorks.items;
const last = items.length - 1;
/**
 * Scroll position is measured in works: work k faces the viewer at k, and the card is edge-on,
 * mid-flip, halfway between two works. The range starts a quarter of a work early, so the card is
 * already turning when the section pins, and runs on past the last work, so it stays readable
 * before Tech Stack slides over the last 600px of this track.
 */
const START = -0.25;
const END = last + 0.9;
/**
 * How much the card slows while a work faces the viewer: 0 is a steady spin, 1 a dead stop.
 * Below 1 every bit of scroll still turns it, so there's no stretch where scrolling seems to do nothing.
 */
const SETTLE = 0.75;

const position = (progress: number) => START + progress * (END - START);
const activeAt = (x: number) => Math.min(last, Math.max(0, Math.round(x)));

/** Card angle in half-turns: always moving, slowest while a work faces the viewer, fastest mid-flip. */
function halfTurns(x: number) {
  if (x <= last) return x - (SETTLE / (2 * Math.PI)) * Math.sin(2 * Math.PI * x);
  // Past the last work there's no next flip: keep the slow pace and ease it out by the end.
  const tail = END - last;
  const u = Math.min(x - last, tail);
  return last + (1 - SETTLE) * u * (1 - u / (2 * tail));
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Selected 3D Works (SPEC.md §3.6): scrolling flips a 3D card. Whichever face is turned
 * away swaps to the next work, so each half-turn reveals a new one.
 */
export function ThreeDWorks() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const rotateY = useTransform(scrollYProgress, (progress) => halfTurns(position(progress)) * 180);
  const [active, setActive] = useState(0);

  // The work changes mid-flip, while the card is edge-on.
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = activeAt(position(progress));
    if (next !== active) setActive(next);
  });

  // Even-numbered works sit on the front face, odd-numbered on the back.
  const front = reduceMotion ? active : Math.min(last, active + (active % 2));
  const back = Math.min(last, active + 1 - (active % 2));

  return (
    <section
      ref={ref}
      id="three-d-works"
      aria-labelledby="three-d-works-title"
      className="relative h-[600vh] w-full bg-black text-white"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute left-0 top-4 z-10 flex w-full items-end justify-between px-6 md:px-12">
          <div>
            <span className="mb-2 block text-eyebrow font-black uppercase tracking-ultra text-white/20">
              {threeDWorks.eyebrow}
            </span>
            <h2 id="three-d-works-title" className="text-2xl font-light tracking-tight text-white/90">
              {threeDWorks.title} <span className="font-serif italic">{threeDWorks.titleAccent}</span>
            </h2>
          </div>
          <p className="flex items-baseline gap-1 font-mono text-sm" aria-label={`${active + 1} / ${items.length}`}>
            <span className="text-white">{pad(active + 1)}</span>
            <span className="text-white/20">/</span>
            <span className="text-white/20">{pad(items.length)}</span>
          </p>
        </div>

        <div className="container mx-auto mt-12 grid grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
          <div className="max-w-xl" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div aria-hidden className="flex items-center gap-4 text-eyebrow font-black uppercase tracking-eyebrow text-white/40" />
                <h3 className="text-5xl font-medium uppercase leading-[0.9] tracking-tight text-white md:text-8xl md:leading-none">
                  {items[active].title}
                  <br />
                  <span className="font-light lowercase italic text-white/40">{items[active].subtitle}</span>
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="perspective-1000 flex justify-center md:justify-end">
            <motion.div
              style={{ rotateX: 15, rotateY: reduceMotion ? 0 : rotateY, rotateZ: -10, transformStyle: "preserve-3d" }}
              className="relative aspect-[3/4] w-[240px] md:w-[330px]"
            >
              <Face item={items[front]} />
              {!reduceMotion && <Face item={items[back]} flipped />}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Face({ item, flipped = false }: { item: (typeof items)[number]; flipped?: boolean }) {
  return (
    <div
      style={{ backfaceVisibility: "hidden", transform: flipped ? "rotateY(180deg)" : undefined }}
      className="absolute inset-0 overflow-hidden rounded-5xl bg-black shadow-2xl"
    >
      <SiteImage src={item.image.src} alt={item.image.alt} fill sizes="(min-width: 768px) 330px, 240px" className="object-cover" />
    </div>
  );
}
