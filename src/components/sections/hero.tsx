"use client";

import { useEffect, useId } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { site } from "@/content/site";
import { EyeIcon } from "@/components/ui/icons";
import { SiteImage } from "@/components/ui/site-image";
import { SmartLink } from "@/components/ui/smart-link";
import { seededRandom } from "@/lib/random";
import { useFinePointer, useIsDesktop } from "@/lib/use-media-query";

const { hero, meta } = site;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Decorative particle fields, seeded so server and client markup match.
const PARTICLE_COLORS = ["var(--color-accent)", "var(--color-violet)", "var(--color-ink)"];
function makeParticles(count: number, seed: number, minSize: number, maxSize: number, maxOpacity: number) {
  const rand = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    width: minSize + rand() * (maxSize - minSize),
    height: minSize + rand() * (maxSize - minSize),
    top: rand() * 100,
    left: rand() * 100,
    opacity: 0.1 + rand() * (maxOpacity - 0.1),
    color: PARTICLE_COLORS[Math.floor(rand() * PARTICLE_COLORS.length)],
  }));
}
const FINE_PARTICLES = makeParticles(50, 7, 1, 3, 0.35);
const SOFT_PARTICLES = makeParticles(30, 11, 2, 6, 0.2);
const LINES = (() => {
  const rand = seededRandom(23);
  return Array.from({ length: 7 }, (_, i) => ({
    y: i * 15,
    opacity: 0.05 + rand() * 0.2,
    color: rand() > 0.5 ? "var(--color-accent)" : "var(--color-violet)",
  }));
})();

/** Home hero (SPEC.md §3.1). */
export function Hero() {
  const isDesktop = useIsDesktop();
  const { scrollY } = useScroll();

  // Desktop scroll choreography (values measured on the reference).
  const background = useTransform(scrollY, [200, 300], ["#ffffff", "#000000"]);
  const color = useTransform(scrollY, [200, 300], ["#000000", "#ffffff"]);
  const frameWidth = useTransform(scrollY, [0, 360], ["70%", "100%"]);
  const frameRadius = useTransform(scrollY, [0, 360], [24, 0]);
  const overlayOpacity = useTransform(scrollY, [450, 600, 800, 950], [0, 1, 1, 0]);
  const overlayY = useTransform(scrollY, [500, 900], [100, -150]);
  const overlayScale = useTransform(scrollY, [500, 700], [0.9, 1]);

  return (
    <motion.section
      id="hero"
      aria-label={site.sections[0].label}
      style={isDesktop ? { backgroundColor: background } : undefined}
      className="relative min-h-screen w-full overflow-hidden bg-black pb-20 pt-32 lg:min-h-[200vh] lg:bg-white"
    >
      <Ambient />

      <motion.div
        style={isDesktop ? { color } : undefined}
        className="w-full px-6 text-white lg:px-12 lg:text-black"
      >
        <div className="mb-20 flex flex-col items-start justify-between lg:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: EASE_OUT }}
            className="max-w-4xl pt-[100px]"
          >
            <p className="mb-1 flex items-center gap-2 text-[18px] leading-[1.1]">
              <SiteImage
                src={meta.avatar.src}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-accent"
              >
                {hero.greeting}
              </motion.span>
            </p>
            <Headline text={hero.headline} />
            <div className="flex flex-wrap items-center gap-12">
              <div>
                <SmartLink
                  href={hero.link.href}
                  external={hero.link.external}
                  className="border-b-2 border-current text-sm font-semibold hover:underline"
                >
                  {hero.link.label}
                </SmartLink>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: EASE_OUT }}
            className="hidden flex-col items-end gap-20 pt-10 lg:flex"
          >
            <Badge />
          </motion.div>
        </div>
      </motion.div>

      <div className="relative mt-20 flex w-full justify-center">
        <motion.div
          style={isDesktop ? { width: frameWidth, borderRadius: frameRadius } : undefined}
          className="relative z-[60] aspect-[21/9] w-full overflow-hidden opacity-50 shadow-2xl lg:w-[70%] lg:rounded-3xl"
        >
          <SiteImage
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover"
          />
        </motion.div>
      </div>

      <motion.div
        aria-hidden
        style={{ opacity: overlayOpacity, y: overlayY, scale: overlayScale }}
        className="pointer-events-none absolute inset-0 z-[100] hidden items-center justify-center lg:flex"
      >
        <p className="pt-[59px] text-[13vw] font-bold uppercase leading-none tracking-tighter text-white">
          {hero.overlayTitle}
        </p>
      </motion.div>
    </motion.section>
  );
}

function Headline({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <h1 className="mb-12 overflow-hidden text-3xl font-medium leading-[1.1] tracking-tight md:text-4xl lg:text-6xl lg:leading-none">
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: EASE_OUT }}
          className="mr-[0.2em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

function Badge() {
  const pathId = useId();
  return (
    <SmartLink
      href={hero.badgeLink.href}
      external={hero.badgeLink.external}
      aria-label={hero.badgeLink.label}
      className="relative flex h-32 w-32 items-center justify-center rounded-full"
    >
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow">
        <defs>
          <path id={pathId} d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
        </defs>
        <text className="fill-current text-[7px] font-bold uppercase tracking-[0.3em]">
          <textPath href={`#${pathId}`}>{hero.badgeText}</textPath>
        </text>
      </svg>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-current/10">
        <EyeIcon className="h-5 w-5" />
      </span>
    </SmartLink>
  );
}

/** Pointer-reactive glow, particles and drawn lines behind the hero. */
function Ambient() {
  const finePointer = useFinePointer();
  const reduceMotion = useReducedMotion();
  const interactive = finePointer && !reduceMotion;

  // Pointer position, absolute (px) and normalised to 0..1 (starts at 1, as on the reference).
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const ratioX = useMotionValue(1);
  const ratioY = useMotionValue(1);

  useEffect(() => {
    if (!interactive) return;
    const onMove = (event: PointerEvent) => {
      pointerX.set(event.clientX - 200);
      pointerY.set(event.clientY - 200);
      ratioX.set(event.clientX / window.innerWidth);
      ratioY.set(event.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive, pointerX, pointerY, ratioX, ratioY]);

  const glowX = useSpring(pointerX, { stiffness: 50, damping: 20 });
  const glowY = useSpring(pointerY, { stiffness: 50, damping: 20 });
  const glow2X = useSpring(pointerX, { stiffness: 30, damping: 20 });
  const glow2Y = useSpring(pointerY, { stiffness: 30, damping: 20 });
  const smoothX = useSpring(ratioX, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(ratioY, { stiffness: 60, damping: 20 });

  return (
    <div aria-hidden>
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none fixed left-0 top-0 z-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]"
      />
      <motion.div
        style={{ x: glow2X, y: glow2Y }}
        className="pointer-events-none fixed left-0 top-0 z-0 h-[400px] w-[400px] rounded-full bg-violet/10 blur-[100px]"
      />

      <ParallaxLayer ratioX={smoothX} ratioY={smoothY} amplitude={20}>
        {FINE_PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-current"
            style={{ width: p.width, height: p.height, top: `${p.top}%`, left: `${p.left}%`, opacity: p.opacity, color: p.color }}
          />
        ))}
      </ParallaxLayer>
      <ParallaxLayer ratioX={smoothX} ratioY={smoothY} amplitude={40}>
        {SOFT_PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-current blur-[1px]"
            style={{ width: p.width, height: p.height, top: `${p.top}%`, left: `${p.left}%`, opacity: p.opacity, color: p.color }}
          />
        ))}
      </ParallaxLayer>
      <ParallaxLayer ratioX={smoothX} ratioY={smoothY} amplitude={30} rotate={-2} fadeTo={0.15}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          {LINES.map((line, i) => (
            <motion.line
              key={i}
              x1={-10}
              y1={line.y}
              x2={110}
              y2={line.y + 10}
              stroke={line.color}
              strokeWidth={0.05}
              opacity={line.opacity}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.1, ease: "easeInOut" }}
            />
          ))}
        </svg>
      </ParallaxLayer>

      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[10%] left-[5%] h-[300px] w-[300px] rounded-full bg-coral/5 blur-[80px]" />
    </div>
  );
}

function ParallaxLayer({
  ratioX,
  ratioY,
  amplitude,
  rotate = 0,
  fadeTo = 1,
  children,
}: {
  ratioX: MotionValue<number>;
  ratioY: MotionValue<number>;
  amplitude: number;
  rotate?: number;
  fadeTo?: number;
  children: React.ReactNode;
}) {
  const x = useTransform(ratioX, (r) => r * amplitude);
  const y = useTransform(ratioY, (r) => r * amplitude);
  const rotation = useTransform(ratioX, (r) => r * rotate);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeTo }}
      transition={{ duration: 1.5 }}
      style={{ x, y, rotate: rotation }}
      className={`pointer-events-none absolute inset-0 z-0 ${fadeTo < 1 ? "overflow-hidden" : ""}`}
    >
      {children}
    </motion.div>
  );
}
