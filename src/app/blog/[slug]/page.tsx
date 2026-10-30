import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site, type PostBlock } from "@/content/site";
import { SiteImage } from "@/components/ui/site-image";

const findPost = (slug: string) => site.posts.find((post) => post.slug === slug);

export function generateStaticParams() {
  return site.posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = findPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt || undefined } : {};
}

/** Single post (SPEC.md §4.6). */
export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <main id="main" tabIndex={-1} className="outline-none w-full bg-gray-100 pb-[50px] pt-[50px] text-black md:pb-[100px] md:pt-[100px]">
      {/* Params are URL data: reading them inside Suspense keeps the route's shell instant. */}
      <Suspense fallback={null}>{params.then(({ slug }) => <PostContent slug={slug} />)}</Suspense>
    </main>
  );
}

function PostContent({ slug }: { slug: string }) {
  const post = findPost(slug);
  if (!post) notFound();

  return (
    <article>
      <header>
        <h1 className="m-auto max-w-[1000px] px-5 pt-3 text-center text-4xl font-medium leading-[120%] md:leading-[140%] lg:text-6xl lg:leading-none">
          {post.title}
        </h1>
        <p className="mt-6 text-center text-eyebrow font-black uppercase tracking-eyebrow text-black/40">
          <span className="text-accent">{post.category}</span> · <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
      </header>
      <div className="container m-auto max-w-[900px] p-9 pt-0">
        <div className="mb-14 mt-0">
          <SiteImage
            src={post.cover.src}
            alt={post.cover.alt}
            width={post.cover.width}
            height={post.cover.height}
            preload
            sizes="(min-width: 900px) 828px, 100vw"
            className="mt-[50px] h-auto w-full md:mt-[100px]"
          />
        </div>
        <div className="m-auto mt-10 max-w-[900px] space-y-6 text-left text-[20px] text-gray-600">
          {post.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
      </div>
    </article>
  );
}

function Block({ block }: { block: PostBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "heading":
      return <h2 className="pt-4 font-semibold text-black">{block.text}</h2>;
    case "quote":
      return <blockquote className="border-l-4 border-accent pl-5 italic text-black/60">{block.text}</blockquote>;
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List className={`space-y-2 pl-6 ${block.ordered ? "list-decimal" : "list-disc"}`}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </List>
      );
    }
  }
}

/** Fixed locale and UTC so the server and client render the same string. */
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
