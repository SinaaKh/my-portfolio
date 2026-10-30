# Portfolio Design Spec

Reference: an existing portfolio design, studied on 2026-10-30 at 1440×900 and 375×812.

The layout, visual design and interactions are modelled on that reference; no text, images, logos, client names
or personal details are reused. All content lives in `src/content/site.ts` as clearly fake placeholders
("Your Name", "Project Title 01", "Client A").

Reference stack, for orientation: Next.js App Router, Tailwind (v3 + daisyUI), Framer Motion, Lenis, AOS,
nprogress. Ours: Next.js 16, Tailwind v4, Framer Motion, Lenis. No daisyUI, AOS or nprogress. Their effects are
rebuilt with Framer Motion and plain CSS.

---

## 1. Design tokens

All tokens are defined once in `src/app/globals.css` (`@theme` → Tailwind utilities + `:root` CSS variables).

### 1.1 Typography

| Role | Reference | Ours | Notes |
|---|---|---|---|
| Sans (everything) | Poppins 300/400/500/600/700/800 via `next/font` | **Poppins**, same weights, `next/font/google` | No swap needed (free Google Font). 900 is *not* loaded on the reference, so `font-black` renders as 800. We keep that by loading 300–800 only. |
| Serif (italic accents) | Tailwind default `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif` | Same system stack | Renders as New York on Apple and Georgia/Cambria elsewhere. No webfont, so there's nothing to swap. |
| Mono (counters, "scroll to explore") | Tailwind default `ui-monospace, SFMono-Regular, Menlo, …` | Same system stack | — |

**Type scale in use** (px, by frequency): 10 · 72 · 14 · 12 · 9 · 60 · 24 · 48 · 20 · 30 · 16 · 8 · 96 · 36 · 13 · 128 · 18 · 7,
plus viewport-relative display sizes: `5vw` / `7vw` (marquee words), `13vw` (hero overlay title), `18vw` (partnership
watermark), `20vw` (timeline watermark).

Named tokens (Tailwind `text-*`):

| Token | Size | Use |
|---|---|---|
| `text-micro` | 8px | timeline sub-labels on mobile, "SCROLL"/"FIN" |
| `text-tag` | 9px | project tag pills |
| `text-eyebrow` | 10px | all uppercase eyebrows and labels |
| `text-nav` | 13px | nav links and the nav CTA |
| `text-lead` | 18px | page intros on secondary pages |
| Tailwind defaults | xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 · 3xl 30 · 4xl 36 · 5xl 48 · 6xl 60 · 7xl 72 · 8xl 96 · 9xl 128 | headings |
| `lg:text-[10rem]` | 160px | secondary-page hero titles |

**Weights:** 300 light (accent words, body on dark), 400, 500 medium (most headings), 600, 700 bold, 800 (rendered for
`font-black`: eyebrows, buttons, game UI).

**Line heights:** `leading-[0.85]` (display), `0.9`, `0.95`, `1.1` (h1/h3), `snug` 1.375, `relaxed` 1.625, `none` 1.

**Letter spacing:**

| Token | Value | Use |
|---|---|---|
| `tracking-tighter` | -0.05em | display headings (measured: -3.6px @72px, -5.04px @100.8px, -4.8px @96px) |
| `tracking-tight` | -0.025em | h3, body headlines |
| `tracking-widest` | 0.1em | small caps labels |
| `tracking-caps` | 0.2em | tech-stack names, footer pills |
| `tracking-label` | 0.3em | "Read Case Study" links, project meta, filter tabs |
| `tracking-eyebrow` | 0.4em | section eyebrows |
| `tracking-ultra` | 0.5em | "Portfolio"/"Timeline" eyebrows, collaborations footnote |

### 1.2 Color

| Token | Value | Use |
|---|---|---|
| `ink` | `#000000` | dark sections, primary text on light |
| `paper` | `#FFFFFF` | light sections, primary text on dark |
| `accent` | `#00BFA5` | teal brand: eyebrows, cursor, CTAs, hovers, glows |
| `violet` | `#7C4DFF` | hero ambient blob, particles |
| `indigo` | `#6366F1` | versatility hub lines, flowing bits, rings |
| `indigo-deep` | `#4F46E5` | hub gradient end |
| `coral` | `#FF5252` | hero ambient blob (5% alpha) |
| `surface` | `#080808` | tech-stack section background |
| `neutral-900` | `#171717` | industry node tiles |
| `neutral-100` | `#F5F5F5` | 3D card fallback bg |
| `gray-50/100/200/…/950` | Tailwind defaults | secondary pages (`bg-gray-100` page bg, `text-gray-600` nav links, `border-gray-100` nav border) |
| `deep-teal` | `#09757A` | secondary-page link accent ("site default" color on the reference) |

**Alpha ramps used everywhere** (via Tailwind `/opacity`):
- On dark: `white/2, /5, /10, /20, /30, /40, /50, /80, /90`
- On light: `black/2, /5, /10, /30, /40, /50, /60, /70, /80`
- Accent tints: `accent/5, /10, /20, /30, /40`

**Industry palette** (bottom borders of the hub nodes): `#FF4D4D`, `#1DB954`, `#00A3FF`, `#FFD700`, `#FF6B00`, `#7C4DFF`.

**Projects page band colors:** `#00BFA5`, `gray-950`, `#0F084E`, `#FFFFFF`, `#D2D2FF`/`#D7EEF0`, `#0D1520`, `#FFE5E2`, `#36234D`.

### 1.3 Spacing, layout, breakpoints

- **Spacing scale**: Tailwind 4px base. Gaps seen: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96. Section padding `py-24`/`py-32`
  (96/128px), `lg:py-32`. Page gutters `px-6` (24px), `lg:px-12` (48px).
- **Containers**: Tailwind `container mx-auto px-6` (max 640/768/1024/1280/1536), `max-w-7xl` (1280), `max-w-[1100px]`,
  `max-w-[1000px]`, `max-w-[900px]`, `max-w-4xl` (896), `max-w-2xl` (672), `max-w-xl` (576), `max-w-md` (448),
  `max-w-xs` (320), `max-w-[300px]`, `max-w-[250px]`.
- **Breakpoints**: Tailwind defaults: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536. Most layout switches
  happen at `md` and `lg`.
- **Nav height**: 80px (`h-20`). Exposed as `--nav-height`.

### 1.4 Radius

| Token | Value | Use |
|---|---|---|
| `rounded-full` | 9999px | pills, buttons, cursor, dots (the most common) |
| `rounded-xl` | 12px | game target, small tiles |
| `rounded-2xl` | 16px | cards, project image frames, tech tiles, filter tabs |
| `rounded-3xl` | 24px | hero image (start state), CTA card |
| `rounded-4xl` | 32px | case-study feature cards |
| `rounded-5xl` | 40px | 3D cards, game result modal, About story card, Lab image |

### 1.5 Elevation

| Token | Value |
|---|---|
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / .25)` (cards, hero image) |
| `shadow-card` | `0 20px 40px rgb(0 0 0 / .4)` (industry tiles, lg) |
| `shadow-card-sm` | `0 10px 20px rgb(0 0 0 / .4)` (industry tiles, mobile) |
| `shadow-glow` | `0 20px 40px rgb(0 191 165 / .2)` (Attempt Bypass button) |
| `shadow-dot` | `0 0 20px #00BFA5` (timeline traveler) |
| indigo pulse | `0 0 26–35px rgb(99 102 241 / .27–.35)`, animated (hub core) |

### 1.6 Motion

- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind default) for CSS transitions. Framer uses springs or `easeOut`.
- **Durations**: 150ms (nav link color), 300ms (link underline, arrow nudge), 500ms (default card/hover), 700ms (slow color
  fades, icon grayscale), 1000ms (image zoom on hover).
- **Smooth scroll**: Lenis on `<html>` (`.lenis.lenis-smooth`), default lerp. Main uses `snap-y snap-proximity` with
  `snap-start` wrappers per section (we drop the snap; see §6). Smooth scroll is disabled when
  `prefers-reduced-motion: reduce`. Ours: `src/components/smooth-scroll.tsx` drives Lenis from Framer Motion's frame
  loop, so scroll-linked motion values stay in sync. Anchor links scroll smoothly (`anchors: true`).
- **Reduced motion**: all scroll-linked transforms fall back to their end state, and marquees and spins stop.

---

## 2. Global elements

### 2.1 Navigation (fixed)
- `fixed top-0 inset-x-0 z-[999] bg-white/80 backdrop-blur-md border-b border-gray-100`, inner `flex h-20 items-center
  justify-between px-6 lg:px-12`.
- **Left**: logo link: 28px round avatar plus wordmark (`text-xl font-bold tracking-tighter text-black`).
- **Center** (`hidden lg:block`): 3 links, `flex space-x-10`, `text-nav font-medium text-gray-600 hover:text-black`
  (150ms).
- **Right**: CTA pill `rounded-full bg-black px-7 py-2.5 text-nav font-bold text-white hover:bg-gray-800
  active:scale-95`, linking to an external scheduling URL. Below `lg`, a hamburger icon button (24px, `stroke-2`, the
  third bar is shorter) opens a dropdown: `mt-3 w-52 rounded-2xl bg-white p-2 shadow-2xl border border-gray-100
  text-gray-600`, with the same links.
- **Scroll behavior** (scroll-linked, not direction-based): `opacity` goes 1→0 and `y` goes 0→-100px as `scrollY` moves
  from 200→400px. It stays hidden for the rest of the page. On secondary pages, the same.
- Content slots: `site.avatar`, `site.shortName`, `nav.links[]`, `nav.cta`.

### 2.2 Custom cursor (desktop pointer only)
- Two fixed layers, `pointer-events-none`:
  1. **Blob**: 32px `bg-accent rounded-full mix-blend-difference z-[9999]`, follows the pointer with a spring lag.
     Scales **2.5×** when hovering any `a`, `button` or `[data-cursor="hover"]`.
  2. **Dot**: 8px `bg-white rounded-full z-[10000]`, follows the pointer exactly. Opacity 0 while hovering interactive
     elements.
- Hidden off-screen (`-100px`) until the first `pointermove`. Our improvement: hidden on `(pointer: coarse)` (the
  reference renders it on touch too).

### 2.3 Route progress
- The reference shows a 3px top progress bar in `#09757A` on route change (nprogress). Optional for us: a thin Framer
  bar in `deep-teal`.

### 2.4 Section stacking notes
- Hero is `lg:min-h-[200vh]`. "My Works" uses `md:-mt-[430px]` so it slides over the hero's tail.
- The Tech Stack section uses `-mt-[600px]` so it overlaps the end of the 3D Works sticky track.
- Sticky scroll sections (Dev Works, 3D Works, Timeline) are `h-[600vh]` wrappers with a `sticky top-0 h-screen` stage.

---

## 3. Home page, section by section (in page order)

Desktop heights measured at 1440×900: Hero 1800 · My Works 900 · Versatility 1434 · Dev Works 5400 · 3D Works 5400 ·
Tech Stack 1144 · Timeline 5400 · Insights 1796 · Partnership 1122 · Collaborations 1136 · Footer ~600.
Mobile (375×812): Hero 812 · My Works 812 · Versatility 1141 · Dev Works 4872 · 3D 4872 · Tech 1268 · Timeline 4872 ·
Insights 1998 · Partnership 1819 · Collaborations 929.

### 3.1 Hero (`#hero`)
**Layout**
- `section relative min-h-screen lg:min-h-[200vh] w-full overflow-hidden pt-32 pb-20`, scroll-linked background color.
- Content row: `w-full px-6 lg:px-12` → `flex flex-col lg:flex-row items-start justify-between mb-20`.
  - Left `max-w-4xl pt-[100px]`:
    - Greeting line: 40px round avatar plus greeting text in `text-accent text-[18px] leading-[1.1]`.
    - Headline h1: `text-3xl md:text-4xl lg:text-6xl font-medium tracking-tight leading-[1.1] mb-12`, split into
      **words**, each an `inline-block mr-[0.2em]`.
    - Text link: `text-sm font-semibold border-b-2 border-current hover:underline`.
  - Right (`hidden lg:flex flex-col items-end gap-20 pt-10`): **circular badge**, 128px, an SVG `textPath` on a circle
    (r=35 in a 100 viewBox) with `text-[7px] uppercase tracking-[0.3em] font-bold`, rotating `spin 12s linear infinite`.
    Center: a 40px circle `bg-current/10` with a 20px icon.
- Image: `relative w-full flex justify-center mt-20` → frame `aspect-[21/9] overflow-hidden shadow-2xl z-[60]`, image
  `object-cover`, frame opacity 0.5.
- Overlay title: absolute-centered `text-[13vw] font-bold text-white tracking-tighter leading-none uppercase pt-[59px]`,
  `z-[100]`.

**Ambient layers** (all `pointer-events-none`, z-0)
- Two **fixed** blur blobs following the pointer: 500px `bg-accent/10 blur-[120px]` and 400px `bg-violet/10 blur-[100px]`.
- Particle layer A: 50 dots (1–3px, random positions, colors accent/violet/black, opacity 0.1–0.35), parallax 20px with
  the pointer.
- Particle layer B: 30 dots (2–6px, `blur-[1px]`), parallax 40px.
- Line layer: SVG `viewBox 0 0 100 100 preserveAspectRatio=none`. Diagonal lines (`y` step 15, slope +10) with stroke 0.05
  in accent/violet and random opacity. Each line draws in via `pathLength`. The layer has opacity 0.15, parallax 30px,
  `rotate(-2deg)`.
- Static blobs: `top-[20%] right-[10%] 400px bg-accent/5 blur-[100px]`; `bottom-[10%] left-[5%] 300px bg-coral/5 blur-[80px]`.

**Motion**
- On load, the headline words rise in staggered (`y: 100% → 0`, stagger ≈ 0.05s), and the greeting fades in.
- Scroll-linked (desktop, `scrollY` in px):
  - Image frame width goes **70% → 100%** and border-radius **24px → 0** over `scrollY` 0→360.
  - Section background goes **white → black**, and the text color black → white, over `scrollY` ≈ 200→300.
  - Overlay title: `y` 100 → -150px, `scale` 0.9 → 1 over `scrollY` ≈ 500→900. **On the reference its opacity stays 0
    (never visible).** We'll fade it in (0→1→0 around the image's full-width moment) unless told otherwise.
- **Mobile** (< lg): starts in the dark state (black bg, white text), image already full-width with no radius, section
  is 1 screen tall. The circular badge is hidden.

**Content slots**: `hero.greeting`, `hero.headline` (string, split into words), `hero.link`, `hero.badgeText`,
`hero.image`, `hero.overlayTitle`.

### 3.2 My Works: word marquee + AI Firewall Challenge (`#my-works`)
**Layout**
- Wrapper `md:-mt-[430px]`. `section relative h-screen w-full flex items-center justify-center overflow-hidden bg-black`.
- Background: `absolute inset-0 flex flex-col justify-center gap-12 lg:gap-20 select-none`, two rows of words
  (`flex whitespace-nowrap gap-12`):
  - Row A: `text-[5vw] lg:text-[7vw] font-black italic uppercase tracking-tighter`, **outlined** (`-webkit-text-stroke:
    1px rgb(255 255 255/.1); color: transparent`).
  - Row B: same size, not italic, `text-white/10`, offset `ml-[-30%]`.
  - Scroll-linked: row A `x` +300 → -300px, row B `x` -300 → +300px as the section passes through the viewport.
- Foreground intro (`relative z-10 text-center p-6`):
  - Title `text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase`.
  - Subtitle `text-accent text-lg mb-4 uppercase tracking-widest font-bold`.
  - Note `text-white/40 text-xs mb-8 uppercase tracking-widest italic`.
  - Button `px-10 py-4 bg-accent text-black font-black text-xl rounded-full uppercase tracking-tighter shadow-glow
    hover:scale-110 transition-transform`.

**AI Firewall Challenge widget** (state machine: `idle → playing → result`)
- **Playing**: the area becomes `cursor-none`. A 24px ring cursor (`border-2 border-white rounded-full
  mix-blend-difference`) follows the pointer.
  - HUD (`absolute top-10 centered`): two stats with a label (`text-white/40 text-xs uppercase tracking-widest`) and a
    value (`text-4xl font-black tabular-nums`). Stat 1 is the score (white). Stat 2 is a countdown from **30s** (accent).
  - Below the HUD, a rotating hint pill: `text-sm font-bold uppercase tracking-widest px-4 py-1 rounded-full
    backdrop-blur-sm text-accent bg-white/5`. It cycles through hint messages and also flashes a status message after a
    failed click.
  - **Target**: 56px hit area, positioned with `left/top %`. A 32px `rounded bg-accent` chip shows a 2-letter label
    (`text-[10px] font-black text-black`), over a `blur-md rounded-xl bg-accent opacity-40` glow, with an `animate-ping`
    ring `border-accent/30`.
  - Behavior: the target **evades** the pointer. When the pointer gets within a radius it jumps away (spring), and its
    scale grows slightly as the pointer approaches (0.8 → ~0.87). Clicks almost never register. It's designed to be
    nearly unwinnable ("only hackers win"): touch input is ignored.
- **Result**: a modal `text-center bg-white/5 backdrop-blur-xl p-12 rounded-5xl border border-white/10` with a title
  `text-6xl font-black italic uppercase tracking-tighter`, a score line `text-2xl text-accent font-bold uppercase
  tracking-widest`, and a retry button `px-8 py-3 bg-accent text-black font-bold rounded-full hover:bg-white`.
- Optional "win" state: if score > 0 (or a secret, such as clicking via keyboard focus), show a success title instead.
- **Mobile**: same layout, smaller text. Pressing the button on touch shows the "touch disabled" state.

**Content slots**: `myWorks.rowA[]`, `myWorks.rowB[]`, `firewall.*` (title, subtitle, note, start, statLabels, hints[],
duration, result titles and messages, retry).

### 3.3 Versatility: industries hub (`#versatility`)
**Layout**
- `section relative py-12 lg:py-24 bg-black overflow-hidden min-h-screen flex flex-col items-center justify-center`.
- Dot grid backdrop: `radial-gradient(#fff 1px, transparent 1px)` at `40px 40px`, opacity 0.05.
- Header (centered, `mb-8 lg:mb-16`): eyebrow `text-accent text-eyebrow font-black uppercase tracking-eyebrow`. Title
  `text-3xl md:text-8xl font-medium leading-[0.9] tracking-tighter text-white`, whose last word is
  `italic font-serif text-white/80`. Description `text-white/40 text-[10px] lg:text-lg max-w-2xl font-light
  leading-relaxed`. Then the **ArrowLink** (see 3.4).
- **Hub diagram** `relative aspect-square md:aspect-[1000/600] w-full max-w-[1000px] mb-8 lg:mb-20`:
  - SVG `viewBox 0 0 1000 600` with 6 connectors from node anchors to the center (500,300), `stroke indigo 2px opacity .3`,
    drawn in with `pathLength`:
    `M150 100 Q300 100 500 300`, `M100 300 L500 300`, `M150 500 Q300 500 500 300`, and the three mirrored at x 850/900.
  - **Flowing bits** (md+): "0"/"1" glyphs (`12px font-black text-indigo`, glow `0 0 8px indigo/50`) moving along each path
    with CSS `offset-path` + animated `offset-distance` 0→100%, fading in and out. About 2 per path, staggered.
  - **Core**: `w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-indigo to-indigo-deep p-[2px]` with a
    pulsing indigo glow. Inner `bg-black/80 w-20 h-20 lg:w-24 lg:h-24 rounded-full border border-white/20`, holding a
    **cycling word** (crossfade and slide, about every 2s) in `text-white font-black text-sm lg:text-xl tracking-tighter`.
    Two orbit rings: `inset-[-15px] lg:inset-[-25px] border border-dashed border-indigo/40` (rotating) and
    `inset-[-20px] lg:inset-[-30px] border border-dotted border-indigo/20` (counter-rotating).
  - **6 nodes** at `left/top %` (15/16.7, 10/50, 15/83.3, 85/16.7, 90/50, 85/83.3): tile `w-10 h-10 lg:w-16 lg:h-16
    rounded-xl lg:rounded-2xl bg-neutral-900 border border-white/10 shadow-card-sm lg:shadow-card text-xl lg:text-3xl`,
    `border-bottom: 2px solid <industry color>`, holding an emoji or icon. On hover the tile scales 1.1, and a label pill
    appears below it (`bg-accent text-black text-[8px] lg:text-eyebrow font-black uppercase tracking-[0.2em]
    rounded-full`, `opacity 0 → 1`, `y 8 → 0`). Nodes pop in and out on a loop (`scale 0 ↔ 1`), staggered.
- **Pillars**: `grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 pt-10 border-t border-white/5`. Each is centered: an
  icon tile `w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-white/5 border border-white/10`
  (hover: `scale-110 border-accent/30 bg-white/10`), a title `text-xs lg:text-base font-bold text-white tracking-widest
  uppercase`, and copy `text-[10px] lg:text-sm text-white/40 max-w-[250px] font-light`.
- **Motion**: the header elements fade up (`y 10–20 → 0`) in view, and the pillars stagger up.

**Content slots**: `versatility.eyebrow/title/titleAccent/description/link`, `hubWords[]`, `industries[]` (icon, label,
color), `pillars[]` (icon, title, description).

### 3.4 Shared component: ArrowLink ("Read Case Study" style)
`group/link inline-flex items-center gap-3 text-eyebrow font-black uppercase tracking-label pb-2 relative
overflow-hidden`, with a label, an arrow icon in accent (`group-hover/link:translate-x-1`, 300ms), a base underline
`h-px bg-white/20` (or `bg-black/10` on light), and an accent underline that slides in from `-translate-x-full` to `0`
(300ms).

### 3.5 Selected Dev Works: horizontal scroll (`#dev-works`)
**Layout**
- `section relative h-[600vh] bg-black` → `sticky top-0 flex h-screen items-center overflow-hidden`.
- Corner header (`absolute top-4 px-6 md:px-12`): eyebrow `text-white/20 text-eyebrow font-black tracking-ultra
  uppercase`, and title `text-2xl font-light tracking-tight text-white/90` with an `italic font-serif` accent.
- Track `flex gap-16 md:gap-24 pl-[10vw] pr-24`. Its `x` goes **0% → -80%** across the section's scroll progress
  (`offset: start start → end end`).
- **Card** `group relative h-[550px] w-[350px] md:h-[650px] md:w-[600px] shrink-0 flex flex-col justify-between`:
  - Meta row: `text-accent text-eyebrow font-black tracking-label uppercase` ("NN / category / role") plus a hairline
    `h-px flex-1 bg-white/10`.
  - Title `text-4xl md:text-6xl font-medium text-white tracking-tight leading-[1.1] mb-6`.
  - Tags: `px-3 py-1 rounded-full border border-white/10 text-tag font-bold text-white/40 uppercase tracking-widest`.
  - ArrowLink to the case study (only on projects that have one).
  - Image frame `relative flex-1 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl`
    (hover: `border-white/20`). Image `object-contain` that scales to 1.05 over 1000ms on hover. Hover overlay:
    `bg-gradient-to-t from-black/60 via-transparent` fades in, and the description slides up (`translate-y-4 → 0`).
- 6 cards on the reference.
- **Mobile**: same mechanic with 350×550 cards. The track still translates.

**Content slots**: `devWorks.eyebrow/title/titleAccent`, `projects[]` (`slug, meta, title, tags[], summary, image,
caseStudy?`).

### 3.6 Selected 3D Works: flipping card viewer (`#three-d-works`)
**Layout**
- `section relative h-[600vh] bg-black text-white` → `sticky top-0 h-screen flex flex-col items-center justify-center
  overflow-hidden`.
- Corner header, same as Dev Works, plus a right-aligned **counter** `font-mono text-sm`: `01` (white) `/` `04`
  (white/20).
- Body `container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-12 mt-12`:
  - Left `max-w-xl space-y-6`: title `text-5xl md:text-8xl font-medium leading-[0.9] tracking-tight uppercase`, then a
    line break and a subtitle `italic font-light text-white/40 lowercase`.
  - Right `flex justify-center md:justify-end` with `perspective: 1000px`: the card `relative w-[280px] h-[380px]
    md:w-[450px]` with `transform-style: preserve-3d`. It has two faces, `absolute inset-0 backface-hidden rounded-5xl
    overflow-hidden shadow-2xl bg-neutral-100`, and the back face is pre-rotated `rotateY(180deg)`.
    *(The reference's md height class is malformed, so the card stays 380px tall on desktop. We keep 380px.)*
- **Motion** (scroll-linked over the 600vh): the card transform is `rotateX(15deg) rotateY(p × 540deg) rotateZ(-10deg)`.
  Active index = `min(n-1, floor(p × n))`. Whichever face is turned away swaps to the next image, so every half-turn
  reveals a new work. On index change the title block cross-fades (`opacity 0, y 10 → 1, 0`) and the counter updates.
- **Mobile**: stacked, with the title above the card.

**Content slots**: `threeDWorks.eyebrow/title/titleAccent`, `items[]` (`title, subtitle, image`).

### 3.7 Tech Stack: filterable grid (`#tech-stack`)
**Layout**
- Wrapper `-mt-[600px]` (overlaps 3D Works). `section relative bg-surface py-32 overflow-hidden min-h-screen`, with a
  radial glow `radial-gradient(circle at 50% 0%, accent/3%, transparent 70%)`.
- Header `mb-24`: eyebrow row (`w-10 h-px bg-accent` plus eyebrow text). Title `text-6xl md:text-9xl font-medium
  text-white leading-[0.85] tracking-tighter` over 2 lines, where word 2 is `text-white/20 italic font-light`.
- Body `flex flex-col lg:flex-row gap-16 lg:gap-24`:
  - **Filter tabs** `flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible w-full lg:w-64 scrollbar-hide`.
    Tab: `relative flex items-center gap-6 px-8 py-6 rounded-2xl text-eyebrow font-black uppercase tracking-label
    transition-all duration-500`. Inactive is `text-white/40`. Active is `text-white bg-white/5` plus an **accent bar**
    `absolute left-0 w-1 h-8 bg-accent rounded-full` that moves between tabs (Framer `layoutId`).
    Tabs: All plus 6 categories. **Default tab: the second one (first real category), not "All".**
  - **Grid** `grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8`. Tile `relative h-48 bg-white/2 border
    border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center` (hover: `bg-white/5 border-white/20`).
    Icon `text-4xl md:text-5xl` in the brand color, `grayscale` until hover (then `grayscale-0 scale-110`, 700ms).
    Name `text-white/40 font-bold text-eyebrow uppercase tracking-caps` (hover: white). A brand-color glow
    `blur-2xl opacity-0 → 10%` on hover.
- **Motion**: changing the filter uses `AnimatePresence mode="wait"`. Exits go `y 0 → 10, scale 1 → 0.9, opacity → 0`.
  Enters go `y 20 → 0, scale 0.9 → 1, opacity 0 → 1`, staggered about 0.05s. Total swap ≈ 500ms.
- **Mobile**: the tabs become a horizontal scroller and the grid is 2 columns.

**Content slots**: `techStack.eyebrow/title/titleAccent`, `categories[]`, `defaultCategory`, `items[]`
(`name, category, color`). Some items belong only to "All" (an uncategorised "tools" group).

### 3.8 Story / Timeline: horizontal journey (`#story`)
**Layout**
- `section relative h-[600vh] bg-black text-white` → `sticky top-0 h-screen w-full flex items-center overflow-hidden`.
- Watermark `absolute left-12 top-1/2 -translate-y-1/2 opacity-5`, holding `text-[20vw] font-serif font-bold
  leading-none whitespace-nowrap`.
- Corner header (`absolute top-12 left-6 md:left-12 z-20`): eyebrow, title `text-2xl md:text-4xl font-light` with an
  italic serif accent, and a subtitle `text-white/40 text-xs md:text-sm font-light mt-2`.
- Center line `absolute top-1/2 inset-x-0 h-px bg-white/5`.
- **Traveler**: a 32px `bg-accent rounded-full shadow-dot` with an 8px black "eye" (top-right) and two 16px hairline
  "wings" (`rotate ±45°`, `bg-white/40`), plus an `animate-ping` halo at 20% opacity.
- Track `flex items-center pl-[20vw] gap-[40vw] md:gap-[20vw]` with a `w-[10vw]` spacer at the end.
- **Entry** `relative shrink-0 w-[280px] md:w-[500px]`:
  - Above the line (`absolute bottom-[calc(50%+40px)] pl-4`): title `text-lg md:text-2xl font-medium tracking-tight
    text-white/90`, then a row with the period (`text-micro md:text-eyebrow font-bold tracking-label uppercase
    text-white/30`), a `w-4 h-px` dash and a tag (`font-serif italic text-white/40`).
  - Below the line (`absolute top-[calc(50%+40px)] pl-4`): a big index `text-3xl md:text-5xl font-serif italic font-bold
    text-white/20`, copy `text-white/50 text-xs md:text-sm font-light leading-relaxed max-w-[240px] md:max-w-[300px]`,
    and a "SCROLL" cue (`w-8 h-px bg-white/10` that grows to `w-16` on hover, label turns accent). The last entry says
    "FIN".
- Bottom-left (`absolute bottom-12`): two 32px round arrow buttons and `font-mono text-xs tracking-tighter "SCROLL TO
  EXPLORE"`. *(The reference styles the arrows `black/10` on black, so they're invisible. We use `white/10`.)*
- **Motion** (section scroll progress `p`):
  - Track `x` **0% → -88%**.
  - Traveler `x` **0 → 92vw**, with a gentle `y` bob (0 to -20px) and a small `rotateZ` wobble (±10° decaying).
  - Entries fade in only near the traveler: the top block goes `y -20 → 0`, the bottom block `y 20 → 0`, opacity 0 → 1.
    About 2 entries are visible at once.
- **Mobile**: same mechanic with 280px entries and wider gaps.

**Content slots**: `timeline.watermark/eyebrow/title/titleAccent/subtitle`, `entries[]` (`title, period, tag,
description`), `scrollCue`, `endCue`, `exploreHint`.

### 3.9 Latest Insights: theme-flip list (`#insights`)
**Layout**
- `section relative w-full py-32 overflow-hidden`, with a dot grid backdrop (40px, opacity 0.02).
- Header `flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8`:
  - Eyebrow (accent). Title `text-5xl md:text-8xl font-medium leading-[0.9] tracking-tighter`, whose last word is
    `italic font-light` at 30% alpha, followed by a trailing period.
  - "Browse all" link `flex items-center gap-4 font-bold text-sm uppercase tracking-widest hover:text-accent` with a
    48px round arrow button (`border`; hover fills accent with white arrow).
- **Post rows** `flex flex-col`, row `relative group py-12 border-b last:border-0`:
  - Left `flex-1`: an index (`text-eyebrow font-black tracking-widest`, 20% alpha), a `w-8 h-px` rule, a category
    (`text-accent tracking-label`), and the title `text-4xl md:text-5xl font-medium leading-[0.9] tracking-tighter`
    (hover: accent, 500ms).
  - Middle (`md:w-1/3 hidden md:block`): an excerpt `text-sm max-w-xs font-medium` that fades in on hover.
  - Right: "Read more" (`text-eyebrow font-black uppercase tracking-caps`) and a 48px round arrow. The group
    translates `x 16px` on hover.
- **Motion**: **scroll-linked theme flip.** With `useScroll({ target, offset: ['start end', 'end start'] })`,
  progress **0.30 → 0.50** maps the background **black → white**, the text **white → black**, and the borders and
  alpha text invert to match. On desktop that's the section top going from about +90px to -450px of the viewport.
  The eyebrow stays accent. Rows fade up (`y 20 → 0`) in view.
- 4 posts on the reference.

**Content slots**: `insights.eyebrow/title/titleAccent/browseAll`, `posts[]` (`slug, category, title, excerpt, date,
cover, body`). The home page shows the first 4.

### 3.10 Partnership (`#partnership`)
**Layout**
- `section relative py-24 lg:py-32 bg-white overflow-hidden`. Watermark `absolute top-10 right-[-5%] opacity-[0.015]`
  holding `text-[18vw] font-black uppercase tracking-tighter text-black`.
- `max-w-7xl mx-auto px-6 lg:px-12` → `grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24`.
  - **Left (6 cols)**: eyebrow. Title `text-5xl lg:text-7xl font-light tracking-tighter text-black leading-[0.95] mb-12`,
    then a line break and `italic font-serif text-black/80`. Paragraph `text-lg lg:text-xl font-light text-black/50
    leading-relaxed tracking-tight max-w-lg mb-12`. **Anti-list** `space-y-6 border-t border-black/5 pt-10`: each item
    has a 6px dot (`bg-accent/20`, accent on hover) and struck-through text `text-sm font-serif italic text-black/30
    line-through decoration-black/10` (hover: `text-black/60`, 700ms).
  - **Right (6 cols)** `flex flex-col justify-between`:
    - Audience list `grid gap-12`. Each item is `group flex gap-8 items-start border-b border-black/5 pb-8
      last:border-0` with an index (`text-eyebrow font-black text-black/10`, hover accent), a label (`text-xs font-black
      uppercase tracking-widest text-black/30`, hover black), and copy (`text-xl font-light text-black/70 leading-snug`,
      hover black).
    - **CTA card** `mt-12 bg-black rounded-3xl p-8 lg:p-12 relative overflow-hidden group cursor-pointer`, with a corner
      glow `w-32 h-32 bg-accent/10 blur-3xl` (hover /20). Title `text-3xl lg:text-4xl font-light text-white
      tracking-tighter` plus an `italic font-serif text-accent` accent. Sub `text-white/40 text-sm font-light`. A link
      reading "Let's talk" (`text-xs font-black uppercase tracking-label`) next to a 48px white circle with a black
      arrow (hover: accent circle, arrow scales 1.25).
- **Motion**: the left column fades up. Audience rows stagger. The CTA card goes `scale 0.95 → 1, opacity 0 → 1` in view.

**Content slots**: `partnership.watermark/eyebrow/title/titleAccent/description/antiList[]/audiences[]/cta`.

### 3.11 Collaborations: velocity marquee (`#collaborations`)
**Layout**
- `section relative w-full py-32 overflow-hidden bg-white text-black`.
- Header `container mx-auto px-6 mb-32 max-w-4xl`: eyebrow (enters `x -20 → 0`). Title `text-5xl md:text-9xl font-medium
  leading-[0.85] flex`, word 1 black, word 2 `italic font-light text-black/40` (enters `y 30 → 0`).
- Marquee band `relative flex flex-col gap-16 py-12 border-y border-black/5 bg-black/2`, with 2 rows. Each row is
  `flex overflow-hidden group` → inner `flex flex-none gap-24 items-center px-12`, with the list rendered twice for a
  seamless wrap. Items are `text-5xl md:text-7xl font-medium whitespace-nowrap tracking-tighter text-black/30
  cursor-default`. On row hover **all** items in that row turn accent (500ms).
- **Motion**: a velocity-reactive marquee. The base speed is about 25px/s (row 1 moves left, row 2 moves right). Scroll
  velocity (`useVelocity` + `useSpring`) adds speed and can flip direction while scrolling, using
  `wrap(-50%, 0, x)`.
- Footnote `container mt-32`: `text-center text-eyebrow font-black uppercase tracking-ultra text-black/40`, fades in.

**Content slots**: `collaborations.eyebrow/title/titleAccent/rows[2][]/footnote`.

### 3.12 Footer (`#contact`)
**Layout**
- `bg-white py-24 text-black` → `container mx-auto px-6`.
- Top `flex flex-col md:flex-row justify-between items-start gap-16 mb-24`:
  - `max-w-md`: heading `text-4xl font-medium tracking-tighter leading-tight mb-8` with an inline `text-accent italic`
    word, then the email link `text-black/60 hover:text-accent text-xl font-medium`.
  - Link columns `grid grid-cols-2 gap-12 md:gap-24`, each `flex flex-col gap-4`. Column title `text-eyebrow font-black
    uppercase tracking-eyebrow text-black/30 mb-2`. Links `text-black/60 hover:text-black text-sm font-medium`.
- "Built with" row `pt-8 border-t border-black/5`: label `text-eyebrow font-black uppercase tracking-eyebrow
  text-black/40 mb-4`, then pills `px-4 py-2 rounded-full border border-black/10 text-eyebrow font-bold uppercase
  tracking-caps text-black/50 hover:text-black hover:border-black/40`.
- Bottom `pt-8 flex flex-col md:flex-row justify-between items-center gap-8`: copyright `text-black/40 text-eyebrow
  font-black uppercase tracking-widest`.
- The reference's "Work" link 404s. Ours points to `/projects`.

**Content slots**: `footer.heading/headingAccent/email/columns[]/builtWithLabel/builtWith[]/copyright`.

---

## 4. Secondary pages

All secondary pages share the fixed nav (with the same scroll fade), the custom cursor and the footer.

### 4.1 About (`/about`)
- Page `bg-white text-black selection:bg-black selection:text-white`.
- **Hero** `relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center px-6 pt-20`, centered `max-w-[900px]`:
  eyebrow (accent), h1 `text-5xl md:text-8xl lg:text-[10rem] font-medium tracking-tighter leading-[0.85]` over 2 lines
  (line 2 `italic font-light text-gray-400`), intro `mt-8 text-[18px] md:text-[20px] text-gray-500 max-w-xl
  leading-relaxed`. Staggered fade-up.
- **Body** `max-w-[1100px] mx-auto px-6 pb-32` → `grid grid-cols-1 lg:grid-cols-12 gap-16 items-start`:
  - Left (4 cols, `lg:sticky lg:top-32`, enters `x -20 → 0`): portrait `aspect-[4/5] rounded-2xl bg-gray-100
    shadow-2xl shadow-black/5` that is `grayscale`, going to color on hover (700ms). Then a "Connect" block: eyebrow
    plus a hairline, and link cards `flex justify-between p-4 rounded-xl bg-gray-50 hover:bg-white border
    border-transparent hover:border-gray-100` (icon, label, arrow).
  - Right (8 cols, `space-y-24`): story sections that fade up in view, each with an h2 `text-3xl md:text-5xl
    font-medium tracking-tight leading-[1.1]` and paragraphs `text-[18px] md:text-[20px] leading-relaxed text-gray-700
    space-y-6`. One section is highlighted in a card `bg-gray-50 p-10 md:p-16 rounded-5xl`. The closing block is
    3 stacked lines `text-5xl md:text-7xl font-medium tracking-tighter` in `gray-200 → gray-300 → black`.
- **Content slots**: `pages.about.*` (eyebrow, title lines, intro, portrait, connect links[], sections[], closingLines[3]).

### 4.2 Projects (`/projects`)
- Page bg `bg-gray-100`.
- **Sticky intro** (`sticky top-0 z-0 pt-[50px] md:pt-[100px]`), centered `max-w-[900px]`: h2 `text-5xl md:text-8xl
  lg:text-[10rem] font-medium tracking-tighter leading-[0.85]` and a paragraph `text-[18px] md:text-[20px] mt-7
  leading-relaxed text-gray-700`. The project bands scroll **over** it (`relative z-[9]`).
- **Project bands**: full-bleed blocks with `py-[100px]`, each in its own band color (see 1.2), and `container m-auto p-5`:
  - `flex flex-col lg:flex-row lg:justify-between`.
  - Left `max-w-[750px]`: kicker `text-[18px]` (70% alpha), title `text-4xl lg:text-[52px] font-medium leading-[1.2]`,
    copy `mt-5 text-[18px]`. Optional **install snippet**: a terminal mock with 3 lines (command in warning-yellow, a
    progress line, a success line in green) at `max-w-[400px]`. Meta row `mt-14 flex gap-4 md:gap-11 flex-wrap` with
    Project (linked), Role and Date, each a label `text-[18px]` (muted) over a value `text-[20px]`. Optional ArrowLink
    to the case study and an optional "Install now" pill `btn-sm rounded-full bg-deep-teal text-white`.
  - Right: tech pills stacked vertically on `lg` (`items-end`, `lg:mt-5`), wrapping horizontally on mobile:
    `text-[18px] border rounded-full px-5 py-2`, colored to the band.
  - Some bands include a screenshot (`max-w-[900px] m-auto`, `rounded-lg`, `mt-[50px] md:mt-[100px]`) sitting on a
    split background (top half band color, bottom half the next band's color).
- **Closing**: the Collaborations section (3.11) is reused at the end (`relative z-[99] bg-white`).
- **Content slots**: `pages.projects.title/intro`, `projectBands[]` (`kicker, title, summary, band colors, meta[],
  tags[], snippet?, screenshot?, caseStudy?, installUrl?`).

### 4.3 Case study (`/projects/[slug]`)
On the reference these live at top-level slugs. Ours nests them under `/projects/[slug]`.
- Page `bg-white text-black`.
- **Hero** `pt-48 pb-20 px-6`, `max-w-[1100px]`: eyebrow `"Case Study • Category"`, h1 `text-5xl md:text-8xl
  lg:text-[10rem] font-medium tracking-tighter leading-[0.85] mb-12` over 2 lines (line 2 italic light gray-400).
  Subtitle h2 `text-2xl md:text-4xl font-medium tracking-tight text-black/80 mb-8`, copy `text-[14px] md:text-[16px]
  text-gray-500`, and chips `px-6 py-4 rounded-xl border border-black/10 bg-black/5 font-medium text-black/60`.
- **Cover** `aspect-[16/9] md:aspect-[21/9] rounded-5xl overflow-hidden border border-black/5 shadow-2xl`, with a
  `from-black/20` gradient.
- **Facts strip** `py-12 border-y border-black/5 bg-gray-50/50` → `grid grid-cols-2 md:grid-cols-4 gap-8`, each a label
  `text-eyebrow font-black uppercase tracking-widest text-gray-400` over a value `text-sm font-medium`.
- **Body** `max-w-[1100px] py-32 space-y-32`:
  - "The Why." block: `grid lg:grid-cols-12`. A sticky h2 (4 cols, `top-32`, last word italic gray-400). Prose
    (8 cols) where the first paragraph has a drop cap (`first-letter:text-7xl font-bold float-left mr-3`), and a pull
    quote `p-8 bg-gray-50 rounded-3xl border-l-4 border-accent italic text-black/60`.
  - "Core Concept." block: heading plus intro, then feature cards `grid md:grid-cols-2 lg:grid-cols-3 gap-8`, each card
    `p-8 bg-gray-50 rounded-4xl border border-black/5 hover:border-accent/20` with a 48px black icon tile, an h4 and
    copy.
  - "Structure." block: a black panel `p-10 md:p-20 rounded-5xl` holding a vertical pipeline of steps (`rounded-2xl
    border bg-white/5 border-white/10 px-6 py-4`) joined by `w-px h-6 bg-white/20`. The final step is
    `bg-accent text-black` with a teal glow.
  - "The Difference." block: a sticky h2 plus a numbered list (`text-4xl font-light text-gray-200`, hover accent), each
    with an h3 `text-2xl font-bold` and copy.
- **Content slots**: `caseStudies[]` (`slug, category, titleLines[2], subtitle, intro, chips[], cover, facts[], why{},
  concept{features[]}, structure{steps[]}, differences[]`).

### 4.4 Lab / experiment page (`/lab`, the reference's "AI friend" page)
- Page `bg-gray-100 text-black`, `max-w-[1100px] mx-auto px-6 pt-32 pb-24`.
- Header `space-y-8` (fade-up): eyebrow (accent), h1 `text-5xl md:text-8xl lg:text-[10rem] font-medium tracking-tighter
  leading-[0.85]` over 2 lines (line 2 italic light gray-400), intro `max-w-2xl text-[18px] md:text-[20px] text-gray-700`.
- Full-height image `relative w-full h-screen mt-24 overflow-hidden rounded-5xl shadow-2xl` (fades in).
- Article `mt-24 grid gap-6 text-[18px] text-gray-800`: paragraphs, a question list card (`rounded-xl bg-white border
  border-gray-200 p-5`), and a dark callout (`rounded-xl bg-gray-950 text-white p-6`, title `text-2xl font-medium`,
  lines `text-gray-200`).
- **Content slots**: `pages.lab.*`.

### 4.5 Writing index (`/blog`)
- Page `bg-black pt-[50px] md:pt-[100px]`, centered `max-w-[1000px]`. Title `text-4xl lg:text-5xl font-medium`. Then
  the **same post rows as 3.9**, in the dark theme. *(The reference renders black text on black here; we use the dark
  variant correctly.)*
- **Content slots**: `pages.blog.title`, `posts[]`.

### 4.6 Post (`/blog/[slug]`)
- Page `bg-gray-100 text-black py-[50px] md:py-[100px]`. Title `max-w-[1000px] text-4xl lg:text-6xl font-medium
  leading-[1.2] md:leading-[1.4] text-center`. Cover `mt-[50px] md:mt-[100px] mb-14`. Prose `max-w-[900px] text-left
  text-[20px] text-gray-600` (p, ul/ol, strong).
- **Content slots**: `posts[].title/cover/body` (body is an array of typed blocks: paragraph, heading, list).

### 4.7 Learn (`/learn`, coming soon)
- `bg-white pt-[50px] md:pt-[100px]`, `max-w-[900px] text-left`. Three staggered h2 lines (`text-4xl lg:text-5xl
  font-medium`, the middle one `md:ml-14`), then a paragraph `text-[20px] mt-10` ending in a colored "Coming soon!"
  badge. Bottom padding `pb-[180px]`.
- **Content slots**: `pages.learn.*`.

---

## 5. Placeholder assets (`/public/placeholders`)

Generated SVGs (`scripts/generate-placeholders.mjs`). Each one shows its file name and size so it's obvious what to
replace.

| File | Size | Ratio | Used by |
|---|---|---|---|
| `avatar.svg` | 160×160 | 1:1 | nav logo, hero greeting |
| `hero.svg` | 2100×900 | 21:9 | hero image |
| `dev-work-01…06.svg` | 1200×800 | 3:2 | Dev Works cards (`object-contain`) |
| `3d-work-01…04.svg` | 900×1200 | 3:4 | 3D card faces (`object-cover`) |
| `about-portrait.svg` | 800×1000 | 4:5 | About |
| `lab-cover.svg` | 1600×900 | 16:9 | Lab page image |
| `case-study-cover-01…02.svg` | 2100×900 | 21:9 | case-study covers |
| `project-shot-01…03.svg` | 1800×1100 | ~16:10 | Projects page screenshots |
| `post-cover-01…04.svg` | 1600×900 | 16:9 | blog posts |
| `og.png` | 1200×630 | 1.91:1 | social share card (PNG, rendered from SVG with sharp) |
| `favicon.svg`, `favicon-32.png` | 64×64, 32×32 | 1:1 | browser tab icon + PNG fallback |
| `apple-touch-icon.png` | 180×180 | 1:1 | iOS home-screen icon |

Implementation notes:
- `next/image` refuses SVGs by default. Placeholder `<Image>`s pass `unoptimized` while the source ends in `.svg`.
  Real photos (JPG/PNG/WebP) go through the optimizer as normal.
- Social platforms don't accept SVG Open Graph images, so the generator renders `og.png` (and the PNG icons)
  from SVG with sharp.

---

## 6. Decisions and deliberate deviations

Defaults applied during the build (2026-10-30). Each can be revisited.

1. **Hero overlay title**: invisible on the reference (opacity stuck at 0). Ours fades in over the full-width image
   (scroll 450–950px).
2. **Timeline arrows**: invisible and non-functional on the reference. Ours are `white/10` buttons that scroll to the
   previous or next milestone.
3. **Custom cursor on touch**: shown on the reference. Ours hides it on coarse pointers.
4. **3D card height on desktop**: kept at 380px to match the reference's broken class.
5. **Footer "Work" link**: 404 on the reference. Ours points to `/projects`.
6. **Serif face**: kept the system `ui-serif` stack, as on the reference.
7. **Scroll snap**: CSS snap is left off because it conflicts with Lenis.
8. **3D Works counter**: the reference changes the index slightly out of sync with the card flips. Ours changes it on
   each half-turn, while the card is edge-on.
9. **Insights hover**: the reference's inline colors block the title hover color. Ours drives colors through CSS
   variables, so the accent hover works.
10. **/blog**: the reference renders black text on black. Ours uses the readable dark row theme.
11. **Firewall game**: keyboard users can Tab to the target and press Enter, which is the intended "hack". Esc quits.
12. **Reduced motion**: autonomous motion is disabled (marquees, spins, pings, particles, cursor springs, hub
    animations, 3D rotation, Lenis). Scroll-linked tracks still follow the user's own scrolling.
13. **Unknown slugs** under `/projects/[slug]` and `/blog/[slug]` show the 404 UI with a 200 status. `dynamicParams`
    isn't available with Cache Components, and params are read inside `<Suspense>` for instant navigation.
14. **Placeholder copy** was sized to wrap like the reference's copy, so section heights match.

---

## 7. Build checklist

Foundations
- [x] Project setup (Next.js, TS, Tailwind, Framer Motion, Lenis)
- [x] Design spec
- [x] Design tokens (Tailwind theme + CSS variables)
- [x] Content model (`src/content/site.ts`)
- [x] Placeholder images
- [x] Layout shell (Lenis provider, section anchors)

Global
- [x] Navigation (desktop + mobile dropdown, scroll fade)
- [x] Custom cursor
- [x] Shared components (ArrowLink, SmartLink, SiteImage, icons, media-query hooks)
- [x] Footer

Home sections
- [x] Hero
- [x] My Works (word marquee)
- [x] AI Firewall Challenge widget
- [x] Versatility (industries hub)
- [x] Selected Dev Works
- [x] Selected 3D Works
- [x] Tech Stack
- [x] Story / Timeline
- [x] Latest Insights
- [x] Partnership
- [x] Collaborations

Secondary pages
- [x] About (`/about`)
- [x] Projects (`/projects`)
- [x] Case study (`/projects/[slug]`)
- [x] Lab (`/lab`)
- [x] Writing index (`/blog`)
- [x] Post (`/blog/[slug]`)
- [x] Learn (`/learn`)

Polish
- [x] Reduced-motion fallbacks
- [x] Responsive QA at 375 / 768 / 1024 / 1440
- [x] Metadata, OG image, favicon, sitemap, robots, 404
- [x] Lighthouse pass: 90+ on every category, mobile and desktop (see README)
