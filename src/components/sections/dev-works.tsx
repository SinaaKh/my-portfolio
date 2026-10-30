"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { site, type DevProject } from "@/content/site";
import { ArrowLink } from "@/components/ui/arrow-link";
import { SiteImage } from "@/components/ui/site-image";

const { devWorks } = site;

/** The track reaches the last card at this much scroll progress, then holds it for the rest. */
const TRACK_END = 0.9;

/** Selected Dev Works: vertical scroll drives a horizontal card track (SPEC.md §3.5). */
export function DevWorks() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // How far the track must travel for the last card to land in view, measured, since it
  // depends on the card count and the viewport.
  const distance = useMotionValue(0);
  const travel = useTransform(scrollYProgress, [0, TRACK_END], [0, 1]);
  const x = useTransform([travel, distance], ([t, d]: number[]) => -t * d);

  useEffect(() => {
    const track = trackRef.current;
    const frame = track?.parentElement;
    if (!track || !frame) return;
    const measure = () => distance.set(Math.max(0, track.offsetWidth - frame.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [distance]);

  return (
    <section ref={ref} id="dev-works" aria-labelledby="dev-works-title" className="relative h-[600vh] bg-black">
      {/* The header sits in the flow, not over the track, so cards can't run into it on short screens. */}
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="flex w-full items-end justify-between px-6 pt-4 md:px-12">
          <div>
            <span className="mb-2 block text-eyebrow font-black uppercase tracking-ultra text-white/20">
              {devWorks.eyebrow}
            </span>
            <h2 id="dev-works-title" className="text-2xl font-light tracking-tight text-white/90">
              {devWorks.title} <span className="font-serif italic">{devWorks.titleAccent}</span>
            </h2>
          </div>
        </div>

        <motion.ul
          ref={trackRef}
          style={{ x }}
          className="flex min-h-0 w-max flex-1 items-center gap-16 py-8 pl-[10vw] pr-6 md:gap-24 md:pr-[10vw]"
        >
          {devWorks.projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: DevProject }) {
  return (
    <li className="group relative flex h-full max-h-[550px] w-[350px] shrink-0 flex-col justify-between md:max-h-[650px] md:w-[600px]">
      <div className="relative z-20 mb-8">
        <div className="mb-4 flex items-center gap-4">
          <span className="text-eyebrow font-black uppercase tracking-label text-accent">{project.meta}</span>
          <div aria-hidden className="h-px flex-1 bg-white/10" />
        </div>
        <h3 className="mb-6 text-4xl font-medium leading-[1.1] tracking-tight text-white md:text-6xl md:leading-none">
          {project.title}
        </h3>
        <ul className="mb-8 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/10 px-3 py-1 text-tag font-bold uppercase tracking-widest text-white/40"
            >
              {tag}
            </li>
          ))}
        </ul>
        {project.caseStudy && (
          <ArrowLink link={{ label: devWorks.caseStudyLabel, href: project.caseStudy }} />
        )}
      </div>

      <div className="relative min-h-40 w-full flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl transition-all duration-500 group-hover:border-white/20">
        <SiteImage
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes="(min-width: 768px) 600px, 350px"
          className="object-contain object-center transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-8 opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100">
          <p className="max-w-md translate-y-4 text-sm leading-relaxed text-white/80 transition-transform duration-500 group-focus-within:translate-y-0 group-hover:translate-y-0 md:text-base md:leading-6">
            {project.summary}
          </p>
        </div>
      </div>
    </li>
  );
}
