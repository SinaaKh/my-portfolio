"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { site } from "@/content/site";
import { useFinePointer } from "@/lib/use-media-query";

const { firewall } = site;

type Phase = "idle" | "playing" | "result";

/** Distance (px) at which the target starts dodging the pointer. */
const EVADE_RADIUS = 140;
const HINT_INTERVAL_MS = 2500;
const MESSAGE_MS = 1500;

/**
 * "AI Firewall Challenge" mini game (SPEC.md §3.2). The target dodges the mouse, so it's
 * nearly impossible to click. Keyboard users can tab to it, which is the intended "hack".
 */
export function FirewallGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const start = () => {
    setScore(0);
    setRound((r) => r + 1);
    setPhase("playing");
  };
  const addPoint = useCallback(() => setScore((s) => s + 1), []);
  const end = useCallback(() => setPhase("result"), []);
  const quit = useCallback(() => setPhase("idle"), []);

  return (
    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="mb-6 text-4xl font-black uppercase tracking-tighter text-white md:text-6xl">
              {firewall.title}
            </h2>
            <p className="mb-4 text-lg font-bold uppercase tracking-widest text-accent">{firewall.subtitle}</p>
            <p className="mb-8 text-xs uppercase italic tracking-widest text-white/40">{firewall.note}</p>
            <button
              type="button"
              onClick={start}
              className="rounded-full bg-accent px-10 py-4 text-xl font-black uppercase tracking-tighter text-black shadow-glow transition-transform hover:scale-110 focus-visible:scale-110"
            >
              {firewall.startLabel}
            </button>
          </motion.div>
        )}

        {phase === "playing" && (
          <GameBoard
            key={`round-${round}`}
            score={score}
            onScore={addPoint}
            onEnd={end}
            onQuit={quit}
          />
        )}

        {phase === "result" && <Result key="result" score={score} onRetry={start} />}
      </AnimatePresence>
    </div>
  );
}

function GameBoard({
  score,
  onScore,
  onEnd,
  onQuit,
}: {
  score: number;
  onScore: () => void;
  onEnd: () => void;
  onQuit: () => void;
}) {
  const finePointer = useFinePointer();
  const areaRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLButtonElement>(null);
  const [timeLeft, setTimeLeft] = useState(firewall.durationSeconds);
  const [hintIndex, setHintIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [ringVisible, setRingVisible] = useState(false);
  const pointerTypeRef = useRef("mouse");

  // Target position in % of the board, sprung so dodges glide.
  const left = useMotionValue(30);
  const top = useMotionValue(60);
  const leftPct = useTransform(useSpring(left, { stiffness: 400, damping: 30 }), (v) => `${v}%`);
  const topPct = useTransform(useSpring(top, { stiffness: 400, damping: 30 }), (v) => `${v}%`);
  const scale = useSpring(0.8, { stiffness: 300, damping: 20 });

  // Ring cursor (board only).
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);

  useEffect(() => {
    targetRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    const hints = window.setInterval(() => setHintIndex((i) => (i + 1) % firewall.hints.length), HINT_INTERVAL_MS);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onQuit();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(hints);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onQuit]);

  useEffect(() => {
    if (timeLeft === 0) onEnd();
  }, [timeLeft, onEnd]);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), MESSAGE_MS);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const relocate = (awayFromX: number, awayFromY: number) => {
    const area = areaRef.current?.getBoundingClientRect();
    if (!area) return;
    // Pick the candidate furthest from the pointer, inside the play area margins.
    let best = { x: 50, y: 50, d: -1 };
    for (let i = 0; i < 8; i++) {
      const x = 10 + Math.random() * 80;
      const y = 25 + Math.random() * 65;
      const d = Math.hypot((x / 100) * area.width - awayFromX, (y / 100) * area.height - awayFromY);
      if (d > best.d) best = { x, y, d };
    }
    left.set(best.x);
    top.set(best.y);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerTypeRef.current = event.pointerType;
    ringX.set(event.clientX);
    ringY.set(event.clientY);
    const area = areaRef.current?.getBoundingClientRect();
    if (!area || event.pointerType === "touch") return;
    const px = event.clientX - area.left;
    const py = event.clientY - area.top;
    const tx = (left.get() / 100) * area.width;
    const ty = (top.get() / 100) * area.height;
    const distance = Math.hypot(px - tx, py - ty);
    scale.set(distance < EVADE_RADIUS * 2 ? 0.8 + 0.1 * (1 - Math.min(distance, EVADE_RADIUS * 2) / (EVADE_RADIUS * 2)) : 0.8);
    if (distance < EVADE_RADIUS) relocate(px, py);
  };

  const hit = () => {
    if (pointerTypeRef.current === "touch") {
      setMessage(firewall.touchBlockedMessage);
      return;
    }
    onScore();
    const area = areaRef.current?.getBoundingClientRect();
    relocate(area ? area.width * (left.get() / 100) : 0, area ? area.height * (top.get() / 100) : 0);
  };

  const status = message ?? firewall.hints[hintIndex];

  return (
    <motion.div
      ref={areaRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerMove={onPointerMove}
      onPointerDown={(event) => {
        pointerTypeRef.current = event.pointerType;
        if (event.target === event.currentTarget) {
          setMessage(
            event.pointerType === "touch"
              ? firewall.touchBlockedMessage
              : firewall.missMessages[Math.floor(Math.random() * firewall.missMessages.length)],
          );
        }
      }}
      onPointerEnter={() => setRingVisible(true)}
      onPointerLeave={() => setRingVisible(false)}
      className={`relative h-full w-full ${finePointer ? "cursor-none" : ""}`}
    >
      {finePointer && ringVisible && (
        <motion.div
          aria-hidden
          style={{ x: ringX, y: ringY }}
          className="pointer-events-none fixed left-0 top-0 z-50 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white mix-blend-difference"
        />
      )}

      <div className="pointer-events-none absolute left-1/2 top-10 flex -translate-x-1/2 flex-col items-center gap-4">
        <div className="flex gap-12">
          <Stat label={firewall.scoreLabel} value={String(score)} />
          <Stat label={firewall.timeLabel} value={`${timeLeft}${firewall.timeUnit}`} accent />
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            role="status"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="rounded-full bg-white/5 px-4 py-1 text-sm font-bold uppercase tracking-widest text-accent backdrop-blur-sm"
          >
            {status}
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.button
        ref={targetRef}
        type="button"
        aria-label={firewall.targetLabel}
        onClick={hit}
        style={{ left: leftPct, top: topPct, scale }}
        className="absolute -ml-7 -mt-7 flex h-14 w-14 cursor-pointer items-center justify-center rounded-xl outline-offset-4"
      >
        <span aria-hidden className="absolute inset-0 rounded-xl bg-accent opacity-40 blur-md" />
        <span className="relative flex h-8 w-8 items-center justify-center rounded bg-accent text-[10px] font-black text-black shadow-lg">
          {firewall.targetLabel}
        </span>
        <span aria-hidden className="absolute inset-0 animate-ping rounded-full border-2 border-accent/30" />
      </motion.button>
    </motion.div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className="mb-1 text-xs uppercase tracking-widest text-white/40">{label}</p>
      <p className={`text-4xl font-black tabular-nums ${accent ? "text-accent" : "text-white"}`}>{value}</p>
    </div>
  );
}

function Result({ score, onRetry }: { score: number; onRetry: () => void }) {
  const retryRef = useRef<HTMLButtonElement>(null);
  const won = score > 0;

  useEffect(() => {
    retryRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      role="status"
      className="rounded-5xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl"
    >
      <h3 className="mb-2 text-6xl font-black uppercase italic tracking-tighter text-white">
        {won ? firewall.result.wonTitle : firewall.result.lostTitle}
      </h3>
      <p className="mb-8 text-2xl font-bold uppercase tracking-widest text-accent">
        {(won ? firewall.result.wonMessage : firewall.result.lostMessage).replace("{score}", String(score))}
      </p>
      <button
        ref={retryRef}
        type="button"
        onClick={onRetry}
        className="rounded-full bg-accent px-8 py-3 font-bold text-black transition-colors hover:bg-white focus-visible:bg-white"
      >
        {firewall.result.retryLabel}
      </button>
    </motion.div>
  );
}
