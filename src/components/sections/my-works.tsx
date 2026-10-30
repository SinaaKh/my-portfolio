"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { sectionLabel } from "@/lib/content";
import { site } from "@/content/site";
import { GameHost } from "@/components/games/game-host";

const { myWorks } = site;

/** Outlined word rows drifting with scroll, with the mini game in front (SPEC.md §3.2). */
export function MyWorks() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rowAX = useTransform(scrollYProgress, [0, 1], [300, -300]);
  const rowBX = useTransform(scrollYProgress, [0, 1], [-300, 300]);

  return (
    <div className="md:-mt-[430px]">
      <section
        ref={ref}
        id="my-works"
        aria-label={sectionLabel("my-works")}
        className="relative flex h-screen w-full items-center justify-center overflow-clip bg-black"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 flex select-none flex-col justify-center gap-12 lg:gap-20"
        >
          <motion.div style={{ x: rowAX }} className="flex gap-12 whitespace-nowrap">
            {myWorks.rowA.map((word) => (
              <span
                key={word}
                className="outline-text text-[5vw] font-black uppercase italic tracking-tighter lg:text-[7vw]"
              >
                {word}
              </span>
            ))}
          </motion.div>
          <motion.div style={{ x: rowBX }} className="-ml-[30%] flex gap-12 whitespace-nowrap">
            {myWorks.rowB.map((word) => (
              <span key={word} className="text-[5vw] font-black uppercase tracking-tighter text-white/10 lg:text-[7vw]">
                {word}
              </span>
            ))}
          </motion.div>
        </div>

        <GameHost />
      </section>
    </div>
  );
}
