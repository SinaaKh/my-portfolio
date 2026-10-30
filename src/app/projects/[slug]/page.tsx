import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site, type CaseStudy } from "@/content/site";
import { Reveal } from "@/components/ui/reveal";
import { SiteImage } from "@/components/ui/site-image";

const findCaseStudy = (slug: string) => site.caseStudies.find((study) => study.slug === slug);

export function generateStaticParams() {
  return site.caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const study = findCaseStudy((await params).slug);
  return study ? { title: study.metaTitle, description: study.intro } : {};
}

/** Case study page (SPEC.md §4.3). */
export default function CaseStudyPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <main id="main" tabIndex={-1} className="outline-none min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* Params are URL data: reading them inside Suspense keeps the route's shell instant. */}
      <Suspense fallback={null}>{params.then(({ slug }) => <CaseStudyContent slug={slug} />)}</Suspense>
    </main>
  );
}

function CaseStudyContent({ slug }: { slug: string }) {
  const study = findCaseStudy(slug);
  if (!study) notFound();

  return (
    <>
      <section className="relative overflow-hidden px-6 pb-20 pt-48">
        <div className="container relative z-10 mx-auto max-w-[1100px]">
          <Reveal className="text-left">
            <p className="mb-8 text-eyebrow font-black uppercase tracking-eyebrow text-accent">{study.category}</p>
            <h1 className="mb-12 text-5xl font-medium leading-[0.85] tracking-tighter text-black md:text-8xl md:leading-none lg:text-[10rem]">
              {study.titleLines[0]}
              <br />
              <span className="font-light italic text-gray-400">{study.titleLines[1]}</span>
            </h1>
            <div className="max-w-3xl">
              <h2 className="mb-8 text-2xl font-medium tracking-tight text-black/80 md:text-4xl">{study.subtitle}</h2>
              <p className="mb-12 text-[14px] leading-relaxed text-gray-500 md:text-[16px]">{study.intro}</p>
              <ul className="flex flex-wrap gap-4">
                {study.chips.map((chip) => (
                  <li
                    key={chip}
                    className="flex items-center gap-2 rounded-xl border border-black/10 bg-black/5 px-6 py-4 font-medium text-black/60"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-20">
        <Reveal y={0} scale={0.95} className="container mx-auto max-w-[1100px]">
          <div className="relative aspect-[16/9] overflow-hidden rounded-5xl border border-black/5 shadow-2xl md:aspect-[21/9]">
            <SiteImage
              src={study.cover.src}
              alt={study.cover.alt}
              fill
              preload
              sizes="(min-width: 1100px) 1052px, 100vw"
              className="h-full w-full object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </Reveal>
      </section>

      <section className="border-y border-black/5 bg-gray-50/50 py-12">
        <dl className="container mx-auto grid max-w-[1100px] grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {study.facts.map((fact) => (
            <div key={fact.label} className="text-left">
              <dt className="mb-2 text-eyebrow font-black uppercase tracking-widest text-gray-400">{fact.label}</dt>
              <dd className="text-sm font-medium text-black">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mx-auto max-w-[1100px] space-y-32 px-6 py-32">
        <Why study={study} />
        <Concept study={study} />
        <Structure study={study} />
        <Differences study={study} />
      </div>
    </>
  );
}

function SplitHeading({ title, accent, sticky = false }: { title: string; accent: string; sticky?: boolean }) {
  return (
    <h2
      className={`text-3xl font-medium leading-[1.1] tracking-tight text-black md:text-5xl md:leading-none ${sticky ? "lg:sticky lg:top-32" : "mb-8"}`}
    >
      {title} <span className="italic text-gray-400">{accent}</span>
    </h2>
  );
}

function Why({ study }: { study: CaseStudy }) {
  const { why } = study;
  return (
    <Reveal as="section" className="grid items-start gap-16 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <SplitHeading title={why.title} accent={why.titleAccent} sticky />
      </div>
      <div className="space-y-8 text-[14px] font-normal leading-relaxed text-gray-700 md:text-[16px] lg:col-span-8">
        {why.paragraphs.map((paragraph, i) => (
          <p
            key={paragraph}
            className={
              i === 0
                ? "first-letter:float-left first-letter:mr-3 first-letter:text-7xl first-letter:font-bold first-letter:text-black"
                : undefined
            }
          >
            {paragraph}
          </p>
        ))}
        <blockquote className="rounded-3xl border-l-4 border-accent bg-gray-50 p-8 italic text-black/60">{why.quote}</blockquote>
      </div>
    </Reveal>
  );
}

function Concept({ study }: { study: CaseStudy }) {
  const { concept } = study;
  return (
    <section className="space-y-16">
      <Reveal className="max-w-3xl">
        <SplitHeading title={concept.title} accent={concept.titleAccent} />
        <p className="text-[14px] leading-relaxed text-gray-500 md:text-[16px]">{concept.intro}</p>
      </Reveal>
      <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {concept.features.map((feature, i) => (
          <Reveal
            as="li"
            key={feature.title}
            delay={i * 0.1}
            className="rounded-4xl border border-black/5 bg-gray-50 p-8 transition-colors hover:border-accent/20"
          >
            <div aria-hidden className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
              {feature.icon}
            </div>
            <h3 className="mb-2 font-bold tracking-tight text-black">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function Structure({ study }: { study: CaseStudy }) {
  const { structure } = study;
  const last = structure.steps.length - 1;
  return (
    <Reveal as="section" className="relative overflow-hidden rounded-5xl bg-black p-10 text-white md:p-20">
      <div className="relative z-10">
        <div className="mb-16 max-w-3xl">
          <h2 className="mb-8 text-3xl font-medium leading-[1.1] tracking-tight md:text-5xl md:leading-none">
            {structure.title} <span className="italic text-gray-400">{structure.titleAccent}</span>
          </h2>
          <p className="text-[14px] text-gray-400 md:text-[16px]">{structure.intro}</p>
        </div>
        <ol className="mx-auto flex max-w-md flex-col items-center space-y-4">
          {structure.steps.map((step, i) => (
            <li key={step} className="flex w-full flex-col items-center space-y-4">
              <div
                className={`w-full rounded-2xl border px-6 py-4 text-center font-medium ${
                  i === last
                    ? "border-accent bg-accent text-black shadow-[0_0_30px_rgb(0_191_165/0.3)]"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                {step}
              </div>
              {i < last && <div aria-hidden className="h-6 w-px bg-white/20" />}
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}

function Differences({ study }: { study: CaseStudy }) {
  const { differences } = study;
  return (
    <section className="grid items-start gap-16 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <SplitHeading title={differences.title} accent={differences.titleAccent} sticky />
      </div>
      <ol className="space-y-12 lg:col-span-8">
        {differences.items.map((item, i) => (
          <Reveal as="li" key={item.title} delay={i * 0.1} className="group flex gap-8">
            <span aria-hidden className="text-4xl font-light text-gray-200 transition-colors group-hover:text-accent">
              {i + 1}
            </span>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-black">{item.title}</h3>
              <p className="text-[14px] leading-relaxed text-gray-500 md:text-[16px]">{item.description}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
