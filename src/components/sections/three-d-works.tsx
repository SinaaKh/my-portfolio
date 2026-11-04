"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
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

/**
 * Whether work k is the picture on its face at card angle θ (degrees). Even works sit on the front
 * face, odd ones on the back, and a face changes picture only when it's turned fully away: half a
 * turn from where either picture shows, so the change is never on screen, whichever way you scroll.
 */
function onFace(k: number, angle: number) {
  const from = k < 2 ? -Infinity : (k - 1) * 180;
  const to = k + 2 > last ? Infinity : (k + 1) * 180;
  return angle >= from && angle < to;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Selected 3D Works (SPEC.md §3.6): scrolling flips a 3D card, and each half-turn reveals a new work.
 * Every work keeps its own image, loaded once. The faces pick theirs from the card's angle in the
 * same frame as the turn, so flipping never waits on a re-render or an image reload.
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
              {reduceMotion ? (
                <Face>
                  <Picture index={active} active={active} />
                </Face>
              ) : (
                <>
                  <Face>
                    {items.map((_, k) => k % 2 === 0 && <Picture key={k} index={k} active={active} angle={rotateY} />)}
                  </Face>
                  <Face flipped>
                    {items.map((_, k) => k % 2 === 1 && <Picture key={k} index={k} active={active} angle={rotateY} />)}
                  </Face>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Face({ flipped = false, children }: { flipped?: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{ backfaceVisibility: "hidden", transform: flipped ? "rotateY(180deg)" : undefined }}
      className="absolute inset-0 overflow-hidden rounded-5xl bg-black shadow-2xl"
    >
      {children}
    </div>
  );
}

/**
 * One work's image. With an angle it shows only while its face carries it; without, always. Only the
 * current work's image is described, so screen readers don't read out the ones waiting off-face.
 */
function Picture({ index, active, angle }: { index: number; active: number; angle?: MotionValue<number> }) {
  const shown = useTransform(() => (!angle || onFace(index, angle.get()) ? 1 : 0));
  const { image } = items[index];
  return (
    <motion.div style={{ opacity: shown }} className="absolute inset-0">
      <SiteImage
        src={image.src}
        alt={index === active ? image.alt : ""}
        fill
        sizes="(min-width: 768px) 330px, 240px"
        className="object-cover"
      />
    </motion.div>
  );
}
