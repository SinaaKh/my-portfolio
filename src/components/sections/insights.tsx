"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionStyle, type MotionValue } from "framer-motion";
import { site } from "@/content/site";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PostRow } from "@/components/ui/post-row";
import { SmartLink } from "@/components/ui/smart-link";

const { insights, posts } = site;

/** Scroll progress window over which the section flips from black to white (measured). */
const FLIP: [number, number] = [0.3, 0.5];

function useFlip(progress: MotionValue<number>, alpha: number) {
  return useTransform(progress, FLIP, [`rgba(255, 255, 255, ${alpha})`, `rgba(0, 0, 0, ${alpha})`]);
}

/** Latest Insights: post list whose theme flips black → white with scroll (SPEC.md §3.9). */
export function Insights() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const background = useTransform(scrollYProgress, FLIP, ["#000000", "#ffffff"]);
  const fg = useFlip(scrollYProgress, 1);
  const fg40 = useFlip(scrollYProgress, 0.4);
  const fg30 = useFlip(scrollYProgress, 0.3);
  const fg20 = useFlip(scrollYProgress, 0.2);
  const fg10 = useFlip(scrollYProgress, 0.1);
  const fg5 = useFlip(scrollYProgress, 0.05);

  return (
    <motion.section
      ref={ref}
      id="insights"
      aria-labelledby="insights-title"
      // Framer animates CSS custom properties; MotionStyle just doesn't type them.
      style={
        {
          backgroundColor: background,
          "--row-fg": fg,
          "--row-fg-40": fg40,
          "--row-fg-30": fg30,
          "--row-fg-20": fg20,
          "--row-fg-10": fg10,
          "--row-fg-5": fg5,
        } as MotionStyle
      }
      className="relative w-full overflow-hidden py-32"
    >
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 text-white opacity-[0.02]" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-24 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-6 text-eyebrow font-black uppercase tracking-eyebrow text-accent">{insights.eyebrow}</p>
            <h2
              id="insights-title"
              className="text-5xl font-medium leading-[0.9] tracking-tighter text-(--row-fg) md:text-8xl md:leading-none"
            >
              {insights.title} <span className="font-light italic text-(--row-fg-30)">{insights.titleAccent}</span>
              {insights.titleSuffix}
            </h2>
          </div>
          <SmartLink
            href={insights.browseAll.href}
            external={insights.browseAll.external}
            className="group mb-4 flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-(--row-fg) transition-colors duration-300 hover:text-accent"
          >
            <span>{insights.browseAll.label}</span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-(--row-fg-10) transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          </SmartLink>
        </div>

        <ol className="flex flex-col">
          {posts.slice(0, insights.limit).map((post, i) => (
            <PostRow key={post.slug} post={post} index={i} readMoreLabel={insights.readMoreLabel} />
          ))}
        </ol>
      </div>
    </motion.section>
  );
}
