import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { site, type ProjectBand } from "@/content/site";
import { Collaborations } from "@/components/sections/collaborations";
import { ArrowLink } from "@/components/ui/arrow-link";
import { SiteImage } from "@/components/ui/site-image";
import { SmartLink } from "@/components/ui/smart-link";

const { projects } = site.pages;

export const metadata: Metadata = pageMetadata({
  title: projects.metaTitle,
  description: projects.intro,
  path: "/projects",
});

const TONE = {
  dark: { kicker: "text-white/70", title: "text-white", summary: "text-white/80", label: "text-white/70", value: "text-white", pill: "border-white/80 text-white" },
  light: { kicker: "text-gray-700", title: "text-black", summary: "text-gray-600", label: "text-gray-600", value: "text-gray-800", pill: "border-gray-500 text-gray-700" },
} as const;

/** Projects page: sticky intro with full-bleed project bands scrolling over it (SPEC.md §4.2). */
export default function ProjectsPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none bg-gray-100">
      <div className="sticky top-0 z-0 w-full bg-gray-100 pt-[50px] text-black md:pt-[100px]">
        <div className="container m-auto max-w-[900px] p-5 text-center">
          <h1 className="pt-3 text-5xl font-medium leading-[0.85] tracking-tighter md:text-8xl md:leading-none lg:text-[10rem]">
            {projects.title}
          </h1>
          <p className="mt-7 text-[18px] font-normal leading-relaxed text-gray-700 md:text-[20px]">{projects.intro}</p>
        </div>
      </div>

      <div className="relative z-[9] pt-0 md:pt-[100px]">
        {projects.bands.map((band) => (
          <Band key={band.title} band={band} />
        ))}
      </div>

      <div className="relative z-[99] bg-white pt-[80px] md:pt-[150px]">
        <Collaborations id="projects-collaborations" />
      </div>
    </main>
  );
}

function Band({ band }: { band: ProjectBand }) {
  const tone = TONE[band.theme.tone];
  const linkTone = band.theme.linkTone ?? band.theme.tone;

  return (
    <section aria-labelledby={`band-${slug(band.title)}`} className="relative w-full" style={{ backgroundColor: band.theme.background }}>
      <div className="py-[100px]">
        <div className="container m-auto px-5">
          <div className="flex flex-col lg:flex-row lg:justify-between">
            <div className="max-w-[750px]">
              <p className={`text-[18px] ${tone.kicker}`}>{band.kicker}</p>
              <h2
                id={`band-${slug(band.title)}`}
                className={`text-left text-4xl font-medium leading-[1.2] lg:text-[52px] ${tone.title}`}
              >
                {band.title}
              </h2>
              <p className={`mt-5 text-[18px] ${tone.summary}`}>{band.summary}</p>

              {band.snippet && <Terminal lines={band.snippet} />}

              <dl className="mt-14 flex flex-wrap gap-4 md:gap-11">
                {band.meta.map((item) => (
                  <div key={item.label}>
                    <dt className={`text-[18px] ${tone.label}`}>{item.label}</dt>
                    <dd className={`pt-1 text-[20px] ${tone.value}`}>
                      {item.href ? (
                        <SmartLink href={item.href} className="underline underline-offset-4">
                          {item.value}
                        </SmartLink>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              {(band.caseStudy || band.install) && (
                <div className="mt-8 flex flex-col items-start gap-4">
                  {band.caseStudy && (
                    <ArrowLink link={{ label: projects.caseStudyLabel, href: band.caseStudy }} tone={linkTone} />
                  )}
                  {band.install && (
                    <SmartLink
                      href={band.install.href}
                      external={band.install.external}
                      className="flex items-center gap-2 rounded-full bg-deep-teal px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      {band.install.label}
                    </SmartLink>
                  )}
                </div>
              )}
            </div>

            <ul className="mt-10 flex flex-row flex-wrap items-start gap-4 lg:mt-0 lg:flex-col lg:flex-nowrap lg:items-end lg:gap-0">
              {band.tags.map((tag, i) => (
                <li
                  key={tag}
                  className={`rounded-full border bg-transparent px-5 py-2 text-[18px] ${tone.pill} ${i > 0 ? "lg:mt-5" : ""}`}
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {band.screenshot && (
        <div
          style={{
            background: band.screenshotBackdrop
              ? `linear-gradient(to bottom, ${band.screenshotBackdrop[0]} 50%, ${band.screenshotBackdrop[1]} 50%)`
              : undefined,
          }}
        >
          <div className="m-auto max-w-[900px] p-5 pb-10">
            <SiteImage
              src={band.screenshot.src}
              alt={band.screenshot.alt}
              width={band.screenshot.width}
              height={band.screenshot.height}
              sizes="(min-width: 900px) 860px, 100vw"
              className="h-auto w-full rounded-lg object-cover"
            />
          </div>
        </div>
      )}
    </section>
  );
}

/** Terminal mock for install snippets: command, progress and success lines. */
function Terminal({ lines }: { lines: [string, string, string] }) {
  const [command, progress, done] = lines;
  return (
    <div className="mt-14 max-w-[400px]">
      <div className="overflow-x-auto rounded-2xl bg-[#2a323c] py-5 font-mono text-sm text-[#a6adbb]">
        <div aria-hidden className="mb-4 flex gap-2 px-5">
          <span className="h-3 w-3 rounded-full bg-current opacity-30" />
          <span className="h-3 w-3 rounded-full bg-current opacity-30" />
          <span className="h-3 w-3 rounded-full bg-current opacity-30" />
        </div>
        <pre className="px-5 text-[#fbbd23]">
          <span aria-hidden className="mr-3 opacity-50">$</span>
          <code>{command}</code>
        </pre>
        <pre className="px-5">
          <span aria-hidden className="mr-3 opacity-50">&gt;</span>
          <code>{progress}</code>
        </pre>
        <pre className="px-5 text-[#36d399]">
          <span aria-hidden className="mr-3 opacity-50">&gt;</span>
          <code>{done}</code>
        </pre>
      </div>
    </div>
  );
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
