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
 * Scroll is split into one band per work plus half a band of extra hold at the end, because
 * Tech Stack slides over the last 600px of this track. Each half-turn happens quickly around
 * a band edge, so a work stays still and readable for the rest of its band.
 */
const BANDS = items.length + 0.5;
const HALF_TURN = 0.04;
const turnAt = (k: number) => k / BANDS;
const rotationInput = [0, ...items.slice(1).flatMap((_, i) => [turnAt(i + 1) - HALF_TURN, turnAt(i + 1) + HALF_TURN]), 1];
const rotationOutput = [0, ...items.slice(1).flatMap((_, i) => [i * 180, (i + 1) * 180]), last * 180];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Selected 3D Works (SPEC.md §3.6): scrolling flips a 3D card. Whichever face is turned
 * away swaps to the next work, so each half-turn reveals a new one.
 */
export function ThreeDWorks() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const rotateY = useTransform(scrollYProgress, rotationInput, rotationOutput);
  const [active, setActive] = useState(0);

  // The work changes at each band edge, mid-turn, while the card is edge-on.
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(last, Math.max(0, Math.floor(progress * BANDS)));
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
