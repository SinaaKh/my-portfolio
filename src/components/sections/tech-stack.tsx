"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { site, type TechCategory, type TechItem } from "@/content/site";
import { SiteImage } from "@/components/ui/site-image";

const { techStack } = site;

const grid: Variants = {
  show: { transition: { staggerChildren: 0.05 } },
  exit: { transition: { staggerChildren: 0.02 } },
};

const tile: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 10, scale: 0.9, transition: { duration: 0.2 } },
};

const itemsFor = (id: TechCategory["id"]) =>
  id === "all" ? techStack.items : techStack.items.filter((item) => item.category === id);

/** Tech Stack: filter tabs with a sliding indicator and an animated grid (SPEC.md §3.7). */
export function TechStack() {
  const [active, setActive] = useState<TechCategory["id"]>(techStack.defaultCategory);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelId = useId();

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (event.key in keys) next = (index + keys[event.key] + techStack.categories.length) % techStack.categories.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = techStack.categories.length - 1;
    if (next === null) return;
    event.preventDefault();
    setActive(techStack.categories[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      id="tech-stack"
      aria-labelledby="tech-stack-title"
      className="relative -mt-[600px] min-h-screen w-full overflow-hidden bg-surface py-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--color-accent)_3%,transparent),transparent_70%)]" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-24 flex flex-col">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center gap-3"
          >
            <div aria-hidden className="h-px w-10 bg-accent" />
            <span className="text-eyebrow font-black uppercase tracking-eyebrow text-accent">{techStack.eyebrow}</span>
          </motion.div>
          <motion.h2
            id="tech-stack-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl font-medium leading-[0.85] tracking-tighter text-white md:text-9xl md:leading-none"
          >
            {techStack.title} <span className="font-light italic text-white/20">{techStack.titleAccent}</span>
            <br />
            {techStack.titleEnd}
          </motion.h2>
        </div>

        <div className="flex flex-col items-start gap-16 lg:flex-row lg:gap-24">
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label={techStack.eyebrow}
            className="scrollbar-hide flex w-full gap-2 overflow-x-auto pb-4 lg:w-64 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {techStack.categories.map((category, i) => {
              const selected = category.id === active;
              return (
                <motion.button
                  key={category.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(category.id)}
                  onKeyDown={(event) => onTabKeyDown(event, i)}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`group relative flex items-center gap-6 whitespace-nowrap rounded-2xl px-8 py-6 text-eyebrow font-black uppercase tracking-label transition-all duration-500 ${
                    selected ? "bg-white/5 text-white" : "text-white/40 hover:text-white/60"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="tech-stack-indicator"
                      aria-hidden
                      className="absolute left-0 h-8 w-1 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{category.label}</span>
                </motion.button>
              );
            })}
          </div>

          <div id={panelId} role="tabpanel" className="w-full flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={active}
                variants={grid}
                initial="hidden"
                animate="show"
                exit="exit"
                className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 xl:grid-cols-4"
              >
                {itemsFor(active).map((item) => (
                  <motion.li key={item.name} variants={tile} className="group relative">
                    <TechTile item={item} />
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechTile({ item }: { item: TechItem }) {
  return (
    <div className="relative flex h-48 flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center transition-all duration-500 group-hover:border-white/20 group-hover:bg-white/[0.05]">
      <div className="relative z-10 mb-6">
        <div
          aria-hidden
          style={{ color: item.color }}
          className="text-4xl grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 md:text-5xl"
        >
          {item.icon ? (
            <SiteImage src={item.icon} alt="" width={48} height={48} className="h-[1em] w-[1em]" />
          ) : (
            <Monogram name={item.name} />
          )}
        </div>
      </div>
      <h3 className="text-eyebrow font-bold uppercase tracking-caps text-white/40 transition-colors group-hover:text-white">
        {item.name}
      </h3>
      <div
        aria-hidden
        style={{ backgroundColor: item.color }}
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-10"
      />
    </div>
  );
}

/** Placeholder icon: initials in a rounded square, drawn in the item's brand color. */
function Monogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <svg viewBox="0 0 24 24" className="h-[1em] w-[1em]">
      <rect x="1.5" y="1.5" width="21" height="21" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="12" y="12.5" textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="800" fill="currentColor">
        {initials}
      </text>
    </svg>
  );
}
