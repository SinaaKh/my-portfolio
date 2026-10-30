import { site } from "@/content/site";

/** Accessible label for a home section, looked up by id so reordering `site.sections` is safe. */
export const sectionLabel = (id: string) => site.sections.find((section) => section.id === id)?.label ?? id;

/** Language code for <html lang>, derived from the Open Graph locale (e.g. "en_US" → "en"). */
export const htmlLang = site.meta.locale.split(/[_-]/)[0] || "en";
