import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/content/site";
import { Reveal } from "@/components/ui/reveal";
import { SiteImage } from "@/components/ui/site-image";
import { SmartLink } from "@/components/ui/smart-link";

const { about } = site.pages;

export const metadata: Metadata = pageMetadata({
  title: about.metaTitle,
  description: about.intro,
  path: "/about",
});

/** About page (SPEC.md §4.1). */
export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none w-full bg-white text-black selection:bg-black selection:text-white">
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 pt-20 md:min-h-[80vh]">
        <div className="z-10 max-w-[900px] text-center">
          <Reveal as="p" y={0} className="mb-8 text-eyebrow font-black uppercase tracking-eyebrow text-accent">
            {about.eyebrow}
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-5xl font-medium leading-[0.85] tracking-tighter md:text-8xl md:leading-none lg:text-[10rem]">
              {about.titleLines[0]}
              <br />
              <span className="font-light italic text-gray-400">{about.titleLines[1]}</span>
            </h1>
          </Reveal>
          <Reveal
            as="p"
            y={0}
            delay={0.2}
            className="mx-auto mt-8 max-w-xl text-[18px] leading-relaxed text-gray-500 md:text-[20px]"
          >
            {about.intro}
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-6 pb-32">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
          <Reveal x={-20} y={0} className="lg:sticky lg:top-32 lg:col-span-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-2xl shadow-black/5">
              <SiteImage
                src={about.portrait.src}
                alt={about.portrait.alt}
                fill
                sizes="(min-width: 1024px) 308px, 100vw"
                className="object-cover grayscale transition-all duration-700 hover:grayscale-0"
              />
            </div>
            <div className="mt-10">
              <div className="mb-6 flex items-center gap-2">
                <h2 className="text-eyebrow font-black uppercase tracking-eyebrow text-accent">{about.connectLabel}</h2>
                <div aria-hidden className="h-px flex-1 bg-gray-100" />
              </div>
              <ul className="grid grid-cols-1 gap-3">
                {about.connectLinks.map((link) => (
                  <li key={link.href}>
                    <SmartLink
                      href={link.href}
                      external={link.external}
                      className="group flex items-center justify-between rounded-xl border border-transparent bg-gray-50 p-4 transition-all duration-300 hover:border-gray-100 hover:bg-white"
                    >
                      <span className="flex items-center gap-4">
                        <span
                          aria-hidden
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xs font-black uppercase text-black shadow-sm transition-transform duration-300 group-hover:scale-110"
                        >
                          {link.icon}
                        </span>
                        <span className="font-medium text-gray-900">{link.label}</span>
                      </span>
                      <svg
                        aria-hidden
                        className="h-5 w-5 text-gray-300 transition-colors group-hover:text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="space-y-24 lg:col-span-8">
            {about.sections.map((section) => (
              <Reveal
                key={section.title}
                as="section"
                className={`space-y-8 ${section.highlight ? "rounded-5xl bg-gray-50 p-10 md:p-16" : ""}`}
              >
                <h2 className="text-3xl font-medium leading-[1.1] tracking-tight md:text-5xl md:leading-none">
                  {section.title}
                </h2>
                <div className="space-y-6 text-[18px] font-normal leading-relaxed text-gray-700 md:text-[20px]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            ))}

            <Reveal as="section" className="pt-12">
              <div className="space-y-4 text-5xl font-medium tracking-tighter md:text-7xl">
                <p className="text-gray-200">{about.closingLines[0]}</p>
                <p className="text-gray-300">{about.closingLines[1]}</p>
                <p className="text-black">{about.closingLines[2]}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
