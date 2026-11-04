"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Post } from "@/content/site";
import { ArrowRightIcon } from "./icons";

/**
 * One writing row (SPEC.md §3.9). Colors come from the --row-* CSS variables set by the
 * parent, so the same row works on the theme-flipping home section and the dark /blog page.
 */
export function PostRow({
  post,
  index,
  readMoreLabel,
  headingLevel = 3,
}: {
  post: Post;
  index: number;
  readMoreLabel: string;
  /** h3 under a section heading (home), h2 directly under the page h1 (/blog). */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative border-b border-(--row-fg-5) py-12 last:border-0 short:py-6"
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-col justify-between gap-8 md:flex-row md:items-center short:flex-row short:items-center short:gap-6">
        <div className="flex-1 transition-all duration-500">
          <div className="mb-4 flex items-center gap-4">
            <span className="text-eyebrow font-black tracking-widest text-(--row-fg-20)">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div aria-hidden className="h-px w-8 bg-(--row-fg-5)" />
            <span className="text-eyebrow font-black uppercase tracking-label text-accent">{post.category}</span>
          </div>
          <Heading className="text-4xl font-medium leading-[0.9] tracking-tighter text-(--row-fg) transition-colors duration-500 group-hover:text-accent md:text-5xl md:leading-none short:text-3xl short:leading-[1.05]">
            {post.title}
          </Heading>
        </div>
        <div className="hidden opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100 md:block md:w-1/3 short:hidden">
          <p className="max-w-xs text-sm font-medium leading-relaxed text-(--row-fg-40)">{post.excerpt}</p>
        </div>
        <div className="flex items-center gap-6 transition-all duration-500 group-hover:translate-x-4">
          <span className="text-eyebrow font-black uppercase tracking-caps text-(--row-fg-20) group-hover:text-(--row-fg)">
            {readMoreLabel}
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-(--row-fg-10) text-(--row-fg-20) transition-all duration-500">
            <ArrowRightIcon className="h-5 w-5" />
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

/** Static --row-* values for dark pages. */
export const darkRowTheme = {
  "--row-fg": "#ffffff",
  "--row-fg-40": "rgb(255 255 255 / 0.4)",
  "--row-fg-20": "rgb(255 255 255 / 0.2)",
  "--row-fg-10": "rgb(255 255 255 / 0.1)",
  "--row-fg-5": "rgb(255 255 255 / 0.05)",
} as React.CSSProperties;
