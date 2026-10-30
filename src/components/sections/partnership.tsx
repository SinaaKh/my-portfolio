"use client";

import { motion } from "framer-motion";
import { site } from "@/content/site";
import { SmartLink } from "@/components/ui/smart-link";

const { partnership } = site;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Partnership: who I work with (SPEC.md §3.10). */
export function Partnership() {
  const { cta } = partnership;

  return (
    <section
      id="partnership"
      aria-labelledby="partnership-title"
      className="relative overflow-hidden bg-white py-24 lg:py-32"
    >
      <div aria-hidden className="pointer-events-none absolute right-[-5%] top-10 select-none opacity-[0.015]">
        <p className="text-[18vw] font-black uppercase leading-none tracking-tighter text-black">{partnership.watermark}</p>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <span className="mb-6 block text-eyebrow font-black uppercase tracking-eyebrow text-accent">
                {partnership.eyebrow}
              </span>
              <h2
                id="partnership-title"
                className="mb-12 text-5xl font-light leading-[0.95] tracking-tighter text-black lg:text-7xl lg:leading-none"
              >
                {partnership.title}
                <br />
                <span className="font-serif italic text-black/80">{partnership.titleAccent}</span>
              </h2>
              <p className="mb-12 max-w-lg text-lg font-light leading-relaxed tracking-tight text-black/50 lg:text-xl lg:leading-7">
                {partnership.description}
              </p>
              <ul className="space-y-6 border-t border-black/5 pt-10">
                {partnership.antiList.map((item) => (
                  <li key={item} className="group flex items-center gap-4">
                    <div
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full bg-accent/20 transition-colors duration-500 group-hover:bg-accent"
                    />
                    <span className="font-serif text-sm italic text-black/30 line-through decoration-black/10 transition-colors duration-700 group-hover:text-black/60">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="flex flex-col justify-between lg:col-span-6">
            <ol className="mb-16 grid grid-cols-1 gap-12 lg:mb-0">
              {partnership.audiences.map((audience, i) => (
                <motion.li
                  key={audience.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
                  className="group flex items-start gap-8 border-b border-black/5 pb-8 last:border-0"
                >
                  <span className="pt-1 text-eyebrow font-black uppercase tracking-widest text-black/10 transition-colors duration-500 group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-black/30 transition-colors duration-500 group-hover:text-black">
                      {audience.label}
                    </h3>
                    <p className="text-xl font-light leading-snug tracking-tight text-black/70 transition-colors duration-500 group-hover:text-black">
                      {audience.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="group relative mt-12 cursor-pointer overflow-hidden rounded-3xl bg-black p-8 lg:p-12"
            >
              <div
                aria-hidden
                className="absolute right-0 top-0 h-32 w-32 rounded-full bg-accent/10 blur-3xl transition-colors duration-700 group-hover:bg-accent/20"
              />
              <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div>
                  <h3 className="mb-2 text-3xl font-light tracking-tighter text-white lg:text-4xl">
                    {cta.title} <span className="font-serif italic text-accent">{cta.titleAccent}</span>
                  </h3>
                  <p className="text-sm font-light text-white/40">{cta.description}</p>
                </div>
                {/* Stretched link: the whole card is clickable. */}
                <SmartLink
                  href={cta.link.href}
                  external={cta.link.external}
                  className="text-xs font-black uppercase tracking-label text-white after:absolute after:inset-0 after:content-['']"
                >
                  <span className="flex items-center gap-4">
                    {cta.link.label}
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white transition-all duration-500 group-hover:bg-accent">
                      <span aria-hidden className="text-xl text-black transition-transform duration-500 group-hover:scale-125">
                        →
                      </span>
                    </span>
                  </span>
                </SmartLink>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
