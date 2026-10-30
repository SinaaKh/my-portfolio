import type { Link } from "@/content/site";
import { ArrowRightIcon } from "./icons";
import { SmartLink } from "./smart-link";

const TONES = {
  /** On dark backgrounds (home sections). */
  dark: { text: "text-white", base: "bg-white/20", slide: "bg-accent", arrow: "text-accent" },
  /** On light backgrounds (projects page bands). */
  light: { text: "text-black", base: "bg-black/10", slide: "bg-deep-teal", arrow: "text-deep-teal" },
  /** On the accent-colored band. */
  accent: { text: "text-white", base: "bg-white/20", slide: "bg-black", arrow: "text-black" },
} as const;

/**
 * Uppercase "Read Case Study" style link: arrow nudge plus an underline that slides in on
 * hover or keyboard focus (SPEC.md §3.4).
 */
export function ArrowLink({
  link,
  tone = "dark",
  className = "",
}: {
  link: Link;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <SmartLink
      href={link.href}
      external={link.external}
      className={`group/link relative inline-flex items-center gap-3 overflow-hidden pb-2 text-eyebrow font-extrabold uppercase tracking-label outline-offset-4 ${t.text} ${className}`}
    >
      <span>{link.label}</span>
      <ArrowRightIcon
        className={`h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1 group-focus-visible/link:translate-x-1 ${t.arrow}`}
      />
      <span aria-hidden className={`absolute bottom-0 left-0 h-px w-full ${t.base}`} />
      <span
        aria-hidden
        className={`absolute bottom-0 left-0 h-px w-full -translate-x-full transition-transform duration-300 group-hover/link:translate-x-0 group-focus-visible/link:translate-x-0 ${t.slide}`}
      />
    </SmartLink>
  );
}
