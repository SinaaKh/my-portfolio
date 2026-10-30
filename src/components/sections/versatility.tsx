"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { sectionLabel } from "@/lib/content";
import { site, type Industry } from "@/content/site";
import { ArrowLink } from "@/components/ui/arrow-link";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { SmartLink } from "@/components/ui/smart-link";
import { seededRandom } from "@/lib/random";

const { versatility } = site;

// Hub geometry in the 1000×600 diagram space (SPEC.md §3.3). One entry per industry node.
const CONNECTORS = [
  { d: "M 150 100 Q 300 100 500 300", left: 15, top: 16.6667 },
  { d: "M 100 300 L 500 300", left: 10, top: 50 },
  { d: "M 150 500 Q 300 500 500 300", left: 15, top: 83.3333 },
  { d: "M 850 100 Q 700 100 500 300", left: 85, top: 16.6667 },
  { d: "M 900 300 L 500 300", left: 90, top: 50 },
  { d: "M 850 500 Q 700 500 500 300", left: 85, top: 83.3333 },
];

const BIT_DURATION = 2.4;
const BITS = (() => {
  const rand = seededRandom(5);
  return CONNECTORS.flatMap((connector, i) =>
    [0, 1].map((n) => ({
      path: connector.d,
      digit: rand() > 0.5 ? "1" : "0",
      begin: (i * 0.37 + n * (BIT_DURATION / 2)) % BIT_DURATION,
    })),
  );
})();

const reveal = (delay = 0, y = 20) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/** Versatility: industries hub (SPEC.md §3.3). */
export function Versatility() {
  return (
    <section
      id="versatility"
      aria-label={sectionLabel("versatility")}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black py-12 lg:py-24"
    >
      <div aria-hidden className="dot-grid absolute inset-0 text-white opacity-[0.05]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6">
        <div className="relative z-30 mb-8 text-center lg:mb-16">
          <motion.span
            {...reveal(0, 10)}
            className="mb-2 block text-eyebrow font-black uppercase tracking-eyebrow text-accent lg:mb-8"
          >
            {versatility.eyebrow}
          </motion.span>
          <motion.h2
            {...reveal(0.1)}
            className="mb-4 text-3xl font-medium leading-[0.9] tracking-tighter text-white md:text-8xl md:leading-none lg:mb-8"
          >
            {versatility.title} <span className="font-serif italic text-white/80">{versatility.titleAccent}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mb-8 max-w-2xl px-4 text-[10px] font-light leading-relaxed text-white/40 lg:text-lg lg:leading-7"
          >
            {versatility.description}
          </motion.p>
          <motion.div {...reveal(0.3, 10)}>
            <ArrowLink link={versatility.link} />
          </motion.div>
        </div>

        <Hub />

        <ul className="grid grid-cols-1 gap-6 border-t border-white/5 pt-10 md:grid-cols-3 lg:gap-12">
          {versatility.pillars.map((pillar, i) => (
            <motion.li key={pillar.title} {...reveal(i * 0.1)} className="group text-center">
              <div
                aria-hidden
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl text-white shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-accent/30 group-hover:bg-white/10 lg:mb-6 lg:h-16 lg:w-16 lg:rounded-2xl lg:text-3xl"
              >
                {pillar.icon}
              </div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-white lg:mb-3 lg:text-base">
                {pillar.title}
              </h3>
              <p className="mx-auto max-w-[250px] text-[10px] font-light leading-relaxed text-white/40 lg:text-sm lg:leading-5">
                {pillar.description}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Hub() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto mb-8 aspect-square w-full max-w-[1000px] md:aspect-[1000/600] lg:mb-20">
      <svg aria-hidden viewBox="0 0 1000 600" className="pointer-events-none absolute inset-0 h-full w-full" fill="none">
        {CONNECTORS.map((connector, i) => (
          <motion.path
            key={connector.d}
            d={connector.d}
            stroke="var(--color-indigo)"
            strokeWidth={2}
            strokeOpacity={0.3}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: i * 0.1, ease: "easeInOut" }}
          />
        ))}
        {!reduceMotion && (
          <g className="hidden md:inline" fill="var(--color-indigo)" fontSize={12} fontWeight={800}>
            {BITS.map((bit, i) => (
              <text
                key={i}
                textAnchor="middle"
                dominantBaseline="central"
                opacity={0}
                style={{ filter: "drop-shadow(0 0 8px color-mix(in srgb, var(--color-indigo) 50%, transparent))" }}
              >
                {bit.digit}
                <animateMotion dur={`${BIT_DURATION}s`} begin={`${bit.begin}s`} repeatCount="indefinite" path={bit.path} />
                <animate
                  attributeName="opacity"
                  dur={`${BIT_DURATION}s`}
                  begin={`${bit.begin}s`}
                  repeatCount="indefinite"
                  values="0;1;1;0"
                  keyTimes="0;0.15;0.85;1"
                />
              </text>
            ))}
          </g>
        )}
      </svg>

      <Core reduceMotion={reduceMotion ?? false} />

      <ul>
        {versatility.industries.map((industry, i) => (
          <IndustryNode key={industry.label} index={i} reduceMotion={reduceMotion ?? false} {...industry} />
        ))}
      </ul>
    </div>
  );
}

function Core({ reduceMotion }: { reduceMotion: boolean }) {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const interval = window.setInterval(
      () => setWordIndex((i) => (i + 1) % versatility.hubWords.length),
      2000,
    );
    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  return (
    <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
      {/* Glow pulse is a CSS keyframe (animate-hub-pulse) so it follows --color-indigo. */}
      <div className="relative flex h-24 w-24 animate-hub-pulse items-center justify-center rounded-full bg-gradient-to-br from-indigo to-indigo-deep p-[2px] lg:h-32 lg:w-32">
        <div aria-hidden className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-xl" />
        <div className="relative z-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-black/80 shadow-2xl lg:h-24 lg:w-24">
          <AnimatePresence initial={false}>
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="absolute whitespace-nowrap text-sm font-black tracking-tighter text-white lg:text-xl"
            >
              {versatility.hubWords[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
        <motion.div
          aria-hidden
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-15px] rounded-full border border-dashed border-indigo/40 lg:inset-[-25px]"
        />
        <motion.div
          aria-hidden
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-20px] rounded-full border border-dotted border-indigo/20 lg:inset-[-30px]"
        />
      </div>
    </div>
  );
}

function IndustryNode({
  index,
  icon,
  label,
  color,
  href,
  reduceMotion,
}: Industry & { index: number; reduceMotion: boolean }) {
  const { left, top } = CONNECTORS[index % CONNECTORS.length];
  const tile = (
    <div
      style={{ borderBottom: `2px solid ${color}` }}
      className={`relative -mt-[30px] flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-neutral-900 text-xl shadow-card-sm transition-all duration-500 group-hover:scale-110 lg:h-16 lg:w-16 lg:rounded-2xl lg:text-3xl lg:shadow-card ${
        href ? "group-hover:border-accent/50 group-focus-within:border-accent/50" : "group-hover:border-white/20"
      }`}
    >
      <span aria-hidden>{icon}</span>
      {href && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full border-2 border-black bg-accent"
        />
      )}
    </div>
  );

  return (
    // Pops in once when the hub scrolls into view, then stays (as on the reference).
    <motion.li
      initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.3 + index * 0.1 }}
      style={{ left: `${left}%`, top: `${top}%` }}
      className="absolute z-30"
    >
      <div className="group relative">
        {href ? (
          <SmartLink href={href} aria-label={label} className="block rounded-xl lg:rounded-2xl">
            {tile}
          </SmartLink>
        ) : (
          tile
        )}
        <div
          aria-hidden={Boolean(href)}
          className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 lg:-bottom-12"
        >
          <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-accent px-2 py-1 text-[8px] font-black uppercase tracking-caps text-black shadow-lg lg:px-3 lg:py-1.5 lg:text-eyebrow">
            {label}
            {href && <ArrowUpRightIcon className="h-2.5 w-2.5" />}
          </span>
        </div>
      </div>
    </motion.li>
  );
}
