"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { site, type TimelineEntry } from "@/content/site";

const { timeline } = site;

/** Track travel and traveler travel, as fractions measured on the reference. */
const TRACK_SHIFT = 0.88;
const TRAVELER_SHIFT_VW = 92;

/** Story / Timeline: a horizontal journey driven by vertical scroll (SPEC.md §3.8). */
export function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const trackX = useTransform(scrollYProgress, [0, 1], ["0%", `-${TRACK_SHIFT * 100}%`]);
  const travelerX = useTransform(scrollYProgress, [0, 1], ["0vw", `${TRAVELER_SHIFT_VW}vw`]);
  const travelerY = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, -20, 0, -20, 0, -20]);
  // Wobble: scroll velocity tilts the traveler, a loose spring lets it settle.
  const velocity = useVelocity(scrollYProgress);
  const tilt = useTransform(velocity, [-0.5, 0, 0.5], [-30, 0, 30], { clamp: true });
  const rotate = useSpring(tilt, { stiffness: 120, damping: 6 });

  /** Scroll so the traveler sits at the next or previous entry. */
  const step = (direction: 1 | -1) => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const entries = [...track.querySelectorAll<HTMLElement>("[data-entry]")];
    const viewport = window.innerWidth;
    const meetAt = (el: HTMLElement) =>
      el.offsetLeft / (TRACK_SHIFT * track.scrollWidth + (TRAVELER_SHIFT_VW / 100) * viewport);
    const current = scrollYProgress.get();
    const stops = entries.map(meetAt);
    const target =
      direction === 1 ? stops.find((p) => p > current + 0.01) : [...stops].reverse().find((p) => p < current - 0.01);
    if (target === undefined) return;
    const top = section.offsetTop + Math.min(1, target) * (section.offsetHeight - window.innerHeight);
    if (lenis) lenis.scrollTo(top, { duration: 1.2 });
    else window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section ref={sectionRef} id="story" aria-labelledby="story-title" className="relative h-[600vh] bg-black text-white">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 select-none opacity-[0.05]">
          <p className="whitespace-nowrap font-serif text-[20vw] font-bold leading-none text-white">{timeline.watermark}</p>
        </div>

        <div className="absolute left-6 top-12 z-20 md:left-12">
          <span className="mb-2 block text-eyebrow font-black uppercase tracking-ultra text-white/20">
            {timeline.eyebrow}
          </span>
          <h2 id="story-title" className="text-2xl font-light tracking-tight text-white/90 md:text-4xl">
            {timeline.title} <span className="font-serif italic">{timeline.titleAccent}</span>
          </h2>
          <p className="mt-2 text-xs font-light text-white/40 md:text-sm">{timeline.subtitle}</p>
        </div>

        <div aria-hidden className="absolute left-0 top-1/2 z-10 h-px w-full bg-white/5">
          <motion.div
            style={{ x: travelerX, y: travelerY }}
            className="pointer-events-none absolute left-0 top-1/2 z-30 -translate-y-1/2"
          >
            <div className="relative">
              <motion.div
                style={{ rotate: reduceMotion ? 0 : rotate }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent shadow-dot"
              >
                <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-black" />
                <div className="absolute -left-2 h-px w-4 rotate-45 bg-white/40" />
                <div className="absolute -left-2 h-px w-4 -rotate-45 bg-white/40" />
              </motion.div>
              <div className="absolute inset-0 animate-ping rounded-full bg-accent opacity-20" />
            </div>
          </motion.div>
        </div>

        <motion.ol ref={trackRef} style={{ x: trackX }} className="flex items-center gap-[40vw] pl-[20vw] md:gap-[20vw]">
          {timeline.entries.map((entry, i) => (
            <Entry key={entry.title} entry={entry} index={i} isLast={i === timeline.entries.length - 1} />
          ))}
          <li aria-hidden className="w-[10vw] shrink-0" />
        </motion.ol>

        <div className="absolute bottom-12 left-6 z-20 flex items-center gap-8 md:left-12">
          <div className="flex items-center gap-4">
            <StepButton label={timeline.prevLabel} onClick={() => step(-1)}>
              ←
            </StepButton>
            <StepButton label={timeline.nextLabel} onClick={() => step(1)}>
              →
            </StepButton>
          </div>
          <p className="font-mono text-xs uppercase tracking-tighter">{timeline.exploreHint}</p>
        </div>
      </div>
    </section>
  );
}

function Entry({ entry, index, isLast }: { entry: TimelineEntry; index: number; isLast: boolean }) {
  const inView = { amount: 0.3 } as const;
  return (
    <li data-entry className="relative w-[280px] shrink-0 md:w-[500px]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={inView}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-[calc(50%+40px)] left-0 pl-4 text-left"
      >
        <h3 className="mb-1 text-lg font-medium tracking-tight text-white/90 md:text-2xl">{entry.title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-micro font-bold uppercase tracking-label text-white/30 md:text-eyebrow">{entry.period}</span>
          <div aria-hidden className="h-px w-4 bg-white/10" />
          <span className="font-serif text-micro italic text-white/40 md:text-eyebrow">{entry.tag}</span>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={inView}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute left-0 top-[calc(50%+40px)] pl-4 text-left"
      >
        <div className="flex items-start gap-4 md:gap-6">
          <span aria-hidden className="font-serif text-3xl font-bold italic leading-none text-white/20 md:text-5xl">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="max-w-[240px] md:max-w-[300px]">
            <p className="mb-4 text-xs font-light leading-relaxed text-white/50 md:mb-6 md:text-sm md:leading-5">
              {entry.description}
            </p>
            <div aria-hidden className="group flex cursor-pointer items-center gap-4">
              <div className="h-px w-8 bg-white/10 transition-all duration-500 group-hover:w-16" />
              <span className="text-micro font-black uppercase tracking-widest text-white/20 transition-colors group-hover:text-accent">
                {isLast ? timeline.endCue : timeline.scrollCue}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </li>
  );
}

function StepButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-xs text-white/40 transition-colors hover:border-white/30 hover:text-white"
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}
