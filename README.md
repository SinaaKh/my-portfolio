# Sina Khodadadi: Portfolio

Personal portfolio of Sina Khodadadi, AI Software Engineer, built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**,
**Framer Motion** and **Lenis** smooth scrolling.

To change the site you normally only need to:

1. edit **`src/content/site.ts`**, and
2. replace or regenerate the files in **`public/images/`**.

The sections below also cover changing the accent color and fonts, and deploying.

The design system (tokens, every section's layout and motion) is documented in [`SPEC.md`](./SPEC.md).

---

## Contents

- [Run it locally](#run-it-locally)
- [Project structure](#project-structure)
- [Editing `site.ts`](#editing-sitets)
- [Swapping images](#swapping-images)
- [SEO, social cards and icons](#seo-social-cards-and-icons)
- [Changing the accent color](#changing-the-accent-color)
- [Changing the fonts](#changing-the-fonts)
- [Motion and accessibility](#motion-and-accessibility)
- [Deploying to Vercel](#deploying-to-vercel)
- [Quality checks](#quality-checks)

---

## Run it locally

Requirements: **Node.js 20.9 or newer** (the repo pins 22.20.0 in `.nvmrc`) and npm.

```bash
nvm use            # optional, picks up .nvmrc
npm install
npm run dev        # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (prerenders every page) |
| `npm run start` | Serves the production build on port 3000 |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check (also catches mistakes in `site.ts`) |

Run `npx tsc --noEmit` after editing `site.ts`. The content is fully typed, so a missing or misspelled field shows up
as an error with its exact location.

## Project structure

```
src/
  content/
    site.ts          ← all text, links, image paths, projects, posts, clients…
    types.ts         ← the shape of site.ts (with comments on every field)
  app/               ← routes: / /about /projects /projects/[slug] /lab /blog /blog/[slug] /learn
                       plus sitemap.ts, robots.ts, not-found.tsx, layout.tsx, globals.css
  components/
    sections/        ← one component per home section (+ footer)
    layout/          ← nav, custom cursor
    ui/              ← shared pieces (links, images, post rows, reveal animation)
  lib/               ← small helpers (metadata, media queries, seeded randomness)
public/images/       ← every image the site uses
scripts/generate-art.mjs ← regenerates the generated artwork
```

## Editing `site.ts`

`src/content/site.ts` exports one object, `site`. Each top-level key maps to a part of the site. Types and inline
comments live in `src/content/types.ts`.

General rules:

- **Links**: `{ label, href }`. Internal links start with `/` (`"/projects"`). Anything starting with `http(s)://`
  opens in a new tab automatically. You can also force it with `external: true`.
- **Images**: use the `img(file, width, height, alt)` helper. `file` is a name inside `public/images/`, and
  `width`/`height` should match the image's real pixel size (they set the aspect ratio). Always write a meaningful
  `alt`.
- **Lists can grow or shrink**: projects, posts, timeline entries, tech items, clients and so on. Exceptions are
  noted below.
- Very long titles still work, but they can change section heights.

### `meta`: site identity and SEO

| Field | Used for |
| --- | --- |
| `name`, `shortName`, `role` | Name in titles and the footer; `shortName` is the nav wordmark |
| `title`, `titleTemplate` | Default `<title>`, and the pattern for page titles (`%s` = page name) |
| `description`, `keywords` | Meta description and keywords |
| `url` | **Your production URL** (no trailing slash). Used for canonical links, Open Graph, `sitemap.xml` and `robots.txt` |
| `locale` | Open Graph locale, and also sets `<html lang>` (`"en_US"` → `en`) |
| `twitterHandle` | Optional, e.g. `"@you"` |
| `email` | Footer mailto link |
| `avatar` | Round photo in the nav and hero |
| `ogImage` | Social share card (1200×630 PNG or JPG) |
| `icons` | Favicon (SVG), 32×32 PNG fallback, 180×180 Apple touch icon |

### `nav`

`links` (center menu), `cta` (the black pill, usually a scheduling link), plus accessibility labels (`menuLabel`,
`homeLabel`, `skipLabel`, `landmarkLabel`).

### `sections`

Accessible names for the home sections that have no visible heading of their own (hero, my works) and for
landmarks. Keep the ids, because the components look their label up by id. Rename the labels freely.

### Home page, top to bottom

| Key | Section | Notes |
| --- | --- | --- |
| `hero` | Greeting, headline, link, rotating badge, image, "My Works" overlay | `headline` animates word by word. Keep `badgeText` to about 40 characters so it fits the ring |
| `myWorks` | Two rows of drifting words behind the mini game | 6–10 short words per row |
| `gamePicker` | Accessible name of the desktop game picker | Option labels are the two game titles |
| `snakeGame` | Context Window Snake, the only mini game on touch devices, and the second option with a mouse | Labels, meters and `endings` (one per way a run can end); `{score}` and `{best}` are replaced |
| `escapeGame` | The Model Escapes, the default mini game with a mouse or trackpad | `durationSeconds`, `catchesToWin`, fake `citations` and `result` messages; `{time}`, `{caught}` and `{total}` are replaced |
| `versatility` | Title, description, link, hub words, **industries** and pillars | The hub has **6 node positions**. Give an industry an `href` to make it a link with a pulsing dot |
| `devWorks` | Horizontal-scroll project cards (6 fits the scroll distance) | `meta` is the small accent line ("01 / Category / Role"). Add `caseStudy` to show the "Read Case Study" link |
| `threeDWorks` | Scroll-flipped research card | Any number of `items`; each half-turn reveals the next |
| `techStack` | Filter tabs and tech tiles | `categories` drive the tabs, `defaultCategory` is selected first. Items in category `"tools"` only appear under "All". `color` tints the icon on hover; add `icon: "/images/your-logo.svg"` for a real logo (otherwise initials are drawn) |
| `timeline` | Horizontal story | Any number of `entries` (`title`, `period`, `tag`, `description`) |
| `insights` | "Latest writing" list | Shows the first `limit` posts from `posts` |
| `posts` | Blog posts (home list, `/blog`, `/blog/[slug]`) | `body` is a list of blocks: `paragraph`, `heading`, `list` (`ordered?`), `quote`. `date` is ISO (`"2026-01-15"`) |
| `partnership` | "Who I work with" | `antiList` (struck-through), `audiences`, and the black `cta` card |
| `collaborations` | Two-row client marquee | `rows` is exactly two lists of names |
| `footer` | Closing heading, link columns, "built with" pills, copyright | `heading` + `headingAccent` + `headingSuffix` form one sentence |

### `pages`: secondary pages

| Key | Route | Notes |
| --- | --- | --- |
| `about` | `/about` | `titleLines` (2), portrait, `connectLinks` (`icon` is a short text badge like `"in"`), story `sections` (set `highlight: true` for the grey card), 3 `closingLines` |
| `projects` | `/projects` | `bands` are the full-width colored blocks: `theme.background` (any CSS color), `theme.tone` (`"dark"` = light text, `"light"` = dark text), `meta` rows, `tags`, and optional `snippet` (3 terminal lines), `screenshot`, `screenshotBackdrop`, `caseStudy`, `install` |
| `lab` | `/lab` | `body` blocks: `paragraph`, `heading`, `list`, `quote`, `card-list`, `callout` |
| `blog` | `/blog` | Page title only; the list comes from `posts` |
| `learn` | `/learn` | Three heading lines, message and badge |
| `notFound` | 404 page | Shown for any unknown URL |

### `caseStudies` (`/projects/[slug]`)

One entry per case study. The `slug` becomes the URL, so link to it with `caseStudy: "/projects/<slug>"` from
`devWorks` or `pages.projects.bands`. Each entry has a hero (`titleLines`, `subtitle`, `intro`, `chips`, `cover`),
`facts`, and four blocks: `why`, `concept` (feature cards), `structure` (pipeline steps; the last is highlighted) and
`differences`. Pages are generated at build time from this list.

> Adding a brand-new route (for example `/uses`) is the one thing that needs code: create `src/app/uses/page.tsx`
> and add the path to `src/app/sitemap.ts`.

## Swapping images

All images live in `public/images/`. There are two ways to replace one:

- **Same name**: overwrite the file (keep the format, e.g. replace `hero.svg` with your own `hero.svg`). Nothing
  else to change.
- **Different name or format** (most real photos are JPG, PNG or WebP): put the file in `public/images/`
  (or anywhere in `public/`) and update its `img(...)` call in `site.ts`, with the new file name and its real
  `width`/`height`.

Raster images are optimized automatically by `next/image` (resized per screen and served as WebP). SVGs are served as-is. To use images
hosted elsewhere (a CDN, Cloudinary…), add the host to `images.remotePatterns` in `next.config.ts`.

| File | Size | Used by |
| --- | --- | --- |
| `avatar.jpg` | 320×320 (1:1) | Photo: nav logo, hero greeting |
| `hero.svg` | 2100×900 (21:9) | Hero image (animated) |
| `dev-work-01…05.svg`, `dev-work-06.png` | 1200×800 (3:2) | Project cards (shown whole, `object-contain`; the SVGs are animated) |
| `research-01…04.svg` | 900×1200 (3:4) | Research card faces (cropped to fill, keep the subject in the middle) |
| `about-portrait.jpg` | 800×1000 (4:5) | Photo: About page |
| `lab-cover.svg` | 1600×900 (16:9) | Lab page |
| `case-study-cover-01…06.svg` | 2100×900 (21:9) | Case study covers |
| `project-shot-01.svg` (1800×1100), `project-shot-02.png` (1800×650), `project-shot-03.png` (1800×850) | | Projects page visuals; the two PNGs are real product captures |
| `post-cover-01…04.svg` | 1600×900 (16:9) | Blog post covers |
| `og.png` | 1200×630 | Social share card |
| `favicon.svg`, `favicon-32.png` | 64×64, 32×32 | Browser tab icon |
| `apple-touch-icon.png` | 180×180 | iOS home screen icon |

The generated art can be rebuilt with `node scripts/generate-art.mjs`. That overwrites every generated file (not the
two photos or the two PNG captures), so if you replace one with your own image, use a new file name.

## SEO, social cards and icons

- Set **`site.meta.url`** to your real domain before deploying. Canonical URLs, `og:url`, the sitemap and robots all
  use it.
- `/sitemap.xml` lists every page, case study and post automatically. `/robots.txt` allows everything and points to
  the sitemap.
- Each page gets its own title, description, canonical URL, Open Graph and Twitter card (`src/lib/metadata.ts`). The
  social image is `site.meta.ogImage`. Use a PNG or JPG, because social platforms ignore SVG.
- Icons come from `site.meta.icons`. Replace the three files above (keep the PNG sizes).
- Unknown URLs show a styled 404 page (copy in `pages.notFound`) that is excluded from search engines.

## Changing the accent color

Colors are design tokens in `src/app/globals.css`, inside the `@theme static { … }` block:

```css
--color-accent: #00bfa5;   /* the teal: links, eyebrows, buttons, glows, cursor */
--color-violet: #7c4dff;   /* hero glow and particles */
--color-indigo: #6366f1;   /* industries hub lines, core and glow */
--color-indigo-deep: #4f46e5;
--color-deep-teal: #09757a; /* link accent on light project bands */
```

Change a value and everything using it updates, including utilities like `text-accent`, `bg-accent/20`, shadows and
glows (they are mixed from the same variable). Per-item colors live in `site.ts`: industry node underlines
(`versatility.industries[].color`), tech brand tints (`techStack.items[].color`) and project band backgrounds
(`pages.projects.bands[].theme.background`).

## Changing the fonts

The sans-serif font is **Poppins** (weights 300–800), loaded with `next/font` in `src/app/layout.tsx`. To switch to
another Google font:

```tsx
// src/app/layout.tsx
import { Inter } from "next/font/google";

const sans = Inter({
  variable: "--font-poppins", // keep this name, or rename it here and in globals.css
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});
// …and use sans.variable on <html> instead of poppins.variable
```

The serif (italic accents) and mono fonts use the system stacks from Tailwind. To use a webfont instead, load it the
same way (e.g. `Instrument_Serif` with `variable: "--font-display-serif"`) and point the token at it in
`globals.css`:

```css
@theme inline {
  --font-serif: var(--font-display-serif), ui-serif, Georgia, serif;
}
```

## Motion and accessibility

- Smooth scrolling is Lenis (`src/components/smooth-scroll.tsx`). In-page `#anchor` links scroll smoothly.
- With **reduce motion** enabled in the OS, the site turns off Lenis, marquees, spins, particles, the cursor spring,
  hub animations and the 3D rotation. Scroll-driven tracks still follow the user's own scrolling.
- Keyboard: skip link, visible focus rings, an accessible tablist in Tech Stack, prev/next buttons on the timeline,
  Esc to quit the mini game. Snake steers with arrow keys or WASD; in The Model Escapes, keyboard users can Tab to the target and press Enter.
- The design deliberately uses faded text (white/20, black/30), which Lighthouse flags as low contrast
  (Accessibility 95–97). To raise it, increase those opacities in the section components, e.g. `text-white/20` →
  `text-white/60`.

## Deploying to Vercel

The project needs no environment variables, and every page is prerendered.

**From the dashboard**

1. Push the repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository. The framework (Next.js) and build settings are
   detected automatically.
3. Deploy. Every push to the default branch then deploys to production, and other branches get preview URLs.
4. Under **Settings → Domains**, add your domain, then set `site.meta.url` to it and push again.

**From the CLI**

```bash
npm i -g vercel
vercel          # first run links the folder to a Vercel project and creates a preview deploy
vercel --prod   # production deploy
```

## Quality checks

Before deploying, all three must pass:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Lighthouse on the production build (`npm run build && npm run start`):

| Page | Performance (mobile / desktop, where measured) | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | 92 / 100 | 97 | 100 | 100 |
| `/about` | 93 | 96 | 100 | 100 |
| `/projects` | 95 | 96 | 100 | 100 |
