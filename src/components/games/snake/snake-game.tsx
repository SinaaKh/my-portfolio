"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { site } from "@/content/site";
import { begin, createGame, step, stepDelay, turn, type Direction, type EndCause, type GameState } from "./engine";

const { snakeGame: copy } = site;

const BEST_KEY = "mini-game-snake-best";
const SWIPE_DISTANCE = 22;
/** Longer than the scroll that brings the section into view when the game starts. */
const OFFSCREEN_CHECK_DELAY_MS = 800;
const KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(best: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(best));
  } catch {
    // Private windows can refuse storage; the best score just won't persist.
  }
}

type Phase = "idle" | "playing" | "result";
type Result = { cause: EndCause; score: number; best: number; isBest: boolean };

/** Game A: Context Window Snake. `withPicker` leaves room at the bottom for the game picker. */
export function SnakeGame({ withPicker = false }: { withPicker?: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [best, setBest] = useState(readBest);
  const [refocus, setRefocus] = useState(false);

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
  const finish = useCallback(
    (cause: EndCause, score: number) => {
      const isBest = score > best;
      const nextBest = Math.max(best, score);
      if (isBest) writeBest(nextBest);
      setBest(nextBest);
      setResult({ cause, score, best: nextBest, isBest });
      setPhase("result");
    },
    [best],
  );

  return (
    <div className={`relative z-10 flex h-full w-full flex-col items-center justify-center px-4 pt-6 short:pt-3 ${withPicker ? "pb-14" : "pb-6 short:pb-3"}`}>
      {phase === "idle" && <Intro best={best} focusOnMount={refocus} onStart={start} />}
      {phase === "playing" && <Board key={round} onEnd={finish} onQuit={quit} />}
      {phase === "result" && result && <Outcome result={result} onRetry={start} />}
    </div>
  );
}

function Intro({ best, focusOnMount, onStart }: { best: number; focusOnMount: boolean; onStart: () => void }) {
  const reduceMotion = useReducedMotion();
  const startRef = useRef<HTMLButtonElement>(null);

  // Returning from a quit: keep keyboard users on the button, without moving the page.
  useEffect(() => {
    if (focusOnMount) startRef.current?.focus({ preventScroll: true });
  }, [focusOnMount]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
      <h2 className="mb-6 text-4xl font-black uppercase tracking-tighter text-white md:text-6xl short:mb-3 short:text-4xl">{copy.title}</h2>
      <p className="mb-4 text-lg font-bold uppercase tracking-widest text-accent short:mb-2 short:text-base">{copy.subtitle}</p>
      <p className="mb-4 text-xs uppercase italic tracking-widest text-white/40 short:mb-2">{copy.note}</p>
      <ul className="mb-8 flex justify-center gap-6 text-xs font-bold uppercase tracking-widest text-white/60 short:mb-5">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-sm bg-accent" />
          {copy.relevantLabel}
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-sm bg-coral" />
          {copy.junkLabel}
        </li>
      </ul>
      {reduceMotion && <p className="mb-6 text-sm text-white/60">{copy.reducedMotionNote}</p>}
      {best > 0 && <p className="mb-6 text-sm font-bold uppercase tracking-widest text-white/60 short:mb-3">{copy.resultBest.replace("{best}", String(best))}</p>}
      <button
        ref={startRef}
        type="button"
        onClick={onStart}
        className="rounded-full bg-accent px-10 py-4 text-xl font-black uppercase tracking-tighter text-black shadow-glow short:py-3 transition-transform hover:scale-110 focus-visible:scale-110"
      >
        {copy.startLabel}
      </button>
    </motion.div>
  );
}

function Board({ onEnd, onQuit }: { onEnd: (cause: EndCause, score: number) => void; onQuit: () => void }) {
  const reduceMotion = useReducedMotion() ?? false;
  const lenis = useLenis();
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextBarRef = useRef<HTMLDivElement>(null);
  const qualityBarRef = useRef<HTMLDivElement>(null);
  const contextMeterRef = useRef<HTMLDivElement>(null);
  const qualityMeterRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameState | null>(null);
  const pausedRef = useRef(false);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const movingRef = useRef(false);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [moving, setMoving] = useState(false);

  const pause = useCallback((next: boolean) => {
    pausedRef.current = next;
    setPaused(next);
  }, []);

  // The snake waits for the first input, so nobody hits a wall before they've found the controls.
  const steer = useCallback((direction: Direction) => {
    const game = gameRef.current;
    if (!game) return;
    if (movingRef.current) {
      turn(game, direction);
      return;
    }
    movingRef.current = true;
    setMoving(true);
    begin(game, direction);
  }, []);

  // Bring the whole section into view, so the game has the screen and doesn't pause itself.
  useEffect(() => {
    // Without a pointer move the site cursor stays enlarged where Start was, on top of the board.
    document.documentElement.dispatchEvent(new PointerEvent("pointerleave"));
    const section = rootRef.current?.closest("section");
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    if (lenis) lenis.scrollTo(top, { duration: 0.5 });
    else window.scrollTo({ top });
    boardRef.current?.focus({ preventScroll: true });
  }, [lenis]);

  // Game loop. It only runs while unpaused, and stops completely on unmount.
  useEffect(() => {
    if (paused) return;
    const canvas = canvasRef.current;
    const board = boardRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !board || !ctx) return;

    const rect = board.getBoundingClientRect();
    if (!gameRef.current) {
      const cellSize = rect.width < 500 ? 24 : 30;
      const cols = Math.max(10, Math.floor(rect.width / cellSize));
      const rows = Math.max(10, Math.floor(rect.height / cellSize));
      gameRef.current = createGame(cols, rows, Math.random);
      canvas.dataset.cols = String(cols);
      canvas.dataset.rows = String(rows);
    }
    const game = gameRef.current;

    const styles = getComputedStyle(document.documentElement);
    const color = (name: string) => styles.getPropertyValue(name).trim();
    const colors = { doc: color("--color-accent"), junk: color("--color-coral"), body: color("--color-violet"), tail: color("--color-indigo") };

    const resize = () => {
      const size = board.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const unit = Math.min(size.width / game.cols, size.height / game.rows);
      const width = unit * game.cols;
      const height = unit * game.rows;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(board);

    const updateMeters = () => {
      const context = Math.round(game.context);
      const quality = Math.round(game.quality);
      if (contextBarRef.current) contextBarRef.current.style.transform = `scaleX(${game.context / 100})`;
      if (qualityBarRef.current) qualityBarRef.current.style.transform = `scaleX(${game.quality / 100})`;
      contextMeterRef.current?.setAttribute("aria-valuenow", String(context));
      qualityMeterRef.current?.setAttribute("aria-valuenow", String(quality));
    };
    updateMeters();

    const draw = (progress: number) => {
      const unit = canvas.clientWidth / game.cols;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      ctx.fillStyle = "rgba(255,255,255,0.06)";
      for (let y = 0; y < game.rows; y++) {
        for (let x = 0; x < game.cols; x++) {
          ctx.fillRect((x + 0.5) * unit - 1, (y + 0.5) * unit - 1, 2, 2);
        }
      }

      const tile = (x: number, y: number, fill: string, inset: number) => {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.roundRect(x * unit + inset, y * unit + inset, unit - inset * 2, unit - inset * 2, unit * 0.18);
        ctx.fill();
      };

      // Relevant doc: a solid page with text lines, so it reads without color too.
      tile(game.doc.x, game.doc.y, colors.doc, unit * 0.14);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      for (let line = 0; line < 3; line++) {
        ctx.fillRect(game.doc.x * unit + unit * 0.28, game.doc.y * unit + unit * (0.3 + line * 0.17), unit * 0.44, Math.max(1, unit * 0.07));
      }

      // Junk doc: marked with a cross.
      for (const { cell } of game.junk) {
        tile(cell.x, cell.y, colors.junk, unit * 0.14);
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = Math.max(1.5, unit * 0.09);
        ctx.beginPath();
        ctx.moveTo(cell.x * unit + unit * 0.32, cell.y * unit + unit * 0.32);
        ctx.lineTo(cell.x * unit + unit * 0.68, cell.y * unit + unit * 0.68);
        ctx.moveTo(cell.x * unit + unit * 0.68, cell.y * unit + unit * 0.32);
        ctx.lineTo(cell.x * unit + unit * 0.32, cell.y * unit + unit * 0.68);
        ctx.stroke();
      }

      const at = (index: number) => {
        const now = game.snake[index];
        const before = game.previous[index] ?? game.previous[game.previous.length - 1] ?? now;
        return {
          x: (before.x + (now.x - before.x) * progress + 0.5) * unit,
          y: (before.y + (now.y - before.y) * progress + 0.5) * unit,
        };
      };

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = unit * 0.62;
      ctx.strokeStyle = colors.tail;
      ctx.beginPath();
      game.snake.forEach((_, index) => {
        const point = at(index);
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.strokeStyle = colors.body;
      ctx.beginPath();
      game.snake.slice(0, Math.ceil(game.snake.length / 2)).forEach((_, index) => {
        const point = at(index);
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      const head = at(0);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(head.x, head.y, unit * 0.36, 0, Math.PI * 2);
      ctx.fill();
    };

    let frameId = 0;
    let last = performance.now();
    let waited = 0;
    const loop = (now: number) => {
      const elapsed = Math.min(now - last, 100);
      last = now;
      waited = movingRef.current ? waited + elapsed : 0;
      const delay = stepDelay(game, reduceMotion);
      while (waited >= delay && !game.cause) {
        waited -= delay;
        const events = step(game, delay, Math.random);
        if (events.ateDoc) setScore(game.score);
        updateMeters();
      }
      draw(reduceMotion ? 1 : Math.min(waited / delay, 1));
      if (game.cause) {
        onEnd(game.cause, game.score);
        return;
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [paused, reduceMotion, onEnd]);

  // Keyboard: game keys steer and never scroll the page while the game is running.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onQuit();
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === " " && document.activeElement === boardRef.current) {
        event.preventDefault();
        pause(!pausedRef.current);
        return;
      }
      if (pausedRef.current) return;
      const direction = KEYS[key];
      if (direction) {
        event.preventDefault();
        steer(direction);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onQuit, pause, steer]);

  // Pause when the section leaves the screen or the tab is hidden. Resuming is always the player's call.
  useEffect(() => {
    const section = rootRef.current?.closest("section");
    if (!section) return;
    // Start can be pressed with the section only part way into view, so wait for the scroll to finish.
    const mountedAt = performance.now();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && performance.now() - mountedAt >= OFFSCREEN_CHECK_DELAY_MS) pause(true);
      },
      { threshold: 0.5 },
    );
    observer.observe(section);
    const onVisibility = () => {
      if (document.hidden) pause(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pause]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = swipeRef.current;
    if (!origin || !gameRef.current || pausedRef.current) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_DISTANCE) return;
    const direction: Direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    steer(direction);
    swipeRef.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerEnd = () => {
    swipeRef.current = null;
  };

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="@container flex h-full w-full max-w-[760px] flex-col justify-center gap-3 pt-2 short:gap-2 short:pt-0"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-white">
          <span className="mr-2 text-xs uppercase tracking-widest text-white/40">{copy.scoreLabel}</span>
          <span className="text-2xl font-black tabular-nums">{score}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              pause(!paused);
              boardRef.current?.focus({ preventScroll: true });
            }}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
          >
            {paused ? copy.resumeLabel : copy.pauseLabel}
          </button>
          <button
            type="button"
            onClick={onQuit}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
          >
            {copy.quitLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Meter meterRef={contextMeterRef} barRef={contextBarRef} label={copy.contextLabel} barClass="bg-violet" />
        <Meter meterRef={qualityMeterRef} barRef={qualityBarRef} label={copy.qualityLabel} barClass="bg-accent" />
      </div>

      {/* Fills the height that's left, but never gets taller than it is wide, so on a phone the board
          is a compact square with the whole game on screen instead of a tall strip. */}
      <div className="relative max-h-[100cqw] min-h-0 flex-1">
        <div
          ref={boardRef}
          tabIndex={0}
          role="application"
          aria-label={copy.boardLabel}
          data-lenis-prevent
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          className="absolute inset-0 flex touch-none select-none items-center justify-center rounded-xl outline-offset-4"
        >
          <canvas ref={canvasRef} aria-hidden className="rounded-xl border border-white/10 bg-black/85" />
        </div>
        {(paused || !moving) && (
          <p className="pointer-events-none absolute inset-x-4 top-1/4 text-center text-2xl font-black uppercase tracking-tighter text-white">
            {paused ? copy.pausedMessage : copy.readyMessage}
          </p>
        )}
      </div>

      <p role="status" className="sr-only">
        {paused ? copy.pausedMessage : moving ? copy.scoreAnnouncement.replace("{score}", String(score)) : copy.readyMessage}
      </p>
    </motion.div>
  );
}

function Meter({
  meterRef,
  barRef,
  label,
  barClass,
}: {
  meterRef: React.RefObject<HTMLDivElement | null>;
  barRef: React.RefObject<HTMLDivElement | null>;
  label: string;
  barClass: string;
}) {
  return (
    <div ref={meterRef} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
      <p className="mb-1 text-eyebrow font-bold uppercase tracking-widest text-white/60">{label}</p>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div ref={barRef} className={`h-full origin-left rounded-full ${barClass}`} style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}

function Outcome({ result, onRetry }: { result: Result; onRetry: () => void }) {
  const retryRef = useRef<HTMLButtonElement>(null);
  const ending = copy.endings[result.cause];

  useEffect(() => {
    retryRef.current?.focus({ preventScroll: true });
    // An arrow key held through a crash keeps repeating; those repeats shouldn't scroll the page.
    const swallowRepeats = (event: KeyboardEvent) => {
      if (event.repeat && (event.key in KEYS || event.key.toLowerCase() in KEYS)) event.preventDefault();
    };
    window.addEventListener("keydown", swallowRepeats);
    return () => window.removeEventListener("keydown", swallowRepeats);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      role="status"
      className="max-w-xl rounded-5xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl md:p-12 short:p-6"
    >
      <h3 className="mb-2 text-4xl font-black uppercase italic tracking-tighter text-white md:text-6xl short:text-4xl">{ending.title}</h3>
      <p className="mb-6 text-white/70 short:mb-3">{ending.message}</p>
      <p className="mb-1 text-2xl font-bold uppercase tracking-widest text-accent short:text-xl">
        {copy.resultScore.replace("{score}", String(result.score))}
      </p>
      <p className="mb-8 text-sm font-bold uppercase tracking-widest text-white/60 short:mb-4">
        {result.isBest ? copy.newBestLabel : copy.resultBest.replace("{best}", String(result.best))}
      </p>
      <button
        ref={retryRef}
        type="button"
        onClick={onRetry}
        className="rounded-full bg-accent px-8 py-3 font-bold text-black transition-colors hover:bg-white focus-visible:bg-white"
      >
        {copy.retryLabel}
      </button>
    </motion.div>
  );
}
