"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { SymbioteEngine, type Box, type Point, type SymbioteFrame, type SymbioteShape } from "@/lib/symbiote";
import { useFinePointer } from "@/lib/use-media-query";

/** The frame loop wakes within this many reaches of the link: where the body turns to goo. */
const WAKE_MARGIN = 1.15;
/** Hit-testing the link only matters this close, where the pointer can be caught or let go. */
const HIT_TEST_MARGIN = 1.5;

type Ink = "dark" | "light";

// Only one link's goo holds the pointer at a time; a link right under the pointer takes it over and the other
// lets go. The holder's ink goes on <html> so the custom cursor can hide its blob (layout/cursor.tsx).
let holder: { ink: Ink } | null = null;
function hold(who: { ink: Ink }, holding: boolean) {
  if (holding) holder = who;
  else if (holder === who) holder = null;
  const root = document.documentElement;
  if (root.dataset.symbiote === holder?.ink) return;
  if (holder) root.dataset.symbiote = holder.ink;
  else delete root.dataset.symbiote;
}

type SymbioteProps = {
  shape: SymbioteShape;
  /** Distance from the link's edge, in px, at which the tendrils start reaching for the pointer. */
  reach: number;
  /** Tendril radius where it leaves the body, in px. */
  thickness: number;
  /** How far the body swells, in px, while it holds the pointer. */
  swell?: number;
  tendrils?: number;
  /** "light" is white goo that turns accent while it holds the pointer, for links on dark cards. */
  ink?: Ink;
};

/**
 * Goo that reaches out of a contact link and catches the pointer (SPEC.md §6.24). It never moves the pointer.
 *
 * Render it as the first child of the element it lives in (the link, or a part of it), which must be
 * `group/goo relative isolate`. Wrap content that should stay above the goo in a positioned element. In the markup,
 * `data-goo-base` marks a descendant the goo grows out of (default: the parent) and `data-goo-zone` an ancestor the
 * pointer must stay inside. The parent gets `data-goo-active` while the goo is out and `data-goo-caught` while it
 * holds the pointer, for hover styling. Fine pointers only, and off under reduced motion.
 */
export function Symbiote({ shape, reach, thickness, swell = shape === "circle" ? 2 : 3, tendrils = 3, ink = "dark" }: SymbioteProps) {
  const finePointer = useFinePointer();
  const reduceMotion = useReducedMotion();
  const enabled = finePointer && !reduceMotion;
  const filterId = `goo-${useId().replace(/[^\w-]/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const lightRef = useRef<SVGFEPointLightElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // A layout effect, so the goo is cleared before Activity hides the page (CLAUDE.md, Activity).
  useLayoutEffect(() => {
    const svg = svgRef.current;
    const filter = filterRef.current;
    const light = lightRef.current;
    const rect = rectRef.current;
    const path = pathRef.current;
    const host = svg?.parentElement;
    if (!enabled || !svg || !filter || !light || !rect || !path || !host) return;

    const base = host.querySelector<HTMLElement>("[data-goo-base]") ?? host;
    const zone = host.closest<HTMLElement>("[data-goo-zone]");
    const link = host.closest("a") ?? host;
    const root = document.documentElement;
    const goo = new SymbioteEngine({ shape, reach, thickness, swell, tendrils });
    const me = { ink };
    const radius = parseFloat(getComputedStyle(base).borderTopLeftRadius) || 0;
    let pointer: Point | null = null;
    let onLink = false;
    let caught = false;
    let active = false;
    let lastPath = "";
    let raf = 0;
    let last = 0;

    // The link only counts while it is really there: not faded out, covered or off screen. It is tested halfway
    // between its centre and the side nearest the pointer, which stays inside rounded shapes and on screen while
    // that side is.
    const reachable = (r: DOMRect, p: Point) => {
      const nx = Math.max(r.left, Math.min(r.right, p.x));
      const ny = Math.max(r.top, Math.min(r.bottom, p.y));
      const hit = document.elementFromPoint((r.left + r.width / 2 + nx) / 2, (r.top + r.height / 2 + ny) / 2);
      return hit !== null && link.contains(hit);
    };

    // The page this frame, in the svg's own coordinates: the parent's padding box, scaled with it.
    const sense = () => {
      const origin = svg.getBoundingClientRect();
      const scale = host.clientWidth ? origin.width / host.clientWidth : 1;
      const local = (r: DOMRect): Box => ({
        x: (r.left - origin.left) / scale,
        y: (r.top - origin.top) / scale,
        w: r.width / scale,
        h: r.height / scale,
      });
      const hostRect = host.getBoundingClientRect();
      const target = local(hostRect);
      const zoneRect = zone?.getBoundingClientRect();
      let at: Point | null = null;
      let distance = Infinity;
      if (pointer) {
        at = { x: (pointer.x - origin.left) / scale, y: (pointer.y - origin.top) / scale };
        if (shape === "circle") {
          const r = target.w / 2;
          distance = Math.max(0, Math.hypot(at.x - target.x - r, at.y - target.y - target.h / 2) - r);
        } else {
          const dx = Math.max(target.x - at.x, 0, at.x - target.x - target.w);
          const dy = Math.max(target.y - at.y, 0, at.y - target.y - target.h);
          distance = Math.hypot(dx, dy);
        }
        const inZone =
          !zoneRect ||
          (pointer.x > zoneRect.left + 8 &&
            pointer.x < zoneRect.right - 8 &&
            pointer.y > zoneRect.top + 8 &&
            pointer.y < zoneRect.bottom - 8);
        const taken = holder !== null && holder !== me && distance > 0;
        if (taken || !inZone || (distance < reach * HIT_TEST_MARGIN && !reachable(hostRect, pointer))) distance = Infinity;
      }
      return {
        pointer: at,
        distance,
        base: base === host ? target : local(base.getBoundingClientRect()),
        radius,
        floor: zoneRect ? local(zoneRect).y + zoneRect.height / scale + 2 : (window.innerHeight - origin.top) / scale + 10,
      };
    };

    const paint = (frame: SymbioteFrame) => {
      const d = frame.path || "M0 0";
      if (d !== lastPath) {
        path.setAttribute("d", d);
        lastPath = d;
      }
      if (frame.rect) {
        rect.setAttribute("x", frame.rect.x.toFixed(1));
        rect.setAttribute("y", frame.rect.y.toFixed(1));
        rect.setAttribute("width", frame.rect.w.toFixed(1));
        rect.setAttribute("height", frame.rect.h.toFixed(1));
        rect.setAttribute("rx", frame.rect.r.toFixed(1));
      }
      const b = frame.bounds;
      filter.setAttribute("x", b ? (b.x0 - 24).toFixed(0) : "0");
      filter.setAttribute("y", b ? (b.y0 - 24).toFixed(0) : "0");
      filter.setAttribute("width", b ? (b.x1 - b.x0 + 48).toFixed(0) : "0");
      filter.setAttribute("height", b ? (b.y1 - b.y0 + 48).toFixed(0) : "0");
      light.setAttribute("x", frame.light.x.toFixed(0));
      light.setAttribute("y", frame.light.y.toFixed(0));
      svg.style.opacity = frame.opacity.toFixed(3);
      if (goo.active !== active) {
        active = goo.active;
        host.toggleAttribute("data-goo-active", active);
      }
      if (goo.caught !== caught) {
        caught = goo.caught;
        host.toggleAttribute("data-goo-caught", caught);
      }
      if (goo.holding !== (holder === me)) hold(me, goo.holding);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const s = sense();
      onLink = s.distance <= 0;
      paint(goo.step(dt, s));
      raf = goo.busy || s.distance < reach * WAKE_MARGIN ? requestAnimationFrame(tick) : 0;
    };

    // The loop only runs while the pointer is near or the goo is still moving.
    const wake = () => {
      if (raf || (!goo.busy && !(sense().distance < reach * WAKE_MARGIN))) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      pointer = { x: event.clientX, y: event.clientY };
      wake();
    };
    const onLeave = () => {
      pointer = null;
      wake();
    };
    const onDown = () => {
      if (!onLink) return;
      goo.squeeze();
      wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", wake, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", wake);
      root.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      path.setAttribute("d", "M0 0");
      svg.style.opacity = "0";
      host.removeAttribute("data-goo-active");
      host.removeAttribute("data-goo-caught");
      hold(me, false);
    };
  }, [enabled, shape, reach, thickness, swell, tendrils, ink]);

  if (!enabled) return null;
  const fill = ink === "light" ? "fill-paper group-data-goo-caught/goo:fill-accent" : "fill-goo";
  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible"
      style={{ opacity: 0 }}
    >
      <defs>
        <filter ref={filterRef} id={filterId} filterUnits="userSpaceOnUse" x={0} y={0} width={0} height={0}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={3} result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -8" result="goo" />
          <feGaussianBlur in="goo" stdDeviation={2} result="soft" />
          <feSpecularLighting in="soft" result="spec" surfaceScale={5} specularConstant={1.2} specularExponent={26}>
            <fePointLight ref={lightRef} x={0} y={0} z={240} />
          </feSpecularLighting>
          <feComposite in="spec" in2="goo" operator="in" result="gloss" />
          <feComposite in="goo" in2="gloss" operator="arithmetic" k1={0} k2={1} k3={0.9} k4={0} />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <rect ref={rectRef} width={0} height={0} className={fill} />
        <path ref={pathRef} className={fill} />
      </g>
    </svg>
  );
}
