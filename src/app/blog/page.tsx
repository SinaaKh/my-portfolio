import type { Metadata } from "next";
import { site } from "@/content/site";
import { PostRow, darkRowTheme } from "@/components/ui/post-row";

const { blog } = site.pages;

export const metadata: Metadata = {
  title: blog.metaTitle,
};

/**
 * Writing index (SPEC.md §4.5). Reuses the home Insights rows in their dark theme.
 * (The reference renders black text on black here; this uses the readable dark variant.)
 */
export default function BlogPage() {
  return (
    <main id="main" tabIndex={-1} style={darkRowTheme} className="outline-none w-full bg-black pt-[50px] text-white md:pt-[100px]">
      <div className="container m-auto p-5 lg:max-w-[1000px]">
        <h1 className="pt-3 text-center text-4xl font-medium leading-[110%] md:leading-[140%] lg:text-5xl lg:leading-none">
          {blog.title}
        </h1>
        <div className="pb-[100px]">
          <ol className="mt-14 flex flex-col">
            {site.posts.map((post, i) => (
              <PostRow key={post.slug} post={post} index={i} readMoreLabel={site.insights.readMoreLabel} />
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
