"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";
import { site } from "@/content/site";

const { gamePicker, snakeGame, escapeGame } = site;

const Loading = () => <div className="h-full w-full" />;

const SnakeGame = dynamic(() => import("./snake/snake-game").then((m) => m.SnakeGame), { ssr: false, loading: Loading });
const EscapeGame = dynamic(() => import("./escape/escape-game").then((m) => m.EscapeGame), { ssr: false, loading: Loading });

const MOUSE_OR_TRACKPAD = "(hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(MOUSE_OR_TRACKPAD);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * The My Works mini game. The Model Escapes needs a mouse to chase with, so touch devices only get
 * Context Window Snake; with a mouse or trackpad both are available. The input isn't known while
 * prerendering, so nothing is picked until hydration, and a game's code loads only once it's shown.
 */
export function GameHost() {
  const hasMouse = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOUSE_OR_TRACKPAD).matches,
    () => null,
  );

  if (hasMouse === null) return <Loading />;
  return hasMouse ? <DesktopGames /> : <SnakeGame />;
}

function DesktopGames() {
  const [game, setGame] = useState<"escape" | "snake">("escape");
  const options = [
    { id: "escape", label: escapeGame.title },
    { id: "snake", label: snakeGame.title },
  ] as const;

  return (
    <>
      {game === "escape" ? <EscapeGame /> : <SnakeGame withPicker />}
      <div
        role="group"
        aria-label={gamePicker.label}
        className="absolute bottom-3 left-1/2 z-20 flex w-max max-w-[calc(100%-16px)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-black/70 px-2 py-1.5 text-xs text-white/50 backdrop-blur-sm"
      >
        {options.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === game}
            onClick={() => setGame(id)}
            className={`rounded-full px-3 py-1 font-bold transition-colors ${
              id === game ? "bg-accent text-black" : "hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
