import type { ComponentType } from "react";
import { site } from "@/content/site";
import { Hero } from "@/components/sections/hero";
import { MyWorks } from "@/components/sections/my-works";
import { Versatility } from "@/components/sections/versatility";
import { DevWorks } from "@/components/sections/dev-works";
import { ThreeDWorks } from "@/components/sections/three-d-works";
import { TechStack } from "@/components/sections/tech-stack";
import { Story } from "@/components/sections/story";
import { Insights } from "@/components/sections/insights";
import { Partnership } from "@/components/sections/partnership";
import { Collaborations } from "@/components/sections/collaborations";

// Home sections in page order (SPEC.md §3). Sections not built yet render a placeholder.
const SECTIONS: Partial<Record<string, ComponentType>> = {
  hero: Hero,
  "my-works": MyWorks,
  versatility: Versatility,
  "dev-works": DevWorks,
  "three-d-works": ThreeDWorks,
  "tech-stack": TechStack,
  story: Story,
  insights: Insights,
  partnership: Partnership,
  collaborations: Collaborations,
};

export default function Home() {
  const sections = site.sections.filter((section) => section.id !== "contact");

  return (
    <main id="main">
      {sections.map((section, index) => {
        const Section = SECTIONS[section.id];
        return Section ? (
          <Section key={section.id} />
        ) : (
          <section
            key={section.id}
            id={section.id}
            aria-label={section.label}
            className="relative flex min-h-[50vh] flex-col items-center justify-center gap-4 border-b border-black/5 bg-paper px-6 text-center"
          >
            <span className="text-eyebrow font-extrabold uppercase tracking-eyebrow text-accent">
              {String(index + 1).padStart(2, "0")} / #{section.id}
            </span>
            <h2 className="text-4xl font-medium tracking-tighter md:text-6xl">
              {section.label} <span className="font-serif italic opacity-60">placeholder</span>
            </h2>
          </section>
        );
      })}
    </main>
  );
}
