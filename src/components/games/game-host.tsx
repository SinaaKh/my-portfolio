"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore, type ComponentType } from "react";
import { site } from "@/content/site";
import { FirewallGame } from "@/components/sections/firewall-game";
import { GameSwitcher } from "./game-switcher";

const Loading = () => <div className="h-full w-full" />;

/**
 * Games under test. Removing one means deleting its line here, its folder and its
 * content key. Each loads on demand, so an unused game adds no JavaScript.
 */
const GAMES: Record<string, { label: string; Game: ComponentType }> = {
  snake: {
    label: site.snakeGame.switchLabel,
    Game: dynamic(() => import("./snake/snake-game").then((m) => m.SnakeGame), { ssr: false, loading: Loading }),
  },
  escape: {
    label: site.escapeGame.switchLabel,
    Game: dynamic(() => import("./escape/escape-game").then((m) => m.EscapeGame), { ssr: false, loading: Loading }),
  },
  rogue: {
    label: site.rogueGame.switchLabel,
    Game: dynamic(() => import("./rogue/rogue-game").then((m) => m.RogueGame), { ssr: false, loading: Loading }),
  },
};

const CHANGE_EVENT = "gamechange";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * Picks the mini game from `?game=`. The parameter is read from `window` rather than
 * `useSearchParams`, so the home page stays fully prerendered: the HTML always holds the
 * current game, and the choice is applied right after hydration.
 */
export function GameHost() {
  const selected = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get("game"),
    () => null,
  );
  const current = selected && selected in GAMES ? selected : null;
  const Game = current ? GAMES[current].Game : FirewallGame;

  const select = (id: string | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("game", id);
    else url.searchParams.delete("game");
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <>
      <Game key={current ?? "current"} />
      <GameSwitcher
        current={current}
        options={Object.entries(GAMES).map(([id, { label }]) => ({ id, label }))}
        onSelect={select}
      />
    </>
  );
}
