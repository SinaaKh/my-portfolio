import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const base = site.meta.url.replace(/\/$/, "");

/** /sitemap.xml: static pages plus every case study and post from site.ts. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/projects", "/lab", "/blog", "/learn"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const caseStudies = site.caseStudies.map((study) => ({
    url: `${base}/projects/${study.slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const posts = site.posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...pages, ...caseStudies, ...posts];
}
