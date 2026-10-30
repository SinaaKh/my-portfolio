# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js version warning

`AGENTS.md` is authoritative here: this is Next.js 16 with Cache Components, and its APIs differ from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code, and heed deprecation notices.

## Commands

```bash
npm run dev          # dev server on :3000 (also defined as "portfolio-dev" in .claude/launch.json)
npm run build        # production build; prerenders every page
npm run start        # serve the production build
npm run lint         # ESLint (next core-web-vitals + typescript)
npx tsc --noEmit     # type check; this is what validates edits to src/content/site.ts
node scripts/generate-art.mjs   # regenerates the artwork in public/images/ (not the photos or the two PNG product captures)
```

There is no test suite. Before deploying, `npm run lint`, `npx tsc --noEmit` and `npm run build` must all pass. Node 22.20.0 is pinned in `.nvmrc`; 20.9+ works.

## Architecture

A one-page portfolio plus secondary pages (Next.js App Router, TypeScript, Tailwind v4, Framer Motion, Lenis) for Sina Khodadadi, AI Software Engineer. Site copy is public: keep clients anonymous where it already is, and don't add internal figures from private projects. Never publish real model error values (WAPE, PR-AUC and the like), in text or encoded in generated images.

**`src/content/site.ts` is the single source of truth for content.** It exports one typed object, `site` (`SiteContent` from `src/content/types.ts`). Every visible string, link, image path, post, case study and tech item comes from it, and the types file documents each field. Components import `site` directly (usually `const { x } = site;` at module level); there is no props plumbing or CMS. Because the data is typed, `tsc` is the validation step for content edits. Don't hard-code copy in components. Add a field to `types.ts` and `site.ts` instead.

How content reaches the pages:
- **Home (`src/app/page.tsx`)** renders `src/components/sections/*` in order. The footer (`#contact`) comes from the root layout. Sections are mostly `"use client"` components driven by Framer Motion scroll transforms, not server components.
- **Routes:** `/about`, `/projects`, `/lab`, `/blog`, `/learn`, `not-found`. Dynamic routes `/projects/[slug]` and `/blog/[slug]` are generated from `site.caseStudies` and `site.posts` via `generateStaticParams`.
- **A new route needs code, not just content:** create `src/app/<name>/page.tsx` and add the path to `src/app/sitemap.ts` (the static page list is hard-coded there).
- **Section labels** are looked up by id with `sectionLabel()` in `src/lib/content.ts`, so keep the ids in `site.sections`. `htmlLang` there derives `<html lang>` from `meta.locale`.
- **Per-page metadata** goes through `pageMetadata()` in `src/lib/metadata.ts`, which builds the canonical URL, Open Graph and Twitter card. Next replaces rather than merges a parent's `openGraph`, so each page must call it. `site.meta.url` feeds canonicals, sitemap and robots.
- **Links** use `SmartLink` (`src/components/ui/smart-link.tsx`): `next/link` for internal routes, a plain anchor with `target="_blank"` for `http(s)://`, and plain anchors for `mailto:` and `tel:`. **Images** use `SiteImage` with the `img(file, w, h, alt)` helper from `site.ts`; `width`/`height` must match the real pixel size.

**Cache Components** is on (`cacheComponents` and `partialPrefetching` in `next.config.ts`). On dynamic routes, `params` is read inside `<Suspense>` (e.g. `params.then(...)` in `projects/[slug]/page.tsx`) to keep the route shell instant. `dynamicParams` isn't available, so unknown slugs render the 404 UI with a 200 status (SPEC.md §6.13). Follow the same pattern for new dynamic routes.

**Styling:** Tailwind v4 is wired through `@tailwindcss/turbopack` in `next.config.ts` (not PostCSS). Design tokens (colors, type sizes, tracking, shadows, animations) live only in the `@theme static` block of `src/app/globals.css` and become both utilities and CSS variables. Change colors there, not as inline hex values in components. Per-item colors (industry underlines, tech tints, project band backgrounds) live in `site.ts`.

**Motion:** `Providers` wraps the app in Framer Motion's `MotionConfig reducedMotion="user"` plus Lenis (`smooth-scroll.tsx`). Autonomous motion (marquees, spins, particles, cursor springs, Lenis) must be disabled under prefers-reduced-motion. Scroll-linked tracks still follow the user's own scrolling. The custom cursor is hidden on coarse pointers.

**Activity:** with Cache Components, Next hides routes in a React `<Activity>` instead of unmounting them, so effects clean up on navigation but `useState` survives and the DOM stays. Anything transient (open overlays, running games) must reset in a `useLayoutEffect` cleanup (`node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`).

**Mini game test (branch `mini-game-test` only):** `?game=snake|escape|rogue` picks a game in `src/components/games/`; no parameter shows `sections/firewall-game.tsx`. To remove a game, delete its folder, its line in `game-host.tsx`, and its `site.ts` key and `types.ts` interface. The switcher is `game-switcher.tsx` plus one line in `game-host.tsx`.

## Docs

- `README.md`: field-by-field guide to `site.ts`, the image table (required sizes and aspect ratios), accent color and font swaps, SEO and deployment.
- `SPEC.md`: the design system and per-section layout and motion measurements, written when this was still a placeholder template, so its content examples and §5 asset list are dated. §6 lists deliberate deviations from the reference site. Consult it before changing a section's behavior.

Conventions (`.editorconfig`): 2-space indent, LF, final newline. Path alias `@/*` → `src/*`.
