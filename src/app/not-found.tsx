import type { Metadata } from "next";
import { site } from "@/content/site";
import { ArrowLink } from "@/components/ui/arrow-link";

const { notFound } = site.pages;

export const metadata: Metadata = {
  title: notFound.metaTitle,
  robots: { index: false, follow: true },
};

/** 404 page, in the style of the secondary-page heroes. */
export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-[80vh] w-full items-center justify-center bg-white px-6 pt-20 text-black outline-none selection:bg-black selection:text-white"
    >
      <div className="max-w-[900px] text-center">
        <p className="mb-8 text-eyebrow font-black uppercase tracking-eyebrow text-accent short:mb-4">{notFound.eyebrow}</p>
        <h1 className="text-5xl font-medium leading-[0.85] tracking-tighter md:text-8xl md:leading-none lg:text-[10rem] short:text-6xl">
          {notFound.titleLines[0]}
          <br />
          <span className="font-light italic text-gray-400">{notFound.titleLines[1]}</span>
        </h1>
        <p className="mx-auto mb-10 mt-8 max-w-xl text-[18px] leading-relaxed text-gray-500 md:text-[20px] short:mb-6 short:mt-5 short:text-base">
          {notFound.message}
        </p>
        <ArrowLink link={notFound.link} tone="light" />
      </div>
    </main>
  );
}
