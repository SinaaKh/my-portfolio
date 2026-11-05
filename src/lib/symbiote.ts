/**
 * Contact-link symbiote physics (SPEC.md §6.24): glossy goo that reaches out of a contact link, catches the
 * pointer and holds on while it moves, then snaps and drips when pulled away. The pointer itself is never moved.
 *
 * No DOM here. `Symbiote` (components/ui/symbiote.tsx) measures the page each frame, passes it in the goo
 * layer's own coordinates and paints the result through an SVG goo filter. The numbers match the design canvas.
 */

export type Point = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number };

/** The goo's body: the base element's rounded box, its circle, or a line under it. */
export type SymbioteShape = "rect" | "circle" | "underline";

export type SymbioteTuning = {
  shape: SymbioteShape;
  /** Distance from the link's edge, in px, at which the tendrils start reaching for the pointer. */
  reach: number;
  /** Tendril radius where it leaves the body, in px. Tips taper to 3.4px. */
  thickness: number;
  /** How far the body swells, in px, while it holds the pointer. */
  swell: number;
  tendrils: number;
};

/** The page this frame, in the goo layer's coordinates. */
export type SymbioteSense = {
  /** The pointer, or null once it has left the window. */
  pointer: Point | null;
  /** Pointer to the link's edge: 0 on the link, Infinity while the link can't be reached. */
  distance: number;
  /** Box of the element the goo grows out of. */
  base: Box;
  /** Corner radius of that box, for the rect shape. */
  radius: number;
  /** Falling drops vanish below this line. */
  floor: number;
};

export type SymbioteFrame = {
  path: string;
  /** The body, for the rect shape. The other shapes draw theirs into `path`. */
  rect: (Box & { r: number }) | null;
  /** Everything drawn, so the filter only runs where there is goo. */
  bounds: { x0: number; y0: number; x1: number; y1: number } | null;
  opacity: number;
  light: Point;
};

type Drop = { x: number; y: number; vx: number; vy: number; age: number; hang: number; life: number };

/** Lets go once the pointer is this many reaches away. */
const RELEASE = 1.3;
const GRAVITY = 900;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export class SymbioteEngine {
  private t = 0;
  private ext = 0;
  private cap = false;
  private capS = 0;
  private hov = 0;
  private act = 0;
  private cool = 0;
  private pressed = 0;
  private drip = 0.35;
  private px = 0;
  private py = 0;
  private ax = Number.NaN;
  private tips: (Point | null)[] = [];
  private roots: Point[] = [];
  private drops: Drop[] = [];
  private bounds = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };

  constructor(private readonly tuning: SymbioteTuning) {}

  /** The tendrils have hold of the pointer. */
  get holding() {
    return this.cap;
  }

  /** The link shows its hover state. */
  get caught() {
    return this.hov > 0.5;
  }

  /** The body has turned to goo. */
  get active() {
    return this.act > 0.4;
  }

  /** Something is still moving, so the frame loop must keep running. */
  get busy() {
    return (
      this.cap ||
      this.ext > 0 ||
      this.drops.length > 0 ||
      this.act > 0.005 ||
      this.capS > 0.005 ||
      this.pressed > 0 ||
      this.cool > 0
    );
  }

  /** A press on the link while the goo holds the pointer. */
  squeeze() {
    if (this.cap) this.pressed = 1;
  }

  step(dt: number, sense: SymbioteSense): SymbioteFrame {
    const { shape, reach, swell, tendrils: n } = this.tuning;
    const e = (k: number) => 1 - Math.exp(-dt * k);
    const d = sense.distance;
    this.t += dt;
    this.cool = Math.max(0, this.cool - dt);
    this.pressed = Math.max(0, this.pressed - dt * 3);
    if (sense.pointer) {
      this.px = sense.pointer.x;
      this.py = sense.pointer.y;
    }

    // Catch and release.
    if (!this.cap) {
      const want = d < reach && this.cool <= 0;
      if (want) this.ext = Math.min(1, this.ext + dt * (1.6 + 2.4 * (1 - d / reach)));
      else this.ext = Math.max(0, this.ext - dt * 3.5);
      if (want && (d <= 0 || this.ext >= 1)) this.cap = true;
    } else if (d > reach * RELEASE) {
      this.snap();
      this.cap = false;
      this.ext = 0;
      this.cool = 0.6;
    }
    this.capS += ((this.cap ? 1 : 0) - this.capS) * e(10);
    this.hov += ((this.cap ? 1 : 0) - this.hov) * e(10);
    const live = d < reach * 1.15 || this.cap || this.drops.length > 0;
    this.act += ((live ? 1 : 0) - this.act) * e(live ? 8 : 2.5);

    this.bounds = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    const b = sense.base;
    let cx = b.x + b.w / 2;
    let cy = b.y + b.h / 2;
    let path = "";
    let rect: SymbioteFrame["rect"] = null;

    if (shape === "underline") {
      // The underline is the body; it swells where the tendrils leave it.
      const y = b.y + b.h + 4;
      const x0 = b.x + 6;
      const x1 = b.x + b.w - 6;
      if (Number.isNaN(this.ax)) this.ax = cx;
      if (sense.pointer) this.ax += (clamp(this.px, Math.min(x0 + 18, cx), Math.max(x1 - 18, cx)) - this.ax) * e(10);
      cx = this.ax;
      cy = y;
      const bump = Math.max(this.ext, this.capS);
      for (let x = x0; x <= x1; x += 4) {
        const r = this.act * (2.4 + 1.2 * this.hov) + 4 * bump * Math.exp(-(((x - this.ax) / 30) ** 2));
        if (r > 0.4) path += this.circ(x, y, r);
      }
    } else if (shape === "circle") {
      const pulse = 1.5 * this.act + 1.2 * this.act * Math.sin(this.t * 4);
      path += this.circ(cx, cy, b.w / 2 + pulse + swell * (this.hov - this.pressed));
    } else {
      const g = swell * (this.hov - this.pressed) + 0.4 * swell * this.hov * Math.sin(this.t * 6);
      rect = { x: b.x - g, y: b.y - g, w: b.w + 2 * g, h: b.h + 2 * g, r: Math.min(sense.radius, b.w / 2, b.h / 2) + g };
      this.grow(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    }

    // Tendrils fan out of the body toward the pointer, then wrap round it once they catch it.
    const th = Math.atan2(this.py - cy, this.px - cx);
    const perpX = -Math.sin(th);
    const perpY = Math.cos(th);
    const mid = (n - 1) / 2;
    while (this.tips.length < n) this.tips.push(null);
    this.tips.length = n;
    this.roots.length = n;
    for (let i = 0; i < n; i++) {
      const a = this.root(b, cx, cy, th, i, mid);
      this.roots[i] = a;
      let tip = this.tips[i];
      if (!tip) {
        tip = { x: a.x, y: a.y };
        this.tips[i] = tip;
      }
      let tx: number;
      let ty: number;
      if (this.cap) {
        tx = this.px + perpX * (i - mid) * 6;
        ty = this.py + perpY * (i - mid) * 6;
      } else {
        const ei = clamp(this.ext * 1.15 - Math.abs(i - mid) * 0.1, 0, 1);
        const f = 1 - (1 - ei) ** 3;
        tx = a.x + (this.px + perpX * (i - mid) * 10 - a.x) * f;
        ty = a.y + (this.py + perpY * (i - mid) * 10 - a.y) * f;
      }
      const k = e(this.cap ? 40 : 18);
      tip.x += (tx - tip.x) * k;
      tip.y += (ty - tip.y) * k;
      path += this.tendril(a, tip, i, mid);
    }
    if (this.capS > 0.05) path += this.circ(this.px, this.py, (8 + 1.2 * Math.sin(this.t * 6)) * this.capS);

    // While it holds on, a drop now and then gathers at a tendril's lowest point and falls.
    if (this.cap) {
      this.drip -= dt;
      if (this.drip <= 0) {
        const i = Math.floor(Math.random() * n);
        const a = this.roots[i];
        const tip = this.tips[i];
        if (a && tip) {
          const q = this.bend(a, tip, i, mid, true);
          if (q.len > 36) {
            let low = this.at(a, q, tip, 0.2);
            for (let j = 3; j <= 8; j++) {
              const p = this.at(a, q, tip, j / 10);
              if (p.y > low.y) low = p;
            }
            this.shed(low.x, low.y + 2, 0, 0, 0.18);
          }
        }
        this.drip = 0.45 + Math.random() * 0.7;
      }
    } else {
      this.drip = 0.35;
    }

    const kept: Drop[] = [];
    for (const q of this.drops) {
      q.age += dt;
      if (q.age > q.hang) {
        q.vy += GRAVITY * dt;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
      }
      if (q.age < q.life && q.y < sense.floor) {
        kept.push(q);
        path += this.circ(q.x, q.y, 4.2 * Math.min(1, q.age / 0.14) * Math.min(1, (q.life - q.age) / 0.3));
      }
    }
    this.drops = kept;

    const bb = this.bounds;
    return {
      path,
      rect,
      bounds: bb.x0 <= bb.x1 ? { ...bb } : null,
      opacity: this.act,
      light: { x: b.x + b.w / 2 - 350, y: b.y + b.h / 2 - 300 },
    };
  }

  /** Where tendril i grows out of the body, fanned around the pointer's direction. */
  private root(b: Box, cx: number, cy: number, th: number, i: number, mid: number): Point {
    const { shape } = this.tuning;
    if (shape === "underline") return { x: cx + (i - mid) * 16, y: cy };
    const phi = th + (i - mid) * (shape === "rect" ? 0.5 : 0.55);
    if (shape === "circle") return { x: cx + Math.cos(phi) * b.w * 0.3, y: cy + Math.sin(phi) * b.w * 0.3 };
    const rx = Math.max(4, b.w / 2 - Math.min(16, b.w / 4));
    const ry = Math.max(4, b.h / 2 - 7);
    return { x: cx + Math.cos(phi) * rx, y: cy + Math.sin(phi) * ry };
  }

  /** A tendril is a quadratic curve from its root to its tip; this is its bend. */
  private bend(a: Point, b: Point, i: number, mid: number, cap: boolean) {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const len = Math.hypot(vx, vy) || 1;
    const wave = Math.sin(this.t * 5 + i * 2.1) * Math.min(16, len * 0.16) * (cap ? 0.35 : 1);
    const off = wave + (i - mid) * len * 0.22;
    return { x: a.x + vx / 2 - (vy / len) * off, y: a.y + vy / 2 + (vx / len) * off, len };
  }

  private at(a: Point, q: Point, b: Point, s: number): Point {
    const u = 1 - s;
    return { x: u * u * a.x + 2 * u * s * q.x + s * s * b.x, y: u * u * a.y + 2 * u * s * q.y + s * s * b.y };
  }

  private tendril(a: Point, tip: Point, i: number, mid: number) {
    const q = this.bend(a, tip, i, mid, this.cap);
    if (q.len < 4) return "";
    const r0 = this.tuning.thickness;
    const m = clamp(Math.ceil(q.len / 5), 3, 70);
    let d = "";
    for (let j = 0; j <= m; j++) {
      const s = j / m;
      const p = this.at(a, q, tip, s);
      d += this.circ(p.x, p.y, (r0 - (r0 - 3.4) * s) * (1 + 0.08 * Math.sin(this.t * 7 + s * 9 + i)));
    }
    return d + this.circ(tip.x, tip.y, 5.5 * Math.min(1, q.len / 24));
  }

  /** Pulled too far, the tendrils snap and each one sheds a couple of drops. */
  private snap() {
    const n = Math.min(this.tips.length, this.roots.length);
    const mid = (n - 1) / 2;
    for (let i = 0; i < n; i++) {
      const a = this.roots[i];
      const tip = this.tips[i];
      if (!a || !tip) continue;
      const q = this.bend(a, tip, i, mid, true);
      if (q.len < 20) continue;
      for (const s of [0.45, 0.75]) {
        const p = this.at(a, q, tip, s);
        this.shed(p.x, p.y, (Math.random() - 0.5) * 80, -30 - 60 * s, 0);
      }
    }
  }

  private shed(x: number, y: number, vx: number, vy: number, hang: number) {
    this.drops.push({ x, y, vx, vy, age: 0, hang, life: 1.2 });
  }

  private grow(x0: number, y0: number, x1: number, y1: number) {
    const b = this.bounds;
    b.x0 = Math.min(b.x0, x0);
    b.y0 = Math.min(b.y0, y0);
    b.x1 = Math.max(b.x1, x1);
    b.y1 = Math.max(b.y1, y1);
  }

  /** A circle as a path segment. All circles wind the same way, so overlaps merge instead of cancelling. */
  private circ(x: number, y: number, r: number) {
    if (!(r > 0.3)) return "";
    this.grow(x - r, y - r, x + r, y + r);
    const a = r.toFixed(1);
    return `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${a} ${a} 0 1 0 ${(2 * r).toFixed(1)} 0a${a} ${a} 0 1 0 ${(-2 * r).toFixed(1)} 0Z`;
  }
}
