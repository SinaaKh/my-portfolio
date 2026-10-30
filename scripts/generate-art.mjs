// Generates every illustration in public/images. Deterministic: same seed, same files.
// Usage: node scripts/generate-art.mjs
// Animations are SMIL inside the SVGs and are hidden under prefers-reduced-motion.
// Not generated here: avatar.jpg and about-portrait.jpg (photos), project-shot-02.png and project-shot-03.png (product captures).

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images");

const C = {
  ink: "#05060a",
  panel: "#10131c",
  line: "#3b4560",
  text: "#f4f6fb",
  dim: "#8b93a7",
  accent: "#00bfa5",
  violet: "#7c4dff",
  indigo: "#6366f1",
  coral: "#ff5252",
  amber: "#ffc93c",
};
const SANS = "Inter, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const FA = "Vazirmatn, 'SF Arabic', 'Geeza Pro', Tahoma, 'Noto Sans Arabic', sans-serif";

function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n1 = (v) => Math.round(v * 10) / 10;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const text = (x, y, s, { size = 20, fill = C.text, weight = 500, anchor = "start", font = SANS, op = 1, ls = 0, rtl = false } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" fill-opacity="${op}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ""}${rtl ? ' direction="rtl"' : ""}>${esc(s)}</text>`;
const fa = (x, y, s, o = {}) => text(x, y, s, { font: FA, rtl: true, anchor: "start", ...o });

const card = (x, y, w, h, { stroke = C.line, fill = C.panel, r = 18, sw = 1.5 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

const curve = (x1, y1, x2, y2) => {
  const m = (x1 + x2) / 2;
  return `M${x1} ${y1}C${m} ${y1} ${m} ${y2} ${x2} ${y2}`;
};
const wire = (d, color = C.line, width = 2, dash = "") =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;

/** A dot travelling along a path. Hidden under reduced motion by the document's stylesheet. */
const pulse = (d, color, { dur = 3, delay = 0, r = 6 } = {}) =>
  `<g class="a"><circle r="${r * 2.4}" fill="${color}" opacity="0.2"><animateMotion dur="${dur}s" begin="-${delay}s" repeatCount="indefinite" path="${d}"/></circle><circle r="${r}" fill="${color}"><animateMotion dur="${dur}s" begin="-${delay}s" repeatCount="indefinite" path="${d}"/></circle></g>`;

function doc(w, h, body, { defs = "", label = "" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<style>@media (prefers-reduced-motion: reduce){.a{display:none}}</style>
<defs>${defs}</defs>
${body}
</svg>
`;
}

const glow = (id, color, cx = 0.5, cy = 0.5, r = 0.6, o = 0.3) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"><stop offset="0" stop-color="${color}" stop-opacity="${o}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
const dotGrid = (id, size = 34, op = 0.12) =>
  `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#fff" fill-opacity="${op}"/></pattern>`;

/** Dark stage: ink, dot grid and a colored glow. */
function stage(w, h, color, { cx = 0.72, cy = 0.28, op = 0.3 } = {}) {
  return {
    defs: glow("g1", color, cx, cy, 0.7, op) + glow("g2", C.violet, 0.1, 0.95, 0.6, 0.14) + dotGrid("dots"),
    body: `<rect width="${w}" height="${h}" fill="${C.ink}"/><rect width="${w}" height="${h}" fill="url(#dots)"/><rect width="${w}" height="${h}" fill="url(#g1)"/><rect width="${w}" height="${h}" fill="url(#g2)"/>`,
  };
}

/* Project scenes: each draws into a 1200×800 space. */

function sceneRag() {
  const q = [64, 400];
  const kw = [430, 232];
  const vec = [430, 568];
  const re = [730, 400];
  const ans = [1000, 240];
  const esc2 = [1000, 560];
  const paths = {
    a: curve(q[0] + 258, q[1], kw[0] - 110, kw[1]),
    b: curve(q[0] + 258, q[1], vec[0] - 110, vec[1]),
    c: curve(kw[0] + 110, kw[1], re[0] - 100, re[1]),
    d: curve(vec[0] + 110, vec[1], re[0] - 100, re[1]),
    e: curve(re[0] + 100, re[1], ans[0] - 124, ans[1]),
    f: curve(re[0] + 100, re[1], esc2[0] - 124, esc2[1]),
  };
  const bars = [120, 96, 74, 50, 30]
    .map((w, i) => `<rect x="${re[0] - 70}" y="${re[1] - 40 + i * 19}" width="${w}" height="10" rx="5" fill="${i === 0 ? C.accent : "#fff"}" fill-opacity="${i === 0 ? 1 : 0.22 - i * 0.02}"/>`)
    .join("");
  return [
    ...Object.values(paths).map((d) => wire(d)),
    card(q[0], q[1] - 78, 258, 156, { stroke: C.accent }),
    text(q[0] + 24, q[1] - 40, "PERSIAN QUESTION", { size: 13, fill: C.accent, weight: 800, ls: 2 }),
    fa(q[0] + 234, q[1] + 6, "عوارض این دارو چیست؟", { size: 21, weight: 600 }),
    text(q[0] + 24, q[1] + 48, "routine patient inquiry", { size: 15, fill: C.dim }),
    card(kw[0] - 110, kw[1] - 62, 220, 124),
    text(kw[0], kw[1] - 8, "Keyword", { size: 25, weight: 700, anchor: "middle" }),
    text(kw[0], kw[1] + 24, "exact drug names", { size: 15, fill: C.dim, anchor: "middle" }),
    card(vec[0] - 110, vec[1] - 62, 220, 124),
    text(vec[0], vec[1] - 8, "Vector", { size: 25, weight: 700, anchor: "middle" }),
    text(vec[0], vec[1] + 24, "same meaning, any words", { size: 15, fill: C.dim, anchor: "middle" }),
    card(re[0] - 100, re[1] - 104, 200, 208, { stroke: C.violet }),
    text(re[0], re[1] - 62, "Reranker", { size: 24, weight: 700, anchor: "middle" }),
    bars,
    card(ans[0] - 124, ans[1] - 78, 260, 156, { stroke: C.accent }),
    text(ans[0] - 100, ans[1] - 36, "GROUNDED ANSWER", { size: 13, fill: C.accent, weight: 800, ls: 2 }),
    `<rect x="${ans[0] - 100}" y="${ans[1] - 16}" width="200" height="9" rx="4" fill="#fff" fill-opacity="0.3"/><rect x="${ans[0] - 100}" y="${ans[1] + 6}" width="150" height="9" rx="4" fill="#fff" fill-opacity="0.2"/>`,
    text(ans[0] - 100, ans[1] + 52, "[1] [2] sources", { size: 15, fill: C.accent, font: MONO }),
    card(esc2[0] - 124, esc2[1] - 78, 260, 156, { stroke: C.coral }),
    text(esc2[0] - 100, esc2[1] - 36, "ESCALATION", { size: 13, fill: C.coral, weight: 800, ls: 2 }),
    text(esc2[0] - 100, esc2[1] + 4, "Complex case", { size: 23, weight: 700 }),
    text(esc2[0] - 100, esc2[1] + 40, "routed to the support team", { size: 15, fill: C.dim }),
    pulse(paths.a, C.accent, { delay: 0 }),
    pulse(paths.b, C.accent, { delay: 0 }),
    pulse(paths.c, C.violet, { delay: 1.4 }),
    pulse(paths.d, C.violet, { delay: 2.2 }),
    pulse(paths.e, C.accent, { delay: 0.6 }),
    pulse(paths.f, C.coral, { dur: 5, delay: 2 }),
  ].join("");
}

function sceneRoster() {
  const rand = rng(41);
  const cols = 30;
  const rows = 35;
  const cw = 25;
  const ch = 17;
  const x0 = 56;
  const y0 = 90;
  const palette = [C.accent, C.violet, C.indigo, C.amber];
  const paths = palette.map(() => "");
  let blank = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = rand();
      const x = x0 + c * cw;
      const y = y0 + r * ch;
      const cell = `M${x} ${y}h${cw - 3}v${ch - 3}h-${cw - 3}z`;
      const weekend = c % 7 === 5 || c % 7 === 6;
      if (v < (weekend ? 0.68 : 0.38)) blank += cell;
      else {
        const k = v < 0.72 ? 0 : v < 0.86 ? 1 : v < 0.96 ? 2 : 3;
        paths[k] += cell;
      }
    }
  }
  const w = cols * cw;
  const h = rows * ch;
  const legend = [
    [C.accent, "Call center"],
    [C.violet, "On-call"],
    [C.indigo, "Training"],
  ]
    .map(([col, label], i) => `<rect x="${x0 + i * 170}" y="46" width="16" height="16" rx="4" fill="${col}"/>${text(x0 + 24 + i * 170, 60, label, { size: 16, fill: C.dim })}`)
    .join("");
  const stat = (y, big, small, color) =>
    card(860, y, 290, 180) +
    text(884, y + 96, big, { size: big.length > 2 ? 50 : 66, weight: 800, fill: color, ls: -2 }) +
    text(884, y + 144, small, { size: 18, fill: C.dim });
  return [
    legend,
    `<path d="${blank}" fill="#fff" fill-opacity="0.045"/>`,
    ...paths.map((d, i) => `<path d="${d}" fill="${palette[i]}" fill-opacity="0.9"/>`),
    `<rect class="a" x="${x0 - 30}" y="${y0 - 8}" width="30" height="${h + 12}" fill="url(#sweep)"><animate attributeName="x" from="${x0 - 30}" to="${x0 + w}" dur="4.5s" repeatCount="indefinite"/></rect>`,
    stat(90, "8d → <2h", "monthly planning time", C.text),
    stat(290, "0", "rule violations", C.accent),
    stat(490, "0", "unfilled slots", C.accent),
  ].join("");
}
const rosterDefs = `<linearGradient id="sweep"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.55"/></linearGradient>`;

function sceneAlloc() {
  const rand = rng(77);
  const n = 64;
  const x0 = 70;
  const base = 690;
  const bw = 16;
  let bars = "";
  let ticks = "";
  const tall = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * bw;
    const v = rand();
    if (v < 0.72) ticks += `M${x} ${base}h${bw - 5}`;
    else {
      const h = 30 + Math.pow(rand(), 2) * 190;
      bars += `<rect x="${x}" y="${n1(base - h)}" width="${bw - 5}" height="${n1(h)}" rx="3" fill="${C.accent}" fill-opacity="${n1(0.55 + rand() * 0.45)}"/>`;
      tall.push(x + (bw - 5) / 2);
    }
  }
  const hub = [600, 330];
  const flows = tall
    .filter((_, i) => i % 3 === 0)
    .map((x) => `M${hub[0]} ${hub[1] + 6}C${hub[0]} 430 ${x} 380 ${x} 470`);
  return [
    card(320, 44, 560, 100, { stroke: C.amber }),
    text(346, 82, "MONTHLY PRODUCT TARGET", { size: 13, weight: 800, ls: 2, fill: C.amber }),
    `<rect x="346" y="100" width="508" height="20" rx="10" fill="${C.amber}"/>`,
    wire(`M600 144V190`),
    pulse("M600 144V190", C.amber, { dur: 1.2 }),
    card(160, 190, 400, 140, { stroke: C.violet }),
    text(190, 240, "Will they buy?", { size: 34, weight: 700 }),
    text(190, 284, "P(demand)  classifier", { size: 18, fill: C.dim, font: MONO }),
    text(600, 280, "×", { size: 46, weight: 300, anchor: "middle", fill: C.dim }),
    card(640, 190, 400, 140, { stroke: C.indigo }),
    text(670, 240, "How much?", { size: 34, weight: 700 }),
    text(670, 284, "E[qty | demand]  regressor", { size: 18, fill: C.dim, font: MONO }),
    ...flows.map((d) => wire(d, "#fff", 1.2).replace('stroke="#fff"', 'stroke="#fff" stroke-opacity="0.22"')),
    ...flows.slice(0, 6).map((d, i) => pulse(d, C.accent, { dur: 2.6, delay: i * 0.45, r: 4 })),
    bars,
    `<path d="${ticks}" stroke="#fff" stroke-opacity="0.28" stroke-width="3" stroke-linecap="round"/>`,
    wire(`M${x0} ${base + 14}H${x0 + n * bw - 5}`, C.line, 1.5),
    text(x0, base + 50, "pharmacies: most of them zero, a few real", { size: 18, fill: C.dim }),
    text(x0 + n * bw - 5, base + 50, "Σ allocations = target ✓", { size: 20, weight: 700, fill: C.accent, anchor: "end", font: MONO }),
  ].join("");
}

function sceneDeck() {
  const stack = [2, 1, 0]
    .map((i) => {
      const x = 70 + i * 18;
      const y = 120 + i * 18;
      return `<rect x="${x}" y="${y}" width="400" height="280" rx="14" fill="${i === 0 ? "#171b27" : "#10131c"}" stroke="${C.line}" stroke-width="1.5"/>`;
    })
    .join("");
  const slide = [
    text(100, 180, "MARKET", { size: 15, weight: 800, ls: 3, fill: C.dim }),
    `<rect x="100" y="205" width="170" height="20" rx="4" fill="#fff" fill-opacity="0.85"/>`,
    `<rect x="100" y="240" width="310" height="9" rx="4" fill="#fff" fill-opacity="0.2"/><rect x="100" y="262" width="260" height="9" rx="4" fill="#fff" fill-opacity="0.2"/>`,
    `<rect x="100" y="300" width="90" height="60" rx="6" fill="${C.indigo}" fill-opacity="0.5"/><rect x="200" y="280" width="90" height="80" rx="6" fill="${C.indigo}" fill-opacity="0.7"/><rect x="300" y="250" width="90" height="110" rx="6" fill="${C.indigo}"/>`,
    `<rect class="a" x="74" y="124" width="392" height="4" fill="${C.accent}"><animate attributeName="y" values="124;394;124" dur="4s" repeatCount="indefinite"/></rect>`,
  ].join("");
  const facts = [
    ["Market size", "slide 4"],
    ["Team", "slide 2"],
    ["Traction", "slide 7"],
    ["Ask", "slide 11"],
  ];
  const rows = facts
    .map(([k, v], i) => {
      const y = 96 + i * 88;
      return (
        card(600, y, 540, 72, { r: 14 }) +
        text(626, y + 44, k, { size: 23, weight: 600 }) +
        `<rect x="${610 + 200}" y="${y + 30}" width="${130 - i * 16}" height="10" rx="5" fill="#fff" fill-opacity="0.25"/>` +
        text(1118, y + 44, `⛓ ${v}`, { size: 16, anchor: "end", fill: C.accent, font: MONO })
      );
    })
    .join("");
  const scores = [
    ["Thesis fit", 0.82, C.accent],
    ["Market", 0.66, C.indigo],
    ["Team", 0.74, C.violet],
    ["Traction", 0.48, C.amber],
  ]
    .map(([k, v, col], i) => {
      const x = 70 + (i % 2) * 540;
      const y = 560 + Math.floor(i / 2) * 84;
      return (
        text(x, y, k, { size: 20, fill: C.dim }) +
        `<rect x="${x}" y="${y + 16}" width="480" height="14" rx="7" fill="#fff" fill-opacity="0.08"/><rect x="${x}" y="${y + 16}" width="${480 * v}" height="14" rx="7" fill="${col}"/>`
      );
    })
    .join("");
  const flow = curve(490, 260, 600, 260);
  return [
    stack,
    slide,
    wire(flow, C.line),
    pulse(flow, C.accent, { dur: 1.6 }),
    rows,
    text(70, 480, "LOCAL-FIRST", { size: 13, weight: 800, ls: 3, fill: C.accent }),
    text(70, 518, "Scorecard against your thesis", { size: 26, weight: 700 }),
    scores,
    text(1140, 756, "illustrative values", { size: 14, fill: C.dim, anchor: "end", op: 0.7 }),
  ].join("");
}

function sceneChat({ light = false } = {}) {
  const t = light ? { bg: "#ffffff", panel: "#f3f4f8", line: "#dfe2ea", ink: "#10131c", dim: "#6b7280" } : { bg: C.panel, panel: "#1a1f2d", line: C.line, ink: C.text, dim: C.dim };
  const rows = [
    ["شرکت نمونه الف", "اصفهان", "صنایع غذایی"],
    ["شرکت نمونه ب", "اصفهان", "صنایع غذایی"],
    ["شرکت نمونه ج", "اصفهان", "صنایع غذایی"],
  ];
  const right = 1090;
  const table = rows
    .map((r, i) => {
      const y = 430 + i * 62;
      return (
        `<rect x="170" y="${y}" width="940" height="56" rx="10" fill="${t.panel}"/>` +
        fa(right, y + 36, r[0], { size: 22, weight: 600, fill: t.ink }) +
        fa(760, y + 36, r[1], { size: 20, fill: t.dim }) +
        fa(470, y + 36, r[2], { size: 20, fill: t.dim })
      );
    })
    .join("");
  return [
    card(50, 40, 1100, 720, { fill: t.bg, stroke: t.line, r: 28 }),
    `<rect x="620" y="84" width="490" height="76" rx="22" fill="${C.accent}"/>`,
    fa(1088, 132, "تولیدکنندگان لبنیات اصفهان را نشان بده", { size: 23, weight: 600, fill: "#04211d" }),
    fa(1110, 216, "این شرکت‌ها را در پایگاه داده پیدا کردم:", { size: 23, fill: t.ink }),
    `<rect x="170" y="244" width="940" height="52" rx="26" fill="none" stroke="${C.violet}" stroke-width="1.5"/>`,
    text(198, 277, "search_companies(industry, province, query)", { size: 18, font: MONO, fill: C.violet, weight: 600 }),
    `<circle cx="1082" cy="270" r="7" fill="${C.violet}"/><circle class="a" cx="1082" cy="270" r="7" fill="#fff"><animate attributeName="opacity" values="0;.8;0" dur="1.4s" repeatCount="indefinite"/></circle>`,
    fa(right, 356, "نام شرکت", { size: 17, weight: 800, fill: t.dim }),
    fa(760, 356, "استان", { size: 17, weight: 800, fill: t.dim }),
    fa(470, 356, "صنعت", { size: 17, weight: 800, fill: t.dim }),
    `<rect x="170" y="376" width="940" height="1.5" fill="${t.line}"/>`,
    `<rect x="170" y="390" width="10" height="10" rx="5" fill="${C.accent}"/>`,
    text(190, 401, "built by the server from SQL", { size: 16, font: MONO, fill: C.accent }),
    table,
    `<rect x="90" y="684" width="1020" height="52" rx="26" fill="${t.panel}"/>`,
    fa(1080, 718, "سؤال خود را بپرسید…", { size: 19, fill: t.dim }),
    text(120, 716, "sample data", { size: 14, fill: t.dim, op: 0.8 }),
  ].join("");
}

function sceneQuota() {
  const rand = rng(9);
  const tiers = [
    ["Visitor", C.coral, 170],
    ["Free", C.amber, 400],
    ["Plan", C.accent, 630],
  ];
  const hub = [560, 400];
  const wires = tiers.map(([, , y]) => curve(320, y, hub[0] - 110, hub[1]));
  let grid = "";
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 6; c++) {
      const open = rand() < 0.5;
      const x = 800 + c * 58;
      const y = 150 + r * 58;
      grid += `<rect x="${x}" y="${y}" width="48" height="48" rx="10" fill="${open ? C.accent : "#fff"}" fill-opacity="${open ? 0.85 : 0.07}"/>`;
    }
  }
  const out = curve(hub[0] + 110, hub[1], 790, hub[1]);
  return [
    ...wires.map((d) => wire(d)),
    wire(out),
    ...tiers.map(
      ([label, col, y]) =>
        card(70, y - 56, 250, 112, { stroke: col }) + text(100, y + 12, label, { size: 32, weight: 700 }),
    ),
    card(hub[0] - 110, hub[1] - 110, 220, 220, { stroke: C.violet }),
    text(hub[0], hub[1] - 8, "Quota", { size: 34, weight: 800, anchor: "middle" }),
    text(hub[0], hub[1] + 34, "Engine", { size: 34, weight: 800, anchor: "middle" }),
    grid,
    ...wires.map((d, i) => pulse(d, tiers[i][1], { delay: i * 0.8 })),
    pulse(out, C.accent, { dur: 1.8 }),
  ].join("");
}

function devWork(file, label, color, scene, extraDefs = "") {
  const s = stage(1200, 800, color);
  return [file, doc(1200, 800, s.body + scene, { defs: s.defs + extraDefs, label })];
}

function cover(file, label, color, scene, extraDefs = "") {
  const w = 2100;
  const h = 900;
  const s = stage(w, h, color, { cx: 0.5, cy: 0.5, op: 0.32 });
  const inner = scene.replace(/<g class="a">.*?<\/g>/g, "").replace(/<rect class="a".*?<\/rect>/g, "");
  return [file, doc(w, h, `${s.body}<svg x="${(w - 1275) / 2}" y="25" width="1275" height="850" viewBox="0 0 1200 800">${inner}</svg>`, { defs: s.defs + extraDefs, label })];
}

/* Generative art */

/** Strands of light across the canvas, pinched together at a focal point. */
function flowLines({ w, h, count, seed, fx = 0.62, fy = 0.46 }) {
  const rand = rng(seed);
  const cx = w * fx;
  const cy = h * fy;
  const out = [];
  for (let i = 0; i < count; i++) {
    const y0 = (i / (count - 1)) * h * 1.3 - h * 0.15;
    const a = 18 + rand() * 60;
    const f = 0.0016 + rand() * 0.0022;
    const ph = rand() * 6.28;
    const a2 = 6 + rand() * 18;
    const f2 = 0.006 + rand() * 0.004;
    let d = "";
    for (let x = -40; x <= w + 40; x += 28) {
      const pinch = 1 - 0.93 * Math.exp(-Math.pow((x - cx) / (w * 0.2), 2));
      const y = cy + (y0 - cy) * pinch + (Math.sin(x * f + ph) * a + Math.sin(x * f2 + ph * 2) * a2) * pinch;
      d += `${d ? "L" : "M"}${x} ${Math.round(y)}`;
    }
    out.push({ d, op: 0.1 + rand() * 0.55, width: 0.8 + rand() * 1.5, tone: rand() });
  }
  return out;
}

function hero() {
  const w = 2100;
  const h = 900;
  const defs =
    `<linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="${C.accent}"/><stop offset="0.5" stop-color="#d7fff8"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>` +
    `<linearGradient id="lg2" x1="0" x2="1"><stop offset="0" stop-color="${C.violet}"/><stop offset="0.5" stop-color="#ffffff"/><stop offset="1" stop-color="${C.accent}"/></linearGradient>` +
    glow("h1", C.accent, 0.3, 0.5, 0.5, 0.3) +
    glow("h2", C.violet, 0.8, 0.5, 0.5, 0.36) +
    glow("h3", "#ffffff", 0.62, 0.46, 0.14, 0.5);
  const lines = flowLines({ w, h, count: 120, seed: 5 });
  const body = lines
    .map((l) => `<path d="${l.d}" fill="none" stroke="url(#${l.tone > 0.5 ? "lg" : "lg2"})" stroke-opacity="${n1(l.op)}" stroke-width="${n1(l.width)}" stroke-linecap="round"/>`)
    .join("");
  const rand = rng(12);
  let nodes = "";
  lines.forEach((l, i) => {
    if (i % 4) return;
    const pts = l.d.slice(1).split("L");
    const [x, y] = pts[Math.floor(rand() * pts.length)].split(" ").map(Number);
    const r = n1(2 + rand() * 4);
    const col = rand() > 0.5 ? "#5eead4" : "#c4b5fd";
    nodes += `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="${col}" opacity="0.16"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
  });
  const pulses = lines
    .filter((l) => l.op > 0.3)
    .filter((_, i) => i % 9 === 0)
    .slice(0, 7)
    .map((l, i) => pulse(l.d, i % 2 ? "#5eead4" : "#c4b5fd", { dur: 9 + i * 1.5, delay: i * 1.7, r: 4 }))
    .join("");
  return doc(w, h, `<rect width="${w}" height="${h}" fill="#04050a"/><rect width="${w}" height="${h}" fill="url(#h1)"/><rect width="${w}" height="${h}" fill="url(#h2)"/><rect width="${w}" height="${h}" fill="url(#h3)"/>${body}${nodes}${pulses}`, { defs, label: "Strands of light converging into a single point" });
}

/** Perspective projection with yaw and pitch, around the origin. */
const project = (p, { yaw, pitch, dist = 900, cx, cy, scale }) => {
  const [x, y, z] = p;
  const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
  const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
  const y1 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
  const f = dist / (dist + z2);
  return [cx + x1 * f * scale, cy + y1 * f * scale, z2];
};

function handJoints(curl) {
  const fingers = [
    { x: -92, y: -40, z: 18, len: [34, 28, 24], spread: -0.62, thumb: true },
    { x: -50, y: -118, z: 0, len: [52, 34, 26], spread: -0.14 },
    { x: -14, y: -128, z: 0, len: [58, 38, 28], spread: -0.03 },
    { x: 22, y: -120, z: 0, len: [52, 35, 26], spread: 0.08 },
    { x: 56, y: -100, z: 2, len: [40, 26, 22], spread: 0.22 },
  ];
  const wrist = [0, 40, 0];
  const joints = [wrist];
  const bones = [];
  fingers.forEach((f) => {
    let cur = [f.x, f.y, f.z];
    const root = joints.length;
    joints.push(cur);
    bones.push([0, root]);
    let bend = curl * (f.thumb ? 0.45 : 1);
    let prev = root;
    f.len.forEach((L) => {
      const dirX = Math.sin(f.spread);
      const dirY = -Math.cos(f.spread) * Math.cos(bend);
      const dirZ = Math.sin(bend);
      cur = [cur[0] + dirX * L, cur[1] + dirY * L, cur[2] - dirZ * L];
      joints.push(cur);
      bones.push([prev, joints.length - 1]);
      prev = joints.length - 1;
      bend += curl * 0.65;
    });
  });
  return { joints, bones };
}

function researchHand() {
  const w = 900;
  const h = 1200;
  const view = { yaw: -0.5, pitch: 0.25, cx: 470, cy: 790, scale: 1.8 };
  const defs = glow("g", C.accent, 0.5, 0.5, 0.5, 0.35) + glow("g3", C.violet, 0.3, 0.6, 0.5, 0.3);
  let ghosts = "";
  [0.55, 0.9, 1.2].forEach((curl, k) => {
    const v = { ...view, yaw: view.yaw + (k - 1) * 0.5, cx: view.cx + (k - 1) * 40 };
    const { joints, bones } = handJoints(curl);
    const pts = joints.map((p) => project(p, v));
    ghosts += bones.map(([a, b]) => `<line x1="${n1(pts[a][0])}" y1="${n1(pts[a][1])}" x2="${n1(pts[b][0])}" y2="${n1(pts[b][1])}" stroke="#a78bfa" stroke-opacity="0.4" stroke-width="2.5"/>`).join("");
    ghosts += pts.map((p) => `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="4" fill="#a78bfa" fill-opacity="0.6"/>`).join("");
  });
  const { joints, bones } = handJoints(0.22);
  const pts = joints.map((p) => project(p, view));
  const palm = [0, 1, 5, 9, 13, 17].map((i) => pts[i].slice(0, 2).map(n1).join(",")).join(" ");
  const main = `<polygon points="${palm}" fill="${C.accent}" fill-opacity="0.1"/>` + bones
    .map(([a, b]) => `<line x1="${n1(pts[a][0])}" y1="${n1(pts[a][1])}" x2="${n1(pts[b][0])}" y2="${n1(pts[b][1])}" stroke="url(#b)" stroke-width="7" stroke-linecap="round"/>`)
    .join("");
  const dots = pts
    .map((p, i) => `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="20" fill="${C.accent}" opacity="0.16"/><circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${i === 0 ? 13 : 9}" fill="#fff"/><circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${i === 0 ? 7 : 5}" fill="${C.accent}"/>`)
    .join("");
  return doc(w, h, `<rect width="${w}" height="${h}" fill="#070812"/><rect width="${w}" height="${h}" fill="url(#g3)"/><rect width="${w}" height="${h}" fill="url(#g)"/>${ghosts}${main}${dots}`, {
    defs: defs + `<linearGradient id="b" gradientUnits="userSpaceOnUse" x1="450" y1="900" x2="450" y2="300"><stop offset="0" stop-color="${C.violet}"/><stop offset="1" stop-color="${C.accent}"/></linearGradient>`,
    label: "A 3D hand skeleton with faint alternative poses around it",
  });
}

function researchRidges() {
  const w = 900;
  const h = 1200;
  const rand = rng(31);
  const rows = 26;
  let body = "";
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const y0 = 400 + t * 500;
    const amp = 60 + t * 140;
    const phase = rand() * 6;
    let d = "";
    let val = 0;
    for (let i = 0; i <= 72; i++) {
      const u = i / 72;
      val += (rand() - 0.5) * 0.14;
      const bell = Math.exp(-Math.pow((u - 0.5) / 0.2, 2));
      const y = y0 - (Math.abs(Math.sin(u * 8 + phase)) * 0.28 + Math.abs(val) + 0.12) * amp * (0.04 + bell * 1.4);
      d += `${i ? "L" : "M"}${n1(-20 + u * 940)} ${n1(y)}`;
    }
    body += `<path d="${d}L920 ${r === rows - 1 ? h : n1(y0 + 60)}L-20 ${r === rows - 1 ? h : n1(y0 + 60)}Z" fill="#06070e"/><path d="${d}" fill="none" stroke="url(#rg)" stroke-width="${n1(1.2 + t * 2)}" stroke-opacity="${n1(0.4 + t * 0.6)}"/>`;
  }
  const defs =
    `<linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="${C.accent}"/><stop offset="0.5" stop-color="#ffffff"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>` +
    glow("g", C.violet, 0.8, 0.3, 0.6, 0.45) +
    glow("g3", C.accent, 0.2, 0.3, 0.6, 0.4);
  return doc(w, h, `<rect width="${w}" height="${h}" fill="#06070e"/><rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#g3)"/>${body}`, { defs, label: "Ridgelines of a time series with forecasts arriving from both directions" });
}

/** Isometric box as three shaded faces. `size` shrinks the footprint to leave gaps. */
function isoBox(gx, gy, gz, height, { ox, oy, u, top, left, right, op = 1, size = 1 }) {
  const px = (x, y, z) => [ox + (x - y) * u * 0.866, oy + (x + y) * u * 0.5 - z * u];
  const pts = (arr) => arr.map((p) => p.map(n1).join(",")).join(" ");
  const k = (1 - size) / 2;
  const x0 = gx + k;
  const y0 = gy + k;
  const x1 = gx + 1 - k;
  const y1 = gy + 1 - k;
  const [a, b, c, d] = [px(x0, y0, gz + height), px(x1, y0, gz + height), px(x1, y1, gz + height), px(x0, y1, gz + height)];
  const [e, f, g] = [px(x1, y0, gz), px(x1, y1, gz), px(x0, y1, gz)];
  return `<g fill-opacity="${op}"><polygon points="${pts([d, c, f, g])}" fill="${left}"/><polygon points="${pts([c, b, e, f])}" fill="${right}"/><polygon points="${pts([a, b, c, d])}" fill="${top}"/></g>`;
}

function researchHurdle() {
  const w = 900;
  const h = 1200;
  const rand = rng(58);
  const n = 12;
  const iso = { ox: 450, oy: 450, u: 40 };
  let body = "";
  for (let s = 0; s < n * 2 - 1; s++) {
    for (let x = 0; x < n; x++) {
      const y = s - x;
      if (y < 0 || y >= n) continue;
      if (rand() < 0.86) {
        body += isoBox(x, y, 0, 0.06, { ...iso, size: 0.86, top: "#242b42", left: "#10141f", right: "#171c2c" });
      } else {
        const height = 1.2 + Math.pow(rand(), 1.4) * 5.5;
        body += isoBox(x, y, 0, height, { ...iso, size: 0.86, top: "#a5fff0", left: "#007d6c", right: C.accent });
      }
    }
  }
  const defs = glow("g", C.accent, 0.5, 0.55, 0.55, 0.32);
  return doc(w, h, `<rect width="${w}" height="${h}" fill="#070812"/><rect width="${w}" height="${h}" fill="url(#g)"/>${body}`, { defs, label: "An isometric field of flat tiles with a few tall bars of demand" });
}

function researchCube() {
  const w = 900;
  const h = 1200;
  const rand = rng(14);
  const n = 6;
  const iso = { ox: 450, oy: 420, u: 52 };
  const cells = [];
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) cells.push([x, y, z]);
  cells.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let body = "";
  cells.forEach(([x, y, z]) => {
    const onShell = x === n - 1 || y === n - 1 || z === n - 1;
    if (!onShell) return;
    const v = rand();
    if (v > 0.84) return;
    const hit = v < 0.2;
    body += isoBox(x, y, z, 0.84, {
      ...iso,
      size: 0.84,
      top: hit ? "#d6ccff" : "#39436a",
      left: hit ? "#4c2bbd" : "#161b2e",
      right: hit ? C.violet : "#232a45",
    });
  });
  const defs = glow("g", C.violet, 0.5, 0.5, 0.55, 0.4);
  return doc(w, h, `<rect width="${w}" height="${h}" fill="#070812"/><rect width="${w}" height="${h}" fill="url(#g)"/>${body}`, { defs, label: "An isometric cube of shift assignments with valid choices highlighted" });
}

function labCover() {
  const w = 1600;
  const h = 900;
  const rand = rng(21);
  const pts = [];
  let v = 700;
  for (let i = 0; i <= 200; i++) {
    v += (rand() - 0.56) * 26;
    pts.push([i * 8, v]);
  }
  const toD = (arr) => arr.map((p, i) => `${i ? "L" : "M"}${p[0]} ${n1(p[1])}`).join("");
  const truth = toD(pts);
  const fwd = pts.slice(50, 118).map((p, i) => [p[0], p[1] + Math.sin(i / 7) * 26 + 16]);
  const back = pts.slice(84, 152).map((p, i) => [p[0], p[1] + Math.cos(i / 6) * 24 - 18]);
  const band = `<rect x="${pts[84][0]}" y="0" width="${pts[118][0] - pts[84][0]}" height="${h}" fill="url(#mid)"/>`;
  const defs =
    glow("g", C.accent, 0.3, 0.5, 0.55, 0.28) +
    glow("g3", C.violet, 0.72, 0.5, 0.55, 0.32) +
    dotGrid("dots", 40, 0.1) +
    `<linearGradient id="mid" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.09"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  const fwdD = toD(fwd);
  const backD = toD([...back].reverse());
  return doc(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="#05060c"/><rect width="${w}" height="${h}" fill="url(#dots)"/><rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#g3)"/>${band}` +
      wire(truth, "#fff", 2).replace('stroke="#fff"', 'stroke="#fff" stroke-opacity="0.3"') +
      wire(fwdD, C.accent, 7) +
      wire(backD, "#9f7bff", 7) +
      pulse(fwdD, C.accent, { dur: 5, r: 7 }) +
      pulse(backD, "#b9a4ff", { dur: 5, delay: 2.5, r: 7 }) +
      text(pts[46][0], fwd[0][1] - 96, "forward →", { size: 30, weight: 700, fill: C.accent }) +
      text(pts[158][0], back[back.length - 1][1] + 104, "← backward", { size: 30, weight: 700, fill: "#b9a4ff", anchor: "end" }) +
      text(800, 120, "where do they meet?", { size: 34, weight: 300, anchor: "middle", op: 0.7 }) +
      text(800, 860, "illustrative series", { size: 16, anchor: "middle", fill: C.dim }),
    { defs, label: "A price series with one forecast running forward and another running backward" },
  );
}

/* Post covers */

function postZero() {
  const w = 1600;
  const h = 900;
  const s = stage(w, h, C.coral, { cx: 0.8, cy: 0.1, op: 0.22 });
  // Heights are illustrative on purpose: this cover must not encode real project results.
  const data = [
    ["rule of thumb", 470, C.coral],
    ["moving average", 400, "#475069"],
    ["fancier model", 340, "#475069"],
    ["always zero", 240, C.accent],
  ];
  const base = 760;
  const bars = data
    .map(([k, bh, col], i) => {
      const x = 500 + i * 260;
      return (
        `<rect x="${x}" y="${base - bh}" width="190" height="${bh}" rx="14" fill="${col}"/>` +
        text(x + 95, base + 42, k, { size: 22, anchor: "middle", fill: C.dim })
      );
    })
    .join("");
  return doc(w, h, s.body + text(90, 210, "Error", { size: 110, weight: 800, ls: -4 }) + text(94, 270, "lower is better", { size: 26, fill: C.dim }) + text(94, 310, "not to scale", { size: 22, fill: C.dim, op: 0.7 }) + bars, { defs: s.defs, label: "Illustrative error bars with the always-zero baseline lowest" });
}

function postGround() {
  const w = 1600;
  const h = 900;
  const s = stage(w, h, C.violet, { cx: 0.3, cy: 0.2 });
  const a = "M430 300H720";
  const b = "M1000 300H1180";
  const c = "M1300 400V560";
  let table = "";
  for (let r = 0; r < 3; r++) {
    table += `<rect x="1040" y="${570 + r * 62}" width="440" height="50" rx="10" fill="#fff" fill-opacity="${r === 0 ? 0.2 : 0.09}"/>`;
  }
  return doc(
    w,
    h,
    s.body +
      wire(a) + wire(b) + wire(c) +
      card(130, 200, 300, 200, { stroke: C.violet }) +
      text(280, 290, "LLM", { size: 62, weight: 800, anchor: "middle" }) +
      text(280, 340, "picks the tool", { size: 22, fill: C.dim, anchor: "middle" }) +
      card(720, 200, 280, 200) +
      text(860, 290, "typed", { size: 34, weight: 700, anchor: "middle" }) +
      text(860, 335, "tool call", { size: 34, weight: 700, anchor: "middle" }) +
      card(1180, 200, 300, 200, { stroke: C.accent }) +
      text(1330, 290, "SQL", { size: 62, weight: 800, anchor: "middle" }) +
      text(1330, 340, "writes the rows", { size: 22, fill: C.dim, anchor: "middle" }) +
      table +
      wire("M280 400V640H960", C.coral, 3, "4 12") +
      text(620, 620, "no path for model text to reach the table", { size: 24, fill: C.coral, anchor: "middle" }) +
      `<path d="M960 620l40 40M1000 620l-40 40" stroke="${C.coral}" stroke-width="7" stroke-linecap="round"/>` +
      pulse(a, C.violet) + pulse(b, C.accent, { delay: 1 }) + pulse(c, C.accent, { delay: 2 }),
    { defs: s.defs, label: "The model picks a tool and SQL writes the table" },
  );
}

function postScale() {
  const w = 1600;
  const h = 900;
  const s = stage(w, h, C.amber, { cx: 0.5, cy: 0.15, op: 0.2 });
  const cx = 800;
  const tilt = 12 * (Math.PI / 180);
  const arm = 460;
  const lx = cx - arm * Math.cos(tilt);
  const ly = 240 + arm * Math.sin(tilt);
  const rx = cx + arm * Math.cos(tilt);
  const ry = 240 - arm * Math.sin(tilt);
  const goals = ["On-call balance", "Training goals", "Manager preferences", "Fairness"];
  const stack = goals
    .map((g, i) => {
      const y = ry + 270 - (i + 1) * 58;
      return `<rect x="${rx - 170}" y="${y}" width="340" height="50" rx="12" fill="#1c2233" stroke="${C.line}"/>` + text(rx, y + 33, g, { size: 22, anchor: "middle", fill: C.dim });
    })
    .join("");
  return doc(
    w,
    h,
    s.body +
      `<path d="M${cx} 240V760M${cx - 140} 760H${cx + 140}" stroke="${C.line}" stroke-width="10" stroke-linecap="round"/>` +
      `<path d="M${lx} ${ly}L${rx} ${ry}" stroke="${C.text}" stroke-width="8" stroke-linecap="round"/>` +
      `<circle cx="${cx}" cy="240" r="18" fill="${C.amber}"/>` +
      `<path d="M${lx} ${ly}V${ly + 270}M${rx} ${ry}V${ry + 270}" stroke="${C.dim}" stroke-width="3"/>` +
      `<path d="M${lx - 190} ${ly + 270}H${lx + 190}M${rx - 190} ${ry + 270}H${rx + 190}" stroke="${C.text}" stroke-width="6" stroke-linecap="round"/>` +
      `<rect x="${lx - 130}" y="${ly + 150}" width="260" height="120" rx="18" fill="${C.amber}"/>` +
      text(lx, ly + 204, "the “soft”", { size: 32, weight: 800, anchor: "middle", fill: "#231a00" }) +
      text(lx, ly + 242, "rule", { size: 32, weight: 800, anchor: "middle", fill: "#231a00" }) +
      stack,
    { defs: s.defs, label: "A balance scale where one soft rule outweighs a stack of goals" },
  );
}

function postNetwork() {
  const w = 1600;
  const h = 900;
  const s = stage(w, h, C.coral, { cx: 0.85, cy: 0.5, op: 0.2 });
  const rand = rng(3);
  const nodes = Array.from({ length: 9 }, (_, i) => [180 + (i % 3) * 200 + rand() * 40, 210 + Math.floor(i / 3) * 210 + rand() * 40]);
  const links = [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8]];
  const net = links.map(([a, b]) => wire(`M${nodes[a][0]} ${nodes[a][1]}L${nodes[b][0]} ${nodes[b][1]}`, C.accent, 2.5)).join("");
  const dots = nodes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="28" fill="${C.accent}" opacity="0.15"/><circle cx="${x}" cy="${y}" r="12" fill="${C.accent}"/>`).join("");
  const wall = 1020;
  const out = [nodes[2], nodes[5], nodes[8]]
    .map(([x, y], i) => wire(`M${x} ${y}L${wall} ${250 + i * 200}`, C.coral, 3, "4 12") + `<path d="M${wall - 24} ${226 + i * 200}l48 48M${wall + 24} ${226 + i * 200}l-48 48" stroke="${C.coral}" stroke-width="8" stroke-linecap="round"/>`)
    .join("");
  const errs = ["403 Forbidden", "ERR_TIMED_OUT", "CDN unreachable"]
    .map((e, i) => text(wall + 90, 260 + i * 200, e, { size: 36, font: MONO, weight: 600, fill: C.coral }))
    .join("");
  const flow = `M${nodes[0][0]} ${nodes[0][1]}L${nodes[1][0]} ${nodes[1][1]}L${nodes[4][0]} ${nodes[4][1]}L${nodes[5][0]} ${nodes[5][1]}`;
  return doc(
    w,
    h,
    s.body + net + out + `<rect x="${wall - 6}" y="130" width="12" height="640" rx="6" fill="${C.line}"/>` + dots + errs + pulse(flow, "#fff", { dur: 4, r: 5 }),
    { defs: s.defs, label: "Self-hosted services stay connected while outside requests hit a wall" },
  );
}

/* Identity */

function monogram(size, rounded = true) {
  const s = size / 64;
  const defs = `<linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.accent}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>`;
  return doc(
    size,
    size,
    `<g transform="scale(${s})"><rect width="64" height="64" rx="${rounded ? 15 : 0}" fill="url(#m)"/>
<path d="M29 21.5c-1.6-3-4.6-4.5-8-4.5-4.6 0-8 2.6-8 6.6 0 3.6 2.7 5.4 7.6 6.6 5.4 1.3 8.9 3.1 8.9 7.3 0 4.3-3.7 7.5-8.9 7.5-4.2 0-7.6-1.8-9.6-5.2" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
<path d="M38 17v30M54 17 38 33l16 14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    { defs, label: "SK" },
  );
}

function og() {
  const w = 1200;
  const h = 630;
  const lines = flowLines({ w: 2100, h: 900, count: 80, seed: 5, fx: 0.8, fy: 0.5 });
  const defs = `<linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="${C.accent}"/><stop offset="1" stop-color="${C.violet}"/></linearGradient>` + glow("g", C.violet, 0.9, 0.2, 0.7, 0.4) + `<linearGradient id="fade" x1="0" x2="1"><stop offset="0.3" stop-color="#05060c" stop-opacity="0.92"/><stop offset="0.85" stop-color="#05060c" stop-opacity="0"/></linearGradient>`;
  const paths = lines.map((l) => `<path d="${l.d}" fill="none" stroke="url(#lg)" stroke-opacity="${n1(l.op)}" stroke-width="${n1(l.width)}"/>`).join("");
  return doc(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="#05060c"/><rect width="${w}" height="${h}" fill="url(#g)"/><g transform="scale(0.72)">${paths}</g><rect width="${w}" height="${h}" fill="url(#fade)"/>` +
      text(84, 250, "Sina Khodadadi", { size: 88, weight: 700, ls: -2, font: "Helvetica Neue, Arial, sans-serif" }) +
      text(88, 320, "AI Software Engineer", { size: 38, fill: C.accent, weight: 600, font: "Helvetica Neue, Arial, sans-serif" }) +
      text(88, 400, "Software engineer, deep in AI.", { size: 30, fill: "#c4c9d6", weight: 400, font: "Helvetica Neue, Arial, sans-serif" }),
    { defs, label: "Sina Khodadadi, AI Software Engineer" },
  );
}

/** The live Marja capture inside a browser frame, on the dark stage of the project cards. */
async function marjaCard() {
  const shot = await sharp(path.join(OUT, "project-shot-02.png")).resize({ width: 1080 }).png().toBuffer();
  const { height: sh } = await sharp(shot).metadata();
  const w = 1200;
  const h = 800;
  const fx = 60;
  const fy = Math.round((h - sh - 54) / 2);
  const s = stage(w, h, "#ffe600", { cx: 0.5, cy: 0.5, op: 0.18 });
  const base = doc(
    w,
    h,
    s.body +
      `<rect x="${fx}" y="${fy}" width="1080" height="${sh + 54}" rx="16" fill="#1a1f2d" stroke="${C.line}"/>` +
      [C.coral, C.amber, C.accent].map((c, i) => `<circle cx="${fx + 26 + i * 22}" cy="${fy + 27}" r="7" fill="${c}"/>`).join("") +
      `<rect x="${fx + 110}" y="${fy + 13}" width="420" height="28" rx="14" fill="#fff" fill-opacity="0.08"/>` +
      text(fx + 128, fy + 33, "marjapanel.ir", { size: 15, fill: C.dim, font: "Helvetica Neue, Arial, sans-serif" }),
    { defs: s.defs },
  );
  return sharp(Buffer.from(base))
    .composite([{ input: shot, left: fx, top: fy + 54 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const svgFiles = [
  ["hero.svg", hero()],
  ["favicon.svg", monogram(64)],
  ["lab-cover.svg", labCover()],
  devWork("dev-work-01.svg", "RAG pipeline with escalation", C.accent, sceneRag()),
  devWork("dev-work-02.svg", "Roster solved by constraint programming", C.violet, sceneRoster(), rosterDefs),
  devWork("dev-work-03.svg", "Two-stage hurdle allocation", C.amber, sceneAlloc()),
  devWork("dev-work-04.svg", "Pitch deck to evidence-backed scorecard", C.indigo, sceneDeck()),
  devWork("dev-work-05.svg", "Persian chat with server-built table", C.violet, sceneChat()),
  cover("case-study-cover-01.svg", "RAG pipeline", C.accent, sceneRag()),
  cover("case-study-cover-02.svg", "Roster grid", C.violet, sceneRoster(), rosterDefs),
  cover("case-study-cover-03.svg", "Hurdle allocation", C.amber, sceneAlloc()),
  cover("case-study-cover-04.svg", "Deal flow scorecard", C.indigo, sceneDeck()),
  cover("case-study-cover-05.svg", "Persian chat", C.violet, sceneChat()),
  cover("case-study-cover-06.svg", "Quota engine", C.accent, sceneQuota()),
  ["research-01.svg", researchHand()],
  ["research-02.svg", researchRidges()],
  ["research-03.svg", researchHurdle()],
  ["research-04.svg", researchCube()],
  ["post-cover-01.svg", postZero()],
  ["post-cover-02.svg", postGround()],
  ["post-cover-03.svg", postScale()],
  ["post-cover-04.svg", postNetwork()],
  ["project-shot-01.svg", doc(1800, 1100, `<rect width="1800" height="1100" fill="#eef0f7"/><svg x="60" y="30" width="1560" height="1040" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet" style="overflow:visible"><g transform="translate(70 0)">${sceneChat({ light: true })}</g></svg>`, { label: "Marja Intelligence chat interface" })],
];

await mkdir(OUT, { recursive: true });
await Promise.all(svgFiles.map(([file, markup]) => writeFile(path.join(OUT, file), markup)));
await sharp(Buffer.from(og())).png({ compressionLevel: 9 }).toFile(path.join(OUT, "og.png"));
await sharp(Buffer.from(monogram(32))).png().toFile(path.join(OUT, "favicon-32.png"));
await sharp(Buffer.from(monogram(180, false))).png().toFile(path.join(OUT, "apple-touch-icon.png"));
await writeFile(path.join(OUT, "dev-work-06.png"), await marjaCard());
console.log(`Wrote ${svgFiles.length + 4} images to ${path.relative(process.cwd(), OUT)}`);
