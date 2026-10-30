import { site } from "@/content/site";

// Phase 1 shell: one anchor per home section, in page order (SPEC.md §3).
// Each placeholder is swapped for the real section component as it's built.
export default function Home() {
  const contact = site.sections.find((section) => section.id === "contact");
  const sections = site.sections.filter((section) => section !== contact);

  return (
    <>
      <main>
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            aria-label={section.label}
            className="flex min-h-[50vh] flex-col items-center justify-center gap-4 border-b border-black/5 px-6 text-center odd:bg-ink odd:text-paper"
          >
            <SectionPlaceholder index={index + 1} label={section.label} id={section.id} />
          </section>
        ))}
      </main>
      {contact && (
        <footer
          id={contact.id}
          aria-label={contact.label}
          className="flex min-h-[30vh] flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <SectionPlaceholder index={sections.length + 1} label={contact.label} id={contact.id} />
        </footer>
      )}
    </>
  );
}

function SectionPlaceholder({ index, label, id }: { index: number; label: string; id: string }) {
  return (
    <>
      <span className="text-eyebrow font-extrabold uppercase tracking-eyebrow text-accent">
        {String(index).padStart(2, "0")} / #{id}
      </span>
      <h2 className="text-4xl font-medium tracking-tighter md:text-6xl">
        {label} <span className="font-serif italic opacity-60">placeholder</span>
      </h2>
    </>
  );
}
