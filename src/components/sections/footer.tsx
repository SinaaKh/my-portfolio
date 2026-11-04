import { site } from "@/content/site";
import { SmartLink } from "@/components/ui/smart-link";

const { footer, meta } = site;

/** Site footer, shared by every page (SPEC.md §3.12). */
export function Footer() {
  return (
    <footer id="contact" aria-labelledby="footer-title" className="bg-white py-24 text-black short:py-14">
      <div className="container m-auto px-6">
        <div className="mb-24 flex flex-col items-start justify-between gap-16 md:flex-row short:mb-12 short:flex-row short:gap-10">
          <div className="max-w-md">
            <h2 id="footer-title" className="mb-8 text-4xl font-medium leading-tight tracking-tighter text-black">
              {footer.heading} <span className="italic text-accent">{footer.headingAccent}</span>
              {footer.headingSuffix}
            </h2>
            <SmartLink
              href={`mailto:${meta.email}`}
              className="text-xl font-medium text-black/60 transition-colors hover:text-accent"
            >
              {meta.email}
            </SmartLink>
          </div>

          <nav aria-label={footer.navLabel} className="grid grid-cols-2 gap-12 md:gap-24">
            {footer.columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <p className="mb-2 text-eyebrow font-black uppercase tracking-eyebrow text-black/30">{column.title}</p>
                {column.links.map((link) => (
                  <SmartLink
                    key={link.href}
                    href={link.href}
                    external={link.external}
                    className="text-sm font-medium text-black/60 transition-colors hover:text-black"
                  >
                    {link.label}
                  </SmartLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-black/5 pt-8">
          <p className="mb-4 text-eyebrow font-black uppercase tracking-eyebrow text-black/40">{footer.builtWithLabel}</p>
          <ul className="flex flex-wrap gap-2 md:gap-3">
            {footer.builtWith.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-black/10 px-4 py-2 text-eyebrow font-bold uppercase tracking-caps text-black/50 transition-colors hover:border-black/40 hover:text-black"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center justify-between gap-8 pt-8 md:flex-row">
          <p className="text-eyebrow font-black uppercase tracking-widest text-black/40">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
