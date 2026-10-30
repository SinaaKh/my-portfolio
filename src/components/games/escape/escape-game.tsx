"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { site } from "@/content/site";

const { escapeGame: copy } = site;

const TARGET_SIZE = 56;
const TARGET_HALF = TARGET_SIZE / 2;
/** Pointer distance (px) at which the model starts running. */
const FLEE_RADIUS = 210;
const FLEE_SPEED = 640;
const WANDER_SPEED = 60;
/** How long it stays put in view before running to another part of the page. */
const HOP_AFTER_MS = 9000;
const CALM_HOP_AFTER_MS = 4000;
const SPRINT_MS = 850;
const BREAKOUT_MS = 1100;
const HIDE_MS = 1400;
const EDGE_MARGIN = 8;
const CORNER_DISTANCE = 44;
const CHIP_EVERY_PX = 420;
const MAX_CHIPS = 14;
const NUDGE_DISTANCE = 130;
const NUDGE_GAP_MS = 1200;
/** Misclicks this close to the model shouldn't follow a link off the page. */
const CLICK_GUARD_RADIUS = 110;
/** Chance a run from the top of the page ends behind the nav, which is only visible up there. */
const NAV_HIDE_CHANCE = 0.6;
const TOUCH_DASH = 70;
const SECTIONS = ["#hero", "#versatility", "#tech-stack", "#insights", "#partnership", "#collaborations", "#contact"];

type Phase = "idle" | "playing" | "result";
type Outcome = { won: boolean; caught: number; timeLeft: number };

/** Game B: The Model Escapes. Everything it does is an overlay or a transient animation, so nothing needs undoing. */
export function EscapeGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [refocus, setRefocus] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Next keeps this route alive in a hidden <Activity> across navigations, so effects clean up but
  // state survives. Reset here, or coming back would resume the round.
  useLayoutEffect(
    () => () => {
      setPhase("idle");
      setRefocus(false);
    },
    [],
  );

  const start = () => {
    setRound((r) => r + 1);
    setPhase("playing");
  };
  const quit = useCallback(() => {
    setRefocus(true);
    setPhase("idle");
  }, []);
  const finish = useCallback((next: Outcome) => {
    setOutcome(next);
    setPhase("result");
  }, []);

  return (
    <div ref={boxRef} className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 pb-14 pt-6">
      {phase === "playing" ? (
        <p className="text-center text-lg font-bold uppercase tracking-widest text-accent">{copy.inProgressMessage}</p>
      ) : (
        <Intro focusOnMount={refocus} onStart={start} />
      )}
      {phase === "playing" && <LooseModel key={round} boxRef={boxRef} onEnd={finish} onQuit={quit} />}
      {phase === "result" && outcome && <ResultCard outcome={outcome} onRetry={start} onClose={quit} />}
    </div>
  );
}

function Intro({ focusOnMount, onStart }: { focusOnMount: boolean; onStart: () => void }) {
  const reduceMotion = useReducedMotion();
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focusOnMount) startRef.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <div className="text-center">
      <h2 className="mb-6 text-4xl font-black uppercase tracking-tighter text-white md:text-6xl">{copy.title}</h2>
      <p className="mb-4 text-lg font-bold uppercase tracking-widest text-accent">{copy.subtitle}</p>
      <p className="mb-8 text-xs uppercase italic tracking-widest text-white/40">{copy.note}</p>
      {reduceMotion && <p className="mb-6 text-sm text-white/60">{copy.reducedMotionNote}</p>}
      <button
        ref={startRef}
        type="button"
        onClick={onStart}
        className="rounded-full bg-accent px-10 py-4 text-xl font-black uppercase tracking-tighter text-black shadow-glow transition-transform hover:scale-110 focus-visible:scale-110"
      >
        {copy.startLabel}
      </button>
    </div>
  );
}

function LooseModel({
  boxRef,
  onEnd,
  onQuit,
}: {
  boxRef: RefObject<HTMLDivElement | null>;
  onEnd: (outcome: Outcome) => void;
  onQuit: () => void;
}) {
  const root = useOverlayRoot();
  const reduceMotion = useReducedMotion() ?? false;
  const lenis = useLenis();

  const layerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLButtonElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const hopRef = useRef<() => void>(() => {});
  const caughtRef = useRef(0);
  const timeRef = useRef(copy.durationSeconds);

  const [caught, setCaught] = useState(0);
  const [timeLeft, setTimeLeft] = useState(copy.durationSeconds);
  const [chips, setChips] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [locate, setLocate] = useState<"above" | "below" | null>(null);
  const [cornered, setCornered] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    // Without a pointer move the site cursor stays enlarged where Start was.
    document.documentElement.dispatchEvent(new PointerEvent("pointerleave"));
    targetRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const target = targetRef.current;
    const layer = layerRef.current;
    if (!target || !layer) return;

    const box = boxRef.current?.getBoundingClientRect();
    const pos = posRef.current;
    pos.x = box ? box.left + box.width / 2 : window.innerWidth / 2;
    pos.y = (box ? box.top + box.height / 2 : window.innerHeight / 2) + window.scrollY;

    const pointer = { x: 0, y: 0, active: false, type: "mouse" };
    const running = new Set<Animation>();
    const headings = Array.from(document.querySelectorAll<HTMLElement>("main h1, main h2, footer h2"));

    type Mode =
      | { name: "breakout"; until: number }
      | { name: "roam" }
      | { name: "hide"; until: number }
      | { name: "sprint"; from: { x: number; y: number }; to: { x: number; y: number }; start: number; thenHide: boolean };
    const startedAt = performance.now();
    let mode: Mode = reduceMotion ? { name: "roam" } : { name: "breakout", until: startedAt + BREAKOUT_MS };
    let last = startedAt;
    let lastHop = startedAt;
    let lastScroll = window.scrollY;
    let scrolled = 0;
    let lastNudgeCheck = startedAt;
    let lastNudge = 0;
    let angle = Math.random() * Math.PI * 2;
    let chipId = 0;
    let hops = 0;
    let wasCornered = false;
    let wasLocate: "above" | "below" | null = null;
    let frameId = 0;

    const addChip = (x: number, y: number) => {
      const text = copy.citations[chipId % copy.citations.length];
      const id = (chipId += 1);
      setChips((list) => [...list.slice(-(MAX_CHIPS - 1)), { id, x, y, text }]);
    };

    const hop = () => {
      lastHop = performance.now();
      const scroll = window.scrollY;
      const width = window.innerWidth;
      const randomX = TARGET_HALF + EDGE_MARGIN + Math.random() * Math.max(0, width - TARGET_SIZE - EDGE_MARGIN * 2);
      const hideBehindNav = !reduceMotion && scroll < 150 && Math.random() < NAV_HIDE_CHANCE;
      // The first run is always up to the hero, so the player goes where the nav can be used as cover.
      const sections = hops === 0 ? SECTIONS.slice(0, 1) : SECTIONS;
      hops += 1;

      let to = { x: randomX, y: scroll + 40 };
      if (!hideBehindNav) {
        const options = sections
          .map((selector) => document.querySelector(selector))
          .filter((el): el is Element => el !== null)
          .map((el) => {
            const rect = el.getBoundingClientRect();
            return { top: rect.top + scroll, height: rect.height };
          })
          .filter(({ top }) => Math.abs(top - pos.y) > window.innerHeight * 0.6);
        const choice = options[Math.floor(Math.random() * options.length)];
        if (choice) {
          const usable = Math.max(0, Math.min(choice.height, window.innerHeight) - 240);
          to = { x: randomX, y: choice.top + 120 + Math.random() * usable };
        } else {
          to = { x: randomX, y: scroll + window.innerHeight / 2 };
        }
      }

      if (reduceMotion) {
        pos.x = to.x;
        pos.y = to.y;
        return;
      }
      mode = { name: "sprint", from: { ...pos }, to, start: performance.now(), thenHide: hideBehindNav };
    };
    hopRef.current = hop;

    const nudgeHeadings = (now: number) => {
      if (reduceMotion || now - lastNudge < NUDGE_GAP_MS) return;
      const x = pos.x;
      const y = pos.y - window.scrollY;
      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight || rect.width === 0) continue;
        const dx = Math.max(rect.left - x, 0, x - rect.right);
        const dy = Math.max(rect.top - y, 0, y - rect.bottom);
        if (Math.hypot(dx, dy) > NUDGE_DISTANCE) continue;
        lastNudge = now;
        // `translate` and `rotate` are separate from the `transform` Framer Motion writes, and an
        // animation leaves no trace on the element once it finishes or is cancelled.
        const push = y < rect.top + rect.height / 2 ? 7 : -7;
        const animation = heading.animate(
          [
            { translate: "0 0", rotate: "0deg" },
            { translate: `0 ${push}px`, rotate: `${push > 0 ? 0.6 : -0.6}deg`, offset: 0.35 },
            { translate: "0 0", rotate: "0deg" },
          ],
          { duration: 520, easing: "ease-out" },
        );
        running.add(animation);
        animation.onfinish = () => running.delete(animation);
        break;
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      const scroll = window.scrollY;
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;
      const hudHeight = hudRef.current?.offsetHeight ?? 0;

      scrolled += Math.abs(scroll - lastScroll);
      lastScroll = scroll;
      if (scrolled >= CHIP_EVERY_PX) {
        scrolled = 0;
        addChip(8 + Math.random() * Math.max(0, viewW - 240), scroll + 60 + Math.random() * Math.max(0, viewH - 220));
      }

      const minX = TARGET_HALF + EDGE_MARGIN;
      const maxX = viewW - TARGET_HALF - EDGE_MARGIN;
      const minY = scroll + TARGET_HALF + EDGE_MARGIN;
      const maxY = scroll + viewH - hudHeight - TARGET_HALF - EDGE_MARGIN * 3;
      const inView = pos.y > scroll && pos.y < scroll + viewH;
      let isCornered = false;
      let shake = 0;

      if (mode.name === "breakout") {
        shake = Math.sin(now / 28) * 3;
        if (now >= mode.until) {
          mode = { name: "roam" };
          lastHop = now;
        }
      } else if (mode.name === "hide") {
        if (now >= mode.until) {
          mode = { name: "sprint", from: { ...pos }, to: { x: pos.x, y: scroll + 220 }, start: now, thenHide: false };
        }
      } else if (mode.name === "sprint") {
        const t = Math.min((now - mode.start) / SPRINT_MS, 1);
        const eased = t * t * (3 - 2 * t);
        pos.x = mode.from.x + (mode.to.x - mode.from.x) * eased;
        pos.y = mode.from.y + (mode.to.y - mode.from.y) * eased;
        if (t === 1) {
          lastHop = now;
          mode = mode.thenHide ? { name: "hide", until: now + HIDE_MS } : { name: "roam" };
        }
      } else if (reduceMotion) {
        if (inView && now - lastHop > CALM_HOP_AFTER_MS) hop();
      } else {
        const fine = pointer.type !== "touch";
        const dx = pos.x - pointer.x;
        const dy = pos.y - scroll - pointer.y;
        const distance = Math.hypot(dx, dy) || 1;
        let vx: number;
        let vy: number;
        if (fine && pointer.active && inView && distance < FLEE_RADIUS) {
          const speed = FLEE_SPEED * Math.sqrt(1 - distance / FLEE_RADIUS);
          vx = (dx / distance) * speed;
          vy = (dy / distance) * speed;
        } else {
          angle += (Math.random() - 0.5) * dt * 4;
          const speed = WANDER_SPEED;
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        }

        const nextX = pos.x + vx * dt;
        const nextY = pos.y + vy * dt;
        pos.x = Math.min(Math.max(nextX, minX), maxX);
        // Vertically it can't run past the screen edge, but scrolling can still leave it behind.
        pos.y = Math.max(Math.min(nextY, Math.max(maxY, pos.y)), Math.min(minY, pos.y));

        if (inView) {
          const wallX = pos.x - minX < CORNER_DISTANCE || maxX - pos.x < CORNER_DISTANCE;
          const wallY = pos.y - minY < CORNER_DISTANCE || maxY - pos.y < CORNER_DISTANCE;
          isCornered = fine && pointer.active && wallX && wallY && distance < FLEE_RADIUS * 1.4;
          if (nextX < minX || nextX > maxX) angle = Math.PI - angle;
          if (nextY < minY || nextY > maxY) angle = -angle;
          if (!isCornered && now - lastHop > HOP_AFTER_MS) hop();
          if (isCornered) lastHop = now;
        } else {
          // Off screen it waits to be found, so a scroll is never wasted.
          lastHop = now;
        }
      }

      if (now - lastNudgeCheck > 200) {
        lastNudgeCheck = now;
        nudgeHeadings(now);
      }

      if (isCornered !== wasCornered) {
        wasCornered = isCornered;
        setCornered(isCornered);
      }
      const nextLocate = pos.y < scroll ? "above" : pos.y > scroll + viewH - hudHeight ? "below" : null;
      if (nextLocate !== wasLocate) {
        wasLocate = nextLocate;
        setLocate(nextLocate);
      }

      layer.style.transform = `translate3d(0, ${-scroll}px, 0)`;
      target.style.transform = `translate3d(${pos.x - TARGET_HALF + shake}px, ${pos.y - TARGET_HALF}px, 0)`;
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.type = event.pointerType;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onPointerDown = (event: PointerEvent) => {
      pointer.type = event.pointerType;
      if (event.pointerType !== "touch" || mode.name !== "roam" || reduceMotion) return;
      // On a touchscreen laptop a near miss makes it hop aside, since there's no hover to dodge.
      const dx = pos.x - event.clientX;
      const dy = pos.y - window.scrollY - event.clientY;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance > TARGET_HALF && distance < CLICK_GUARD_RADIUS) {
        pos.x = Math.min(Math.max(pos.x + (dx / distance) * TOUCH_DASH, TARGET_HALF + EDGE_MARGIN), window.innerWidth - TARGET_HALF - EDGE_MARGIN);
        pos.y += (dy / distance) * TOUCH_DASH;
      }
    };
    const onClickCapture = (event: MouseEvent) => {
      const clicked = event.target;
      if (!(clicked instanceof Element) || clicked.closest("[data-escape-ui]")) return;
      const distance = Math.hypot(pos.x - event.clientX, pos.y - window.scrollY - event.clientY);
      if (distance < CLICK_GUARD_RADIUS) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onQuit();
    };

    const root = document.documentElement;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("click", onClickCapture, true);
    window.addEventListener("keydown", onKeyDown);

    const timer = window.setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) onEnd({ won: false, caught: caughtRef.current, timeLeft: 0 });
    }, 1000);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearInterval(timer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("keydown", onKeyDown);
      running.forEach((animation) => animation.cancel());
      running.clear();
    };
  }, [boxRef, reduceMotion, onEnd, onQuit]);

  const scrollToTarget = () => {
    const top = Math.max(0, posRef.current.y - window.innerHeight / 2);
    if (lenis) lenis.scrollTo(top, { duration: 0.7 });
    else window.scrollTo({ top });
  };

  const catchIt = () => {
    caughtRef.current += 1;
    setCaught(caughtRef.current);
    if (caughtRef.current >= copy.catchesToWin) {
      onEnd({ won: true, caught: caughtRef.current, timeLeft: timeRef.current });
      return;
    }
    setAnnouncement(copy.catchAnnouncement.replace("{caught}", String(caughtRef.current)).replace("{total}", String(copy.catchesToWin)));
    hopRef.current();
  };

  return createPortal(
    <>
      <div className="pointer-events-none fixed inset-0 z-[998] overflow-hidden">
        <div ref={layerRef} className="absolute left-0 top-0 h-0 w-full will-change-transform">
          {chips.map((chip) => (
            <motion.span
              key={chip.id}
              aria-hidden
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              style={{ left: chip.x, top: chip.y }}
              className="absolute whitespace-nowrap rounded-full border border-accent/60 bg-black/85 px-3 py-1 text-xs font-bold text-accent"
            >
              {chip.text}
            </motion.span>
          ))}
          <button
            ref={targetRef}
            type="button"
            data-escape-ui
            aria-label={copy.targetAriaLabel}
            style={{ width: TARGET_SIZE, height: TARGET_SIZE }}
            onPointerDown={(event) => {
              event.stopPropagation();
              catchIt();
            }}
            onClick={(event) => {
              // Pointer catches happen on press; a click with no pointer detail is the keyboard.
              if (event.detail !== 0) return;
              if (locate) scrollToTarget();
              else catchIt();
            }}
            className="pointer-events-auto absolute left-0 top-0 flex cursor-pointer touch-manipulation items-center justify-center rounded-xl outline-offset-4"
          >
            <span aria-hidden className={`absolute inset-0 rounded-xl opacity-40 blur-md ${cornered ? "bg-coral" : "bg-accent"}`} />
            <span className={`relative flex h-9 w-9 items-center justify-center rounded text-xs font-black text-black shadow-lg ${cornered ? "bg-coral" : "bg-accent"}`}>
              {copy.targetLabel}
            </span>
            {!reduceMotion && <span aria-hidden className="absolute inset-0 animate-ping rounded-full border-2 border-accent/30" />}
            {cornered && (
              <span aria-hidden className="absolute -top-5 whitespace-nowrap text-eyebrow font-black uppercase tracking-widest text-coral">
                {copy.corneredLabel}
              </span>
            )}
          </button>
        </div>
      </div>

      <div
        ref={hudRef}
        data-escape-ui
        className="fixed bottom-3 left-1/2 z-[10000] flex w-max max-w-[calc(100vw-16px)] -translate-x-1/2 flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-white/15 bg-black px-4 py-2 text-white shadow-card-sm"
      >
        <p className="text-xs font-bold uppercase tracking-widest">
          <span className="text-white/50">{copy.caughtLabel} </span>
          <span className="tabular-nums">
            {caught}/{copy.catchesToWin}
          </span>
        </p>
        <p className="text-xs font-bold uppercase tracking-widest">
          <span className="text-white/50">{copy.timeLabel} </span>
          <span className="tabular-nums text-accent">
            {timeLeft}
            {copy.timeUnit}
          </span>
        </p>
        {locate && (
          <button type="button" onClick={scrollToTarget} className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-black">
            {locate === "above" ? copy.locateAboveLabel : copy.locateBelowLabel}
          </button>
        )}
        <button type="button" onClick={onQuit} className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-white/10">
          {copy.endLabel}
        </button>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </>,
    root,
  );
}

/** The overlay lives in its own element, so nothing it adds to the page outlives the game. */
function useOverlayRoot() {
  const [root] = useState(() => document.createElement("div"));
  useLayoutEffect(() => {
    document.body.append(root);
    return () => root.remove();
  }, [root]);
  return root;
}

function ResultCard({ outcome, onRetry, onClose }: { outcome: Outcome; onRetry: () => void; onClose: () => void }) {
  const root = useOverlayRoot();
  const retryRef = useRef<HTMLButtonElement>(null);
  const { result } = copy;

  useEffect(() => {
    retryRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const message = outcome.won
    ? result.wonMessage.replace("{time}", String(outcome.timeLeft))
    : result.lostMessage.replace("{caught}", String(outcome.caught)).replace("{total}", String(copy.catchesToWin));

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        role="status"
        className="pointer-events-auto max-w-xl rounded-5xl border border-white/10 bg-black/90 p-8 text-center shadow-card backdrop-blur-xl md:p-12"
      >
        <h3 className="mb-3 text-4xl font-black uppercase italic tracking-tighter text-white md:text-6xl">
          {outcome.won ? result.wonTitle : result.lostTitle}
        </h3>
        <p className="mb-8 font-bold text-accent">{message}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            ref={retryRef}
            type="button"
            onClick={onRetry}
            className="rounded-full bg-accent px-8 py-3 font-bold text-black transition-colors hover:bg-white focus-visible:bg-white"
          >
            {result.retryLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/25 px-8 py-3 font-bold text-white transition-colors hover:bg-white/10"
          >
            {result.closeLabel}
          </button>
        </div>
      </motion.div>
    </div>,
    root,
  );
}
