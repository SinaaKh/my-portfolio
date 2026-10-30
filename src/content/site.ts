/**
 * All site content. Every visible string, link, image path, project, tech item,
 * timeline entry, post and client name comes from this file.
 *
 * Everything here is a placeholder. Replace it with your own content.
 * Types live in `./types.ts`.
 */
import type { ImageAsset, SiteContent } from "./types";

export type * from "./types";

const img = (file: string, width: number, height: number, alt: string): ImageAsset => ({
  src: `/placeholders/${file}`,
  width,
  height,
  alt,
});

const SCHEDULE_URL = "https://example.com/schedule";

export const site: SiteContent = {
  meta: {
    name: "Your Name",
    shortName: "YOU",
    role: "Your Role",
    title: "Your Name · Your Role",
    titleTemplate: "%s · Your Name",
    description: "A one-sentence placeholder description of what you do and who you do it for.",
    url: "https://example.com",
    locale: "en_US",
    email: "hello@example.com",
    avatar: img("avatar.svg", 160, 160, "Portrait of Your Name"),
    ogImage: img("og.svg", 1200, 630, "Your Name: portfolio"),
  },

  nav: {
    links: [
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "Lab", href: "/lab" },
    ],
    cta: { label: "Let's Chat", href: SCHEDULE_URL, external: true },
    menuLabel: "Open menu",
    homeLabel: "Home",
    skipLabel: "Skip to content",
    landmarkLabel: "Primary",
  },

  sections: [
    { id: "hero", label: "Introduction" },
    { id: "my-works", label: "My works" },
    { id: "versatility", label: "Versatility" },
    { id: "dev-works", label: "Selected dev works" },
    { id: "three-d-works", label: "Selected 3D works" },
    { id: "tech-stack", label: "Tech stack" },
    { id: "story", label: "Story" },
    { id: "insights", label: "Latest insights" },
    { id: "partnership", label: "Partnership" },
    { id: "collaborations", label: "Collaborations" },
    { id: "contact", label: "Contact" },
  ],

  hero: {
    greeting: "Hi, I am Your Name",
    headline: "A short placeholder headline for the work you do best.",
    link: { label: "Placeholder link to a featured page", href: "/lab" },
    badgeText: "• Placeholder badge text • Goes around the circle ",
    badgeLink: { label: "Schedule a call", href: SCHEDULE_URL, external: true },
    image: img("hero.svg", 2100, 900, "Hero image placeholder"),
    overlayTitle: "My Works",
  },

  myWorks: {
    rowA: ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel"],
    rowB: ["India", "Juliet", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa"],
  },

  firewall: {
    title: "Mini Game Title",
    subtitle: "Placeholder challenge line. Catch it if you can.",
    note: "(Placeholder note: mouse only. Touch input disabled.)",
    startLabel: "Start Game",
    scoreLabel: "Score",
    timeLabel: "Time",
    timeUnit: "s",
    durationSeconds: 30,
    targetLabel: "AB",
    hints: ["Hint message one…", "Hint message two…", "Hint message three…"],
    missMessages: ["Miss message one", "Miss message two"],
    touchBlockedMessage: "Placeholder: touch input is disabled",
    result: {
      lostTitle: "Game Over",
      wonTitle: "You Win",
      lostMessage: "Score: {score} (placeholder verdict)",
      wonMessage: "Score: {score} (placeholder victory line)",
      retryLabel: "Try again?",
    },
  },

  versatility: {
    eyebrow: "Section Eyebrow",
    title: "Placeholder for Every",
    titleAccent: "Accent",
    description:
      "A placeholder paragraph of roughly two lines that explains the range of problems you solve and the kinds of teams you solve them for.",
    link: { label: "Read Case Study", href: "/projects" },
    hubWords: ["Alpha", "Beta", "Gamma", "Delta", "Omega"],
    industries: [
      { icon: "🧩", label: "Industry A", color: "#ff4d4d" },
      { icon: "📦", label: "Industry B", color: "#1db954" },
      { icon: "🛰️", label: "Industry C", color: "#00a3ff" },
      { icon: "📊", label: "Industry D", color: "#ffd700" },
      { icon: "🧪", label: "Industry E", color: "#ff6b00" },
      { icon: "⚙️", label: "Industry F", color: "#7c4dff" },
    ],
    pillars: [
      { icon: "✦", title: "Pillar One", description: "Short placeholder sentence describing this pillar." },
      { icon: "◎", title: "Pillar Two", description: "Short placeholder sentence describing this pillar." },
      { icon: "▲", title: "Pillar Three", description: "Short placeholder sentence describing this pillar." },
    ],
  },

  devWorks: {
    eyebrow: "Portfolio",
    title: "Selected",
    titleAccent: "Dev Works",
    caseStudyLabel: "Read Case Study",
    projects: [
      {
        slug: "project-01",
        meta: "01 / Category / Your Role",
        title: "Project Title 01",
        tags: ["Tag One", "Tag Two", "Tag Three", "Tag Four"],
        summary:
          "Placeholder summary for this project. Two or three sentences about the problem, what you built and the result it delivered.",
        image: img("dev-work-01.svg", 1200, 800, "Project Title 01 preview"),
        caseStudy: "/projects/project-01",
      },
      {
        slug: "project-02",
        meta: "02 / Category / Your Role",
        title: "Project Title 02",
        tags: ["Tag One", "Tag Two", "Tag Three"],
        summary:
          "Placeholder summary for this project. Two or three sentences about the problem, what you built and the result it delivered.",
        image: img("dev-work-02.svg", 1200, 800, "Project Title 02 preview"),
        caseStudy: "/projects/project-02",
      },
      {
        slug: "project-03",
        meta: "03 / Category / Your Role",
        title: "Project Title 03",
        tags: ["Tag One", "Tag Two", "Tag Three", "Tag Four"],
        summary:
          "Placeholder summary for this project. Two or three sentences about the problem, what you built and the result it delivered.",
        image: img("dev-work-03.svg", 1200, 800, "Project Title 03 preview"),
      },
      {
        slug: "project-04",
        meta: "04 / Category / Your Role",
        title: "Project Title 04",
        tags: ["Tag One", "Tag Two", "Tag Three", "Tag Four"],
        summary:
          "Placeholder summary for this project. Two or three sentences about the problem, what you built and the result it delivered.",
        image: img("dev-work-04.svg", 1200, 800, "Project Title 04 preview"),
      },
      {
        slug: "project-05",
        meta: "05 / Category / Your Role",
        title: "Project Title 05",
        tags: ["Tag One", "Tag Two", "Tag Three"],
        summary:
          "Placeholder summary for this project. Two or three sentences about the problem, what you built and the result it delivered.",
        image: img("dev-work-05.svg", 1200, 800, "Project Title 05 preview"),
      },
      {
        slug: "project-06",
        meta: "06 / Category / Your Role",
        title: "Project Title 06",
        tags: ["Tag One", "Tag Two", "Tag Three"],
        summary:
          "Placeholder summary for this project. Two or three sentences about the problem, what you built and the result it delivered.",
        image: img("dev-work-06.svg", 1200, 800, "Project Title 06 preview"),
      },
    ],
  },

  threeDWorks: {
    eyebrow: "Portfolio",
    title: "Selected",
    titleAccent: "3D Works",
    items: [
      { title: "3D Title 01", subtitle: "subtitle one", image: img("3d-work-01.svg", 900, 1200, "3D Title 01 render") },
      { title: "3D Title 02", subtitle: "subtitle two", image: img("3d-work-02.svg", 900, 1200, "3D Title 02 render") },
      { title: "3D Title 03", subtitle: "subtitle three", image: img("3d-work-03.svg", 900, 1200, "3D Title 03 render") },
      { title: "3D Title 04", subtitle: "subtitle four", image: img("3d-work-04.svg", 900, 1200, "3D Title 04 render") },
    ],
  },

  techStack: {
    eyebrow: "Section Eyebrow",
    title: "The",
    titleAccent: "Core",
    titleEnd: "Toolkit.",
    categories: [
      { id: "all", label: "All" },
      { id: "frontend", label: "Frontend" },
      { id: "backend", label: "Backend" },
      { id: "ai", label: "AI" },
      { id: "mobile", label: "Mobile" },
      { id: "cloud", label: "Cloud" },
      { id: "database", label: "Database" },
    ],
    defaultCategory: "frontend",
    items: [
      { name: "Frontend Tool 01", category: "frontend", color: "#ffffff" },
      { name: "Frontend Tool 02", category: "frontend", color: "#61dafb" },
      { name: "Frontend Tool 03", category: "frontend", color: "#3178c6" },
      { name: "Frontend Tool 04", category: "frontend", color: "#06b6d4" },
      { name: "Frontend Tool 05", category: "frontend", color: "#e94cff" },
      { name: "Backend Tool 01", category: "backend", color: "#cc0000" },
      { name: "Backend Tool 02", category: "backend", color: "#5fa04e" },
      { name: "Backend Tool 03", category: "backend", color: "#ffffff" },
      { name: "Backend Tool 04", category: "backend", color: "#3776ab" },
      { name: "Backend Tool 05", category: "backend", color: "#ff2d20" },
      { name: "Backend Tool 06", category: "backend", color: "#e10098" },
      { name: "AI Tool 01", category: "ai", color: "#10a37f" },
      { name: "AI Tool 02", category: "ai", color: "#00bfa5" },
      { name: "AI Tool 03", category: "ai", color: "#7c4dff" },
      { name: "AI Tool 04", category: "ai", color: "#6366f1" },
      { name: "AI Tool 05", category: "ai", color: "#ffd21e" },
      { name: "AI Tool 06", category: "ai", color: "#ff6b00" },
      { name: "Mobile Tool 01", category: "mobile", color: "#02569b" },
      { name: "Mobile Tool 02", category: "mobile", color: "#61dafb" },
      { name: "Mobile Tool 03", category: "mobile", color: "#7f52ff" },
      { name: "Cloud Tool 01", category: "cloud", color: "#ff9900" },
      { name: "Cloud Tool 02", category: "cloud", color: "#4285f4" },
      { name: "Cloud Tool 03", category: "cloud", color: "#2496ed" },
      { name: "Cloud Tool 04", category: "cloud", color: "#326ce5" },
      { name: "Cloud Tool 05", category: "cloud", color: "#ffca28" },
      { name: "Cloud Tool 06", category: "cloud", color: "#ffffff" },
      { name: "Database Tool 01", category: "database", color: "#4169e1" },
      { name: "Database Tool 02", category: "database", color: "#47a248" },
      { name: "Database Tool 03", category: "database", color: "#ff4438" },
      { name: "Tool 01", category: "tools", color: "#f24e1e" },
      { name: "Tool 02", category: "tools", color: "#ff6c37" },
      { name: "Tool 03", category: "tools", color: "#f05032" },
      { name: "Tool 04", category: "tools", color: "#635bff" },
    ],
  },

  timeline: {
    watermark: "The Story",
    eyebrow: "Timeline",
    title: "How I",
    titleAccent: "Got Here",
    subtitle: "A one-line placeholder subtitle for your story.",
    scrollCue: "Scroll",
    endCue: "Fin",
    exploreHint: "Scroll to explore",
    prevLabel: "Previous milestone",
    nextLabel: "Next milestone",
    entries: [
      { title: "Milestone Title 01", period: "Year 01", tag: "Chapter Tag", description: "Placeholder description of this milestone in one or two short sentences." },
      { title: "Milestone Title 02", period: "Year 02", tag: "Chapter Tag", description: "Placeholder description of this milestone in one or two short sentences." },
      { title: "Milestone Title 03", period: "Year 03", tag: "Chapter Tag", description: "Placeholder description of this milestone in one or two short sentences." },
      { title: "Milestone Title 04", period: "Year 04", tag: "Chapter Tag", description: "Placeholder description of this milestone in one or two short sentences." },
      { title: "Milestone Title 05", period: "Year 05", tag: "Chapter Tag", description: "Placeholder description of this milestone in one or two short sentences." },
      { title: "Milestone Title 06", period: "Year 06", tag: "Chapter Tag", description: "Placeholder description of this milestone in one or two short sentences." },
      { title: "Milestone Title 07", period: "Year 07", tag: "Chapter Tag", description: "Placeholder description of this milestone in one or two short sentences." },
      { title: "Milestone Title 08", period: "Year 08", tag: "Chapter Tag", description: "Placeholder description of this milestone in one or two short sentences." },
      { title: "Milestone Title 09", period: "Year 09", tag: "Chapter Tag", description: "Placeholder description of this milestone in one or two short sentences." },
    ],
  },

  insights: {
    eyebrow: "Latest Insights",
    title: "Placeholder title for your",
    titleAccent: "writing",
    titleSuffix: ".",
    browseAll: { label: "Browse all writing", href: "/blog" },
    readMoreLabel: "Read More",
    limit: 4,
  },

  posts: [
    {
      slug: "post-title-01",
      category: "Insight",
      title: "Post Title 01: a placeholder headline long enough to wrap onto a second line",
      excerpt: "Placeholder excerpt. One or two sentences that tease what the post is about.",
      date: "2026-01-15",
      cover: img("post-cover-01.svg", 1600, 900, "Post Title 01 cover"),
      body: [
        { type: "paragraph", text: "Opening paragraph placeholder. Set up the problem and why it matters." },
        { type: "heading", text: "Section Heading" },
        { type: "list", items: ["First point placeholder", "Second point placeholder", "Third point placeholder"] },
        { type: "paragraph", text: "Closing paragraph placeholder with the takeaway." },
      ],
    },
    {
      slug: "post-title-02",
      category: "Insight",
      title: "Post Title 02: a placeholder headline about a technical topic",
      excerpt: "Placeholder excerpt. One or two sentences that tease what the post is about.",
      date: "2026-02-15",
      cover: img("post-cover-02.svg", 1600, 900, "Post Title 02 cover"),
      body: [
        { type: "paragraph", text: "Opening paragraph placeholder. Set up the problem and why it matters." },
        { type: "heading", text: "Section Heading" },
        { type: "list", ordered: true, items: ["Step one placeholder", "Step two placeholder", "Step three placeholder"] },
        { type: "paragraph", text: "Closing paragraph placeholder with the takeaway." },
      ],
    },
    {
      slug: "post-title-03",
      category: "Insight",
      title: "Post Title 03: comparing option A and option B, with trade-offs",
      excerpt: "Placeholder excerpt. One or two sentences that tease what the post is about.",
      date: "2026-03-15",
      cover: img("post-cover-03.svg", 1600, 900, "Post Title 03 cover"),
      body: [
        { type: "paragraph", text: "Opening paragraph placeholder. Set up the problem and why it matters." },
        { type: "quote", text: "A placeholder pull quote." },
        { type: "paragraph", text: "Closing paragraph placeholder with the takeaway." },
      ],
    },
    {
      slug: "post-title-04",
      category: "Insight",
      title: "Post Title 04: a short how-to placeholder headline",
      excerpt: "",
      date: "2026-04-15",
      cover: img("post-cover-04.svg", 1600, 900, "Post Title 04 cover"),
      body: [
        { type: "paragraph", text: "Opening paragraph placeholder. Set up the problem and why it matters." },
        { type: "paragraph", text: "Closing paragraph placeholder with the takeaway." },
      ],
    },
  ],

  partnership: {
    watermark: "Values",
    eyebrow: "Section Eyebrow",
    title: "Your title here",
    titleAccent: "with an accent",
    description:
      "A placeholder paragraph of two or three lines describing the kind of teams you like to work with and how you approach the work.",
    antiList: ["Not placeholder one.", "Not placeholder two.", "Not placeholder three."],
    audiences: [
      { label: "Label One", description: "Placeholder description of an ideal partner" },
      { label: "Label Two", description: "Placeholder description of an ideal partner" },
      { label: "Label Three", description: "Placeholder description of an ideal partner" },
      { label: "Label Four", description: "Placeholder description of an ideal partner" },
      { label: "Label Five", description: "Placeholder description of an ideal partner" },
    ],
    cta: {
      title: "Placeholder call to",
      titleAccent: "action?",
      description: "One short supporting line.",
      link: { label: "Let's talk", href: SCHEDULE_URL, external: true },
    },
  },

  collaborations: {
    eyebrow: "Collaborations",
    title: "Clients",
    titleAccent: "and teams",
    rows: [
      ["Client A", "Client B", "Client C", "Client D", "Client E", "Client F", "Client G", "Client H", "Client I", "Client J", "Client K", "Client L"],
      ["Client M", "Client N", "Client O", "Client P", "Client Q", "Client R", "Client S", "Client T", "Client U", "Client V", "Client W", "Client X"],
    ],
    footnote: "& 00+ other placeholder launches",
  },

  footer: {
    navLabel: "Footer",
    heading: "Your closing call to action goes",
    headingAccent: "here",
    headingSuffix: ".",
    columns: [
      {
        title: "Socials",
        links: [
          { label: "LinkedIn", href: "https://example.com/linkedin", external: true },
          { label: "GitHub", href: "https://example.com/github", external: true },
          { label: "Social Three", href: "https://example.com/social", external: true },
        ],
      },
      {
        title: "Sitemap",
        links: [
          { label: "Work", href: "/projects" },
          { label: "Writing", href: "/blog" },
          { label: "Learn", href: "/learn" },
        ],
      },
    ],
    builtWithLabel: "This portfolio is built with",
    builtWith: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion", "Lenis Smooth Scroll"],
    copyright: "© 2026 Your Name. All rights reserved",
  },

  pages: {
    about: {
      metaTitle: "About",
      eyebrow: "My Story",
      titleLines: ["Placeholder", "Title."],
      intro: "A one or two line placeholder intro for your about page.",
      portrait: img("about-portrait.svg", 800, 1000, "Portrait of Your Name"),
      connectLabel: "Connect",
      connectLinks: [
        { icon: "in", label: "LinkedIn", href: "https://example.com/linkedin", external: true },
        { icon: "gh", label: "GitHub", href: "https://example.com/github", external: true },
      ],
      sections: [
        {
          title: "Chapter Title 01",
          paragraphs: [
            "Placeholder paragraph for the first chapter of your story. Two to four sentences.",
            "A second placeholder paragraph to show spacing between paragraphs.",
          ],
        },
        {
          title: "Chapter Title 02",
          paragraphs: [
            "Placeholder paragraph for the second chapter of your story. Two to four sentences.",
            "A second placeholder paragraph to show spacing between paragraphs.",
          ],
        },
        {
          title: "Chapter Title 03",
          highlight: true,
          paragraphs: [
            "Placeholder paragraph for a highlighted chapter, shown in a card.",
            "A second placeholder paragraph to show spacing between paragraphs.",
          ],
        },
      ],
      closingLines: ["Closing line one.", "Closing line two.", "Closing line three."],
    },

    projects: {
      metaTitle: "Projects",
      title: "Projects",
      intro:
        "A placeholder intro paragraph for the projects page. Explain roughly how many projects you have worked on and what kinds they were: client work, products you built for yourself, open-source libraries and experiments. Then say how this page is organised and what a visitor will find in each band below, from the technologies used to the role you played. Five or six lines of text works best here.",
      caseStudyLabel: "Read Case Study",
      bands: [
        {
          kicker: "Category / Your Role",
          title: "Project Title 01:",
          summary: "Placeholder summary. Two or three sentences about the project, the problem and the result.",
          theme: { background: "#00bfa5", tone: "dark", linkTone: "accent" },
          meta: [
            { label: "Project", value: "Project 01", href: "/projects/project-01" },
            { label: "Role", value: "Your Role" },
            { label: "Date", value: "2026" },
          ],
          tags: ["Tag One", "Tag Two", "Tag Three", "Tag Four"],
          caseStudy: "/projects/project-01",
        },
        {
          kicker: "Open Source Library",
          title: "Library Title 01:",
          summary: "Placeholder summary for an open-source package. One or two sentences.",
          theme: { background: "#030712", tone: "dark" },
          meta: [
            { label: "Package", value: "package-name-01", href: "https://example.com/package-01" },
            { label: "Role", value: "Author" },
          ],
          tags: ["Tag One", "Tag Two", "Tag Three", "Tag Four"],
          snippet: ["npm i package-name-01", "installing...", "Done, ready to use!"],
        },
        {
          kicker: "Open Source Library",
          title: "Library Title 02:",
          summary: "Placeholder summary for an open-source package. One or two sentences.",
          theme: { background: "#0f084e", tone: "dark" },
          meta: [
            { label: "Package", value: "package-name-02", href: "https://example.com/package-02" },
            { label: "Role", value: "Author" },
          ],
          tags: ["Tag One", "Tag Two", "Tag Three", "Tag Four"],
          snippet: ["npm i package-name-02", "installing...", "Done, ready to use!"],
        },
        {
          kicker: "Featured Tooling",
          title: "Project Title 02",
          summary: "Placeholder summary for a developer tool. Two or three sentences.",
          theme: { background: "#ffffff", tone: "light" },
          meta: [
            { label: "Project", value: "Project 02", href: "https://example.com/project-02" },
            { label: "Role", value: "Your Role" },
          ],
          tags: ["Tag One", "Tag Two", "Tag Three"],
          caseStudy: "/projects/project-02",
          install: { label: "Install now", href: "https://example.com/install", external: true },
        },
        {
          kicker: "Personal Project",
          title: "Project Title 03:",
          summary: "Placeholder summary for a personal project. Two or three sentences.",
          theme: { background: "#d2d2ff", tone: "light" },
          meta: [
            { label: "Project", value: "Project 03" },
            { label: "Role", value: "Your Role" },
            { label: "Date", value: "2026" },
          ],
          tags: ["Tag One", "Tag Two", "Tag Three", "Tag Four", "Tag Five", "Tag Six"],
          screenshot: img("project-shot-01.svg", 1800, 1100, "Project Title 03 screenshot"),
          screenshotBackdrop: ["#d2d2ff", "#d7eef0"],
        },
        {
          kicker: "Client Project",
          title: "Project Title 04:",
          summary: "Placeholder summary for a client project. Two or three sentences.",
          theme: { background: "#d7eef0", tone: "light" },
          meta: [
            { label: "Client", value: "Client A" },
            { label: "Role", value: "Your Role" },
            { label: "Date", value: "2026" },
          ],
          tags: ["Tag One", "Tag Two", "Tag Three", "Tag Four", "Tag Five", "Tag Six"],
          screenshot: img("project-shot-02.svg", 1800, 1100, "Project Title 04 screenshot"),
          screenshotBackdrop: ["#d7eef0", "#f3f4f6"],
        },
        {
          kicker: "Client Project",
          title: "Project Title 05:",
          summary: "Placeholder summary for a client project. Two or three sentences.",
          theme: { background: "#f3f4f6", tone: "light" },
          meta: [
            { label: "Client", value: "Client B" },
            { label: "Role", value: "Your Role" },
            { label: "Date", value: "2026" },
          ],
          tags: ["Tag One", "Tag Two"],
          screenshot: img("project-shot-03.svg", 1800, 1100, "Project Title 05 screenshot"),
          screenshotBackdrop: ["#f3f4f6", "#0d1520"],
        },
        {
          kicker: "Client Project",
          title: "Project Title 06:",
          summary: "Placeholder summary for a client project. Two or three sentences.",
          theme: { background: "#ffe5e2", tone: "light" },
          meta: [
            { label: "Client", value: "Client C" },
            { label: "Role", value: "Your Role" },
          ],
          tags: ["Tag One", "Tag Two", "Tag Three"],
        },
        {
          kicker: "Client Project",
          title: "Project Title 07:",
          summary: "Placeholder summary for a client project. Two or three sentences.",
          theme: { background: "#36234d", tone: "dark" },
          meta: [
            { label: "Client", value: "Client D" },
            { label: "Role", value: "Your Role" },
          ],
          tags: ["Tag One", "Tag Two", "Tag Three"],
        },
      ],
    },

    lab: {
      metaTitle: "Lab",
      eyebrow: "Experiment",
      titleLines: ["Lab", "Title."],
      intro: "A placeholder intro for an experiment or side project. One or two sentences.",
      image: img("lab-cover.svg", 1600, 900, "Lab experiment cover"),
      body: [
        { type: "paragraph", text: "Placeholder paragraph introducing the experiment and the problem it explores." },
        { type: "paragraph", text: "A second placeholder paragraph with a question that leads into the list below." },
        { type: "card-list", items: ["Placeholder question one?", "Placeholder question two?", "Placeholder question three?"] },
        { type: "paragraph", text: "Placeholder paragraph explaining how the experiment adapts or works." },
        { type: "callout", title: "Placeholder callout title.", lines: ["Callout line one.", "Callout line two.", "Callout line three."] },
        { type: "paragraph", text: "Closing placeholder paragraph." },
      ],
    },

    blog: {
      metaTitle: "Writing",
      title: "Writings",
    },

    learn: {
      metaTitle: "Learn",
      lines: ["Placeholder line one...", "Placeholder line two?", "Placeholder line three?"],
      message: "A placeholder sentence about upcoming learning content.",
      badge: "Coming soon!",
    },
  },

  caseStudies: [
    {
      slug: "project-01",
      metaTitle: "Project Title 01",
      category: "Case Study • Category",
      titleLines: ["Project", "Title 01."],
      subtitle: "A placeholder one-line subtitle for this case study",
      intro: "Placeholder intro paragraph. Summarise the project in two or three sentences.",
      chips: ["Chip One", "Chip Two", "Chip Three"],
      cover: img("case-study-cover-01.svg", 2100, 900, "Project Title 01 cover"),
      facts: [
        { label: "Role", value: "Your Role" },
        { label: "Timeline", value: "00 weeks" },
        { label: "Team", value: "0 people" },
        { label: "Year", value: "2026" },
      ],
      why: {
        title: "The",
        titleAccent: "Why.",
        paragraphs: [
          "Placeholder paragraph explaining why this project exists. It opens with a drop cap.",
          "A second placeholder paragraph with more context.",
        ],
        quote: "A placeholder pull quote that captures the core idea.",
      },
      concept: {
        title: "Core",
        titleAccent: "Concept.",
        intro: "Placeholder paragraph introducing the core concept.",
        features: [
          { icon: "✦", title: "Feature One", description: "Short placeholder description." },
          { icon: "◎", title: "Feature Two", description: "Short placeholder description." },
          { icon: "▲", title: "Feature Three", description: "Short placeholder description." },
        ],
      },
      structure: {
        title: "Product",
        titleAccent: "Structure.",
        intro: "Placeholder line describing the pipeline below.",
        steps: ["Step One", "Step Two", "Step Three", "Step Four", "Final Step"],
      },
      differences: {
        title: "The",
        titleAccent: "Difference.",
        items: [
          { title: "Difference One", description: "Placeholder description of what sets this apart." },
          { title: "Difference Two", description: "Placeholder description of what sets this apart." },
          { title: "Difference Three", description: "Placeholder description of what sets this apart." },
        ],
      },
    },
    {
      slug: "project-02",
      metaTitle: "Project Title 02",
      category: "Case Study • Category",
      titleLines: ["Project", "Title 02."],
      subtitle: "A placeholder one-line subtitle for this case study",
      intro: "Placeholder intro paragraph. Summarise the project in two or three sentences.",
      chips: ["Chip One", "Chip Two"],
      cover: img("case-study-cover-02.svg", 2100, 900, "Project Title 02 cover"),
      facts: [
        { label: "Role", value: "Your Role" },
        { label: "Timeline", value: "00 weeks" },
        { label: "Team", value: "0 people" },
        { label: "Year", value: "2026" },
      ],
      why: {
        title: "The",
        titleAccent: "Why.",
        paragraphs: ["Placeholder paragraph explaining why this project exists."],
        quote: "A placeholder pull quote that captures the core idea.",
      },
      concept: {
        title: "Core",
        titleAccent: "Concept.",
        intro: "Placeholder paragraph introducing the core concept.",
        features: [
          { icon: "✦", title: "Feature One", description: "Short placeholder description." },
          { icon: "◎", title: "Feature Two", description: "Short placeholder description." },
          { icon: "▲", title: "Feature Three", description: "Short placeholder description." },
        ],
      },
      structure: {
        title: "Product",
        titleAccent: "Structure.",
        intro: "Placeholder line describing the pipeline below.",
        steps: ["Step One", "Step Two", "Step Three", "Final Step"],
      },
      differences: {
        title: "The",
        titleAccent: "Difference.",
        items: [
          { title: "Difference One", description: "Placeholder description of what sets this apart." },
          { title: "Difference Two", description: "Placeholder description of what sets this apart." },
        ],
      },
    },
  ],
};
