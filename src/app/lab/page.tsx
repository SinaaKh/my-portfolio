import type { Metadata } from "next";
import { site, type LabBlock } from "@/content/site";
import { Reveal } from "@/components/ui/reveal";
import { SiteImage } from "@/components/ui/site-image";

const { lab } = site.pages;

export const metadata: Metadata = {
  title: lab.metaTitle,
  description: lab.intro,
};

/** Lab / experiment page (SPEC.md §4.4). */
export default function LabPage() {
  return (
    <main id="main" className="w-full bg-gray-100 text-black">
      <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-32">
        <Reveal className="space-y-8">
          <div className="space-y-4">
            {/* Inline span in a 24px line box, as on the reference. */}
            <p>
              <span className="text-eyebrow font-black uppercase tracking-eyebrow text-accent">{lab.eyebrow}</span>
            </p>
            <h1 className="text-5xl font-medium leading-[0.85] tracking-tighter md:text-8xl md:leading-none lg:text-[10rem]">
              {lab.titleLines[0]}
              <br />
              <span className="font-light italic text-gray-400">{lab.titleLines[1]}</span>
            </h1>
          </div>
          <div className="max-w-2xl">
            <p className="text-[18px] font-normal leading-relaxed text-gray-700 md:text-[20px]">{lab.intro}</p>
          </div>
        </Reveal>

        <Reveal y={0} className="relative mt-24 h-screen w-full overflow-hidden rounded-5xl shadow-2xl">
          <SiteImage
            src={lab.image.src}
            alt={lab.image.alt}
            fill
            loading="eager"
            sizes="(min-width: 1100px) 1052px, 100vw"
            className="object-cover"
          />
        </Reveal>

        <article className="mt-24 grid gap-6 text-[18px] text-gray-800">
          {lab.body.map((block, i) => (
            <LabBlockView key={i} block={block} />
          ))}
        </article>
      </div>
    </main>
  );
}

function LabBlockView({ block }: { block: LabBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "heading":
      return <h2 className="text-2xl font-medium">{block.text}</h2>;
    case "quote":
      return <blockquote className="border-l-4 border-accent pl-5 italic text-gray-600">{block.text}</blockquote>;
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List className={`grid gap-2 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </List>
      );
    }
    case "card-list":
      return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <ul className="grid gap-2">
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );
    case "callout":
      return (
        <div className="rounded-xl bg-gray-950 p-6 text-white">
          <p className="text-2xl font-medium">{block.title}</p>
          <div className="mt-3 grid gap-1 text-gray-200">
            {block.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      );
  }
}
