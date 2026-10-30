"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query. Returns `serverValue` during SSR and hydration,
 * so markup stays identical; the real value takes over right after.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Tailwind `lg` breakpoint (1024px). */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

/** True for mouse and trackpad users; false for touch-only devices. */
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");
