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

type Point = [x: number, y: number];
type HubLayout = { width: number; height: number; nodes: { at: Point; bend?: Point }[] };

// Hub geometry (SPEC.md §3.3): one node per industry, each wired to the core at the centre. Tiles are
// centred on their node and paths start there, so every path runs out from under its tile. Portrait
// phones get a square diagram; wider screens and phones held sideways get the 1000×600 one.
const WIDE: HubLayout = {
  width: 1000,
  height: 600,
  nodes: [
    { at: [150, 100], bend: [300, 100] },
    { at: [100, 300] },
    { at: [150, 500], bend: [300, 500] },
    { at: [850, 100], bend: [700, 100] },
    { at: [900, 300] },
    { at: [850, 500], bend: [700, 500] },
  ],
};
const SQUARE: HubLayout = {
  width: 1000,
  height: 1000,
  nodes: [
    { at: [190, 170], bend: [340, 170] },
    { at: [90, 500] },
    { at: [190, 830], bend: [340, 830] },
    { at: [810, 170], bend: [660, 170] },
    { at: [910, 500] },
    { at: [810, 830], bend: [660, 830] },
  ],
};

function connectorPaths({ width, height, nodes }: HubLayout) {
  const centre = `${width / 2} ${height / 2}`;
  return nodes.map(({ at, bend }) => `M ${at.join(" ")} ${bend ? `Q ${bend.join(" ")}` : "L"} ${centre}`);
}

/** Node position as a percentage of the diagram, for placing its tile over the SVG. */
function nodePosition({ width, height, nodes }: HubLayout, index: number) {
  const [x, y] = nodes[index % nodes.length].at;
  return { left: `${(x / width) * 100}%`, top: `${(y / height) * 100}%` };
}

const BIT_DURATION = 2.4;
function makeBits(paths: string[]) {
  const rand = seededRandom(5);
  return paths.flatMap((path, i) =>
    [0, 1].map((n) => ({
      path,
      digit: rand() > 0.5 ? "1" : "0",
      begin: (i * 0.37 + n * (BIT_DURATION / 2)) % BIT_DURATION,
    })),
  );
}

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
            className="mb-4 text-3xl font-medium leading-[0.9] tracking-tighter text-white short:text-5xl md:text-8xl md:leading-none short:leading-none lg:mb-8"
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

        <ul className="grid grid-cols-1 gap-6 border-t border-white/5 pt-10 md:grid-cols-3 short:grid-cols-3 lg:gap-12">
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
  const reduceMotion = useReducedMotion() ?? false;

  return (
    // On a phone held sideways the hub is sized by the screen's height, so the whole diagram fits on screen.
    <div className="relative mx-auto mb-8 aspect-square w-full max-w-[1000px] md:aspect-[1000/600] short:aspect-[1000/600] short:max-w-[calc((100svh-3rem)*5/3)] lg:mb-20">
      {/* Both diagrams are in the markup and CSS shows one, so nothing shifts after hydration.
          Strokes and bits are sized to come out about the same on screen either way. */}
      <Diagram layout={SQUARE} strokeWidth={4} bitSize={30} reduceMotion={reduceMotion} className="md:hidden short:hidden" />
      <Diagram layout={WIDE} strokeWidth={2} bitSize={12} reduceMotion={reduceMotion} className="hidden md:block short:block" />

      <Core reduceMotion={reduceMotion} />

      <ul>
        {versatility.industries.map((industry, i) => (
          <IndustryNode key={industry.label} index={i} reduceMotion={reduceMotion} {...industry} />
        ))}
      </ul>
    </div>
  );
}

function Diagram({
  layout,
  strokeWidth,
  bitSize,
  reduceMotion,
  className,
}: {
  layout: HubLayout;
  strokeWidth: number;
  bitSize: number;
  reduceMotion: boolean;
  className: string;
}) {
  const paths = connectorPaths(layout);
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      fill="none"
    >
      {paths.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke="var(--color-indigo)"
          strokeWidth={strokeWidth}
          strokeOpacity={0.3}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: i * 0.1, ease: "easeInOut" }}
        />
      ))}
      {!reduceMotion && (
        <g fill="var(--color-indigo)" fontSize={bitSize} fontWeight={800}>
          {makeBits(paths).map((bit, i) => (
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
  const square = nodePosition(SQUARE, index);
  const wide = nodePosition(WIDE, index);
  const tile = (
    <div
      style={{ borderBottom: `2px solid ${color}` }}
      className={`relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-neutral-900 text-2xl shadow-card-sm transition-all duration-500 group-hover:scale-110 lg:h-16 lg:w-16 lg:rounded-2xl lg:text-3xl lg:shadow-card ${
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
    // Centred on its node in whichever diagram is showing.
    <li
      style={
        {
          "--node-x": square.left,
          "--node-y": square.top,
          "--node-x-md": wide.left,
          "--node-y-md": wide.top,
        } as React.CSSProperties
      }
      className="absolute left-[var(--node-x)] top-[var(--node-y)] z-30 -translate-x-1/2 -translate-y-1/2 md:left-[var(--node-x-md)] md:top-[var(--node-y-md)] short:left-[var(--node-x-md)] short:top-[var(--node-y-md)]"
    >
      {/* Pops in once when the hub scrolls into view, then stays (as on the reference). */}
      <motion.div
        initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.3 + index * 0.1 }}
        className="group relative"
      >
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
      </motion.div>
    </li>
  );
}
