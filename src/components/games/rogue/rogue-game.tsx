"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { site, type RogueEditTarget } from "@/content/site";

const { rogueGame: copy } = site;

/** The real elements each edit covers. `grow` lets a short element's overlay be wider than the original. */
const TARGETS: Record<RogueEditTarget, { selector: string; grow?: boolean; nav?: boolean }> = {
  greeting: { selector: "#hero p > span", grow: true },
  headline: { selector: "#hero h1" },
  heroLink: { selector: "#hero h1 ~ div a", grow: true },
  navCta: { selector: 'header a[href^="mailto:"]', grow: true, nav: true },
  navLab: { selector: 'header nav a[href="/lab"]', grow: true, nav: true },
  versatility: { selector: "#versatility h2" },
  devWorks: { selector: "#dev-works h2", grow: true },
  research: { selector: "#three-d-works h2", grow: true },
  story: { selector: "#story h2", grow: true },
  insights: { selector: "#insights h2" },
  partnership: { selector: "#partnership h2" },
  collaborations: { selector: "#collaborations h2" },
  footer: { selector: "#contact h2" },
};

const FIRST_EDIT_MS = 1400;
const START_DELAY_MS = 3800;
const MIN_DELAY_MS = 1100;
const CALM_START_DELAY_MS = 4500;
const CALM_MIN_DELAY_MS = 2600;
/** Delay lost per second played. */
const SPEED_UP_MS = 60;
const CALM_SPEED_UP_MS = 30;
/** Nav links fade away with scroll, so they're only fair targets near the top. */
const NAV_VISIBLE_UNTIL = 200;
const TYPE_MS = 22;

type Phase = "idle" | "playing" | "result";
type Outcome = { won: boolean; score: number };
type Edit = { id: number; target: RogueEditTarget; text: string; element: HTMLElement };

const isRendered = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};
const isOnScreen = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
};

/**
 * Game C: Rogue Agent. Edits never touch the real content: the original fades out through a
 * Web Animation, and a button with the fake text sits on top. Cancelling the animation is the revert,
 * so the DOM, the prerendered HTML and what crawlers see never change.
 */
export function RogueGame() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
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
  const finish = useCallback((next: Outcome) => {
    setOutcome(next);
    setPhase("result");
  }, []);

  return (
    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 pb-14 pt-6">
      {phase === "playing" ? (
        <p className="text-center text-lg font-bold uppercase tracking-widest text-accent">{copy.inProgressMessage}</p>
      ) : (
        <Intro focusOnMount={refocus} onStart={start} />
      )}
      {phase === "playing" && <Agent key={round} onEnd={finish} onQuit={quit} />}
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

function Agent({ onEnd, onQuit }: { onEnd: (outcome: Outcome) => void; onQuit: () => void }) {
  const root = useOverlayRoot();
  const reduceMotion = useReducedMotion() ?? false;
  const lenis = useLenis();
  const [edits, setEdits] = useState<Edit[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(copy.durationSeconds);
  const [announcement, setAnnouncement] = useState("");
  const [agentPosition, setAgentPosition] = useState<{ x: number; y: number } | null>(null);

  const editsRef = useRef<Edit[]>([]);
  const hidesRef = useRef(new Map<number, Animation>());
  const buttonsRef = useRef(new Map<number, HTMLButtonElement>());
  const scoreRef = useRef(0);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // The action starts at the top of the page, where the first edits land.
  useEffect(() => {
    // Without a pointer move the site cursor stays enlarged where Start was, over the page being edited.
    document.documentElement.dispatchEvent(new PointerEvent("pointerleave"));
    if (lenis) lenis.scrollTo(0, { duration: 0.9 });
    else window.scrollTo({ top: 0 });
  }, [lenis]);

  // Spawns edits on a schedule that tightens, and ends the game at the time limit or the edit limit.
  useEffect(() => {
    const hides = hidesRef.current;
    const startedAt = performance.now();
    let spawned = 0;
    let nextId = 0;
    let timeout = 0;
    let remaining = copy.durationSeconds;

    const spawn = () => {
      const active = new Set(editsRef.current.map((edit) => edit.target));
      const available = copy.edits
        .filter((edit) => !active.has(edit.target))
        .map((edit) => ({ ...edit, element: document.querySelector<HTMLElement>(TARGETS[edit.target].selector) }))
        .filter((edit): edit is typeof edit & { element: HTMLElement } => edit.element !== null && isRendered(edit.element))
        .filter((edit) => !TARGETS[edit.target].nav || window.scrollY < NAV_VISIBLE_UNTIL);

      const onScreen = available.filter((edit) => isOnScreen(edit.element));
      const offScreen = available.filter((edit) => !isOnScreen(edit.element));
      // Every third edit lands elsewhere on the page, so the player has to go after it.
      const pool = (spawned % 3 === 2 && offScreen.length > 0) || onScreen.length === 0 ? offScreen : onScreen;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!pick) return;

      spawned += 1;
      nextId += 1;
      // A long-running animation holds opacity at 0 without writing to the element's style.
      const hide = pick.element.animate({ opacity: [0, 0] }, { duration: 3_600_000 });
      hides.set(nextId, hide);
      const edit: Edit = { id: nextId, target: pick.target, text: pick.text, element: pick.element };
      editsRef.current = [...editsRef.current, edit];
      setEdits(editsRef.current);
      setAnnouncement(copy.editAnnouncement.replace("{text}", pick.text));
      const rect = pick.element.getBoundingClientRect();
      setAgentPosition({ x: rect.left, y: rect.top });

      if (editsRef.current.length >= copy.maxEdits) onEnd({ won: false, score: scoreRef.current });
    };

    const schedule = () => {
      const seconds = (performance.now() - startedAt) / 1000;
      const delay = reduceMotion
        ? Math.max(CALM_MIN_DELAY_MS, CALM_START_DELAY_MS - seconds * CALM_SPEED_UP_MS)
        : Math.max(MIN_DELAY_MS, START_DELAY_MS - seconds * SPEED_UP_MS);
      timeout = window.setTimeout(() => {
        spawn();
        schedule();
      }, delay);
    };

    const first = window.setTimeout(() => {
      spawn();
      schedule();
    }, FIRST_EDIT_MS);

    const timer = window.setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) onEnd({ won: true, score: scoreRef.current });
    }, 1000);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onQuit();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(timeout);
      window.clearInterval(timer);
      window.removeEventListener("keydown", onKeyDown);
      // This is the whole restore: with the animations gone, the originals are back as they were.
      hides.forEach((hide) => hide.cancel());
      hides.clear();
    };
  }, [reduceMotion, onEnd, onQuit]);

  // Keep each overlay on top of its element, which may scroll, fade or animate. Runs only with edits on screen.
  useEffect(() => {
    if (edits.length === 0) return;
    let frameId = 0;
    const loop = () => {
      for (const edit of editsRef.current) {
        const button = buttonsRef.current.get(edit.id);
        if (!button) continue;
        const rect = edit.element.getBoundingClientRect();
        const grow = TARGETS[edit.target].grow;
        button.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
        if (grow) button.style.maxWidth = `${Math.max(120, window.innerWidth - rect.left - 8)}px`;
        else button.style.width = `${rect.width}px`;
        button.style.minHeight = `${rect.height}px`;
        button.style.color = getComputedStyle(edit.element).color;
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [edits.length]);

  const goTo = useCallback(
    (edit: Edit) => {
      if (isOnScreen(edit.element)) return;
      const section = edit.element.closest("section, footer");
      const top = section ? section.getBoundingClientRect().top + window.scrollY : 0;
      if (lenis) lenis.scrollTo(top, { duration: 0.7 });
      else window.scrollTo({ top });
    },
    [lenis],
  );

  const revert = (edit: Edit) => {
    hidesRef.current.get(edit.id)?.cancel();
    hidesRef.current.delete(edit.id);
    buttonsRef.current.delete(edit.id);
    editsRef.current = editsRef.current.filter((item) => item.id !== edit.id);
    setEdits(editsRef.current);
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setAnnouncement(copy.revertAnnouncement.replace("{score}", String(scoreRef.current)));
    // Don't strand keyboard users: focus moves to the next edit, or back to the banner.
    const next = editsRef.current[0];
    const nextButton = next && buttonsRef.current.get(next.id);
    (nextButton ?? nextButtonRef.current)?.focus({ preventScroll: true });
  };

  const goToNext = () => {
    const next = editsRef.current[0];
    if (!next) return;
    goTo(next);
    buttonsRef.current.get(next.id)?.focus({ preventScroll: true });
  };

  return createPortal(
    <>
      <div className="pointer-events-none fixed inset-0 z-[1000] overflow-hidden">
        {agentPosition && (
          <motion.div
            aria-hidden
            initial={false}
            animate={{ x: agentPosition.x - 16, y: agentPosition.y - 30, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-lg bg-violet text-[10px] font-black text-white shadow-card-sm"
          >
            {copy.agentLabel}
          </motion.div>
        )}
        {edits.map((edit) => (
          <EditButton
            key={edit.id}
            edit={edit}
            calm={reduceMotion}
            onMount={(button) => {
              if (button) buttonsRef.current.set(edit.id, button);
            }}
            onFocus={() => goTo(edit)}
            onRevert={() => revert(edit)}
          />
        ))}
      </div>

      <div
        role="region"
        aria-label={copy.banner}
        className="fixed bottom-3 left-1/2 z-[10000] flex w-max max-w-[calc(100vw-16px)] -translate-x-1/2 flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-coral/50 bg-black px-4 py-2 text-white shadow-card-sm"
      >
        <p className="w-full text-center text-xs font-black uppercase tracking-widest text-coral md:w-auto">{copy.banner}</p>
        <p className="text-xs font-bold uppercase tracking-widest">
          <span className="text-white/50">{copy.unrevertedLabel} </span>
          <span className="tabular-nums">
            {edits.length}/{copy.maxEdits}
          </span>
        </p>
        <p className="text-xs font-bold uppercase tracking-widest">
          <span className="text-white/50">{copy.revertedLabel} </span>
          <span className="tabular-nums text-accent">{score}</span>
        </p>
        <p className="text-xs font-bold uppercase tracking-widest">
          <span className="text-white/50">{copy.timeLabel} </span>
          <span className="tabular-nums text-accent">
            {timeLeft}
            {copy.timeUnit}
          </span>
        </p>
        <button
          ref={nextButtonRef}
          type="button"
          onClick={goToNext}
          aria-disabled={edits.length === 0}
          className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-black aria-disabled:opacity-40"
        >
          {copy.nextEditLabel}
        </button>
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

const COPIED_STYLES = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "textAlign",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "backgroundColor",
  "borderRadius",
] as const;

function EditButton({
  edit,
  calm,
  onMount,
  onFocus,
  onRevert,
}: {
  edit: Edit;
  calm: boolean;
  onMount: (button: HTMLButtonElement | null) => void;
  onFocus: () => void;
  onRevert: () => void;
}) {
  const [typed, setTyped] = useState(calm ? edit.text.length : 0);
  const ref = useRef<HTMLButtonElement>(null);
  const grow = TARGETS[edit.target].grow;

  // Match the element it covers, and sit in place before the first paint.
  useLayoutEffect(() => {
    const button = ref.current;
    if (!button) return;
    const computed = getComputedStyle(edit.element);
    for (const name of COPIED_STYLES) button.style[name] = computed[name];
    const rect = edit.element.getBoundingClientRect();
    button.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
    button.style.minHeight = `${rect.height}px`;
    button.style.color = computed.color;
    if (grow) {
      button.style.width = "max-content";
      button.style.maxWidth = `${Math.max(120, window.innerWidth - rect.left - 8)}px`;
    } else {
      button.style.width = `${rect.width}px`;
    }
    onMount(button);
    // onMount is new every render but only needs to run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit, grow]);

  useEffect(() => {
    if (calm) return;
    const interval = window.setInterval(() => {
      setTyped((count) => {
        if (count >= edit.text.length) window.clearInterval(interval);
        return Math.min(count + 1, edit.text.length);
      });
    }, TYPE_MS);
    return () => window.clearInterval(interval);
  }, [calm, edit.text.length]);

  return (
    <button
      ref={ref}
      type="button"
      aria-label={copy.revertAriaLabel.replace("{text}", edit.text)}
      onClick={onRevert}
      onFocus={onFocus}
      data-rogue-edit={edit.target}
      className="pointer-events-auto absolute left-0 top-0 cursor-pointer touch-manipulation decoration-accent decoration-dashed decoration-2 underline-offset-4 outline-1 outline-dashed outline-accent/70 hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-solid"
    >
      <span className="underline">{edit.text.slice(0, typed)}</span>
    </button>
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
        <p className="mb-8 font-bold text-accent">
          {(outcome.won ? result.wonMessage : result.lostMessage).replace("{score}", String(outcome.score))}
        </p>
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
