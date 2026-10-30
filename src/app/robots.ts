import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const base = site.meta.url.replace(/\/$/, "");

/** /robots.txt: allow everything and point crawlers at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
