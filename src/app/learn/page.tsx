import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/content/site";

const { learn } = site.pages;

export const metadata: Metadata = pageMetadata({
  title: learn.metaTitle,
  description: learn.message,
  path: "/learn",
});

const lineClass = "pt-3 text-4xl font-medium leading-[110%] md:leading-[140%] lg:text-5xl lg:leading-none";

/** Learn: "coming soon" page (SPEC.md §4.7). */
export default function LearnPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none w-full bg-white pt-[50px] text-black md:pt-[100px]">
      <div className="container m-auto max-w-[900px] p-5 text-left">
        <h1 className={lineClass}>{learn.lines[0]}</h1>
        <p className={`${lineClass} md:ml-14`}>{learn.lines[1]}</p>
        <p className={lineClass}>{learn.lines[2]}</p>
        <p className="-mb-[80px] mt-10 text-[20px]">
          {learn.message} <b className="text-red-600">{learn.badge}</b>
        </p>
      </div>
      <div className="pb-[180px]" />
    </main>
  );
}
