"use client";

import { site } from "@/content/site";

const { gameSwitcher } = site;

/** Test-only "Game: Current / A / B / C" links. Delete this file and its one line in game-host.tsx to remove it. */
export function GameSwitcher({
  current,
  options,
  onSelect,
}: {
  current: string | null;
  options: { id: string; label: string }[];
  onSelect: (id: string | null) => void;
}) {
  const items = [{ id: null, label: gameSwitcher.baselineLabel }, ...options];

  return (
    <nav
      aria-label={gameSwitcher.landmarkLabel}
      className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs text-white/50 backdrop-blur-sm"
    >
      <span className="mr-1 font-bold uppercase tracking-widest">{gameSwitcher.label}:</span>
      {items.map(({ id, label }) => (
        <a
          key={label}
          href={id ? `/?game=${id}` : "/"}
          aria-current={id === current ? "page" : undefined}
          onClick={(event) => {
            event.preventDefault();
            onSelect(id);
          }}
          className={`rounded-full px-2.5 py-1 font-bold transition-colors hover:text-white ${
            id === current ? "bg-accent text-black hover:text-black" : ""
          }`}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
