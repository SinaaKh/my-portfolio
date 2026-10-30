/**
 * Types for every piece of site content. The data itself lives in `site.ts`.
 * Section numbers refer to SPEC.md.
 */

export type Href = string;

export interface Link {
  label: string;
  href: Href;
  /** Opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** Heading made of a plain part and an accented (italic) part. */
export interface SectionHeading {
  eyebrow: string;
  title: string;
  titleAccent: string;
}

/* Site-wide */

export interface SiteMeta {
  name: string;
  /** Short wordmark shown in the nav. */
  shortName: string;
  role: string;
  /** Default <title>. */
  title: string;
  /** Used with `%s` for page titles, e.g. "%s · Your Name". */
  titleTemplate: string;
  description: string;
  url: string;
  locale: string;
  email: string;
  avatar: ImageAsset;
  ogImage: ImageAsset;
}

export interface NavContent {
  links: Link[];
  cta: Link;
  menuLabel: string;
  homeLabel: string;
  skipLabel: string;
  /** Accessible name of the primary navigation landmark. */
  landmarkLabel: string;
}

export interface HomeSectionAnchor {
  id: string;
  label: string;
}

/* Home sections */

export interface HeroContent {
  greeting: string;
  /** Rendered word by word. */
  headline: string;
  link: Link;
  /** Text that runs around the rotating circular badge. */
  badgeText: string;
  badgeLink: Link;
  image: ImageAsset;
  overlayTitle: string;
}

export interface MyWorksContent {
  rowA: string[];
  rowB: string[];
}

export interface FirewallGameContent {
  title: string;
  subtitle: string;
  note: string;
  startLabel: string;
  scoreLabel: string;
  timeLabel: string;
  /** Unit appended to the countdown value, e.g. "s". */
  timeUnit: string;
  durationSeconds: number;
  /** Two-letter label inside the evasive target. */
  targetLabel: string;
  hints: string[];
  missMessages: string[];
  touchBlockedMessage: string;
  result: {
    lostTitle: string;
    wonTitle: string;
    /** `{score}` is replaced with the final score. */
    lostMessage: string;
    wonMessage: string;
    retryLabel: string;
  };
}

export interface Industry {
  icon: string;
  label: string;
  /** Bottom-border accent color of the node tile. */
  color: string;
  /** Optional link. Linked nodes get a pulsing dot and an accent hover border. */
  href?: Href;
}

export interface Pillar {
  icon: string;
  title: string;
  description: string;
}

export interface VersatilityContent extends SectionHeading {
  description: string;
  link: Link;
  /** Words that cycle inside the hub core. */
  hubWords: string[];
  industries: Industry[];
  pillars: Pillar[];
}

export interface DevProject {
  slug: string;
  /** e.g. "01 / Category / Role" */
  meta: string;
  title: string;
  tags: string[];
  summary: string;
  image: ImageAsset;
  /** Link to the case study, when there is one. */
  caseStudy?: Href;
}

export interface DevWorksContent extends SectionHeading {
  caseStudyLabel: string;
  projects: DevProject[];
}

export interface ThreeDWork {
  title: string;
  subtitle: string;
  image: ImageAsset;
}

export interface ThreeDWorksContent extends SectionHeading {
  items: ThreeDWork[];
}

export type TechCategoryId =
  | "frontend"
  | "backend"
  | "ai"
  | "mobile"
  | "cloud"
  | "database"
  /** Only listed under "All". */
  | "tools";

export interface TechCategory {
  id: TechCategoryId | "all";
  label: string;
}

export interface TechItem {
  name: string;
  category: TechCategoryId;
  /** Brand color used for the icon and hover glow. */
  color: string;
  /** Optional path to an icon; a monogram is rendered otherwise. */
  icon?: string;
}

export interface TechStackContent extends SectionHeading {
  /** Second line of the heading, after the accent word. */
  titleEnd: string;
  categories: TechCategory[];
  defaultCategory: TechCategory["id"];
  items: TechItem[];
}

export interface TimelineEntry {
  title: string;
  period: string;
  tag: string;
  description: string;
}

export interface TimelineContent extends SectionHeading {
  watermark: string;
  subtitle: string;
  entries: TimelineEntry[];
  scrollCue: string;
  endCue: string;
  exploreHint: string;
  prevLabel: string;
  nextLabel: string;
}

export type PostBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "quote"; text: string };

export interface Post {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  /** ISO date, e.g. "2026-01-15". */
  date: string;
  cover: ImageAsset;
  body: PostBlock[];
}

export interface InsightsContent extends SectionHeading {
  /** Trailing punctuation after the accent word. */
  titleSuffix: string;
  browseAll: Link;
  readMoreLabel: string;
  /** How many posts the home page shows. */
  limit: number;
}

export interface Audience {
  label: string;
  description: string;
}

export interface PartnershipContent extends SectionHeading {
  watermark: string;
  description: string;
  antiList: string[];
  audiences: Audience[];
  cta: {
    title: string;
    titleAccent: string;
    description: string;
    link: Link;
  };
}

export interface CollaborationsContent extends SectionHeading {
  rows: [string[], string[]];
  footnote: string;
}

export interface FooterColumn {
  title: string;
  links: Link[];
}

export interface FooterContent {
  /** Accessible name of the footer navigation landmark. */
  navLabel: string;
  heading: string;
  headingAccent: string;
  headingSuffix: string;
  columns: FooterColumn[];
  builtWithLabel: string;
  builtWith: string[];
  copyright: string;
}

/* Secondary pages */

export interface ConnectLink extends Link {
  /** Short glyph or emoji shown in the card. */
  icon: string;
}

export interface AboutPageContent {
  metaTitle: string;
  eyebrow: string;
  titleLines: [string, string];
  intro: string;
  portrait: ImageAsset;
  connectLabel: string;
  connectLinks: ConnectLink[];
  sections: { title: string; paragraphs: string[]; highlight?: boolean }[];
  closingLines: [string, string, string];
}

export interface ProjectBandMeta {
  label: string;
  value: string;
  href?: Href;
}

export interface ProjectBand {
  kicker: string;
  title: string;
  summary: string;
  theme: {
    /** Band background color. */
    background: string;
    /** Text and pill color scheme. */
    tone: "light" | "dark";
    /** Case-study link style; defaults to the tone. Use "accent" on accent-colored bands. */
    linkTone?: "light" | "dark" | "accent";
  };
  meta: ProjectBandMeta[];
  tags: string[];
  /** Terminal mock lines: command, progress, success. */
  snippet?: [string, string, string];
  screenshot?: ImageAsset;
  /** Split backdrop behind the screenshot: [top, bottom]. */
  screenshotBackdrop?: [string, string];
  caseStudy?: Href;
  install?: Link;
}

export interface ProjectsPageContent {
  metaTitle: string;
  title: string;
  intro: string;
  caseStudyLabel: string;
  bands: ProjectBand[];
}

export interface CaseStudy {
  slug: string;
  metaTitle: string;
  category: string;
  titleLines: [string, string];
  subtitle: string;
  intro: string;
  chips: string[];
  cover: ImageAsset;
  facts: { label: string; value: string }[];
  why: { title: string; titleAccent: string; paragraphs: string[]; quote: string };
  concept: {
    title: string;
    titleAccent: string;
    intro: string;
    features: { icon: string; title: string; description: string }[];
  };
  structure: { title: string; titleAccent: string; intro: string; steps: string[] };
  differences: {
    title: string;
    titleAccent: string;
    items: { title: string; description: string }[];
  };
}

export type LabBlock =
  | PostBlock
  | { type: "card-list"; items: string[] }
  | { type: "callout"; title: string; lines: string[] };

export interface LabPageContent {
  metaTitle: string;
  eyebrow: string;
  titleLines: [string, string];
  intro: string;
  image: ImageAsset;
  body: LabBlock[];
}

export interface BlogPageContent {
  metaTitle: string;
  title: string;
}

export interface LearnPageContent {
  metaTitle: string;
  lines: [string, string, string];
  message: string;
  badge: string;
}

/* Root */

export interface SiteContent {
  meta: SiteMeta;
  nav: NavContent;
  sections: HomeSectionAnchor[];
  hero: HeroContent;
  myWorks: MyWorksContent;
  firewall: FirewallGameContent;
  versatility: VersatilityContent;
  devWorks: DevWorksContent;
  threeDWorks: ThreeDWorksContent;
  techStack: TechStackContent;
  timeline: TimelineContent;
  insights: InsightsContent;
  posts: Post[];
  partnership: PartnershipContent;
  collaborations: CollaborationsContent;
  footer: FooterContent;
  pages: {
    about: AboutPageContent;
    projects: ProjectsPageContent;
    lab: LabPageContent;
    blog: BlogPageContent;
    learn: LearnPageContent;
  };
  caseStudies: CaseStudy[];
}
