// Generates the placeholder SVGs in public/placeholders.
// Usage: node scripts/generate-placeholders.mjs
// Sizes and ratios are listed in SPEC.md §5. Replace the files with real images when ready.

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "placeholders");

const THEMES = {
  dark: { from: "#0b0b0b", to: "#1c1c1c", grid: "#ffffff", text: "#ffffff", glow: "#00bfa5" },
  light: { from: "#f5f5f5", to: "#e5e7eb", grid: "#000000", text: "#000000", glow: "#00bfa5" },
  violet: { from: "#1a1033", to: "#2d1b69", grid: "#ffffff", text: "#ffffff", glow: "#7c4dff" },
  teal: { from: "#063b3d", to: "#09757a", grid: "#ffffff", text: "#ffffff", glow: "#00bfa5" },
};

/** [file, width, height, label, theme] */
const MANIFEST = [
  ["avatar.svg", 160, 160, "YN", "teal"],
  ["hero.svg", 2100, 900, "Hero Image", "light"],
  ...[1, 2, 3, 4, 5, 6].map((n) => [`dev-work-0${n}.svg`, 1200, 800, `Project Title 0${n}`, "dark"]),
  ...[1, 2, 3, 4].map((n) => [`3d-work-0${n}.svg`, 900, 1200, `3D Title 0${n}`, "violet"]),
  ["about-portrait.svg", 800, 1000, "Portrait", "light"],
  ["lab-cover.svg", 1600, 900, "Lab Cover", "dark"],
  ...[1, 2].map((n) => [`case-study-cover-0${n}.svg`, 2100, 900, `Case Study 0${n}`, "light"]),
  ...[1, 2, 3].map((n) => [`project-shot-0${n}.svg`, 1800, 1100, `Project Screenshot 0${n}`, "light"]),
  ...[1, 2, 3, 4].map((n) => [`post-cover-0${n}.svg`, 1600, 900, `Post Cover 0${n}`, "dark"]),
  ["og.svg", 1200, 630, "Your Name", "teal"],
];

function svg(width, height, label, themeName, file) {
  const t = THEMES[themeName];
  const min = Math.min(width, height);
  const isAvatar = file === "avatar.svg";
  const cell = Math.round(min / 12);
  const titleSize = Math.round(min * (isAvatar ? 0.36 : 0.075));
  const metaSize = Math.max(10, Math.round(min * 0.03));

  const meta = isAvatar
    ? ""
    : `<text x="50%" y="${height / 2 + titleSize * 0.9}" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="${metaSize}" fill="${t.text}" fill-opacity="0.45">${file} · ${width}×${height}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label} placeholder">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.from}"/>
      <stop offset="1" stop-color="${t.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.75" cy="0.2" r="0.6">
      <stop offset="0" stop-color="${t.glow}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${t.glow}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse">
      <path d="M ${cell} 0 L 0 0 0 ${cell}" fill="none" stroke="${t.grid}" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>
  <text x="50%" y="${height / 2}" text-anchor="middle" dominant-baseline="${isAvatar ? "central" : "auto"}" font-family="Poppins, ui-sans-serif, system-ui, sans-serif" font-weight="600" font-size="${titleSize}" letter-spacing="-0.02em" fill="${t.text}" fill-opacity="${isAvatar ? 0.9 : 0.75}">${label}</text>
  ${meta}
</svg>
`;
}

await mkdir(OUT_DIR, { recursive: true });
await Promise.all(
  MANIFEST.map(([file, w, h, label, theme]) => writeFile(path.join(OUT_DIR, file), svg(w, h, label, theme, file))),
);
console.log(`Wrote ${MANIFEST.length} placeholders to ${path.relative(process.cwd(), OUT_DIR)}`);
