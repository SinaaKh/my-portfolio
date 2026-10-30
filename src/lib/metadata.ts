import type { Metadata } from "next";
import { site } from "@/content/site";

const { meta } = site;

/**
 * Page metadata with canonical URL, Open Graph and Twitter card, all fed from site.ts.
 * Next.js replaces (rather than merges) a parent's `openGraph`, so every page builds its own.
 */
export function pageMetadata({
  title,
  description = meta.description,
  path,
  type = "website",
}: {
  /** Page title; omit for the home page to use the site default. */
  title?: string;
  description?: string;
  /** Route path starting with "/". */
  path: string;
  type?: "website" | "article";
}): Metadata {
  const fullTitle = title ? meta.titleTemplate.replace("%s", title) : meta.title;
  const image = { url: meta.ogImage.src, width: meta.ogImage.width, height: meta.ogImage.height, alt: meta.ogImage.alt };

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: meta.name,
      locale: meta.locale,
      title: fullTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.url],
      ...(meta.twitterHandle ? { creator: meta.twitterHandle } : {}),
    },
  };
}
